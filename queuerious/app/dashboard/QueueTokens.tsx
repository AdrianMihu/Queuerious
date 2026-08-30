"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type QueueTokensProps = {
  initialTokens: number;
  userId: string;
};

export default function QueueTokens({
  initialTokens,
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

      if (!error && data) {
        setQueueTokens(data.tokens);
      }
    }

    fetchTokens();

    const interval = setInterval(fetchTokens, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [userId]);

  return (
    <div className="hidden items-center gap-3 rounded-full border border-violet-400/15 bg-violet-500/[0.07] px-4 py-2 sm:flex">
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
  );
}