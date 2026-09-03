import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock3, Lock, MessageCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type HistoryMessage = {
  sender_id: string | null;
  message_type: string;
  content: string;
  created_at: string;
};

type HistoryItem = {
  id: string;
  conversation_id: string;
  other_gender: string;
  connection_type: string | null;
  messages: HistoryMessage[];
  created_at: string;
};

export default async function HistoryConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (subscription?.plan !== "mind") {
    redirect("/dashboard/store");
  }

  const { data: history } = await supabase
    .from("queuemitment_history")
    .select(
      "id, conversation_id, other_gender, connection_type, messages, created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (!history) {
    redirect("/dashboard/queuemitment-history");
  }

  const item = history as HistoryItem;
  const conversationDate = new Date(item.created_at);

  return (
    <div className="p-6 lg:p-10">
      {/* Back */}
      <Link
        href="/dashboard/queuemitment-history"
        className="mb-6 inline-flex items-center gap-2 text-sm text-white/35 transition-colors hover:text-cyan-400"
      >
        <ArrowLeft size={16} />
        Back to History
      </Link>

      {/* Conversation header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.06] via-white/[0.02] to-transparent p-5 lg:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-cyan-400/[0.06] blur-3xl" />

        <div className="relative flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.06)]">
            <span className="text-lg font-semibold text-cyan-400/80">?</span>

            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#0d0d12] bg-cyan-400/60" />
          </div>

          {/* Identity */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white lg:text-2xl">
                Someone
              </h1>

              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/40">
                {item.other_gender}
              </span>

              {item.connection_type && (
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                    item.connection_type === "Relationship"
                      ? "border-rose-400/15 bg-rose-400/[0.05] text-rose-300/75"
                      : "border-violet-400/15 bg-violet-400/[0.05] text-violet-300/75"
                  }`}
                >
                  {item.connection_type}
                </span>
              )}
            </div>

            <div className="mt-1.5 flex items-center gap-2 text-xs text-white/30">
              <Clock3 size={13} />
              {conversationDate.toLocaleDateString("en-GB")}
              <span className="text-white/15">•</span>
              {item.messages.length}{" "}
              {item.messages.length === 1 ? "message" : "messages"}
            </div>
          </div>
        </div>
      </div>

      {/* Read-only notice */}
      <div className="mx-auto mb-4 flex max-w-4xl items-center justify-center gap-2 text-[11px] text-white/25">
        <Lock size={13} className="text-cyan-400/50" />
        Read-only conversation
      </div>

      {/* Chat */}
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0b0b10] shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
        {/* Chat top bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
          <MessageCircle size={15} className="text-cyan-400/60" />

          <span className="text-xs font-medium text-white/30">
            Queuemitment
          </span>

          <Sparkles size={13} className="ml-auto text-cyan-400/40" />
        </div>

        {/* Messages */}
        <div className="space-y-3 p-5 lg:p-7">
          {item.messages.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center text-sm text-white/25">
              No messages in this conversation.
            </div>
          ) : (
            item.messages.map((message, index) => {
              const isMine = message.sender_id === user.id;

              return (
                <div
                  key={`${message.created_at}-${index}`}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isMine
                        ? "rounded-br-md border border-cyan-400/10 bg-cyan-400/[0.12] text-cyan-50"
                        : "rounded-bl-md border border-white/[0.05] bg-white/[0.045] text-white/75"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 border-t border-white/[0.05] px-5 py-4">
          <Lock size={12} className="text-cyan-400/40" />

          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/20">
            Archived • Read-only
          </span>
        </div>
      </div>
    </div>
  );
}
