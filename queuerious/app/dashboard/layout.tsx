import Link from "next/link";
import DashboardSidebar from "./DashboardSidebar";
import HeaderActions from "./HeaderActions";
import Notifications from "./Notifications";
import QueueTokens from "./QueueTokens";

import {
  Bell,
  Brain,
  Sparkles,
  CircleUserRound,
  Flame,
  Home,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  User,
  Zap,
} from "lucide-react";

import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    redirect("/");
  }

  const email =
    typeof data.claims?.email === "string"
      ? data.claims.email
      : "Queuerious user";

  const metadata = data.claims?.user_metadata;

  const firstName =
    metadata &&
    typeof metadata.first_name === "string" &&
    metadata.first_name.trim().length > 0
      ? metadata.first_name.trim()
      : "there";

  const userId = data.claims?.sub;

  let queueTokens = 0;
  let freeTokenClaimedAt: string | null = null;

  const { data: tokenData } = await supabase
    .from("queue_tokens")
    .select("tokens, free_token_claimed_at")
    .eq("user_id", userId)
    .single();

  queueTokens = tokenData?.tokens ?? 0;
  freeTokenClaimedAt = tokenData?.free_token_claimed_at ?? null;

  let activeSubscription: "beyond" | "mind" | null = null;

  const { data: subscriptionData } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (
    subscriptionData?.plan === "beyond" ||
    subscriptionData?.plan === "mind"
  ) {
    activeSubscription = subscriptionData.plan;
  }

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-gray-900 dark:bg-[#09090d] dark:text-white">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <DashboardSidebar firstName={firstName} email={email} />

        {/* MAIN APP */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOP BAR */}
          <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/[0.07] px-6 lg:px-10">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 font-bold text-violet-300">
                Q
              </div>

              <span className="font-semibold">Queuerious</span>
            </div>

            <div className="hidden lg:block">
              <p className="text-sm text-white/35">Your Queuerious space</p>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {activeSubscription && (
                <div
                  className={`flex items-center gap-3 rounded-3xl border px-5 py-2.5 ${
                    activeSubscription === "beyond"
                      ? "border-violet-400/15 bg-violet-500/[0.07]"
                      : "border-cyan-400/15 bg-cyan-400/[0.07]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      activeSubscription === "beyond"
                        ? "bg-violet-500/15"
                        : "bg-cyan-400/15"
                    }`}
                  >
                    {activeSubscription === "beyond" ? (
                      <Sparkles size={19} className="text-violet-300" />
                    ) : (
                      <Brain size={19} className="text-cyan-300" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {activeSubscription === "beyond"
                        ? "Queuerious Beyond"
                        : "Queuerious Mind"}
                    </p>

                    <p
                      className={`text-xs ${
                        activeSubscription === "beyond"
                          ? "text-violet-300/50"
                          : "text-cyan-300/50"
                      }`}
                    >
                      Active membership
                    </p>
                  </div>
                </div>
              )}
              <QueueTokens
                initialTokens={queueTokens}
                initialFreeTokenClaimedAt={
                  tokenData?.free_token_claimed_at ?? null
                }
                userId={userId}
              />

              {typeof userId === "string" && (
                <HeaderActions
                  firstName={firstName}
                  email={email}
                  userId={userId}
                />
              )}
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
