"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle, X } from "lucide-react";

import { createClient } from "../../lib/supabase/client";

type NotificationsProps = {
  userId: string;
};

export default function Notifications({
  userId,
}: NotificationsProps) {
  const [hasNotifications, setHasNotifications] = useState(false);
  const [open, setOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  /*
    CLOSE WHEN CLICKING OUTSIDE
  */

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
    REALTIME NOTIFICATIONS
  */

  useEffect(() => {
    const supabase = createClient();

    let channel: ReturnType<typeof supabase.channel> | null = null;

    let cancelled = false;

    async function setupNotifications() {
      const { data: matches, error } = await supabase
        .from("matches")
        .select("conversation_id")
        .or(
          `user_one_id.eq.${userId},user_two_id.eq.${userId}`
        );

      if (cancelled) return;

      if (error) {
        console.error(
          "Error loading notification conversations:",
          error
        );

        return;
      }

      const conversationIds = (matches ?? [])
        .map((match) => match.conversation_id)
        .filter(
          (conversationId): conversationId is string =>
            Boolean(conversationId)
        );

      if (conversationIds.length === 0) {
        return;
      }

      channel = supabase
        .channel(`notifications-${userId}-${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "conversation_messages",
          },
          (payload) => {
            const message = payload.new as {
              conversation_id: string;
              sender_id: string;
            };

            if (
              !conversationIds.includes(
                message.conversation_id
              )
            ) {
              return;
            }

            if (message.sender_id === userId) {
              return;
            }

            setHasNotifications(true);
          }
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            console.error(
              "Notification realtime channel error"
            );
          }
        });
    }

    setupNotifications();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);

  /*
    OPEN NOTIFICATIONS
  */

  function handleOpenNotifications() {
    setOpen((current) => !current);
  }

  /*
    MARK AS SEEN
  */

  function handleNotificationClick() {
    setHasNotifications(false);
    setOpen(false);
  }

  return (
    <div ref={notificationRef} className="relative">
      {/* BELL */}

      <button
        onClick={handleOpenNotifications}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
          open
            ? "border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300"
            : "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:border-white/[0.07] dark:text-white/45 dark:hover:bg-white/[0.05] dark:hover:text-white"
        }`}
        aria-label="Notifications"
      >
        <Bell size={18} />

        {hasNotifications && (
          <>
            <span className="absolute right-2 top-2 h-2.5 w-2.5 animate-pulse rounded-full bg-violet-400" />

            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#09090d]" />
          </>
        )}
      </button>

      {/* DROPDOWN */}

      {open && (
        <div className="absolute right-0 top-[52px] z-50 w-[320px] animate-in fade-in zoom-in-95 duration-200">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-2xl shadow-gray-900/10 backdrop-blur-xl dark:border-white/[0.09] dark:bg-[#121218]/95 dark:shadow-black/40">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/[0.07]">
              <div>
                <p className="text-sm font-semibold">
                  Notifications
                </p>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-white/35">
                  Stay up to date with your connections.
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 transition hover:text-gray-900 dark:text-white/25 dark:hover:text-white"
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>

            {/* NEW MESSAGE */}

            {hasNotifications ? (
              <Link
                href="/dashboard/matches"
                onClick={handleNotificationClick}
                className="flex gap-3 px-5 py-4 transition hover:bg-gray-50 dark:hover:bg-white/[0.04]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-violet-600 dark:text-violet-300">
                  <MessageCircle size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white/80">
                    You have new messages
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-white/40">
                    Someone from your matches has sent you a
                    message.
                  </p>
                </div>
              </Link>
            ) : (
              /* EMPTY STATE */

              <div className="flex flex-col items-center px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-500/[0.06] text-violet-600 dark:text-violet-300">
                  <Bell size={20} />
                </div>

                <p className="mt-4 text-sm font-medium text-gray-700 dark:text-white/70">
                  You&apos;re all caught up
                </p>

                <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-gray-500 dark:text-white/35">
                  New messages from your matches will appear
                  here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}