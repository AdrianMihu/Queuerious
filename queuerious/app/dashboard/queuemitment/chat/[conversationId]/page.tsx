"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  Circle,
  Clock3,
  LoaderCircle,
  MessageCircleWarning,
  Plus,
  Send,
  Smile,
  Sparkles,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type?: "message" | "system";
};

type Conversation = {
  id: string;
  user_one_id: string;
  user_two_id: string;
  status: string;
  started_at: string;
  expires_at: string;
  extension_user_one: boolean;
  extension_user_two: boolean;
  extension_used: boolean;
  reveal_started_at: string | null;
};

export default function QueuemitmentChatPage() {
  const params = useParams();
  const router = useRouter();

  const conversationId = params.conversationId as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [newMessage, setNewMessage] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [loading, setLoading] = useState(true);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const [serverTimeOffset, setServerTimeOffset] = useState<number | null>(null);

  const EXTENSION_DURATION = 2 * 60;

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);

  const [reportReason, setReportReason] = useState<string | null>(null);

  const [reportComment, setReportComment] = useState("");

  const [myExtensionVote, setMyExtensionVote] = useState(false);

  const [theirExtensionVote, setTheirExtensionVote] = useState(false);

  const [extensionUsed, setExtensionUsed] = useState(false);

  const [showConversationEndedModal, setShowConversationEndedModal] =
    useState(false);

  const [endedByOtherPerson, setEndedByOtherPerson] = useState(false);

  const isEndingConversationRef = useRef(false);

  const previousConversationRef = useRef<Conversation | null>(null);

  const emojis = [
    "😀",
    "😃",
    "😂",
    "🥹",
    "😊",
    "😍",
    "😘",
    "😉",
    "😎",
    "🤔",
    "😅",
    "😭",
    "🥲",
    "😏",
    "🙃",
    "😳",
    "🤯",
    "😴",
    "❤️",
    "🔥",
    "✨",
    "👍",
    "👀",
    "🙌",
  ];

  const addSystemMessage = (content: string) => {
    const systemMessage: Message = {
      id: `system-${Date.now()}-${Math.random()}`,
      sender_id: "__system__",
      content,
      created_at: new Date().toISOString(),
      message_type: "system",
    };

    setMessages((currentMessages) => [...currentMessages, systemMessage]);
  };

  /*
    LOAD CONVERSATION
  */

  useEffect(() => {
    const supabase = createClient();

    const loadConversation = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUserId(user.id);

      const { data: conversationData, error } = await supabase
        .from("queuemitment_conversations")
        .select("*")
        .eq("id", conversationId)
        .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
        .maybeSingle();

      console.log("Conversation ID:", conversationId);
      console.log("Current user:", user.id);
      console.log("Conversation data:", conversationData);
      console.log("Conversation error:", error);

      if (error || !conversationData) {
        console.error("Error loading Queuemitment conversation:", error);

        setLoading(false);
        return;
      }

      const { data: serverTime, error: serverTimeError } = await supabase.rpc(
        "get_server_time"
      );
      
      if (serverTimeError || !serverTime) {
        console.error("Error getting server time:", serverTimeError);
      } else {
        const serverNow = new Date(serverTime).getTime();
        const browserNow = Date.now();
      
        setServerTimeOffset(serverNow - browserNow);
      }

      setConversation(conversationData);
      previousConversationRef.current = conversationData;

      const iAmUserOne = user.id === conversationData.user_one_id;

      setMyExtensionVote(
        iAmUserOne
          ? conversationData.extension_user_one
          : conversationData.extension_user_two
      );

      setTheirExtensionVote(
        iAmUserOne
          ? conversationData.extension_user_two
          : conversationData.extension_user_one
      );

      setExtensionUsed(conversationData.extension_used);

      const { data: messagesData, error: messagesError } = await supabase
        .from("conversation_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error loading messages:", messagesError);
      } else {
        setMessages(messagesData ?? []);
      }

      setLoading(false);
    };

    loadConversation();
  }, [conversationId, router]);

  const completeExtension = async () => {
    if (!conversationId) return;

    const supabase = createClient();

    const { data, error } = await supabase.rpc(
      "complete_queuemitment_extension",
      {
        p_conversation_id: conversationId,
      }
    );

    if (error) {
      console.error("Error completing extension:", error);
      return;
    }

    if (data && data.length > 0) {
      console.log("Extension successfully completed:", data[0]);

      setConversation(data[0]);
      setExtensionUsed(true);

      setMyExtensionVote(true);
      setTheirExtensionVote(true);
    }
  };

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`queuemitment-conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "queuemitment_conversations",
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("Conversation realtime update:", payload);

          const updatedConversation = payload.new as Conversation;

          const previousConversation = previousConversationRef.current;

          setConversation(updatedConversation);

          const iAmUserOne = currentUserId === updatedConversation.user_one_id;

          const iVoted = iAmUserOne
            ? updatedConversation.extension_user_one
            : updatedConversation.extension_user_two;

          const theyVoted = iAmUserOne
            ? updatedConversation.extension_user_two
            : updatedConversation.extension_user_one;

          setMyExtensionVote(iVoted);
          setTheirExtensionVote(theyVoted);
          setExtensionUsed(updatedConversation.extension_used);

          if (previousConversation) {
            const otherUserId =
              currentUserId === updatedConversation.user_one_id
                ? updatedConversation.user_two_id
                : updatedConversation.user_one_id;

            const otherUserVotedNow =
              (!previousConversation.extension_user_one &&
                updatedConversation.extension_user_one &&
                updatedConversation.user_one_id === otherUserId) ||
              (!previousConversation.extension_user_two &&
                updatedConversation.extension_user_two &&
                updatedConversation.user_two_id === otherUserId);

            if (otherUserVotedNow) {
              addSystemMessage(
                "Someone also voted to extend the conversation."
              );
            }

            if (
              !previousConversation.extension_used &&
              updatedConversation.extension_used
            ) {
              addSystemMessage(
                "You both wanted more time. Your conversation has been extended by 2 minutes."
              );
            }
          }

          previousConversationRef.current = updatedConversation;

          if (
            updatedConversation.extension_user_one &&
            updatedConversation.extension_user_two &&
            !updatedConversation.extension_used
          ) {
            completeExtension();
          }

          if (
            updatedConversation.status === "ended" &&
            !isEndingConversationRef.current
          ) {
            setEndedByOtherPerson(true);
            setShowConversationEndedModal(true);
          }
        }
      )
      .subscribe((status) => {
        console.log("Conversation realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  /*
    CONVERSATION TIMER
  */

    useEffect(() => {
      if (!conversation?.expires_at) return;
    
      const updateTimer = async () => {
        const expiresAt = new Date(
          conversation.expires_at
        ).getTime();
    
        const now = Date.now();
    
        const difference = Math.max(
          0,
          Math.floor((expiresAt - now) / 1000)
        );
    
        setSecondsLeft(difference);
    
        if (difference <= 0) {
          const supabase = createClient();
    
          // Setăm începutul Reveal-ului doar dacă nu există deja
          if (!conversation.reveal_started_at) {
            const { error } = await supabase
              .from("queuemitment_conversations")
              .update({
                reveal_started_at: new Date().toISOString(),
              })
              .eq("id", conversationId)
              .is("reveal_started_at", null);
    
            if (error) {
              console.error(
                "Error starting reveal timer:",
                error
              );
              return;
            }
          }
    
          router.push(
            `/dashboard/queuemitment/reveal/${conversationId}`
          );
        }
      };
    
      updateTimer();
    
      const interval = setInterval(() => {
        updateTimer();
      }, 1000);
    
      return () => clearInterval(interval);
    }, [conversation, conversationId, router]);

  /*
  REALTIME MESSAGES
*/

  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`queuemitment-messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          setMessages((currentMessages) => [...currentMessages, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  /*
    SEND MESSAGE
  */

  const sendMessage = async () => {
    const trimmedMessage = newMessage.trim();

    if (!trimmedMessage || !currentUserId || !conversationId) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.from("conversation_messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      message_type: "message",
      content: trimmedMessage,
    });

    if (error) {
      console.error("Error sending message");
      console.error("message:", error.message);
      console.error("details:", error.details);
      console.error("hint:", error.hint);
      console.error("code:", error.code);

      console.error(JSON.stringify(error, null, 2));

      return;
    }

    setNewMessage("");
  };

    /*
    Test Debug Button Skip Time
  */
    const handleTestSkipTime = async () => {
        if (!conversationId) return;
      
        const supabase = createClient();
      
        console.log("TEST: Skipping 4 minutes and 30 seconds");
      
        // Luăm timpul actual de expirare
        const { data: conversationData, error: fetchError } = await supabase
          .from("queuemitment_conversations")
          .select("expires_at")
          .eq("id", conversationId)
          .single();
      
        if (fetchError || !conversationData) {
          console.error("TEST: Could not get conversation:", fetchError);
          return;
        }
      
        // Scădem 4 minute și 30 secunde
        const currentExpiresAt = new Date(conversationData.expires_at);
      
        const newExpiresAt = new Date(
          currentExpiresAt.getTime() - 4.5 * 60 * 1000
        );
      
        const { data, error } = await supabase
          .from("queuemitment_conversations")
          .update({
            expires_at: newExpiresAt.toISOString(),
          })
          .eq("id", conversationId)
          .select()
          .single();
      
        if (error) {
          console.error("TEST: Failed to skip time:", error);
          return;
        }
      
        console.log("TEST: Time skipped successfully:", data);
      };

      
    /*
    End debug button
  */

  const leaveChat = async () => {
    isEndingConversationRef.current = true;

    const supabase = createClient();

    const { error } = await supabase
      .from("queuemitment_conversations")
      .update({
        status: "ended",
      })
      .eq("id", conversationId);

    if (error) {
      console.error("Error leaving chat:", error);
      return;
    }

    window.location.href = "/dashboard/queuemitment";
  };

  const submitReport = async () => {
    if (!reportReason) return;

    isEndingConversationRef.current = true;

    const supabase = createClient();

    const { error } = await supabase
      .from("queuemitment_conversations")
      .update({
        status: "ended",
      })
      .eq("id", conversationId);

    if (error) {
      console.error("Error reporting conversation:", error);
      return;
    }

    setShowReportModal(false);

    window.location.href = "/dashboard/queuemitment?report=success";
  };

  const requestExtension = async () => {
    if (!conversation || !currentUserId || extensionUsed || secondsLeft === 0) {
      return;
    }

    const supabase = createClient();

    const voteColumn =
      currentUserId === conversation.user_one_id
        ? "extension_user_one"
        : "extension_user_two";

    const { error } = await supabase
      .from("queuemitment_conversations")
      .update({
        [voteColumn]: true,
      })
      .eq("id", conversationId);

    if (error) {
      console.error("Error voting for extension:", error);
      return;
    }

    setMyExtensionVote(true);
    addSystemMessage("You voted to extend this conversation by 2 minutes.");
  };

  /*
    FORMAT TIMER
  */

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  /*
    LOADING
  */

  if (loading) {
    return (
      <section className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-3 text-white/40">
          <LoaderCircle size={22} className="animate-spin" />
          Loading conversation...
        </div>
      </section>
    );
  }

  /*
    NOT FOUND
  */

  if (!conversation) {
    return (
      <section className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Conversation not found</h1>

          <p className="mt-3 text-white/40">
            This conversation may have expired.
          </p>

          <button
            onClick={() => router.push("/dashboard/queuemitment")}
            className="mt-6 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium transition hover:bg-violet-400"
          >
            Return to Queuemitment
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col">
      {/* HEADER */}

      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-6 py-5 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
            <Sparkles size={20} className="text-violet-300" />

            {secondsLeft !== 0 && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 rounded-full border-2 border-[#09090d] bg-emerald-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">Someone</h1>

              {secondsLeft !== 0 && (
                <Circle size={7} className="fill-violet-300 text-violet-300" />
              )}
            </div>

            <p className="text-xs text-white/35">
              Discover them through conversation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* TIMER */}

          <div className="hidden items-center gap-2 rounded-xl border border-violet-400/15 bg-violet-500/[0.07] px-4 py-2.5 text-violet-200 sm:flex">
            <Clock3 size={17} />

            <div>
              <p className="text-xs font-medium">
                {secondsLeft === 0 ? "Time's up" : formatTime(secondsLeft)}
              </p>

              <p className="text-[10px] opacity-50">remaining</p>
            </div>
          </div>

          {/* REPORT */}

          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="hidden items-center gap-2 rounded-xl border border-red-400/10 px-4 py-2.5 text-sm text-red-300/70 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300 sm:flex"
          >
            <MessageCircleWarning size={17} />
            Report
          </button>

          {/* LEAVE */}

          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-4 py-2.5 text-sm text-white/50 transition hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white"
          >
            <X size={17} />

            <span className="hidden sm:inline">Leave chat</span>
          </button>
        </div>
      </header>

      {/* CONVERSATION INTRO */}

      <div className="shrink-0 border-b border-white/[0.05] bg-violet-500/[0.025] px-6 py-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 lg:flex-row">
          <div className="flex items-center justify-center gap-2 text-center text-sm text-white/35 lg:text-left">
            <Sparkles size={15} className="shrink-0 text-violet-300" />

            <span>No profiles. No first impressions. Just conversation.</span>
          </div>

          {secondsLeft !== 0 && (
            <button
              type="button"
              onClick={requestExtension}
              disabled={myExtensionVote || extensionUsed}
              className={`group flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition ${
                extensionUsed
                  ? "cursor-default border-emerald-400/20 bg-emerald-500/[0.06] text-emerald-300/70"
                  : myExtensionVote
                  ? "cursor-wait border-violet-400/25 bg-violet-500/[0.08] text-violet-200"
                  : "border-white/[0.08] bg-white/[0.025] text-white/50 hover:border-violet-400/30 hover:bg-violet-500/[0.08] hover:text-violet-200"
              }`}
            >
              {extensionUsed ? (
                <>
                  <Check size={17} />
                  Extension used
                </>
              ) : myExtensionVote ? (
                <>
                  <Clock3 size={17} />
                  Waiting for Someone...
                </>
              ) : (
                <>
                  <Plus
                    size={17}
                    className="transition group-hover:rotate-90"
                  />
                  Add 2 minutes
                </>
              )}
            </button>
          )}
        </div>

        {secondsLeft !== 0 && !extensionUsed && !myExtensionVote && (
          <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] text-white/20 lg:text-right">
            Both people need to agree. One extension per conversation.
          </p>
        )}
      </div>

      {/* MESSAGES */}

      <div className="flex flex-1 flex-col px-6 py-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <Sparkles size={28} />
              </div>

              <h2 className="mt-6 text-xl font-semibold">
                The conversation starts here.
              </h2>

              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/40">
                You don&apos;t know who they are yet. Neither do they. Start
                with something worth saying.
              </p>
            </div>
          )}

          {messages.map((message) => {
            if (message.message_type === "system") {
              return (
                <div key={message.id} className="flex justify-center py-2">
                  <div className="max-w-md rounded-2xl border border-violet-400/10 bg-violet-500/[0.05] px-4 py-3 text-center">
                    <div className="mb-1 flex items-center justify-center gap-2 text-violet-300">
                      <Sparkles size={13} />

                      <span className="text-[10px] font-medium uppercase tracking-[0.16em]">
                        Queuemitment
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-white/45">
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            }

            const isMe = message.sender_id === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                    isMe
                      ? "bg-violet-500 text-white"
                      : "border border-white/[0.08] bg-white/[0.04] text-white/80"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MESSAGE INPUT */}

      <div className="border-t border-white/[0.07] px-6 py-5 lg:px-10">
      <div className="mx-auto flex w-full max-w-3xl items-end gap-3">
      <div className="relative">
  <button
    type="button"
    onClick={() => setShowEmojiPicker((current) => !current)}
    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-white/45 transition hover:border-violet-400/30 hover:bg-violet-500/[0.08] hover:text-violet-300"
    aria-label="Open emoji picker"
  >
    <Smile size={20} />
  </button>

  {showEmojiPicker && (
    <div className="absolute bottom-16 left-0 z-40 w-72 rounded-2xl border border-white/[0.1] bg-[#16161f] p-3 shadow-2xl">
      <div className="grid grid-cols-6 gap-1">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              setNewMessage((current) => current + emoji);
              setShowEmojiPicker(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl transition hover:bg-white/[0.08]"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )}
</div>
          <input
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Say something worth discovering..."
            className="flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-sm outline-none placeholder:text-white/25 focus:border-violet-400/40"
          />

          <button
            onClick={sendMessage}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-white transition hover:bg-violet-400 active:scale-95"
          >
            <Send size={19} />
          </button>
        </div>
      </div>
      {/* LEAVE MODAL */}

      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#111118] p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Leave conversation?</h2>

            <p className="mt-3 text-sm leading-relaxed text-white/40">
              Are you sure you want to leave this Queuemitment conversation?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={leaveChat}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-400"
              >
                Leave chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Button */}

      <button
  onClick={handleTestSkipTime}
  className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-300 transition hover:bg-violet-500/20"
>
  TEST · Skip 4:30
</button>

      {/* REPORT MODAL */}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#111118] p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Report Someone</h2>

            <p className="mt-3 text-sm text-white/40">
              Tell us why you want to report this conversation.
            </p>

            <div className="mt-5 space-y-2">
              {[
                "Harassment or abusive behaviour",
                "Inappropriate content",
                "Spam",
                "Other",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setReportReason(reason)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    reportReason === reason
                      ? "border-violet-400/50 bg-violet-500/10 text-violet-200"
                      : "border-white/[0.08] text-white/50 hover:bg-white/[0.05]"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <textarea
              value={reportComment}
              onChange={(event) => setReportComment(event.target.value)}
              placeholder="Additional details (optional)"
              className="mt-4 min-h-24 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-sm outline-none placeholder:text-white/25 focus:border-violet-400/40"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-white/50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitReport}
                disabled={!reportReason}
                className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit report
              </button>
            </div>
          </div>
        </div>
      )}

      {showConversationEndedModal && endedByOtherPerson && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#111118] p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <Sparkles size={28} />
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
              The conversation has ended
            </h2>

            <p className="mt-3 leading-relaxed text-white/45">
              The other person didn&apos;t feel like going on. That&apos;s okay
              — there are plenty more conversations waiting for you.
            </p>

            <button
              type="button"
              onClick={() => (window.location.href = "/dashboard/queuemitment")}
              className="mt-7 w-full rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
            >
              Back to Queuemitment
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
