"use client";

import { useEffect, useState } from "react";
import { Heart, Timer, X } from "lucide-react";

export default function DecisionAnimation() {
  const [seconds, setSeconds] = useState(30);
  const [selected, setSelected] = useState<"match" | "pass" | null>(null);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          clearInterval(countdown);

          // Stop at 00:00, then demonstrate a Match
          setTimeout(() => {
            setSelected("match");
          }, 500);

          return 0;
        }

        return current - 1;
      });
    }, 180);

    return () => {
      clearInterval(countdown);
    };
  }, []);

  const isUrgent = seconds <= 10 && seconds > 0;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* BACKGROUND GLOW */}

      <div
        className={`absolute h-64 w-64 rounded-full blur-[100px] transition-all duration-500 ${
          isUrgent
            ? "scale-125 bg-rose-500/20"
            : selected === "match"
            ? "scale-125 bg-violet-500/25"
            : "scale-100 bg-violet-500/15"
        }`}
      />

      <div className="relative flex w-full max-w-xl flex-col items-center px-6">
        {/* TIMER */}

        <div
          className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-300 ${
            isUrgent
              ? "animate-pulse border-rose-400/30 bg-rose-500/10 text-rose-300"
              : seconds === 0
              ? "border-white/10 bg-white/[0.04] text-white/40"
              : "border-violet-400/20 bg-violet-500/10 text-violet-300"
          }`}
        >
          <Timer size={15} />

          <span className="text-sm font-medium">
            00:{seconds.toString().padStart(2, "0")}
          </span>
        </div>

        {/* TITLE */}

        <div className="mt-5 text-center">
          <p className="text-sm font-medium text-white/70">
            Make your choice
          </p>

          <p className="mt-1 text-xs text-white/35">
            Match or move on?
          </p>
        </div>

        {/* DECISION BUTTONS */}

        <div className="mt-7 grid w-full grid-cols-2 gap-4">
          {/* PASS */}

          <div
            className={`flex h-24 flex-col items-center justify-center rounded-3xl border transition-all duration-500 ${
              selected === "match"
                ? "scale-95 border-white/[0.04] bg-white/[0.02] text-white/25 opacity-40"
                : "border-white/[0.08] bg-white/[0.035] text-white/50"
            }`}
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]">
              <X size={18} />
            </div>

            <span className="text-sm font-medium">
              Pass
            </span>
          </div>

          {/* MATCH */}

          <div
            className={`flex h-24 flex-col items-center justify-center rounded-3xl border transition-all duration-500 ${
              selected === "match"
                ? "scale-105 border-violet-400/50 bg-violet-500/20 text-violet-100 shadow-lg shadow-violet-500/20"
                : "border-violet-400/20 bg-violet-500/[0.09] text-violet-200"
            }`}
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20">
              <Heart
                size={18}
                className={selected === "match" ? "fill-current" : ""}
              />
            </div>

            <span className="text-sm font-medium">
              Match
            </span>
          </div>
        </div>

        {/* STATUS */}

        <p
          className={`mt-5 text-center text-xs transition-all duration-500 ${
            selected === "match"
              ? "text-violet-300"
              : seconds === 0
              ? "text-white/35"
              : "text-white/30"
          }`}
        >
          {selected === "match"
            ? "You both chose to continue the connection."
            : seconds === 0
            ? "Time is up..."
            : "If time runs out, it's automatically a pass."}
        </p>
      </div>
    </div>
  );
}