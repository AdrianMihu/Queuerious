"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircle,
  Sparkles,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const prompts = [
  "Looking beyond first impressions...",
  "Searching for a curious mind...",
  "Somewhere, someone might be looking too...",
  "The best connections usually start unexpectedly.",
  "Good conversations are worth waiting for.",
];

export default function WaitingPage() {


  const router = useRouter();

  const [queueState, setQueueState] = useState<
  "searching" | "matched" | "countdown" | "failed"
>("searching");

  const [promptIndex, setPromptIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const conversationIdRef = useRef<string | null>(null);
const queueEntryIdRef = useRef<string | null>(null);
const isCheckingRef = useRef(false);

/*
  HANDLE TAB / BROWSER CLOSE DURING COUNTDOWN
*/

/*
  HANDLE LEAVING THE QUEUE / PAGE CLOSE
*/

useEffect(() => {
  const handlePageHide = () => {
    if (
      queueState !== "matched" &&
      queueState !== "countdown"
    ) {
      // User is still waiting → cancel their queue entry
      navigator.sendBeacon("/api/leave-queue");
      return;
    }

    const conversationId = conversationIdRef.current;

    if (!conversationId) return;

    const data = new Blob(
      [
        JSON.stringify({
          conversationId,
        }),
      ],
      {
        type: "application/json",
      }
    );

    navigator.sendBeacon(
      "/api/cancel-ready",
      data
    );
  };

  window.addEventListener("pagehide", handlePageHide);

  return () => {
    window.removeEventListener(
      "pagehide",
      handlePageHide
    );
  };
}, [queueState]);

useEffect(() => {
  if (queueState !== "failed") return;

  const timer = setTimeout(() => {
    router.push("/dashboard/queuemitment");
  }, 4000);

  return () => clearTimeout(timer);
}, [queueState, router]);

  /*
    PROMPT ROTATION
  */

  useEffect(() => {
    if (queueState !== "searching") return;

    const interval = setInterval(() => {
      setPromptIndex((current) =>
        (current + 1) % prompts.length
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [queueState]);

  /*
  HEARTBEAT DURING COUNTDOWN
*/

useEffect(() => {
  if (queueState !== "countdown") return;

  const supabase = createClient();

  let heartbeat: ReturnType<typeof setInterval> | undefined;

  let sendHeartbeat: (() => Promise<void>) | undefined;

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      sendHeartbeat?.();
    }
  };

  const startHeartbeat = async () => {
    const conversationId = conversationIdRef.current;

    if (!conversationId) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: conversation, error } = await supabase
      .from("queuemitment_conversations")
      .select("user_one_id, user_two_id")
      .eq("id", conversationId)
      .single();

    if (error || !conversation) {
      console.error(
        "Error loading conversation for heartbeat:",
        error
      );
      return;
    }

    const lastSeenColumn =
      conversation.user_one_id === user.id
        ? "user_one_last_seen"
        : "user_two_last_seen";

    sendHeartbeat = async () => {
      const { error: heartbeatError } = await supabase
        .from("queuemitment_conversations")
        .update({
          [lastSeenColumn]: new Date().toISOString(),
        })
        .eq("id", conversationId);

      if (heartbeatError) {
        console.error("Heartbeat error:", heartbeatError);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    /*
      Send one immediately
    */

    await sendHeartbeat();

    /*
      Then keep updating
    */

    heartbeat = setInterval(() => {
      sendHeartbeat?.();
    }, 3000);
  };

  startHeartbeat();

  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    if (heartbeat) {
      clearInterval(heartbeat);
    }
  };
}, [queueState]);

  /*
    REAL MATCHMAKING HEARTBEAT

    Every 2 seconds:

    1. Check if we were already matched.
    2. If not, run the matchmaking RPC.
    3. If a conversation is created, start the match flow.
  */

    useEffect(() => {
      const supabase = createClient();
    
      let cancelled = false;
      let interval: ReturnType<typeof setInterval> | null = null;
    
      const initializeQueue = async () => {
        /*
          Get current user
        */
    
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
    
        if (userError || !user || cancelled) {
          return;
        }
    
        const { data: currentQueueEntry, error: queueEntryError } =
  await supabase
    .from("queue_entries")
    .select("id, status, conversation_id")
    .eq("user_id", user.id)
    .in("status", ["waiting", "matched"])
    .order("joined_at", { ascending: false })
    .limit(1)
    .maybeSingle();

if (queueEntryError || !currentQueueEntry) {
  console.error("Error finding current queue entry:", queueEntryError);
  router.push("/dashboard/queuemitment");
  return;
}

queueEntryIdRef.current = currentQueueEntry.id;
    
        

    
        /*
          Start matchmaking only after
          the fresh queue entry exists.
        */
    
        const checkForMatch = async () => {
          if (
            cancelled ||
            conversationIdRef.current ||
            isCheckingRef.current ||
            !queueEntryIdRef.current
          ) {
            return;
          }
    
          isCheckingRef.current = true;
    
          try {
            /*
              FIRST:
    
              Check ONLY our CURRENT queue entry.
    
              We no longer search through old
              matched entries from previous sessions.
            */
    
            const {
              data: currentQueueEntry,
              error: queueError,
            } = await supabase
              .from("queue_entries")
              .select("status, conversation_id")
              .eq("id", queueEntryIdRef.current)
              .maybeSingle();
    
            if (queueError) {
              console.error(
                "Error checking current queue entry:",
                queueError
              );
    
              return;
            }
    
            /*
              Another user may have triggered
              the match and updated THIS entry.
            */
    
            if (
              currentQueueEntry?.status === "matched" &&
              currentQueueEntry.conversation_id &&
              !conversationIdRef.current
            ) {
              conversationIdRef.current =
                currentQueueEntry.conversation_id;
    
              setQueueState("matched");
    
              return;
            }
    
            /*
              SECOND:
    
              Try to find a REAL waiting user.
    
              If nobody exists, the RPC should
              simply return null and we stay here.
            */
    
            const {
              data: conversationId,
              error: matchError,
            } = await supabase.rpc(
              "find_queuemitment_match"
            );
    
            if (matchError) {
              console.error(
                "MATCHMAKING ERROR:",
                matchError
              );
    
              return;
            }
    
            /*
              A REAL match was created.
            */
    
            if (
              conversationId &&
              !conversationIdRef.current
            ) {
              conversationIdRef.current = conversationId;
    
              setQueueState("matched");
            }
          } finally {
            isCheckingRef.current = false;
          }
        };
    
        /*
          Check immediately
        */
    
        checkForMatch();
    
        /*
          Then keep checking
        */
    
        interval = setInterval(() => {
          checkForMatch();
        }, 2000);
      };
    
      initializeQueue();
    
      return () => {
        cancelled = true;
    
        if (interval) {
          clearInterval(interval);
        }
      };
    }, []);

  /*
    MATCH FOUND → SHOW "SOMEONE IS WAITING"

    Keep this visible for 5 seconds.
  */

  useEffect(() => {
    if (queueState !== "matched") return;

    const timer = setTimeout(() => {
      setQueueState("countdown");
    }, 5000);

    return () => clearTimeout(timer);
  }, [queueState]);

  /*
  MARK USER AS READY
*/

useEffect(() => {
  if (queueState !== "countdown") return;

  const markReady = async () => {
    const conversationId = conversationIdRef.current;

    if (!conversationId) return;

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: conversation, error } = await supabase
      .from("queuemitment_conversations")
      .select("user_one_id, user_two_id")
      .eq("id", conversationId)
      .single();

    if (error || !conversation) {
      console.error("Error loading conversation:", error);
      return;
    }

    const readyColumn =
      conversation.user_one_id === user.id
        ? "user_one_ready"
        : "user_two_ready";

    const { error: updateError } = await supabase
      .from("queuemitment_conversations")
      .update({
        [readyColumn]: true,
      })
      .eq("id", conversationId);

    if (updateError) {
      console.error("Error marking user as ready:", updateError);
    }
  };

  markReady();
}, [queueState]);

/*
  CANCEL READY STATUS WHEN LEAVING
*/

useEffect(() => {
  if (queueState !== "countdown") return;

  const supabase = createClient();

  const markNotReady = async () => {
    const conversationId = conversationIdRef.current;

    if (!conversationId) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: conversation } = await supabase
      .from("queuemitment_conversations")
      .select("user_one_id, user_two_id")
      .eq("id", conversationId)
      .single();

    if (!conversation) return;

    const readyColumn =
      conversation.user_one_id === user.id
        ? "user_one_ready"
        : "user_two_ready";

    await supabase
      .from("queuemitment_conversations")
      .update({
        [readyColumn]: false,
      })
      .eq("id", conversationId);
  };

  return () => {
    markNotReady();
  };
}, [queueState]);



  /*
    COUNTDOWN
  */

    useEffect(() => {
      if (queueState !== "countdown") return;
    
      if (countdown === 0) {
        const enterConversation = async () => {
          const conversationId = conversationIdRef.current;
        
          if (!conversationId) {
            console.error("No conversation ID found.");
            return;
          }
        
          const supabase = createClient();

      /*
  FINAL HANDSHAKE
*/

const { data: bothUsersReady, error: finalReadyError } =
await supabase.rpc(
  "mark_queuemitment_final_ready",
  {
    p_conversation_id: conversationId,
  }
);

if (finalReadyError) {
console.error(
  "Error during final handshake:",
  finalReadyError
);

setQueueState("failed");
return;
}

/*
If both users are ready, continue immediately.
Otherwise wait for the second user.
*/

if (!bothUsersReady) {
let connected = false;

for (let attempt = 0; attempt < 20; attempt++) {
  await new Promise((resolve) =>
    setTimeout(resolve, 500)
  );

  const { data: latestConversation, error } =
    await supabase
      .from("queuemitment_conversations")
      .select(
        "user_one_final_ready, user_two_final_ready"
      )
      .eq("id", conversationId)
      .single();

  if (error) {
    console.error(
      "Error checking final ready status:",
      error
    );
    continue;
  }

  if (
    latestConversation?.user_one_final_ready &&
    latestConversation?.user_two_final_ready
  ) {
    connected = true;
    break;
  }
}

if (!connected) {
  console.log(
    "The other person could not connect."
  );

  setQueueState("failed");
  return;
}
}
        
          /*
            Both users are here → consume token
          */
        
          const { error } = await supabase.rpc(
            "consume_queue_token"
          );
        
          if (error) {
            console.error(
              "Error consuming queue token:",
              error
            );
        
            router.push("/dashboard/queuemitment");
        
            return;
          }
        
          /*
            ENTER CHAT 🔥
          */
        
          router.push(
            `/dashboard/queuemitment/chat/${conversationId}`
          );
        };
    
        enterConversation();
    
        return;
      }
    
      const timer = setTimeout(() => {
        setCountdown((current) => current - 1);
      }, 1000);
    
      return () => clearTimeout(timer);
    }, [queueState, countdown, router]);

  return (
    <section className="flex flex-1 items-center justify-center px-6 py-10 lg:px-10">
      <div className="w-full max-w-3xl">

        {/* SEARCHING */}

        {queueState === "searching" && (
          <div className="relative overflow-hidden rounded-[36px] border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.16] via-[#15121e] to-[#101015] p-8 shadow-2xl shadow-violet-950/20 sm:p-14">

            {/* Background glow */}

            <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[120px]" />

            <div className="relative flex flex-col items-center text-center">

              {/* Animated icon */}

              <div className="relative mb-10 flex h-24 w-24 items-center justify-center">

                <div className="absolute inset-0 animate-ping rounded-full border border-violet-400/30" />

                <div className="absolute inset-3 rounded-full border border-violet-400/20" />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15 shadow-lg shadow-violet-500/20">
                  <Zap
                    size={30}
                    className="fill-violet-300 text-violet-300"
                  />
                </div>

              </div>

              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-300">
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />

                YOU&apos;RE IN THE QUEUE
              </div>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Looking for someone worth discovering.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/45">
                {prompts[promptIndex]}
              </p>

              {/* Queue status */}

              <div className="mt-12 grid w-full max-w-xl gap-3 sm:grid-cols-3">

                <StatusCard
                  label="Preferences"
                  value="Applied"
                />

                <StatusCard
                  label="Queue type"
                  value="Standard"
                />

                <StatusCard
                  label="Status"
                  value="Searching"
                  active
                />

              </div>

              <p className="mt-10 text-sm text-white/25">
                Stay curious. A connection could be closer than you think.
              </p>

            </div>
          </div>
        )}

        {/* MATCHED */}

        {queueState === "matched" && (
          <div className="relative overflow-hidden rounded-[36px] border border-violet-400/30 bg-gradient-to-br from-violet-500/[0.22] via-[#181321] to-[#101015] p-10 shadow-2xl shadow-violet-500/20 sm:p-16">

            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-[120px]" />

            <div className="relative flex flex-col items-center text-center">

              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-violet-300/30 bg-violet-500/20 text-violet-200 shadow-xl shadow-violet-500/20">
                <Sparkles size={42} />
              </div>

              <p className="mb-4 text-sm font-medium tracking-[0.2em] text-violet-300">
                CONNECTION FOUND
              </p>

              <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
                Someone is waiting.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/45">
                You don&apos;t know anything about them yet.
                <br />
                And that&apos;s kind of the point.
              </p>

            </div>
          </div>
        )}

        {/* COUNTDOWN */}

        {queueState === "countdown" && (
          <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-[36px] border border-violet-400/25 bg-gradient-to-br from-violet-500/[0.18] via-[#15121e] to-[#101015] shadow-2xl shadow-violet-950/30">

            <div className="absolute h-96 w-96 rounded-full bg-violet-500/20 blur-[130px]" />

            <div className="absolute h-96 w-96 rounded-full bg-violet-500/20 blur-[130px]" />

            <div className="relative text-center">

              <p className="mb-8 text-sm font-medium tracking-[0.22em] text-violet-300">
                GET READY
              </p>

              <div
                key={countdown}
                className="animate-in zoom-in-50 duration-500 text-[180px] font-semibold leading-none tracking-tighter text-white sm:text-[240px]"
              >
                {countdown}
              </div>

              <p className="mt-8 text-lg text-white/40">
                Your conversation is about to begin.
              </p>

            </div>

          </div>
        )}

        {/* FAILED TO CONNECT */}

{queueState === "failed" && (
  <div className="relative overflow-hidden rounded-[36px] border border-violet-400/20 bg-gradient-to-br from-[#181321] via-[#121218] to-[#101015] p-10 shadow-2xl shadow-violet-950/20 sm:p-16">
    
    <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[120px]" />

    <div className="relative flex flex-col items-center text-center">
      
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/10 text-violet-300 shadow-xl shadow-violet-950/30">
        <Sparkles size={38} />
      </div>

      <p className="mt-8 text-sm font-medium tracking-[0.2em] text-violet-300">
        CONNECTION INTERRUPTED
      </p>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        They couldn&apos;t connect.
      </h1>

      <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/45">
        The other person left before the conversation could begin.
        No worries — we&apos;ll get you back to Queuemitment.
      </p>

      <div className="mt-10 flex items-center gap-2 text-sm text-white/30">
        <LoaderCircle size={16} className="animate-spin" />
        Returning you shortly...
      </div>

    </div>
  </div>
)}

      </div>
    </section>
  );
}


/*
  STATUS CARD
*/

function StatusCard({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/10 px-4 py-4 text-left">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>

      <p
        className={`mt-2 text-sm font-medium ${
          active
            ? "text-violet-300"
            : "text-white/65"
        }`}
      >
        {value}
      </p>
    </div>
  );
}