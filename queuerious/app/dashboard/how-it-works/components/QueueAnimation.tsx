"use client";

import { useEffect, useState } from "react";
import { Check, Search, Zap } from "lucide-react";

type Stage = "idle" | "searching" | "found";

export default function QueueAnimation() {
  const [stage, setStage] = useState<Stage>("idle");

  useEffect(() => {
    const searchingTimer = setTimeout(() => {
      setStage("searching");
    }, 900);

    const foundTimer = setTimeout(() => {
      setStage("found");
    }, 3500);

    return () => {
      clearTimeout(searchingTimer);
      clearTimeout(foundTimer);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div
        className={`absolute h-52 w-52 rounded-full blur-[100px] transition-all duration-700 ${
          stage === "found"
            ? "scale-125 bg-emerald-500/20"
            : "bg-violet-500/20"
        }`}
      />

      {/* IDLE */}
      {stage === "idle" && (
        <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/15">
            <Zap
              size={32}
              className="fill-violet-300 text-violet-300"
            />
          </div>

          <p className="text-sm font-medium text-white">
            Entering the queue
          </p>

          <p className="mt-2 text-xs text-white/35">
            Looking for someone curious...
          </p>
        </div>
      )}

      {/* SEARCHING */}
      {stage === "searching" && (
        <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-violet-400/25 bg-violet-500/15">
              <Search size={30} className="text-violet-300" />
            </div>
          </div>

          <p className="text-sm font-medium text-white">
            Searching for someone
          </p>

          <div className="mt-4 flex gap-1.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />

            <span
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400"
              style={{ animationDelay: "150ms" }}
            />

            <span
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}

      {/* FOUND */}
      {stage === "found" && (
        <div className="relative flex flex-col items-center animate-in fade-in zoom-in-90 duration-500">
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />

            <Check size={38} className="relative text-emerald-300" />
          </div>

          <p className="text-base font-semibold text-white">
            Someone found.
          </p>

          <p className="mt-2 text-xs text-white/40">
            Your conversation is about to begin.
          </p>
        </div>
      )}
    </div>
  );
}