"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Heart,
  X,
  MapPin,
  Ruler,
  Sparkles,
  Clock,
  Loader2,
} from "lucide-react";

import { createClient } from "../../../../../lib/supabase/client";

type Profile = {
  id: string;
  first_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  height_cm: number | null;
  location: string | null;
  bio: string | null;
  interests: string[] | null;
  photo_urls: string[] | null;
};

type Conversation = {
  id: string;
  user_one_id: string;
  user_two_id: string;
  status: string;
  user_one_decision: string;
  user_two_decision: string;
  reveal_started_at: string | null;
};

export default function QueuemitmentRevealPage() {
  const params = useParams();
  const router = useRouter();

  const conversationId = params.conversationId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);

  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);

  const [myDecision, setMyDecision] = useState<string>("pending");

  const [theirDecision, setTheirDecision] = useState<string>("pending");

  const [showMatchModal, setShowMatchModal] = useState(false);

  const [showEndedScreen, setShowEndedScreen] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(30);

  /*
    Calculate age
  */

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  /*
    Load conversation + profile
  */

  useEffect(() => {
    const loadReveal = async () => {
      if (!conversationId) return;

      const supabase = createClient();

      setLoading(true);

      /*
        Get current user
      */

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setCurrentUserId(user.id);

      /*
        Get conversation
      */

      const { data: conversationData, error } = await supabase
        .from("queuemitment_conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error || !conversationData) {
        console.error("Error loading conversation:", error);

        router.push("/dashboard/queuemitment");

        return;
      }

      setConversation(conversationData);

      /*
        Determine the other user
      */

      const otherUserId =
        user.id === conversationData.user_one_id
          ? conversationData.user_two_id
          : conversationData.user_one_id;

      /*
        Get other profile
      */

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
          id,
          first_name,
          date_of_birth,
          gender,
          height_cm,
          location,
          bio,
          interests,
          photo_urls
        `
        )
        .eq("id", otherUserId)
        .maybeSingle();
      if (profileError) {
        console.error("Error loading profile:", profileError);
      }

      setOtherProfile(profileData);

      /*
        Determine decisions
      */

      const iAmUserOne = user.id === conversationData.user_one_id;

      const myCurrentDecision = iAmUserOne
        ? conversationData.user_one_decision
        : conversationData.user_two_decision;

      const theirCurrentDecision = iAmUserOne
        ? conversationData.user_two_decision
        : conversationData.user_one_decision;

      setMyDecision(myCurrentDecision);
      setTheirDecision(theirCurrentDecision);

      /*
        Check current outcome
      */

      if (
        conversationData.user_one_decision === "match" &&
        conversationData.user_two_decision === "match"
      ) {
        setShowMatchModal(true);
      }

      if (
        conversationData.user_one_decision !== "pending" &&
        conversationData.user_two_decision !== "pending" &&
        !(
          conversationData.user_one_decision === "match" &&
          conversationData.user_two_decision === "match"
        )
      ) {
        setShowEndedScreen(true);
      }

      setLoading(false);
    };

    loadReveal();
  }, [conversationId, router]);

  /*
    Realtime conversation updates
  */

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`queuemitment-reveal-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "queuemitment_conversations",
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("Reveal realtime update:", payload);

          const updatedConversation = payload.new as Conversation;

          setConversation(updatedConversation);

          const iAmUserOne = currentUserId === updatedConversation.user_one_id;

          const updatedMyDecision = iAmUserOne
            ? updatedConversation.user_one_decision
            : updatedConversation.user_two_decision;

          const updatedTheirDecision = iAmUserOne
            ? updatedConversation.user_two_decision
            : updatedConversation.user_one_decision;

          setMyDecision(updatedMyDecision);
          setTheirDecision(updatedTheirDecision);

          /*
            IT'S A MATCH ❤️
          */

          if (
            updatedConversation.user_one_decision === "match" &&
            updatedConversation.user_two_decision === "match"
          ) {
            setShowMatchModal(true);
          }

          /*
            Someone passed
          */

          if (
            updatedConversation.user_one_decision !== "pending" &&
            updatedConversation.user_two_decision !== "pending" &&
            !(
              updatedConversation.user_one_decision === "match" &&
              updatedConversation.user_two_decision === "match"
            )
          ) {
            setShowEndedScreen(true);
          }
        }
      )
      .subscribe((status) => {
        console.log("Reveal realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  /*
  REVEAL DECISION TIMER

  30 seconds from reveal_started_at.
*/

  useEffect(() => {
    if (!conversation?.reveal_started_at) return;

    // Stop the timer if we already decided
    if (myDecision !== "pending") return;

    let cancelled = false;

    const updateTimer = () => {
      const revealStartedAt = new Date(
        conversation.reveal_started_at!
      ).getTime();

      const expiresAt = revealStartedAt + 30_000;

      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

      if (!cancelled) {
        setSecondsLeft(remaining);
      }
    };

    updateTimer();

    const interval = setInterval(updateTimer, 250);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [conversation?.reveal_started_at, myDecision]);

  /*
    Submit Match / Pass
  */

  const submitDecision = async (decision: "match" | "pass") => {
    if (submitting || myDecision !== "pending") {
      return;
    }

    const supabase = createClient();

    setSubmitting(true);

    /*
      Optimistic UI
    */

    setMyDecision(decision);

    const { data, error } = await supabase.rpc("submit_queuemitment_decision", {
      p_conversation_id: conversationId,
      p_decision: decision,
    });

    if (error) {
      console.error(
        "Error submitting decision:",
        JSON.stringify(error, null, 2)
      );

      console.log("ERROR MESSAGE:", error.message);
      console.log("ERROR DETAILS:", error.details);
      console.log("ERROR HINT:", error.hint);
      console.log("ERROR CODE:", error.code);

      setMyDecision("pending");
      setSubmitting(false);

      return;
    }

    console.log("Decision submitted:", data);

    setSubmitting(false);
  };

  /*
  AUTO PASS WHEN TIMER EXPIRES
*/

useEffect(() => {
  if (secondsLeft > 0) return;

  if (myDecision !== "pending") return;

  if (submitting) return;

  const timeout = setTimeout(() => {
    void submitDecision("pass");
  }, 100);

  return () => clearTimeout(timeout);

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [secondsLeft, myDecision, submitting]);

  /*
    Loading
  */

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#09090d]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-violet-400" />

          <p className="text-sm text-white/40">
            Revealing your conversation...
          </p>
        </div>
      </div>
    );
  }

  /*
    No profile
  */

  if (!otherProfile) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#09090d]">
        <div className="text-center">
          <p className="text-white/50">We couldn&apos;t reveal this profile.</p>
        </div>
      </div>
    );
  }

  /*
    Match modal ❤️
  */

  if (showMatchModal) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#09090d] px-6">
        <div className="w-full max-w-xl rounded-[32px] border border-violet-400/20 bg-[#15151f] p-10 text-center shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-500/10">
            <Heart size={38} className="fill-violet-400 text-violet-400" />
          </div>

          <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
            Mutual connection
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            It&apos;s a match! 🎉
          </h1>

          <p className="mx-auto mt-5 max-w-md leading-relaxed text-white/45">
            You both wanted to keep this connection going. Looks like the
            conversation was worth it.
          </p>

          <button
            onClick={() => router.push("/dashboard/matches")}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 font-medium text-white transition hover:scale-[1.01] hover:shadow-lg hover:shadow-violet-500/20"
          >
            See your match
          </button>
        </div>
      </div>
    );
  }

  /*
    Conversation ended because someone passed
  */

  if (showEndedScreen) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#09090d] px-6">
        <div className="w-full max-w-xl rounded-[32px] border border-white/[0.08] bg-[#15151f] p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.04]">
            <Sparkles size={34} className="text-violet-300" />
          </div>

          <h1 className="mt-8 text-3xl font-semibold">That&apos;s okay.</h1>

          <p className="mx-auto mt-4 max-w-md leading-relaxed text-white/45">
            Not every conversation is meant to become a match. There are plenty
            of new people waiting to meet you.
          </p>

          <button
            onClick={() => router.push("/dashboard/queuemitment")}
            className="mt-8 w-full rounded-2xl bg-violet-600 px-6 py-4 font-medium transition hover:bg-violet-500"
          >
            Back to Queuemitment
          </button>
        </div>
      </div>
    );
  }

  const age = calculateAge(otherProfile.date_of_birth);

  const photo =
    otherProfile.photo_urls && otherProfile.photo_urls.length > 0
      ? otherProfile.photo_urls[0]
      : null;

  /*
    Main reveal screen
  */

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#09090d] px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}

        <div className="mb-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
            <Sparkles size={25} className="text-violet-300" />
          </div>

          <p className="mt-5 text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
            The reveal
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
            So... who were you talking to?
          </h1>

          <p className="mt-3 text-white/40">
            Now you finally get to see the person behind the conversation.
          </p>
        </div>

        {/* Profile card */}

        <div className="overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#15151f]">
          {/* Photo */}

          <div className="relative aspect-[16/8] bg-white/[0.03]">
            {photo ? (
              <Image
                src={photo}
                alt={otherProfile.first_name || "Profile"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-violet-500/10 text-4xl font-semibold text-violet-300">
                  {otherProfile.first_name?.charAt(0).toUpperCase() || "?"}
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#15151f] via-transparent to-transparent" />
          </div>

          {/* Profile content */}

          <div className="p-7 lg:p-10">
            {/* Name */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold">
                  {otherProfile.first_name || "Unknown"}

                  {age !== null && (
                    <span className="ml-2 text-white/40">{age}</span>
                  )}
                </h2>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/45">
                  {otherProfile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      {otherProfile.location}
                    </div>
                  )}

                  {otherProfile.height_cm && (
                    <div className="flex items-center gap-2">
                      <Ruler size={16} />
                      {otherProfile.height_cm} cm
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}

            {otherProfile.bio && (
              <div className="mt-8 border-t border-white/[0.07] pt-8">
                <p className="text-sm font-medium text-white/70">About</p>

                <p className="mt-3 leading-relaxed text-white/45">
                  {otherProfile.bio}
                </p>
              </div>
            )}

            {/* Interests */}

            {otherProfile.interests && otherProfile.interests.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-medium text-white/70">Interests</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {otherProfile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full border border-violet-400/15 bg-violet-500/[0.07] px-4 py-2 text-sm text-violet-200"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Decision area */}

            <div className="mt-10 border-t border-white/[0.07] pt-8">
              {myDecision === "pending" ? (
                <>
                  <div className="text-center">
                    <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-5 py-2.5">
                      <Clock size={17} className="text-violet-300" />

                      <span className="text-sm font-medium text-violet-200">
                        {secondsLeft}s to decide
                      </span>
                    </div>

                    <p className="mt-6 text-lg font-medium">
                      What do you think?
                    </p>

                    <p className="mt-2 text-sm text-white/40">
                      Your decision will be locked once you choose. If time runs
                      out, it&apos;s a pass.
                    </p>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-4">
                    {/* PASS */}

                    <button
                      onClick={() => submitDecision("pass")}
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.03] px-5 py-4 font-medium text-white/60 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                    >
                      <X size={20} />
                      Pass
                    </button>

                    {/* MATCH */}

                    <button
                      onClick={() => submitDecision("match")}
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-4 font-medium transition hover:scale-[1.01] hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Heart size={20} className="fill-white" />
                      )}
                      Match
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] p-6 text-center">
                  <Clock size={24} className="mx-auto text-violet-300" />

                  <h3 className="mt-4 font-medium">
                    Your decision is locked in.
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    Waiting for the other person to make their decision...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
