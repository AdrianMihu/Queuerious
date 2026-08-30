import Link from "next/link";
import DashboardSidebar from "./DashboardSidebar";
import QueueTokens from "./QueueTokens";
import {
  Bell,
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

  if (typeof userId === "string") {
    const { data: tokenData } = await supabase
      .from("queue_tokens")
      .select("tokens")
      .eq("user_id", userId)
      .single();

    queueTokens = tokenData?.tokens ?? 0;
  }

  return (
    <main className="min-h-screen bg-[#09090d] text-white">
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
              {/* Queue tokens */}
              <QueueTokens
  initialTokens={queueTokens}
  userId={userId}
/>

              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] text-white/45 transition hover:bg-white/[0.05] hover:text-white">
                <Bell size={18} />
              </button>

              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] text-white/45 transition hover:bg-white/[0.05] hover:text-white">
                <CircleUserRound size={19} />
              </button>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
