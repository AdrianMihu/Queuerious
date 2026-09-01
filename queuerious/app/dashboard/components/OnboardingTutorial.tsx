"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";

const steps = [
  {
    target: "tutorial-profile",
    title: "Complete your profile",
    description:
      "Add the basics about yourself and give people something interesting to discover after the conversation.",
  },
  {
    target: "tutorial-preferences",
    title: "Set your preferences",
    description:
      "Tell us who you'd like to meet and what you're looking for so we can build your queues around you.",
  },
  {
    target: "tutorial-queuemitment",
    title: "Welcome to Queuemitment",
    description:
      "Enter the queue and get matched through curiosity and conversation — before either of you sees a profile.",
  },
];

export default function OnboardingTutorial() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    function updateTargetPosition() {
      const element = document.getElementById(steps[step].target);

      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    }

    updateTargetPosition();

    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition, true);

    return () => {
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition, true);
    };
  }, [step]);

  async function finishTutorial() {
    setFinishing(true);

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Could not get user:", userError);
      setFinishing(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        tutorial_completed: true,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error completing tutorial:", error);
      setFinishing(false);
      return;
    }

    setVisible(false);

    if (error) {
      console.error("Error completing tutorial:", error);
      setFinishing(false);
      return;
    }

    setVisible(false);
  }

  if (!visible || !targetRect) return null;

  const isLastStep = step === steps.length - 1;

  const padding = 6;

  const spotlightTop = targetRect.top - padding;
  const spotlightLeft = targetRect.left - padding;
  const spotlightWidth = targetRect.width + padding * 2;
  const spotlightHeight = targetRect.height + padding * 2;
  const cardHeight = 365;
  const cardWidth = 380;
  const gap = 24;

  const hasSpaceBelow =
    targetRect.bottom + gap + cardHeight < window.innerHeight;

  const cardTop = hasSpaceBelow
    ? targetRect.bottom + gap
    : targetRect.top - gap - cardHeight;

  const cardLeft = Math.min(
    targetRect.left + 10,
    window.innerWidth - cardWidth - 20
  );

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* TOP DARK AREA */}
      <div
        className="absolute left-0 right-0 top-0 bg-black/80 backdrop-blur-[2px]"
        style={{
          height: spotlightTop,
        }}
      />

      {/* LEFT DARK AREA */}
      <div
        className="absolute bg-black/80 backdrop-blur-[2px]"
        style={{
          top: spotlightTop,
          left: 0,
          width: spotlightLeft,
          height: spotlightHeight,
        }}
      />

      {/* RIGHT DARK AREA */}
      <div
        className="absolute bg-black/80 backdrop-blur-[2px]"
        style={{
          top: spotlightTop,
          left: spotlightLeft + spotlightWidth,
          right: 0,
          height: spotlightHeight,
        }}
      />

      {/* BOTTOM DARK AREA */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-[2px]"
        style={{
          top: spotlightTop + spotlightHeight,
        }}
      />

      {/* Spotlight border */}
      <div
        className="pointer-events-none absolute rounded-xl border border-violet-400 shadow-[0_0_0_4px_rgba(139,92,246,0.15),0_0_35px_rgba(139,92,246,0.45)] transition-all duration-300"
        style={{
          top: spotlightTop,
          left: spotlightLeft,
          width: spotlightWidth,
          height: spotlightHeight,
        }}
      />

      {/* Tutorial card */}
      <div
        className="absolute w-[380px] rounded-3xl border border-violet-400/20 bg-[#17151f] p-6 shadow-2xl shadow-black/60"
        style={{
          top: Math.max(20, cardTop),
          left: Math.max(20, cardLeft),
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/15 text-violet-300">
            <Sparkles size={20} />
          </div>

          <span className="text-xs font-medium text-white/30">
            {step + 1} / {steps.length}
          </span>
        </div>

        <h3 className="text-xl font-semibold">{steps[step].title}</h3>

        <p className="mt-3 text-sm leading-relaxed text-white/50">
          {steps[step].description}
        </p>

        <div className="mt-7 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 text-sm text-white/35 transition hover:text-white disabled:pointer-events-none disabled:opacity-0"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={finishTutorial}
              disabled={finishing}
              className="flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium transition hover:bg-violet-400 active:scale-[0.98] disabled:opacity-60"
            >
              {finishing ? "Saving..." : "Got it"}
              {!finishing && <Check size={17} />}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((current) => current + 1)}
              className="flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium transition hover:bg-violet-400 active:scale-[0.98]"
            >
              Next
              <ArrowRight size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
