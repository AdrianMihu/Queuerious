"use client";

import { useEffect, useState } from "react";
import {
  MessageCircle,
  Sparkles,
  UserRound,
} from "lucide-react";

export default function WelcomeAnimation() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => setStage(2), 1000),
      setTimeout(() => setStage(3), 2100),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* CENTRAL GLOW */}

      <div
        className={`absolute h-64 w-64 rounded-full bg-violet-500/20 blur-[100px] transition-all duration-1000 ${
          stage >= 2
            ? "scale-125 opacity-100"
            : "scale-75 opacity-40"
        }`}
      />

      {/* FLOATING SPARKLES */}

      <Sparkles
        size={20}
        className={`absolute left-[22%] top-[22%] text-violet-300 transition-all duration-700 ${
          stage >= 1
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      />

      <Sparkles
        size={15}
        className={`absolute right-[24%] top-[30%] text-violet-300/70 transition-all delay-200 duration-700 ${
          stage >= 1
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      />

      <Sparkles
        size={13}
        className={`absolute bottom-[22%] left-[30%] text-violet-300/50 transition-all delay-300 duration-700 ${
          stage >= 1
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      />

      <div className="relative flex w-full max-w-xl items-center justify-center px-6">
        {/* LEFT PERSON */}

        <div
          className={`absolute left-[10%] transition-all duration-700 sm:left-[18%] ${
            stage >= 1
              ? "translate-x-0 scale-100 opacity-100"
              : "-translate-x-10 scale-90 opacity-0"
          }`}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.04] text-white/55">
            <UserRound size={30} />
          </div>
        </div>

        {/* RIGHT PERSON */}

        <div
          className={`absolute right-[10%] transition-all duration-700 sm:right-[18%] ${
            stage >= 1
              ? "translate-x-0 scale-100 opacity-100"
              : "translate-x-10 scale-90 opacity-0"
          }`}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.04] text-white/55">
            <UserRound size={30} />
          </div>
        </div>

        {/* CENTRAL CONVERSATION */}

        <div
          className={`relative z-10 flex flex-col items-center transition-all duration-700 ${
            stage >= 2
              ? "scale-100 opacity-100"
              : "scale-50 opacity-0"
          }`}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/30 bg-violet-500/15 text-violet-200 shadow-xl shadow-violet-500/20">
            <MessageCircle size={32} />
          </div>

          <div
            className={`mt-4 flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-violet-300 transition-all duration-700 ${
              stage >= 3
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }`}
          >
            <Sparkles size={14} />
            DISCOVER DIFFERENTLY
          </div>
        </div>
      </div>

      {/* BOTTOM STATUS */}

      <div
        className={`absolute bottom-7 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-xs text-white/35 transition-all duration-700 ${
          stage >= 3
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0"
        }`}
      >
        Curiosity starts the conversation.
      </div>
    </div>
  );
}