import Link from "next/link";
import {
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { createClient } from "../../../lib/supabase/server";

type Profile = {
  id: string;
  first_name: string | null;
  date_of_birth: string | null;
  location: string | null;
  photo_urls: string[] | null;
};

type Match = {
  id: string;
  conversation_id: string;
  user_one_id: string;
  user_two_id: string;
  created_at: string;
};

type ConversationMessage = {
  conversation_id: string;
  content: string | null;
  created_at: string;
};

function getAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference =
    today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function formatTime(date: string) {
  const now = new Date();
  const messageDate = new Date(date);

  const difference =
    now.getTime() - messageDate.getTime();

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);

  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d`;

  return messageDate.toLocaleDateString();
}

export default async function MatchesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  /*
    GET ALL MATCHES FOR CURRENT USER
  */

  const { data: matchesData, error: matchesError } =
    await supabase
      .from("matches")
      .select(`
        id,
        conversation_id,
        user_one_id,
        user_two_id,
        created_at
      `)
      .or(
        `user_one_id.eq.${user.id},user_two_id.eq.${user.id}`
      )
      .order("created_at", {
        ascending: false,
      });

  if (matchesError) {
    console.error(
      "Error loading matches:",
      matchesError
    );
  }

  const matches = (matchesData || []) as Match[];

console.log("========== MATCH / PROFILE DEBUG ==========");

console.log(
  "CURRENT USER ID:",
  user.id
);

console.log(
  "MATCHES RAW:",
  JSON.stringify(matches, null, 2)
);

/*
  FIND THE OTHER USER IN EVERY MATCH
*/

const otherUserIds = matches.map((match) =>
  match.user_one_id === user.id
    ? match.user_two_id
    : match.user_one_id
);

console.log(
  "OTHER USER IDS:",
  JSON.stringify(otherUserIds, null, 2)
);

/*
  GET PROFILES
*/

let profiles: Profile[] = [];

if (otherUserIds.length > 0) {
  const {
    data: profilesData,
    error: profilesError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      date_of_birth,
      location,
      photo_urls
    `)
    .in("id", otherUserIds);

  console.log(
    "PROFILES QUERY ERROR:",
    profilesError
      ? JSON.stringify(profilesError, null, 2)
      : "NO ERROR"
  );

  console.log(
    "PROFILES QUERY RESULT:",
    JSON.stringify(profilesData, null, 2)
  );

  profiles = (profilesData || []) as Profile[];
}

console.log(
  "FINAL PROFILES ARRAY:",
  JSON.stringify(profiles, null, 2)
);

console.log("========== END MATCH / PROFILE DEBUG ==========");

  /*
    GET LATEST MESSAGE FROM EACH MATCH
  */

  const conversationIds = matches.map(
    (match) => match.conversation_id
  );

  let messages: ConversationMessage[] = [];

  if (conversationIds.length > 0) {
    const { data: messagesData, error: messagesError } =
      await supabase
        .from("conversation_messages")
        .select(`
          conversation_id,
          content,
          created_at
        `)
        .in("conversation_id", conversationIds)
        .order("created_at", {
          ascending: false,
        });

    if (messagesError) {
      console.error(
        "Error loading messages:",
        messagesError
      );
    }

    messages = (messagesData || []) as ConversationMessage[];
  }

  /*
    CREATE A LOOKUP FOR THE LATEST MESSAGE
  */

  const latestMessageByConversation = new Map<
    string,
    ConversationMessage
  >();

  for (const message of messages) {
    if (
      !latestMessageByConversation.has(
        message.conversation_id
      )
    ) {
      latestMessageByConversation.set(
        message.conversation_id,
        message
      );
    }
  }

 /*
  CREATE PROFILE LOOKUP
*/

const profilesById = new Map(
  profiles.map((profile) => [
    String(profile.id).trim().toLowerCase(),
    profile,
  ])
);

/*
  COMBINE MATCH + PROFILE + MESSAGE DATA
*/

