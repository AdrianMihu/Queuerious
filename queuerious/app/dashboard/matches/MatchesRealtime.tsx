"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

type Props = {
  conversationIds: string[];
};

export default function MatchesRealtime({
  conversationIds,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    if (conversationIds.length === 0) return;

    const supabase = createClient();

    const channels = conversationIds.map((conversationId) =>
      supabase
        .channel(`matches-list-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "conversation_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          () => {
            router.refresh();
          }
        )
        .subscribe()
    );

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [conversationIds, router]);

  return null;
}