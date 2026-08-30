"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  MapPin,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

export default function PreferencesAnimation() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1300),
      setTimeout(() => setStage(3), 2100),
      setTimeout(() => setStage(4), 3000),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">

      {/* Background glow */}

      <div className="absolute h-56 w-56 rounded-full bg-violet-500/15 blur-[100px]" />

      <div className="relative flex w-full max-w-md flex-col gap-3">

        {/* Header */}

        <div
          className={`flex items-center gap-3 transition-all duration-500 ${
            stage >= 1
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/15">
            <SlidersHorizontal
              size={19}
              className="text-violet-300"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Your preferences
            </p>

            <p className="text-xs text-white/35">
              Used to guide your search
            </p>
          </div>
        </div>

        {/* Preference cards */}

        <div className="mt-3 space-y-2">

          <div
            className={`flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 transition-all duration-500 ${
              stage >= 2
                ? "translate-x-0 opacity-100"
                : "-translate-x-6 opacity-0"
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart size={16} className="text-violet-300" />

              <span className="text-sm text-white/70">
              Who you&apos;d like to meet
              </span>
            </div>

            <span className="text-xs text-violet-300">
              Selected
            </span>
          </div>

          <div
            className={`flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 transition-all duration-500 delay-150 ${
              stage >= 3
                ? "translate-x-0 opacity-100"
                : "translate-x-6 opacity-0"
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-violet-300" />

              <span className="text-sm text-white/70">
                Location preferences
              </span>
            </div>

            <span className="text-xs text-violet-300">
              Selected
            </span>
          </div>

        </div>

        {/* Matching signal */}

        <div
          className={`mt-4 flex items-center justify-center gap-3 transition-all duration-700 ${
            stage >= 4
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-400/40" />

          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/25 bg-violet-500/15">
            <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/10" />

            <Sparkles
              size={20}
              className="relative text-violet-300"
            />
          </div>

          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-400/40" />
        </div>

      </div>
    </div>
  );
}