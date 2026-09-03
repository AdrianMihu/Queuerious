import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Clock3, MessageCircle, Sparkles } from "lucide-react";

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
  messages: HistoryMessage[];
  created_at: string;
  connection_type: string | null;
};

export default async function QueuemitmentHistoryPage() {
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

  const { data: history, error } = await supabase
    .from("queuemitment_history")
    .select(
      "id, conversation_id, other_gender, connection_type, messages, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("History fetch error:", error);
  }

  const historyItems = (history ?? []) as HistoryItem[];

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.06] via-white/[0.02] to-transparent p-6 lg:p-7">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/[0.06] blur-3xl" />

        <div className="relative flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.08)]">
              <Clock3 className="h-6 w-6 text-cyan-400" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
                  Queuemitment History
                </h1>

                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">
                  Mind
                </span>

                <Sparkles className="h-4 w-4 text-cyan-400/70" />
              </div>

              <p className="mt-1.5 text-sm text-white/40">
                Revisit previous conversations that did not end in a match
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
              Archive
            </p>

            <p className="mt-1 text-sm font-medium text-white/50">
              {historyItems.length} / 10
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {historyItems.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-white/[0.07] bg-white/[0.02] text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <MessageCircle className="h-7 w-7 text-cyan-400" />
          </div>

          <h2 className="text-lg font-semibold text-white">No history yet</h2>

          <p className="mt-2 max-w-sm text-sm text-white/40">
            Your past Queuemitments will appear here after a conversation ends
            without a mutual match.
          </p>
        </div>
      ) : (
        /* History list */
        <div className="grid gap-4">
          {historyItems.map((item) => {
            const lastMessage =
              item.messages[item.messages.length - 1]?.content ?? "No messages";

            const date = new Date(item.created_at);

            return (
              <Link
                key={item.id}
                href={`/dashboard/queuemitment-history/${item.id}`}
                className="group relative block overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-[1px] hover:border-cyan-400/20 hover:bg-cyan-400/[0.025] hover:shadow-[0_0_40px_rgba(34,211,238,0.05)]"
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/[0.04] blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative flex items-center justify-between gap-5">
                  <div className="flex min-w-0 items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 to-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <span className="text-lg font-semibold text-cyan-400/80">
                        ?
                      </span>

                      <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#0d0d12] bg-cyan-400/60" />
                    </div>

                    {/* Conversation info */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold tracking-tight text-white">
                          Someone
                        </h2>

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

                      <p className="mt-1.5 truncate text-sm text-white/35 transition-colors group-hover:text-white/45">
                        {lastMessage}
                      </p>
                    </div>
                  </div>

                  {/* Metadata + arrow */}
                  <div className="flex shrink-0 items-center gap-4">
                    <div className="hidden text-right sm:block">
                      <p className="text-xs text-white/30">
                        {date.toLocaleDateString("en-GB")}
                      </p>

                      <p className="mt-1 text-[11px] text-white/20">
                        {item.messages.length}{" "}
                        {item.messages.length === 1 ? "message" : "messages"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile metadata */}
                <div className="relative mt-4 flex items-center gap-3 border-t border-white/[0.05] pt-3 sm:hidden">
                  <span className="text-[11px] text-white/25">
                    {date.toLocaleDateString("en-GB")}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-white/15" />

                  <span className="text-[11px] text-white/20">
                    {item.messages.length}{" "}
                    {item.messages.length === 1 ? "message" : "messages"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
