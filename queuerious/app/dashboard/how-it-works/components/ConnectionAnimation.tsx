"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Heart,
  MessageCircle,
  Sparkles,
  UserRound,
} from "lucide-react";

export default function ConnectionAnimation() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1800),
      setTimeout(() => setStage(3), 2800),
      setTimeout(() => setStage(4), 4000),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* BACKGROUND GLOW */}

      <div
        className={`absolute h-72 w-72 rounded-full bg-violet-500/20 blur-[110px] transition-all duration-1000 ${
          stage >= 2
            ? "scale-125 opacity-100"
            : "scale-75 opacity-40"
        }`}
      />

      <div className="relative flex w-full max-w-xl flex-col items-center px-6">
        {/* MATCH AREA */}

        <div className="relative flex h-[150px] w-full items-center justify-center">
          {/* LEFT PROFILE */}

          <div
            className={`absolute left-[12%] transition-all duration-700 sm:left-[18%] ${
              stage >= 1
                ? "translate-x-5 scale-100 opacity-100"
                : "-translate-x-8 scale-90 opacity-0"
            }`}
          >
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-3xl border transition-all duration-700 ${
                stage >= 2
                  ? "border-violet-400/40 bg-violet-500/20 shadow-lg shadow-violet-500/20"
                  : "border-white/[0.08] bg-white/[0.04]"
              }`}
            >
              <UserRound
                size={30}
                className={
                  stage >= 2
                    ? "text-violet-200"
                    : "text-white/45"
                }
              />
            </div>
          </div>

          {/* RIGHT PROFILE */}

          <div
            className={`absolute right-[12%] transition-all duration-700 sm:right-[18%] ${
              stage >= 1
                ? "-translate-x-5 scale-100 opacity-100"
                : "translate-x-8 scale-90 opacity-0"
            }`}
          >
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-3xl border transition-all duration-700 ${
                stage >= 2
                  ? "border-violet-400/40 bg-violet-500/20 shadow-lg shadow-violet-500/20"
                  : "border-white/[0.08] bg-white/[0.04]"
              }`}
            >
              <UserRound
                size={30}
                className={
                  stage >= 2
                    ? "text-violet-200"
                    : "text-white/45"
                }
              />
            </div>
          </div>

          {/* CENTER HEART */}

          <div
            className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-500 ${
              stage >= 2
                ? "scale-100 border-violet-400/50 bg-violet-500/25 text-violet-100 shadow-xl shadow-violet-500/30"
                : "scale-0 border-transparent bg-transparent text-transparent"
            }`}
          >
            <Heart
              size={28}
              className={stage >= 2 ? "fill-current" : ""}
            />
          </div>

          {/* SPARKLES */}

          {stage >= 2 && (
            <>
              <Sparkles
                size={18}
                className="absolute left-[30%] top-3 animate-pulse text-violet-300"
              />

              <Sparkles
                size={14}
                className="absolute right-[30%] bottom-5 animate-pulse text-violet-300/70"
              />
            </>
          )}
        </div>

        {/* MATCH MESSAGE */}

        <div
          className={`mt-2 text-center transition-all duration-700 ${
            stage >= 3
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200">
            <Check size={16} />

            It&apos;s a match
          </div>

          <p className="mt-3 text-xs text-white/40">
            You both chose to continue the connection.
          </p>
        </div>

        {/* CONTINUE CHAT */}

        <div
          className={`mt-5 w-full max-w-sm transition-all duration-700 ${
            stage >= 4
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              <MessageCircle size={17} />
            </div>

            <div className="flex-1">
              <p className="text-xs font-medium text-white/70">
                Continue the conversation
              </p>

              <p className="mt-0.5 text-[11px] text-white/35">
                Your connection is now available anytime.
              </p>
            </div>

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/15 text-violet-300">
              <Heart size={13} className="fill-current" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}