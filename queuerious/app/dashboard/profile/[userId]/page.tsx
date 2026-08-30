import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Heart,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";

import { createClient } from "../../../../lib/supabase/server";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function UserProfilePage({
  params,
}: PageProps) {
  const { userId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  /*
    SECURITY CHECK:
    Make sure the logged-in user actually has a match
    with the profile they are trying to view.
  */

  const { data: matchData } = await supabase
    .from("matches")
    .select("*")
    .or(
      `and(user_one_id.eq.${user.id},user_two_id.eq.${userId}),and(user_one_id.eq.${userId},user_two_id.eq.${user.id})`
    )
    .maybeSingle();

  if (!matchData) {
    notFound();
  }

  /*
    GET PROFILE
  */

  const { data: profileData, error: profileError } =
    await supabase
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
      .eq("id", userId)
      .single();

  if (profileError || !profileData) {
    console.error("Error loading profile:", profileError);
    notFound();
  }

  /*
    CALCULATE AGE
  */

  let age: number | null = null;

  if (profileData.date_of_birth) {
    const birthDate = new Date(profileData.date_of_birth);
    const today = new Date();

    age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
  }

  /*
    PHOTOS
  */

  const photos =
    profileData.photo_urls &&
    profileData.photo_urls.length > 0
      ? profileData.photo_urls
      : [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1400&q=85",
        ];

  const interests = profileData.interests || [];

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* BACK */}

        <Link
          href={`/dashboard/matches/${matchData.id}/chat`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to chat
        </Link>

        {/* PROFILE CARD */}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60">

          {/* MAIN PHOTO */}

          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-800">
            <img
              src={photos[0]}
              alt={profileData.first_name || "Profile"}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-6 sm:p-8">

            {/* NAME */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div>
                <h1 className="text-3xl font-semibold sm:text-4xl">
                  {profileData.first_name || "Unknown"}
                  {age !== null && `, ${age}`}
                </h1>

                {profileData.location && (
                  <div className="mt-3 flex items-center gap-2 text-zinc-400">
                    <MapPin size={18} />
                    {profileData.location}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
                <Heart size={16} />
                Matched
              </div>

            </div>

            {/* BIO */}

            {profileData.bio && (
              <section className="mt-8">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-medium">
                  <UserRound size={18} />
                  About
                </h2>

                <p className="leading-7 text-zinc-300">
                  {profileData.bio}
                </p>
              </section>
            )}

            {/* INTERESTS */}

            {interests.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
                  <Sparkles size={18} />
                  Interests
                </h2>

                <div className="flex flex-wrap gap-2">
                  {interests.map(
                    (interest: string) => (
                      <span
                        key={interest}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300"
                      >
                        {interest}
                      </span>
                    )
                  )}
                </div>
              </section>
            )}

            {/* PHOTOS */}

            {photos.length > 1 && (
              <section className="mt-10">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
                  <CalendarDays size={18} />
                  Photos
                </h2>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.slice(1).map(
                    (photo: string, index: number) => (
                      <div
                        key={`${photo}-${index}`}
                        className="aspect-square overflow-hidden rounded-2xl bg-zinc-800"
                      >
                        <img
                          src={photo}
                          alt={`Photo ${index + 2}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}