"use client";

import { useState } from "react";
import Link from "next/link";

import WelcomeAnimation from "./components/WelcomeAnimation";
import QueueAnimation from "./components/QueueAnimation";
import PreferencesAnimation from "./components/PreferencesAnimation";
import MatchAnimation from "./components/MatchAnimation";
import ConversationAnimation from "./components/ConversationAnimation";
import RevealAnimation from "./components/RevealAnimation";
import DecisionAnimation from "./components/DecisionAnimation";
import ConnectionAnimation from "./components/ConnectionAnimation";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const slides = [
  {
    eyebrow: "WELCOME TO QUEUERIOUS",
    title: "Meet the mind before the face.",
    description:
      "Connection starts with curiosity, conversation and personality  before either of you sees a profile.",
  },
  {
    eyebrow: "STEP 1 · ENTER THE QUEUE",
    title: "Step into the unknown.",
    description:
      "Use a Queue to enter Queuemitment. We'll look for someone else ready to have a conversation.",
  },
  {
    eyebrow: "STEP 2 · YOUR PREFERENCES",
    title: "Your preferences guide the search.",
    description:
      "Before finding someone, Queuerious uses the preferences you've selected to look for people who fit what you're looking for.",
  },
  {
    eyebrow: "STEP 3 · GET MATCHED",
    title: "Someone is waiting.",
    description:
      "When two people enter the queue, the conversation begins  completely anonymous.",
  },
  {
    eyebrow: "STEP 4 · THE CONVERSATION",
    title: "Talk before you know.",
    description:
      "You have a limited amount of time to talk, ask questions and discover the person behind the screen.",
  },
  {
    eyebrow: "STEP 5 · THE REVEAL",
    title: "Now you see.",
    description:
      "When time runs out, the mystery disappears and you finally discover who you've been talking to.",
  },
  {
    eyebrow: "STEP 6 · MAKE A DECISION",
    title: "30 seconds. Your choice.",
    description:
      "Choose Match to continue the connection or Pass to move on. If time runs out, it's automatically a pass.",
  },
  {
    eyebrow: "THE CONNECTION",
    title: "Both chose Match?",
    description:
      "Then it's official. Your conversation becomes a match and you can continue talking whenever you want.",
  },
];

export default function HowItWorksPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  const slide = slides[currentSlide];

  function nextSlide() {
    if (!isLastSlide) {
      setCurrentSlide((current) => current + 1);
    }
  }

  function previousSlide() {
    if (!isFirstSlide) {
      setCurrentSlide((current) => current - 1);
    }
  }

  return (
    <section className="flex min-h-full flex-1 px-6 py-8 lg:px-10 xl:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        {/* TOP */}

        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <span className="text-xs font-medium text-white/25">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>

        {/* SLIDE */}

        <div className="flex flex-1 items-center justify-center py-12">
          <div
            key={currentSlide}
            className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-3 duration-500"
          >
            {/* VISUAL AREA */}

            <div className="relative mb-12 flex h-[280px] items-center justify-center overflow-hidden rounded-[36px] border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.12] via-[#14121c] to-[#0d0d12]">
              {/* SLIDE ANIMATION */}

              {currentSlide === 0 ? (
                <WelcomeAnimation />
              ) : currentSlide === 1 ? (
                <QueueAnimation />
              ) : currentSlide === 2 ? (
                <PreferencesAnimation />
              ) : currentSlide === 3 ? (
                <MatchAnimation />
              ) : currentSlide === 4 ? (
                <ConversationAnimation />
              ) : currentSlide === 5 ? (
                <RevealAnimation />
              ) : currentSlide === 6 ? (
                <DecisionAnimation />
              ) : currentSlide === 7 ? (
                <ConnectionAnimation />
              ) : null}
            </div>

            {/* CONTENT */}

            <div className="text-center">
              <p className="mb-4 text-xs font-medium tracking-[0.22em] text-violet-300">
                {slide.eyebrow}
              </p>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {slide.title}
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/45 sm:text-lg">
                {slide.description}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}

        <div className="flex items-center justify-between border-t border-white/[0.07] py-6">
          <button
            onClick={previousSlide}
            disabled={isFirstSlide}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white/45 transition hover:bg-white/[0.04] hover:text-white disabled:pointer-events-none disabled:opacity-20"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          {/* PROGRESS */}

          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to step ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-7 bg-violet-400"
                    : "w-2 bg-white/15 hover:bg-white/30"
                }`}
              />
            ))}
          </div>

          {isLastSlide ? (
            <Link
              href="/dashboard/queuemitment"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 active:scale-[0.98]"
            >
              Got it
              <Check size={17} />
            </Link>
          ) : (
            <button
              onClick={nextSlide}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 active:scale-[0.98]"
            >
              Next
              <ArrowRight size={17} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
