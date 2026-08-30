"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const isChatActive = pathname.startsWith(
    "/dashboard/queuemitment/chat"
  );

  const navClass = isChatActive
    ? "pointer-events-none cursor-not-allowed opacity-30"
    : "";

  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-white/[0.07] bg-[#0d0d12] lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-white/[0.07] px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-lg font-bold text-violet-300">
          Q
        </div>

        <div>
          <h1 className="font-semibold tracking-tight">
            Queuerious
          </h1>

          <p className="text-xs text-white/35">
            Meet differently.
          </p>
        </div>
      </div>

      {/* Navigation */}

      {/* QUEUE AND ME */}

      <div className="mx-4 mt-8 border-t border-white/[0.07] pt-3">
  <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/25">
    Queue and me
  </p>

  <Link
    href="/dashboard/how-it-works"
    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-violet-500/10 hover:text-violet-300"
  >
    <CircleHelp size={18} />
    How it Works
  </Link>
</div>


      <nav className="flex-1 px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/25">
          Discover
        </p>

        <div className={`space-y-1 ${navClass}`}>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white"
          >
            <Home size={18} />
            Home
          </Link>

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white"
          >
            <User size={18} />
            Profile
          </Link>

          <Link
            href="/dashboard/preferences"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white"
          >
            <SlidersHorizontal size={18} />
            Preferences
          </Link>

          <Link
  href="/dashboard/matches"
  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white"
>
  <Heart size={18} />
  Matches
</Link>
        </div>

        <div className="my-7 border-t border-white/[0.07]" />

        <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/25">
          Experience
        </p>

        <div className={`space-y-1 ${navClass}`}>
          <Link
            href="/dashboard/queuemitment"
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-violet-500/10 hover:text-violet-300"
          >
            <Zap
              size={18}
              className="transition group-hover:fill-violet-300"
            />
            Queuemitment
          </Link>

          <Link
            href="/dashboard/store"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white"
          >
            <ShoppingBag size={18} />
            Store
          </Link>
        </div>

        <div className="my-7 border-t border-white/[0.07]" />

<div className={navClass}>
  <Link
    href="/dashboard/settings"
    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white"
  >
    <Settings size={18} />
    Settings
  </Link>

  <Link
  href="/dashboard/debug"
  className={`mb-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white ${navClass}`}
>
  <Settings size={18} />
  Debug
</Link>
</div>

        {isChatActive && (
          <div className="mt-8 rounded-2xl border border-violet-400/10 bg-violet-500/[0.05] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-violet-300">
              <div className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              Conversation active
            </div>

            <p className="mt-2 text-xs leading-relaxed text-white/35">
              Your navigation is temporarily locked while you&apos;re in
              a conversation.
            </p>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/[0.07] p-4">
        

        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-sm font-semibold">
            {firstName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {firstName}
            </p>

            <p className="truncate text-xs text-white/35">
              {email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}