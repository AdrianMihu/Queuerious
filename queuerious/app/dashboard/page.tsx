import Link from "next/link";
import {
  Brain,
  ChevronRight,
  EyeOff,
  Heart,
  MessageCircle,
  SlidersHorizontal,
  Sparkles,
  User,
  UserRound,
  HeartHandshake,
  Users,
  Zap,
} from "lucide-react";

import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingTutorial from "./components/OnboardingTutorial";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    redirect("/");
  }

  const userId = data.claims?.sub;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("photo_urls, tutorial_completed")
    .eq("id", userId)
    .maybeSingle();

  const tutorialCompleted = profileData?.tutorial_completed === true;

  const profilePhoto =
    profileData?.photo_urls && profileData.photo_urls.length > 0
      ? profileData.photo_urls[0]
      : null;

  return (
    <>
      {!tutorialCompleted && <OnboardingTutorial />}

      <section className="flex-1 px-6 py-10 lg:px-10 xl:px-16">
        <div className="mx-auto max-w-6xl">
          {/* HERO */}
          <div className="relative mb-10 overflow-hidden rounded-[36px] border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.14] via-[#111019] to-[#09090d] px-7 py-10 shadow-[0_30px_100px_rgba(80,40,160,0.12)] sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-purple-500/10 blur-[110px]" />

            {/* Decorative Q / connection */}
            <div className="pointer-events-none absolute right-10 top-10 hidden opacity-[0.08] lg:block"></div>

            <div className="relative max-w-3xl">
              <div className="mb-6 flex items-center gap-2 text-sm font-medium text-violet-300">
                <Sparkles size={17} />
                <span>THE QUEURIOUS EXPERIENCE</span>
              </div>

              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
                You don&apos;t know
                <br />
                <span className="text-violet-300">
                  who you&apos;re about to meet.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/45 sm:text-lg">
                And that&apos;s exactly the point.
                <br className="hidden sm:block" />
                Start with a conversation. Let the connection reveal itself.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/dashboard/queuemitment"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-violet-500 px-7 py-4 font-medium transition hover:bg-violet-400 hover:shadow-xl hover:shadow-violet-500/20 active:scale-[0.98]"
                >
                  <Zap
                    size={18}
                    className="fill-white transition group-hover:scale-110"
                  />
                  Enter the Queue
                  <ChevronRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* HOW QUEURIOUS WORKS */}
          <div className="mb-12">
            <div className="mb-8 max-w-2xl">
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-violet-300">
                How Queuerious works
              </p>

              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                A connection, from queue to match.
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-white/35 sm:text-base">
                No swiping. Just a
                different way to meet someone.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-gradient-to-br from-white/[0.035] via-[#101017] to-violet-950/[0.08] p-6 sm:p-8 lg:p-10">
              {/* Ambient glow */}
              <div className="pointer-events-none absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-violet-600/[0.08] blur-[110px]" />

              <div className="relative space-y-0">
                {/* STEP 01 */}
                <div className="flex gap-5 sm:gap-7">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.09]">
                      <User size={20} className="text-violet-300" />
                    </div>

                    <div className="mt-3 w-px flex-1 bg-gradient-to-b from-violet-400/20 to-violet-400/5" />
                  </div>

                  <div className="flex flex-1 flex-col gap-5 pb-9 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-3">
                        <span className="text-xs font-medium text-violet-300/50">
                          01
                        </span>
                        <h3 className="text-lg font-semibold sm:text-xl">
                          Create your profile
                        </h3>
                      </div>

                      <p className="max-w-2xl text-sm leading-relaxed text-white/40 sm:text-base">
                        Add your photos and tell Queuerious a little about
                        yourself. Your profile is there to be discovered, but
                        not yet.
                      </p>
                    </div>

                    <Link
                      href="/dashboard/profile"
                      className="group inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-violet-400/15 bg-violet-500/[0.06] px-3.5 py-2 text-xs font-medium text-violet-200 transition hover:border-violet-400/30 hover:bg-violet-500/[0.12] hover:text-white sm:self-center"
                    >
                      <UserRound size={14} />
                      Go to Profile
                      <ChevronRight
                        size={14}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>
                </div>

                {/* STEP 02 */}
                <div className="flex gap-5 sm:gap-7">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.09]">
                      <SlidersHorizontal size={20} className="text-violet-300" />
                    </div>

                    <div className="mt-3 w-px flex-1 bg-gradient-to-b from-violet-400/20 to-violet-400/5" />
                  </div>

                  <div className="flex flex-1 flex-col gap-5 pb-9 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-3">
                        <span className="text-xs font-medium text-violet-300/50">
                          02
                        </span>
                        <h3 className="text-lg font-semibold sm:text-xl">
                          Set your preferences
                        </h3>
                      </div>

                      <p className="max-w-2xl text-sm leading-relaxed text-white/40 sm:text-base">
                        Choose what kind of connection you are looking for and
                        who you would like to meet. Queuerious uses these
                        preferences when finding your connection.
                      </p>
                    </div>

                    <Link
                      href="/dashboard/preferences"
                      className="group inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-violet-400/15 bg-violet-500/[0.06] px-3.5 py-2 text-xs font-medium text-violet-200 transition hover:border-violet-400/30 hover:bg-violet-500/[0.12] hover:text-white sm:self-center"
                    >
                      <SlidersHorizontal size={14} />
                      Set Preferences
                      <ChevronRight
                        size={14}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>
                </div>

                {/* STEP 03 */}
                <div className="flex gap-5 sm:gap-7">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.09]">
                      <Zap
                        size={20}
                        className="fill-violet-300 text-violet-300"
                      />
                    </div>

                    <div className="mt-3 w-px flex-1 bg-gradient-to-b from-violet-400/20 to-violet-400/5" />
                  </div>

                  <div className="flex flex-1 flex-col gap-5 pb-9 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-3">
                        <span className="text-xs font-medium text-violet-300/50">
                          03
                        </span>
                        <h3 className="text-lg font-semibold sm:text-xl">
                          Enter a queue
                        </h3>
                      </div>

                      <p className="max-w-2xl text-sm leading-relaxed text-white/40 sm:text-base">
                        Join the queue and let us find the perfect fit for you.
                        Queuerious works with{" "}
                        <span className="text-white/65">Queue Tokens</span>, and
                        you need at least one to enter the queue.
                      </p>
                    </div>

                    <Link
                      href="/dashboard/queuemitment"
                      className="group inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-violet-400/15 bg-violet-500/[0.06] px-3.5 py-2 text-xs font-medium text-violet-200 transition hover:border-violet-400/30 hover:bg-violet-500/[0.12] hover:text-white sm:self-center"
                    >
                      <Zap size={14} />
                       Queuemitment
                      <ChevronRight
                        size={14}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>
                </div>

                {/* STEP 04 */}
                <div className="flex gap-5 sm:gap-7">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.09]">
                      <MessageCircle size={20} className="text-violet-300" />
                    </div>

                    <div className="mt-3 w-px flex-1 bg-gradient-to-b from-violet-400/20 to-violet-400/5" />
                  </div>

                  <div className="pb-9 pt-1">
                    <div className="mb-1 flex items-center gap-3">
                      <span className="text-xs font-medium text-violet-300/50">
                        04
                      </span>
                      <h3 className="text-lg font-semibold sm:text-xl">
                        Talk anonymously
                      </h3>
                    </div>

                    <p className="max-w-2xl text-sm leading-relaxed text-white/40 sm:text-base">
                      Once Queuerious finds your connection, your Queue Token is
                      consumed and you enter a{" "}
                      <span className="text-white/65">
                        5 minute anonymous chat
                      </span>
                      . You cannot see their profile, and they cannot see yours.
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-400/10 bg-violet-500/[0.06] px-3 py-2 text-xs text-violet-200/70">
                      <span className="font-semibold text-violet-300">
                        05:00
                      </span>
                      <span>anonymous conversation</span>
                    </div>
                  </div>
                </div>

                {/* STEP 05 */}
                <div className="flex gap-5 sm:gap-7">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.09]">
                      <EyeOff size={20} className="text-violet-300" />
                    </div>

                    <div className="mt-3 w-px flex-1 bg-gradient-to-b from-violet-400/20 to-violet-400/5" />
                  </div>

                  <div className="pb-9 pt-1">
                    <div className="mb-1 flex items-center gap-3">
                      <span className="text-xs font-medium text-violet-300/50">
                        05
                      </span>
                      <h3 className="text-lg font-semibold sm:text-xl">
                        The reveal
                      </h3>
                    </div>

                    <p className="max-w-2xl text-sm leading-relaxed text-white/40 sm:text-base">
                      When the <span className="text-white/65">5</span> minutes
                      are over, the anonymous conversation ends and the profiles
                      are revealed. Now you finally get to see who was on the
                      other side.
                    </p>
                  </div>
                </div>

                {/* STEP 06 */}
                <div className="flex gap-5 sm:gap-7">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.09]">
                      <Heart size={20} className="text-violet-300" />
                    </div>

                    <div className="mt-3 w-px flex-1 bg-gradient-to-b from-violet-400/20 to-violet-400/5" />
                  </div>

                  <div className="pb-9 pt-1">
                    <div className="mb-1 flex items-center gap-3">
                      <span className="text-xs font-medium text-violet-300/50">
                        06
                      </span>
                      <h3 className="text-lg font-semibold sm:text-xl">
                        Match or pass
                      </h3>
                    </div>

                    <p className="max-w-2xl text-sm leading-relaxed text-white/40 sm:text-base">
                      After the reveal, you decide. Choose{" "}
                      <span className="text-violet-300">Match</span> if you
                      would like to keep the connection, or{" "}
                      <span className="text-white/60">Pass</span> if it is not
                      for you.
                    </p>
                  </div>
                </div>

                {/* STEP 07 */}
                <div className="flex gap-5 sm:gap-7">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 shadow-lg shadow-violet-500/10">
                    <HeartHandshake size={20} className="text-violet-300" />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-5 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-3">
                        <span className="text-xs font-medium text-violet-300/60">
                          07
                        </span>
                        <h3 className="text-lg font-semibold sm:text-xl">
                          Keep the connection
                        </h3>
                      </div>

                      <p className="max-w-2xl text-sm leading-relaxed text-white/40 sm:text-base">
                        If you both choose{" "}
                        <span className="text-violet-300">Match</span>, the
                        connection becomes permanent. The anonymous part is
                        over, you can return to your match and talk whenever you
                        want.
                      </p>

                      <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-400/10 bg-violet-500/[0.06] px-3 py-2 text-xs text-violet-200/70">
                        <Heart
                          size={13}
                          className="fill-violet-300 text-violet-300"
                        />
                        <span>Matched. Talk anytime.</span>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/matches"
                      className="group inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20 sm:self-center"
                    >
                      <Heart size={14} className="fill-white" />
                      View Matches
                      <ChevronRight
                        size={14}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </section>
    </>
  );
}
