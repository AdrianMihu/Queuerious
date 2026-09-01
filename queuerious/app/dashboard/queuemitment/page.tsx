"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import {
  ArrowRight,
  Crown,
  Lock,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";

type QueueType = "standard" | "priority" | null;

export default function QueuemitmentPage() {
  const router = useRouter();

  const [selectedQueue, setSelectedQueue] = useState<QueueType>(null);

  const [isEnteringQueue, setIsEnteringQueue] = useState(false);

  const [showNoTokensModal, setShowNoTokensModal] = useState(false);

  const [showProfileRequiredModal, setShowProfileRequiredModal] =
    useState(false);

  const [showPreferencesRequiredModal, setShowPreferencesRequiredModal] =
    useState(false);

  const hasPriorityAccess = false;

  const handleEnterQueue = async () => {
    if (!selectedQueue || isEnteringQueue) return;

    try {
      setIsEnteringQueue(true);

      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("User not authenticated:", authError);
        return;
      }

      /*
  PROFILE + PREFERENCES CHECK

  The user must complete their profile location
  and all matchmaking preferences before entering
  the queue.
*/

      const [
        { data: profile, error: profileError },
        { data: preferences, error: preferencesError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("location")
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("preferences")
          .select(
            "looking_for_type, searching_for, min_age, max_age, location_preference"
          )
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      if (profileError) {
        console.error("Error checking profile:", profileError);

        alert("We couldn't check your profile. Please try again.");

        return;
      }

      if (preferencesError) {
        console.error("Error checking preferences:", preferencesError);

        alert("We couldn't check your preferences. Please try again.");

        return;
      }

      /*
  LOCATION IS REQUIRED
*/

      if (!profile?.location) {
        setShowProfileRequiredModal(true);
        return;
      }

      /*
  ALL PREFERENCES ARE REQUIRED
*/

      if (
        !preferences ||
        !preferences.looking_for_type ||
        preferences.looking_for_type.length === 0 ||
        preferences.min_age === null ||
        preferences.min_age === undefined ||
        preferences.max_age === null ||
        preferences.max_age === undefined ||
        !preferences.location_preference
      ) {
        setShowPreferencesRequiredModal(true);
        return;

        return;
      }

      /*
        Check if the user has at least
        one queue token available.
      */
      const { data: tokenData, error: tokenError } = await supabase
        .from("queue_tokens")
        .select("tokens")
        .eq("user_id", user.id)
        .maybeSingle();

      if (tokenError) {
        console.error("Error checking queue tokens:", tokenError);
        alert("We couldn't check your queue tokens. Please try again.");
        return;
      }

      if (!tokenData || tokenData.tokens < 1) {
        setShowNoTokensModal(true);
        return;
      }

      /*
        Check if the user already has
        an active queue entry.
      */
      const { data: existingEntry, error: existingError } = await supabase
        .from("queue_entries")
        .select("id, status")
        .eq("user_id", user.id)
        .in("status", ["waiting"])
        .maybeSingle();

      if (existingError) {
        console.error("Error checking queue entry");
        console.error("message:", existingError.message);
        console.error("details:", existingError.details);
        console.error("hint:", existingError.hint);
        console.error("code:", existingError.code);

        alert(
          `Error checking queue entry:\n\n${existingError.message}\nCode: ${existingError.code}`
        );

        return;
      }

      /*
        If already in an active queue,
        just continue to waiting.
      */
      if (existingEntry) {
        router.push("/dashboard/queuemitment/waiting");
        return;
      }

      /*
        Create a new queue entry.
  
        IMPORTANT:
        We DO NOT consume a token here.
        The token will only be consumed
        when a conversation actually starts.
      */
      const { error: insertError } = await supabase
        .from("queue_entries")
        .insert({
          user_id: user.id,
          queue_type: selectedQueue,
          status: "waiting",
        });

      if (insertError) {
        console.error("QUEUE INSERT ERROR");
        console.error("message:", insertError.message);
        console.error("details:", insertError.details);
        console.error("hint:", insertError.hint);
        console.error("code:", insertError.code);

        alert(`Could not enter the queue: ${insertError.message}`);
        return;
      }

      router.push("/dashboard/queuemitment/waiting");
    } catch (error) {
      console.error("Unexpected error entering queue:", error);
    } finally {
      setIsEnteringQueue(false);
    }
  };

  /*
    TEMPORARY FOR MVP

    Later this will come from the user's
    active subscription in Supabase.
  */

  return (
    <section className="flex-1 px-6 py-10 lg:px-10 xl:px-16">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-2 text-sm text-violet-300">
            <Zap size={16} />
            <span>Queuemitment</span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Meet someone differently.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/45 sm:text-lg">
            Choose how you want to enter the queue. We’ll take your preferences
            into account and look for someone worth discovering.
          </p>
        </div>

        {/* QUEUE OPTIONS */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* STANDARD QUEUE */}
          <button
            type="button"
            onClick={() => setSelectedQueue("standard")}
            className={`group relative overflow-hidden rounded-[32px] border p-8 text-left transition sm:p-10 ${
              selectedQueue === "standard"
                ? "border-violet-400/50 bg-violet-500/[0.10] shadow-2xl shadow-violet-950/30"
                : "border-white/[0.07] bg-white/[0.025] hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[0.04]"
            }`}
          >
            {/* Glow */}
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px] transition group-hover:bg-violet-500/20" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/10">
                  <Sparkles size={28} className="text-violet-300" />
                </div>

                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                  Available
                </span>
              </div>

              <div className="mt-10">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-violet-300">
                  Standard
                </p>

                <h2 className="mt-2 text-3xl font-semibold">Standard Queue</h2>

                <p className="mt-4 max-w-md leading-relaxed text-white/45">
                  Take your place in the queue and meet someone based on
                  curiosity, conversation and your preferences.
                </p>
              </div>

              <div className="mt-10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white/35">
                  <Zap size={16} className="text-violet-300" />
                  Available to everyone
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                    selectedQueue === "standard"
                      ? "bg-violet-500 text-white"
                      : "bg-white/[0.05] text-white/45 group-hover:bg-violet-500/15 group-hover:text-violet-300"
                  }`}
                >
                  <ArrowRight size={19} />
                </div>
              </div>
            </div>
          </button>

          {/* PRIORITY QUEUE */}
          {hasPriorityAccess ? (
            <button
              type="button"
              onClick={() => setSelectedQueue("priority")}
              className={`group relative overflow-hidden rounded-[32px] border p-8 text-left transition sm:p-10 ${
                selectedQueue === "priority"
                  ? "border-cyan-400/50 bg-cyan-500/[0.10] shadow-2xl shadow-cyan-950/30"
                  : "border-cyan-400/20 bg-gradient-to-br from-cyan-500/[0.10] via-[#11171b] to-[#101015] hover:-translate-y-1 hover:border-cyan-400/40"
              }`}
            >
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-[100px] transition group-hover:bg-cyan-400/25" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                    <Zap size={28} className="fill-cyan-300 text-cyan-300" />
                  </div>

                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                    Priority Access
                  </span>
                </div>

                <div className="mt-10">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
                    Priority
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold">
                    Priority Queue
                  </h2>

                  <p className="mt-4 max-w-md leading-relaxed text-white/45">
                    Less waiting. More curiosity. Priority members move ahead in
                    the matchmaking queue.
                  </p>
                </div>

                <div className="mt-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-cyan-200/60">
                    <Crown size={16} />
                    Membership benefit
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                      selectedQueue === "priority"
                        ? "bg-cyan-400 text-[#071014]"
                        : "bg-cyan-400/10 text-cyan-200 group-hover:bg-cyan-400/20"
                    }`}
                  >
                    <ArrowRight size={19} />
                  </div>
                </div>
              </div>
            </button>
          ) : (
            <div className="group relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-white/[0.015] p-8 sm:p-10">
              {/* Subtle locked glow */}
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/[0.06] blur-[100px]" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                    <Lock size={25} className="text-white/35" />
                  </div>

                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                    Members only
                  </span>
                </div>

                <div className="mt-10">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/35">
                    Priority
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold text-white/75">
                    Priority Queue
                  </h2>

                  <p className="mt-4 max-w-md leading-relaxed text-white/35">
                    Less waiting. More curiosity. Move ahead in the matchmaking
                    queue with Priority access.
                  </p>
                </div>

                <div className="mt-10">
                  <p className="mb-4 text-sm text-white/30">
                    Available with Queuerious Beyond or Queuerious Mind.
                  </p>

                  <Link
                    href="/dashboard/store"
                    className="inline-flex items-center gap-2 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-5 py-3 text-sm font-medium text-violet-200 transition hover:border-violet-400/40 hover:bg-violet-500/20"
                  >
                    <Crown size={16} />
                    Explore Memberships
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SELECTED QUEUE */}
        {selectedQueue && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex flex-col gap-5 rounded-[28px] border border-violet-400/20 bg-violet-500/[0.07] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-violet-300">
                  <Zap size={16} />
                  <span>Queue selected</span>
                </div>

                <h3 className="mt-2 text-xl font-semibold">
                  {selectedQueue === "standard"
                    ? "Standard Queue"
                    : "Priority Queue"}
                </h3>

                <p className="mt-1 text-sm text-white/40">
                  Ready when you are. We’ll start looking for your next
                  conversation.
                </p>
              </div>

              <button
                type="button"
                onClick={handleEnterQueue}
                disabled={isEnteringQueue}
                className="inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-violet-500 px-8 py-5 text-lg font-medium transition hover:bg-violet-400 hover:shadow-xl hover:shadow-violet-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Zap
                  size={20}
                  className={isEnteringQueue ? "animate-pulse" : ""}
                />

                {isEnteringQueue ? "Entering Queue..." : "Enter the Queue"}

                {!isEnteringQueue && <ChevronRight size={20} />}
              </button>
            </div>
          </div>
        )}

        {/* SMALL INFO */}
        <div className="mt-12 border-t border-white/[0.07] pt-6">
          <p className="max-w-2xl text-sm leading-relaxed text-white/25">
            Matches are based on your Queuerious preferences. Profiles remain
            hidden at the beginning — because sometimes the best connections
            start with a conversation.
          </p>
        </div>
      </div>
      {showNoTokensModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#09090d]/80 backdrop-blur-md"
            onClick={() => setShowNoTokensModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-violet-400/20 bg-[#111118] p-8 shadow-2xl shadow-black/60">
            {/* Background glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/20 blur-[100px]" />

            <div className="relative">
              {/* Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                <Zap size={28} className="text-violet-300" />
              </div>

              {/* Content */}
              <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-violet-300">
                No queues available
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                You’re out of queue tokens.
              </h2>

              <p className="mt-4 leading-relaxed text-white/45">
                You need at least one queue token to enter Queuemitment. Get
                more queues and come back when you’re ready for your next
                conversation.
              </p>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowNoTokensModal(false)}
                  className="flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                >
                  Maybe later
                </button>

                <Link
                  href="/dashboard/store"
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20"
                >
                  Get more queues
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {showProfileRequiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#09090d]/80 backdrop-blur-md"
            onClick={() => setShowProfileRequiredModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-violet-400/20 bg-[#111118] p-8 shadow-2xl shadow-black/60">
            {/* Background glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/20 blur-[100px]" />

            <div className="relative">
              {/* Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                <Sparkles size={28} className="text-violet-300" />
              </div>

              <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-violet-300">
                Profile incomplete
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Your profile isn&apos;t ready yet.
              </h2>

              <p className="mt-4 leading-relaxed text-white/45">
                Before entering Queuemitment, please set your location. We need
                it to find compatible people for you.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowProfileRequiredModal(false)}
                  className="flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                >
                  Maybe later
                </button>

                <Link
                  href="/dashboard/profile"
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20"
                >
                  Complete profile
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPreferencesRequiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#09090d]/80 backdrop-blur-md"
            onClick={() => setShowPreferencesRequiredModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-violet-400/20 bg-[#111118] p-8 shadow-2xl shadow-black/60">
            {/* Background glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/20 blur-[100px]" />

            <div className="relative">
              {/* Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                <Zap size={28} className="text-violet-300" />
              </div>

              <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-violet-300">
                Preferences incomplete
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Tell us who you&apos;re looking for.
              </h2>

              <p className="mt-4 leading-relaxed text-white/45">
                Complete your matchmaking preferences before entering
                Queuemitment. This helps us find people who are actually
                compatible with you.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowPreferencesRequiredModal(false)}
                  className="flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                >
                  Maybe later
                </button>

                <Link
                  href="/dashboard/preferences"
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20"
                >
                  Set preferences
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