const displayMatches = matches
  .map((match) => {
    const otherUserId =
      match.user_one_id === user.id
        ? match.user_two_id
        : match.user_one_id;

        const profile = profilesById.get(
          String(otherUserId).trim().toLowerCase()
        );

    console.log("MATCH:", match);
    console.log("OTHER USER ID:", otherUserId);
    console.log("PROFILE:", profile);

    if (!profile) return null;

    const latestMessage =
      latestMessageByConversation.get(
        match.conversation_id
      );

    return {
      id: match.id,
      conversationId: match.conversation_id,

      name:
        profile.first_name || "Queuerious user",

      age: getAge(profile.date_of_birth),

      location:
        profile.location || "Location unavailable",

      image:
        profile.photo_urls &&
        profile.photo_urls.length > 0
          ? profile.photo_urls[0]
          : null,

      lastMessage:
        latestMessage?.content ||
        "You matched — start the conversation.",

      lastMessageTime: latestMessage
        ? formatTime(latestMessage.created_at)
        : formatTime(match.created_at),

      createdAt: match.created_at,
    };
  })

  
  

  .filter(
    (
      match
    ): match is NonNullable<typeof match> =>
      match !== null
  );

  

  return (
    <section className="flex-1 px-6 py-10 lg:px-10 xl:px-16">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2 text-sm text-rose-300">
            <Heart
              size={16}
              className="fill-rose-300"
            />

            <span>Your connections</span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Your Matches
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/45 sm:text-lg">
            Conversations that became something more.
          </p>
        </div>

        {/* HERO */}

        <div className="relative overflow-hidden rounded-[32px] border border-rose-400/15 bg-gradient-to-br from-rose-500/[0.14] via-[#171116] to-[#111116] p-7 shadow-2xl shadow-rose-950/10 sm:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-rose-500/20 blur-[110px]" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10">
                <Heart
                  size={25}
                  className="fill-rose-300 text-rose-300"
                />
              </div>

              <p className="mb-3 text-sm font-medium text-rose-300">
                CONNECTIONS, NOT SWIPES
              </p>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Every match started with a conversation.
              </h2>

              <p className="mt-5 max-w-xl leading-relaxed text-white/45">
                You met their mind before their face. Now the
                conversation doesn&apos;t have to end.
              </p>
            </div>

            {/* MATCH COUNTER */}

            <div className="flex shrink-0 items-center gap-5 rounded-3xl border border-white/[0.08] bg-black/20 p-6 backdrop-blur-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
                <Users size={28} />
              </div>

              <div>
                <p className="text-3xl font-semibold">
                  {displayMatches.length}
                </p>

                <p className="mt-1 text-sm text-white/40">
                  {displayMatches.length === 1
                    ? "Match"
                    : "Matches"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONVERSATIONS */}

        <div className="mt-12">
          <div className="mb-6 flex items-end justify-between gap-4">

            <div>
              <p className="mb-2 flex items-center gap-2 text-sm text-violet-300">
                <MessageCircle size={16} />
                Keep discovering
              </p>

              <h2 className="text-2xl font-semibold tracking-tight">
                Your conversations
              </h2>
            </div>

            <p className="hidden text-sm text-white/30 sm:block">
              {displayMatches.length} active{" "}
              {displayMatches.length === 1
                ? "connection"
                : "connections"}
            </p>
          </div>

          {/* EMPTY STATE */}

          {displayMatches.length === 0 && (
            <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.025] p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
                <Heart size={28} />
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                No matches yet
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/40">
                Your next Queuemitment conversation could become
                something more.
              </p>

              <Link
                href="/dashboard/queuemitment"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-medium transition hover:bg-violet-400"
              >
                <Zap size={17} />
                Enter Queuemitment
              </Link>
            </div>
          )}

          {/* CHAT LIST */}

          <div className="space-y-3">
            {displayMatches.map((match) => (
              <Link
                key={match.id}
                href={`/dashboard/matches/${match.id}/chat`}
                className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-rose-400/20 hover:bg-white/[0.045]"
              >
                {/* AVATAR */}

                <div className="relative shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-violet-500/10">
                    {match.image ? (
                      <img
                        src={match.image}
                        alt={match.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-violet-300">
                        {match.name
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-[#0d0d12] bg-emerald-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  </div>
                </div>

                {/* CONTENT */}

                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2">

                      <h3 className="truncate font-semibold">
                        {match.name}
                      </h3>

                      {match.age !== null && (
                        <span className="text-sm text-white/35">
                          {match.age}
                        </span>
                      )}

                      <Heart
                        size={13}
                        className="shrink-0 fill-rose-400 text-rose-400"
                      />
                    </div>

                    <span className="shrink-0 text-xs text-white/30">
                      {match.lastMessageTime}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-white/30">
                    <MapPin size={13} />

                    {match.location}
                  </div>

                  <p className="mt-2 truncate text-sm text-white/40">
                    {match.lastMessage}
                  </p>
                </div>

                {/* RIGHT */}

                <div className="hidden shrink-0 items-center sm:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white/25 transition group-hover:translate-x-1 group-hover:bg-white/[0.04] group-hover:text-rose-300">
                    <ChevronRight size={19} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* KEEP DISCOVERING */}

        <div className="mt-8 rounded-[28px] border border-white/[0.06] bg-white/[0.015] p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-violet-300">
                <Sparkles size={16} />
                More connections are waiting
              </div>

              <h3 className="text-xl font-semibold">
                Your next conversation could become your next match.
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-white/40">
                Go back into Queuemitment and meet someone new.
              </p>
            </div>

            <Link
              href="/dashboard/queuemitment"
              className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-violet-500 px-6 py-4 text-sm font-medium transition hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98]"
            >
              <Zap
                size={17}
                className="transition group-hover:fill-white"
              />

              Enter Queuemitment

              <ChevronRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}