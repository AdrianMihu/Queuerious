"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import {
  Heart,
  Home,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  User,
  CircleHelp,
  Zap,
} from "lucide-react";

type DashboardSidebarProps = {
  firstName: string;
  email: string;
};

export default function DashboardSidebar({
  firstName,
  email,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const isQueueWaiting =
  pathname === "/dashboard/queuemitment/waiting";

  async function handleNavigation() {
    console.log("🔥 HANDLE NAVIGATION", pathname);
    if (!isQueueWaiting) return;
  
    const supabase = createClient();
  
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) return;
  
    const { error } = await supabase.rpc("leave_queuemitment");

console.log("🔥 LEAVE QUEUEMITMENT ERROR:", error);

console.log("🔥 DISCARD ERROR:", error);
  }
  

  const isChatActive = pathname.startsWith("/dashboard/queuemitment/chat");

  const navClass = isChatActive
    ? "pointer-events-none cursor-not-allowed opacity-30"
    : "";

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-gray-200 bg-white text-gray-900 dark:border-white/[0.07] dark:bg-[#0d0d12] dark:text-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-gray-200 px-6 dark:border-white/[0.07]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-lg font-bold text-violet-300">
          Q
        </div>

        <div>
          <h1 className="font-semibold tracking-tight">Queuerious</h1>

          <p className="text-xs text-gray-500 dark:text-white/35">
            Meet differently.
          </p>
        </div>
      </div>

      {/* Navigation */}

      {/* QUEUE AND ME */}

      <div
        className={`mx-4 mt-8 border-t border-gray-200 pt-3 dark:border-white/[0.07] ${navClass}`}
      >
        <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 dark:text-white/25">
          Queue and me
        </p>

        <Link
          href="/dashboard/how-it-works"
          onClick={handleNavigation}
          className="group relative z-[60] flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-violet-500/10 hover:text-violet-600 dark:text-white/50 dark:hover:text-violet-300"
        >
          <CircleHelp size={18} />
          How it Works
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 dark:text-white/25">
          Discover
        </p>

        {isChatActive && (
          <div className="mt-8 rounded-2xl border border-violet-400/10 bg-violet-500/[0.05] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-violet-300">
              <div className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              Conversation active
            </div>

            <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-white/35">
              Your navigation is temporarily locked while you&apos;re in a
              conversation.
            </p>
          </div>
        )}

        <div className={`space-y-1 ${navClass}`}>
          <Link
            href="/dashboard"
            onClick={handleNavigation}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white"
          >
            <Home size={18} />
            Home
          </Link>

          <Link
            id="tutorial-profile"
            href="/dashboard/profile"
            onClick={handleNavigation}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white"
          >
            <User size={18} />
            Profile
          </Link>
          <Link
            id="tutorial-preferences"
            href="/dashboard/preferences"
            onClick={handleNavigation}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white"
          >
            <SlidersHorizontal size={18} />
            Preferences
          </Link>

          <Link
            href="/dashboard/matches"
            onClick={handleNavigation}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white"
          >
            <Heart size={18} />
            Matches
          </Link>
        </div>

        <div className="my-7 border-t border-gray-200 dark:border-white/[0.07]" />

        <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 dark:text-white/25">
          Experience
        </p>

        <div className={`space-y-1 ${navClass}`}>
          <Link
            id="tutorial-queuemitment"
            href="/dashboard/queuemitment"
            onClick={handleNavigation}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white"
          >
            <Zap size={18} className="transition group-hover:fill-violet-300" />
            Queuemitment
          </Link>

          <Link
            href="/dashboard/store"
            onClick={handleNavigation}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white"
          >
            <ShoppingBag size={18} />
            Store
          </Link>
        </div>

        <div className="my-7 border-t border-gray-200 dark:border-white/[0.07]" />

        <div className={navClass}>
          <Link
            href="/dashboard/settings"
            onClick={handleNavigation}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white"
          >
            <Settings size={18} />
            Settings
          </Link>

          <Link
            href="/dashboard/debug"
            onClick={handleNavigation}
            className={`mb-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white ${navClass}`}
          >
            <Settings size={18} />
            Debug
          </Link>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 p-4 dark:border-white/[0.07]">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-sm font-semibold">
            {firstName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{firstName}</p>

            <p className="truncate text-xs text-gray-500 dark:text-white/35">
              {email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
