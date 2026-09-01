"use client";

import { useEffect, useState } from "react";
import { Flame, Gift, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type QueueTokensProps = {
  initialTokens: number;
  initialFreeTokenClaimedAt: string | null;
  userId: string;
};

export default function QueueTokens({
  initialTokens,
  initialFreeTokenClaimedAt,
  userId,
}: QueueTokensProps) {
  const [queueTokens, setQueueTokens] = useState(initialTokens);

  useEffect(() => {
    const supabase = createClient();
  
    async function fetchTokens() {
      const { data, error } = await supabase
        .from("queue_tokens")
        .select("tokens")
        .eq("user_id", userId)
        .single();
  
      console.log("FETCHED TOKENS:", data);
  
      if (!error && data) {
        setQueueTokens(data.tokens);
      }
    }
  
    fetchTokens();
  
    const interval = setInterval(fetchTokens, 1000);
  
    return () => clearInterval(interval);
  }, [userId]);

  const [freeTokenClaimedAt, setFreeTokenClaimedAt] =
    useState<string | null>(initialFreeTokenClaimedAt);

    const [now, setNow] = useState(0);

  const [isClaiming, setIsClaiming] = useState(false);

  /*
    Keep the countdown updating every second
  */

    useEffect(() => {
      const interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    
      return () => clearInterval(interval);
    }, []);

  /*
    Calculate when the next free token is available
  */

  const nextFreeTokenAt = freeTokenClaimedAt
    ? new Date(freeTokenClaimedAt).getTime() +
      24 * 60 * 60 * 1000
    : null;

  const remainingTime = nextFreeTokenAt
    ? Math.max(nextFreeTokenAt - now, 0)
    : 0;

  const canClaim =
    !freeTokenClaimedAt || remainingTime === 0;

  /*
    Format countdown
  */

  function formatRemainingTime(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  /*
    CLAIM FREE TOKEN
  */

  async function handleClaimFreeToken() {
    if (!canClaim || isClaiming) return;

    setIsClaiming(true);

    const supabase = createClient();

    const { data, error } = await supabase.rpc(
      "claim_free_queue_token"
    );

    if (error) {
      console.error(
        "Error claiming free queue token:",
        error
      );

      setIsClaiming(false);
      return;
    }

    /*
      Update token count instantly
    */

    if (typeof data === "number") {
      setQueueTokens(data);
    } else {
      setQueueTokens((current) => current + 1);
    }

    /*
      Start new 24h cooldown
    */

    setFreeTokenClaimedAt(
      new Date().toISOString()
    );

    setIsClaiming(false);
  }

  return (
    <div className="hidden items-center gap-3 sm:flex">
      {/* QUEUE TOKENS */}

      <div className="flex items-center gap-3 rounded-full border border-violet-400/15 bg-violet-500/[0.07] px-4 py-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/15">
          <Flame size={15} className="text-violet-300" />
        </div>

        <div>
          <p className="text-xs font-medium">
            {queueTokens}{" "}
            {queueTokens === 1 ? "queue" : "queues"}
          </p>

          <p className="text-[10px] text-white/35">
            available
          </p>
        </div>
      </div>

      {/* FREE TOKEN */}

      <button
        onClick={handleClaimFreeToken}
        disabled={!canClaim || isClaiming}
        className={`flex items-center gap-3 rounded-full border px-4 py-2 transition ${
          canClaim
            ? "border-violet-400/20 bg-violet-500/10 hover:bg-violet-500/20"
            : "cursor-not-allowed border-white/[0.07] bg-white/[0.02] opacity-60"
        }`}
      >
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            canClaim
              ? "bg-violet-500/15"
              : "bg-white/[0.05]"
          }`}
        >
          {canClaim ? (
            <Gift size={15} className="text-violet-300" />
          ) : (
            <Clock size={15} className="text-white/40" />
          )}
        </div>

        <div className="text-left">
          <p className="text-xs font-medium">
            Free queue token
          </p>

          <p className="text-[10px] text-white/35">
            {isClaiming
              ? "Collecting..."
              : canClaim
              ? "Collect now"
              : formatRemainingTime(remainingTime)}
          </p>
        </div>
      </button>
    </div>
  );
}