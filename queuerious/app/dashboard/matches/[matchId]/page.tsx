import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Heart,
  MapPin,
  MessageCircle,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";

import { createClient } from "../../../../lib/supabase/server";

export default async function MatchProfilePage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
    .single();

  if (matchError || !matchData) {
    console.error("Error loading match:", matchError);
    notFound();
  }

  const otherUserId =
    matchData.user_one_id === user.id
      ? matchData.user_two_id
      : matchData.user_one_id;

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      date_of_birth,
      location,
      bio,
      interests,
      photo_urls
    `)
    .eq("id", otherUserId)
    .single();

  if (profileError || !profileData) {
    console.error("Error loading profile:", profileError);
    notFound();
  }

  let age = 0;

  if (profileData.date_of_birth) {
    const birthDate = new Date(profileData.date_of_birth);
    const today = new Date();

    age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference =
      today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
  }

  const photos =
    profileData.photo_urls && profileData.photo_urls.length > 0
      ? profileData.photo_urls
      : [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1400&q=85",
        ];

  const match = {
    id: matchData.id,
    name: profileData.first_name || "Unknown",
    age,
    location: profileData.location || "Unknown location",
    image: photos[0],
    photos,
    matchedAt: new Date(matchData.created_at).toLocaleDateString(),
    conversation:
      "You both decided the conversation was worth continuing.",
    bio:
      profileData.bio ||
      "There is still a lot more to discover about each other.",
    interests: profileData.interests || [],
  };

  return (
    <section className="flex-1 px-6 py-10 lg:px-10 xl:px-16">
      <div className="mx-auto max-w-6xl">
        {/* BACK */}
        <Link
          href={`/dashboard/matches/${match.id}/chat`}
          className="group mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
        >
          <ArrowLeft
            size={17}
            className="transition group-hover:-translate-x-1"
          />
          Back to Matches
        </Link>

        {/* HERO */}
        <div className="relative overflow-hidden rounded-[36px] border border-rose-400/15 bg-[#111116]">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={match.image}
              alt={match.name}
              className="h-full w-full object-cover opacity-40"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d12] via-[#0d0d12]/85 to-[#0d0d12]/30" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-transparent to-transparent" />
          </div>

          {/* Glow */}
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-rose-500/20 blur-[120px]" />

          <div className="relative min-h-[560px] p-8 sm:p-12 lg:p-16">
            {/* Badge */}
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 backdrop-blur-md">
              <Heart size={15} className="fill-rose-300" />
              Your Connection
            </div>

            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-2 text-sm text-rose-300">
                <Sparkles size={16} />
                Worth discovering
              </div>

              <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
                {match.name}

                <span className="ml-3 text-white/45">{match.age}</span>
              </h1>

              <div className="mt-5 flex items-center gap-2 text-base text-white/50">
                <MapPin size={18} />

                {match.location}
              </div>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/60">
                {match.bio}
              </p>

              {/* ACTIONS */}
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">

              <Link
  href={`/dashboard/matches/${match.id}/chat`}
  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-rose-500 px-7 py-4 font-medium text-white transition hover:bg-rose-400 hover:shadow-lg hover:shadow-rose-500/20 active:scale-[0.98]">

  <MessageCircle size={17} />

  Continue the conversation

  <ArrowRight size={17} />
</Link>

                <Link
                  href={`/dashboard/matches`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/[0.10] bg-black/20 px-7 py-4 text-sm font-medium text-white/70 backdrop-blur-md transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Heart size={17} className="fill-rose-400 text-rose-400" />
                  Your matches
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CONNECTION STORY */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="relative overflow-hidden rounded-[30px] border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.12] via-[#15121e] to-[#111116] p-7 sm:p-9">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/15 blur-[90px]" />

            <div className="relative">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <Sparkles size={24} />
              </div>

              <p className="mb-3 text-sm font-medium text-violet-300">
                YOUR CONNECTION
              </p>

              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                You met the mind before the face.
              </h2>

              <p className="mt-5 max-w-xl leading-relaxed text-white/45">
                {match.conversation}
              </p>

              <div className="mt-7 flex items-center gap-2 text-sm text-white/35">
                <CalendarDays size={16} />

                {match.matchedAt}
              </div>
            </div>
          </div>

          {/* CONNECTION STATUS */}
          <div className="rounded-[30px] border border-white/[0.07] bg-white/[0.025] p-7 sm:p-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
              <Heart size={24} className="fill-rose-300" />
            </div>

            <p className="mt-7 text-sm font-medium text-white/35">
              CONNECTION STATUS
            </p>

            <h3 className="mt-2 text-xl font-semibold">Matched</h3>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-3 w-3">
                <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-rose-400 opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-400" />
              </div>

              <span className="text-sm text-white/45">Connection active</span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-white/35">
              You can continue discovering each other beyond your first
              conversation.
            </p>
          </div>
        </div>

        {/* ABOUT */}
        <div className="mt-8 rounded-[30px] border border-white/[0.07] bg-white/[0.025] p-7 sm:p-10">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.05] text-white/70">
              <UserRound size={23} />
            </div>

            <div>
              <p className="text-sm font-medium text-white/35">
                ABOUT {match.name.toUpperCase()}
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                A little more to discover.
              </h2>

              <p className="mt-5 max-w-3xl leading-relaxed text-white/45">
                {match.bio}
              </p>
            </div>
          </div>
        </div>

        {/* INTERESTS */}
        <div className="mt-8 rounded-[30px] border border-white/[0.07] bg-white/[0.025] p-7 sm:p-10">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                <Sparkles size={21} />
              </div>

              <div>
                <p className="text-sm font-medium text-white/35">INTERESTS</p>

                <h2 className="text-2xl font-semibold">
                  Things {match.name} is into
                </h2>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
          {match.interests.map((interest: string) => (
              <span
                key={interest}
                className="rounded-full border border-violet-400/15 bg-violet-500/[0.07] px-5 py-3 text-sm text-violet-200 transition hover:border-violet-400/30 hover:bg-violet-500/[0.12]"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* PHOTOS */}
        <div className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-rose-300">
                <Heart size={15} className="fill-rose-300" />
                The reveal
              </div>

              <h2 className="text-3xl font-semibold tracking-tight">
                More of {match.name}
              </h2>
            </div>

            <p className="hidden text-sm text-white/30 sm:block">
              {match.photos.length} photos
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
          {match.photos.map((photo: string, index: number) => (
              <div
                key={`${photo}-${index}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/[0.07]"
              >
                <img
                  src={photo}
                  alt={`${match.name} photo ${index + 1}`}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

                <div className="absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white/70 opacity-0 backdrop-blur-md transition group-hover:opacity-100">
                  Photo {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-12 mb-4 relative overflow-hidden rounded-[32px] border border-rose-400/15 bg-gradient-to-r from-rose-500/[0.13] via-[#181116] to-[#111116] p-8 sm:p-10">
          <div className="absolute -right-10 -bottom-16 h-56 w-56 rounded-full bg-rose-500/15 blur-[100px]" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-rose-300">
                <MessageCircle size={16} />
                The conversation doesn&apos;t have to end here.
              </div>

              <h2 className="text-2xl font-semibold">
                Keep discovering {match.name}.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/45">
                Your first conversation brought you here. There&apos;s still a
                lot more to discover.
              </p>
            </div>

            <Link href={`/dashboard/matches/${match.id}/chat`}
className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-rose-500 px-7 py-4 font-medium transition hover:bg-rose-400 hover:shadow-lg hover:shadow-rose-500/20 active:scale-[0.98]">
              <MessageCircle size={18} />
              Continue chatting
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
