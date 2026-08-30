"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, UserRound } from "lucide-react";

type Stage = "waiting" | "approaching" | "matched";

export default function MatchAnimation() {
  const [stage, setStage] = useState<Stage>("waiting");

  useEffect(() => {
    const approachTimer = setTimeout(() => {
      setStage("approaching");
    }, 700);

    const matchedTimer = setTimeout(() => {
      setStage("matched");
    }, 2400);

    return () => {
      clearTimeout(approachTimer);
      clearTimeout(matchedTimer);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Background glow */}

      <div
        className={`absolute h-64 w-64 rounded-full blur-[110px] transition-all duration-700 ${
          stage === "matched"
            ? "scale-125 bg-violet-500/25"
            : "bg-violet-500/10"
        }`}
      />

      {/* CONNECTION LINE */}

      <div
        className={`absolute top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-violet-400/60 to-transparent transition-all duration-700 ${
          stage === "matched"
            ? "w-48 opacity-100"
            : "w-0 opacity-0"
        }`}
      />

      {/* LEFT PERSON */}

      <div
        className={`relative z-10 transition-all duration-700 ${
          stage === "waiting"
            ? "-translate-x-20 opacity-0"
            : stage === "approaching"
              ? "-translate-x-8 opacity-100"
              : "-translate-x-12 opacity-100"
        }`}
      >
        <div className="flex h-24 w-20 flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.05] backdrop-blur">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15">
            <UserRound size={20} className="text-violet-300" />
          </div>

          <div className="mt-2 h-1.5 w-8 rounded-full bg-white/15" />
        </div>
      </div>

      {/* CENTER */}

      <div
        className={`relative z-20 mx-6 transition-all duration-500 ${
          stage === "matched"
            ? "scale-100 opacity-100"
            : "scale-50 opacity-0"
        }`}
      >
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/20">
          <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/15" />

          {stage === "matched" ? (
            <Check size={28} className="relative text-violet-200" />
          ) : (
            <Sparkles size={24} className="relative text-violet-300" />
          )}
        </div>
      </div>

      {/* RIGHT PERSON */}

      <div
        className={`relative z-10 transition-all duration-700 ${
          stage === "waiting"
            ? "translate-x-20 opacity-0"
            : stage === "approaching"
              ? "translate-x-8 opacity-100"
              : "translate-x-12 opacity-100"
        }`}
      >
        <div className="flex h-24 w-20 flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.05] backdrop-blur">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15">
            <UserRound size={20} className="text-violet-300" />
          </div>

          <div className="mt-2 h-1.5 w-8 rounded-full bg-white/15" />
        </div>
      </div>

      {/* TEXT */}

      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-center transition-all duration-500 ${
          stage === "matched"
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0"
        }`}
      >
        <p className="text-sm font-semibold text-white">
          Match found
        </p>

        <p className="mt-1 text-xs text-white/35">
          Your anonymous conversation begins.
        </p>
      </div>
    </div>
  );
}