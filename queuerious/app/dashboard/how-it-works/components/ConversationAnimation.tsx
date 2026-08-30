"use client";

import { useEffect, useState } from "react";
import { Clock, UserRound } from "lucide-react";

export default function ConversationAnimation() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1500),
      setTimeout(() => setStage(3), 2300),
      setTimeout(() => setStage(4), 3400),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Glow */}

      <div className="absolute h-64 w-64 rounded-full bg-violet-500/15 blur-[110px]" />

      {/* CHAT WINDOW */}

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111116]/90 shadow-2xl shadow-black/30">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15">
              <UserRound
                size={17}
                className="text-violet-300"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                Anonymous
              </p>

              <p className="text-[11px] text-emerald-300/70">
                Connected
              </p>
            </div>

          </div>

          {/* TIMER */}

          <div className="flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/[0.08] px-3 py-1.5">
            <Clock
              size={13}
              className="text-violet-300"
            />

            <span className="text-xs font-medium text-violet-200">
              02:47
            </span>
          </div>
        </div>

        {/* MESSAGES */}

        <div className="flex min-h-[170px] flex-col gap-3 px-5 py-5">

          {/* MESSAGE 1 */}

          <div
            className={`flex transition-all duration-500 ${
              stage >= 1
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            }`}
          >
            <div className="max-w-[75%] rounded-2xl rounded-tl-md bg-white/[0.07] px-4 py-2.5 text-sm text-white/80">
            What&apos;s something you could talk about for hours?
            </div>
          </div>

          {/* MESSAGE 2 */}

          <div
            className={`flex justify-end transition-all duration-500 ${
              stage >= 2
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            }`}
          >
            <div className="max-w-[75%] rounded-2xl rounded-tr-md bg-violet-500 px-4 py-2.5 text-sm text-white">
              Probably music. You?
            </div>
          </div>

          {/* TYPING */}

          <div
            className={`flex transition-all duration-300 ${
              stage === 3
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }`}
          >
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-white/[0.06] px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" />

              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40"
                style={{ animationDelay: "150ms" }}
              />

              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>

          {/* MESSAGE 3 */}

          <div
            className={`flex transition-all duration-500 ${
              stage >= 4
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            }`}
          >
            <div className="max-w-[75%] rounded-2xl rounded-tl-md bg-white/[0.07] px-4 py-2.5 text-sm text-white/80">
              I think travelling. I love hearing people&apos;s stories.
            </div>
          </div>

        </div>
      </div>

      {/* LABEL */}

      
    </div>
  );
}