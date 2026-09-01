import Link from "next/link";
import { ChevronRight, Heart, Sparkles, User, Zap } from "lucide-react";

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

  const metadata = data.claims?.user_metadata;

  const avatarUrl =
    metadata &&
    typeof metadata.avatar_url === "string" &&
    metadata.avatar_url.trim().length > 0
      ? metadata.avatar_url
      : null;

  const firstName =
    metadata &&
    typeof metadata.first_name === "string" &&
    metadata.first_name.trim().length > 0
      ? metadata.first_name.trim()
      : "there";

  return (
    <>
      {!tutorialCompleted && <OnboardingTutorial />}

      <section className="flex-1 px-6 py-10 lg:px-10 xl:px-16"></section>

      <section className="flex-1 px-6 py-10 lg:px-10 xl:px-16">
        <div className="mx-auto max-w-6xl">
          {/* Greeting */}
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-2 text-sm text-violet-300">
              <Sparkles size={16} />
              <span>Welcome back</span>
            </div>

            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Good afternoon, {firstName}.
            </h2>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/45 sm:text-lg">
              Ready to meet someone differently?
            </p>
          </div>

          {/* HERO CARD */}
          <div className="relative overflow-hidden rounded-[32px] border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.16] via-[#15121e] to-[#111116] p-7 shadow-2xl shadow-violet-950/20 sm:p-10">
            {/* Decorative glow */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-[100px]" />

            <div className="relative">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/15">
                <Zap size={25} className="fill-violet-300 text-violet-300" />
              </div>

              <div className="max-w-2xl">
                <p className="mb-3 text-sm font-medium text-violet-300">
                  QUEUERIOUS EXPERIENCE
                </p>

                <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Meet the mind before the face.
                </h3>

                <p className="mt-5 max-w-xl leading-relaxed text-white/50">
                  Start queueing and get matched with someone based on
                  curiosity, conversation and connection — before either of you
                  sees a profile.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/dashboard/queuemitment"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-violet-500 px-7 py-4 font-medium transition hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98]"
                >
                  <Zap
                    size={18}
                    className="transition group-hover:fill-white"
                  />
                  Start Queueing
                  <ChevronRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* LOWER CARDS */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Profile card */}
            <Link
              href="/dashboard/profile"
              className="group rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 transition hover:border-violet-400/20 hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.05] text-white/70">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Your profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={21} />
                  )}
                </div>

                <ChevronRight
                  size={19}
                  className="text-white/25 transition group-hover:translate-x-1 group-hover:text-violet-300"
                />
              </div>

              <h4 className="mt-6 text-lg font-semibold">Your profile</h4>

              <p className="mt-2 text-sm leading-relaxed text-white/40">
                Give people something interesting to discover after the
                conversation.
              </p>
            </Link>

            {/* Preferences card */}
            <Link
              href="/dashboard/preferences"
              className="group rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 transition hover:border-violet-400/20 hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-white/70">
                  <Heart size={21} />
                </div>

                <ChevronRight
                  size={19}
                  className="text-white/25 transition group-hover:translate-x-1 group-hover:text-violet-300"
                />
              </div>

              <h4 className="mt-6 text-lg font-semibold">Your preferences</h4>

              <p className="mt-2 text-sm leading-relaxed text-white/40">
                Tell us who you would like to meet in your queues.
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm text-violet-300">
                Set preferences
                <ChevronRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
