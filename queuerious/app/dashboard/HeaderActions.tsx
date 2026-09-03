"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Notifications from "./Notifications";

import {
  CircleUserRound,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { createClient } from "../../lib/supabase/client";

type HeaderActionsProps = {
  firstName: string;
  email: string;
  userId: string;
};

export default function HeaderActions({
  firstName,
  email,
  userId,
}: HeaderActionsProps) {
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /*
    CLOSE PROFILE DROPDOWN WHEN CLICKING OUTSIDE
  */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
    LOGOUT
  */

  async function handleLogout() {
    try {
      setLoggingOut(true);

      const supabase = createClient();

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Error logging out:",
          error
        );

        setLoggingOut(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Unexpected logout error:",
        error
      );

      setLoggingOut(false);
    }
  }

  return (
    <div className="flex items-center gap-3">

      {/* ============================== */}
      {/* NOTIFICATIONS */}
      {/* ============================== */}

      <Notifications userId={userId} />


      {/* ============================== */}
      {/* PROFILE MENU */}
      {/* ============================== */}

      <div
        ref={profileRef}
        className="relative"
      >
        <button
          onClick={() =>
            setProfileOpen(
              (current) => !current
            )
          }
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition ${
            profileOpen
              ? "border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300"
              : "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:border-white/[0.07] dark:text-white/45 dark:hover:bg-white/[0.05] dark:hover:text-white"
          }`}
          aria-label="Profile menu"
        >
          <CircleUserRound size={24} />
        </button>


        {/* PROFILE DROPDOWN */}

        {profileOpen && (
          <div className="absolute right-0 top-[68px] z-50 w-[280px] animate-in fade-in zoom-in-95 duration-200">

<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-2xl shadow-gray-900/10 backdrop-blur-xl dark:border-white/[0.09] dark:bg-[#121218]/95 dark:shadow-black/40">

              {/* USER INFO */}

              <div className="border-b border-gray-200 px-5 py-4 dark:border-white/[0.07]">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-sm font-semibold text-white">
                    {firstName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-medium">
                      {firstName}
                    </p>

                    <p className="truncate text-xs text-gray-500 dark:text-white/35">
                      {email}
                    </p>

                  </div>

                </div>

              </div>


              {/* MENU */}

              <div className="p-2">

                <Link
                  href="/dashboard/profile"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/55 dark:hover:bg-white/[0.05] dark:hover:text-white"
                >
                  <User size={17} />
                  Your profile
                </Link>


                <Link
                  href="/dashboard/settings"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/55 dark:hover:bg-white/[0.05] dark:hover:text-white"
                >
                  <Settings size={17} />
                  Settings
                </Link>

              </div>


              {/* LOGOUT */}

              <div className="border-t border-gray-200 p-2 dark:border-white/[0.07]">

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut size={17} />

                  {loggingOut
                    ? "Logging out..."
                    : "Log out"}

                </button>

              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}