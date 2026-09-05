"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { createClient } from "../../../../../lib/supabase/client";
import { ArrowLeft, Heart, MapPin, Send, Smile, UserRound } from "lucide-react";

type Message = {
  id: number;
  sender: "me" | "them";
  text: string;
  time: string;
};

type Match = {
  id: string;
  userId: string;
  name: string;
  age: number;
  location: string;
  image: string;
  online: boolean;
  messages: Message[];
};

const emojis = ["😂", "❤️", "🥹", "😏", "🔥", "🤔", "👀", "✨"];

export default function MatchChatPage() {
  const params = useParams();
  const router = useRouter();

  const searchParams = useSearchParams();
  const sectionType = searchParams.get("type");

  const matchId = Array.isArray(params.matchId)
    ? params.matchId[0]
    : params.matchId;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);

  const [unmatchOpen, setUnmatchOpen] = useState(false);
  const [unmatching, setUnmatching] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadMatch() {
      if (!matchId) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (matchError || !matchData) {
        console.error("Error loading match:", matchError);
        setLoading(false);
        return;
      }

      const otherUserId =
        matchData.user_one_id === user.id
          ? matchData.user_two_id
          : matchData.user_one_id;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
            id,
            first_name,
            date_of_birth,
            location,
            photo_urls
          `
        )
        .eq("id", otherUserId)
        .single();

      if (profileError || !profileData) {
        console.error("Error loading profile:", profileError);
        setLoading(false);
        return;
      }

      const { data: messagesData, error: messagesError } = await supabase
        .from("conversation_messages")
        .select(
          `
            id,
            sender_id,
            content,
            created_at
          `
        )
        .eq("conversation_id", matchData.conversation_id)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error loading messages:", messagesError);
      }

      let age = 0;

      if (profileData.date_of_birth) {
        const birthDate = new Date(profileData.date_of_birth);
        const today = new Date();

        age = today.getFullYear() - birthDate.getFullYear();

        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (
          monthDifference < 0 ||
          (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
      }

      setMatch({
        id: matchData.id,
        userId: otherUserId,
        name: profileData.first_name || "Unknown",
        age,
        location: profileData.location || "",
        image:
          profileData.photo_urls?.[0] ||
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
        online: true,
        messages: [],
      });

      setMessages(
        (messagesData || []).map((chatMessage) => ({
          id: chatMessage.id,
          sender: chatMessage.sender_id === user.id ? "me" : "them",
          text: chatMessage.content || "",
          time: new Date(chatMessage.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }))
      );

      setLoading(false);
    }

    loadMatch();
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (loading) {
    return (
      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <p className="text-white/40">Loading chat...</p>
      </section>
    );
  }

  if (!match) {
    return (
      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="text-center">
          <Heart size={40} className="mx-auto text-rose-300" />

          <h1 className="mt-5 text-2xl font-semibold">Match not found</h1>

          <p className="mt-2 text-white/40">
            This connection doesn&apos;t seem to exist.
          </p>

          <Link
            href="/dashboard/matches"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium transition hover:bg-violet-400"
          >
            <ArrowLeft size={16} />
            Back to Matches
          </Link>
        </div>
      </section>
    );
  }

  async function sendMessage() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !matchId || trimmedMessage.length > 1000) {
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .select("conversation_id")
      .or(`id.eq.${matchId},conversation_id.eq.${matchId}`)
      .single();

    if (matchError || !matchData) {
      console.error("Error finding conversation:", matchError);
      return;
    }

    const { data: newMessage, error: messageError } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id: matchData.conversation_id,
        sender_id: user.id,
        message_type: "message",
        content: trimmedMessage,
      })
      .select()
      .single();

    if (messageError || !newMessage) {
      console.error(
        "Error sending message:",
        JSON.stringify(messageError, null, 2)
      );
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: newMessage.id,
        sender: "me",
        text: newMessage.content || "",
        time: new Date(newMessage.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setMessage("");
    setEmojiOpen(false);
  }

  async function handleUnmatch() {
    if (!match) return;

    setUnmatching(true);

    const supabase = createClient();

    console.log("UNMATCHING MATCH ID:", match.id);

    // 1. Get the conversation_id
    const { data: matchData, error: matchFetchError } = await supabase
      .from("matches")
      .select("conversation_id")
      .eq("id", match.id)
      .single();

    console.log("MATCH DATA:", matchData);
    console.log("MATCH FETCH ERROR:", matchFetchError);

    if (matchFetchError || !matchData?.conversation_id) {
      console.error("Could not find conversation:", matchFetchError);
      setUnmatching(false);
      return;
    }

    // 2. Cancel BOTH queue entries through the RPC
    const { data: cancelledCount, error: queueError } = await supabase.rpc(
      "cancel_match_queue_entries",
      {
        p_conversation_id: matchData.conversation_id,
      }
    );

    console.log("RPC CANCELLED COUNT:", cancelledCount);
    console.log("QUEUE ENTRIES CANCEL ERROR:", queueError);

    if (queueError) {
      console.error("Error cancelling queue entries:", queueError);
      setUnmatching(false);
      return;
    }

    // 3. Delete the match
    const { data, error } = await supabase
      .from("matches")
      .delete()
      .eq("id", match.id)
      .select();

    console.log("UNMATCH RESULT:", data);
    console.log("UNMATCH ERROR:", error);

    if (error) {
      setUnmatching(false);
      return;
    }

    // 4. Go back to matches
    router.push("/dashboard/matches");
    router.refresh();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <section className="flex flex-1 flex-col overflow-hidden">
      <div className="mx-auto flex h-[calc(100vh-80px)] w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-white/[0.07] bg-[#0d0d12] shadow-2xl shadow-black/20">
          {/* HEADER */}
          <header className="relative flex shrink-0 items-center gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-6">
            <Link
              href={
                sectionType === "relationship"
                  ? "/dashboard/matches?type=relationship"
                  : sectionType === "friends"
                  ? "/dashboard/matches?type=friends"
                  : "/dashboard/matches"
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] text-white/50 transition hover:bg-white/[0.05] hover:text-white"
              aria-label="Back to matches"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="relative shrink-0">
              <div className="h-11 w-11 overflow-hidden rounded-2xl border border-white/[0.08]">
                <img
                  src={match.image}
                  alt={match.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {match.online && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-4 border-[#0d0d12] bg-emerald-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-semibold">{match.name}</h1>

                <span className="text-sm text-white/40">{match.age}</span>

                <Heart size={14} className="fill-rose-400 text-rose-400" />
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs text-white/35">
                <MapPin size={13} />

                <span className="truncate">
                  {match.online ? "Active now" : match.location}
                </span>
              </div>
            </div>

            <Link
              href={`/dashboard/profile/${match.userId}`}
              className="hidden items-center gap-2 rounded-xl border border-rose-400/15 bg-rose-500/[0.07] px-4 py-2.5 text-sm font-medium text-rose-300 transition hover:border-rose-400/25 hover:bg-rose-500/[0.12] sm:flex"
            >
              <UserRound size={16} />
              View profile
            </Link>

            <button
              type="button"
              onClick={() => setUnmatchOpen(true)}
              className="hidden items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.07] px-4 py-2.5 text-sm font-medium text-red-300 transition hover:border-red-400/30 hover:bg-red-500/[0.12] sm:flex"
            >
              <Heart size={16} />
              Unmatch
            </button>
          </header>

          {/* MOBILE VIEW PROFILE */}
          <div className="flex shrink-0 border-b border-white/[0.06] px-4 py-3 sm:hidden">
            <Link
              href={`/dashboard/profile/${match.userId}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/15 bg-rose-500/[0.07] px-4 py-2.5 text-sm font-medium text-rose-300"
            >
              <UserRound size={16} />
              View profile
            </Link>
          </div>

          <div className="flex shrink-0 px-4 pb-3 sm:hidden">
            <button
              type="button"
              onClick={() => setUnmatchOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.07] px-4 py-2.5 text-sm font-medium text-red-300"
            >
              <Heart size={16} />
              Unmatch
            </button>
          </div>

          {/* MATCH INTRO */}
          <div className="shrink-0 px-4 pt-5 sm:px-6">
            <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-full border border-rose-400/10 bg-rose-500/[0.05] px-4 py-2 text-center text-xs text-rose-200/80">
              <Heart size={13} className="fill-rose-300 text-rose-300" />
              You matched. The conversation continues.
            </div>
          </div>

          {/* MESSAGES */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.map((chatMessage) => {
                const isMe = chatMessage.sender === "me";

                return (
                  <div
                    key={chatMessage.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`break-words [overflow-wrap:anywhere] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                          isMe
                            ? "rounded-br-md bg-violet-500 text-white"
                            : "rounded-bl-md border border-white/[0.07] bg-white/[0.045] text-white/75"
                        }`}
                      >
                        {chatMessage.text}
                      </div>

                      <span className="mt-1.5 block px-1 text-[10px] text-white/25">
                        {chatMessage.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* INPUT */}
          <div className="relative shrink-0 border-t border-white/[0.07] bg-[#0d0d12] p-4 sm:p-5">
            {/* EMOJI PICKER */}
            {emojiOpen && (
              <div className="absolute bottom-[calc(100%+8px)] left-4 z-20 rounded-2xl border border-white/[0.08] bg-[#15151c] p-3 shadow-2xl shadow-black/40">
                <div className="grid grid-cols-4 gap-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setMessage((currentMessage) =>
                          `${currentMessage}${emoji}`.slice(0, 1000)
                        );
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-lg transition hover:bg-white/[0.06]"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mx-auto flex max-w-3xl items-end gap-3">
              <button
                type="button"
                onClick={() => setEmojiOpen((currentValue) => !currentValue)}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
                  emojiOpen
                    ? "border-violet-400/30 bg-violet-500/10 text-violet-300"
                    : "border-white/[0.07] text-white/40 hover:bg-white/[0.05] hover:text-white"
                }`}
                aria-label="Choose emoji"
              >
                <Smile size={19} />
              </button>

              <div className="min-w-0 flex-1">
                <input
                  value={message}
                  maxLength={1000}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${match.name}...`}
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/25 focus:bg-white/[0.05]"
                />

                <p className="mt-1 text-right text-[10px] text-white/25">
                  {message.length} / 1000
                </p>
              </div>

              <button
                type="button"
                onClick={sendMessage}
                disabled={!message.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-35 active:scale-[0.97]"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {unmatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#15151c] p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
              <Heart size={22} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">Are you sure?</h2>

            <p className="mt-2 text-sm leading-relaxed text-white/45">
              You will no longer be matched with {match.name}. This chat will
              disappear from your matches.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setUnmatchOpen(false)}
                disabled={unmatching}
                className="flex-1 rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.05]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUnmatch}
                disabled={unmatching}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {unmatching ? "Unmatching..." : "Yes, unmatch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
