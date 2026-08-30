"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  MessageCircle,
  Timer,
  UserRound,
} from "lucide-react";

export default function RevealAnimation() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevealed((current) => !current);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">

      {/* Background glow */}

      <div
        className={`absolute h-72 w-72 rounded-full bg-violet-500/20 blur-[110px] transition-all duration-1000 ${
          revealed ? "scale-125 opacity-100" : "scale-75 opacity-40"
        }`}
      />

      <div className="relative w-full max-w-2xl px-6">

        {/* HEADER */}

        <div className="mx-auto mb-5 flex max-w-xl items-center justify-between rounded-2xl border border-white/[0.07] bg-[#111117]/90 px-5 py-3">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              {revealed ? (
                <Eye size={17} />
              ) : (
                <MessageCircle size={17} />
              )}
            </div>

            <div>
              <p className="text-sm font-medium">
                {revealed
                  ? "Identities revealed"
                  : "Anonymous conversation"}
              </p>

              <p className="text-xs text-white/35">
                {revealed
                  ? "The mystery is over"
                  : "Still getting to know each other"}
              </p>
            </div>

          </div>

          {!revealed && (
            <div className="flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">
              <Timer size={13} />
              00:01
            </div>
          )}

          {revealed && (
            <div className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">
              REVEAL
            </div>
          )}

        </div>

        {/* MAIN AREA */}

        <div className="relative mx-auto flex h-[155px] max-w-xl items-center justify-center">

          {/* LEFT PROFILE */}

          <div
            className={`absolute left-0 transition-all duration-700 ${
              revealed
                ? "translate-x-0 scale-100 opacity-100"
                : "translate-x-10 scale-90 opacity-40 blur-sm"
            }`}
          >
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/30 to-violet-900/20 shadow-xl shadow-violet-950/30">

              {revealed ? (
                <div className="flex h-full w-full items-center justify-center bg-violet-500/10">
                  <UserRound
                    size={38}
                    className="text-violet-200"
                  />
                </div>
              ) : (
                <span className="text-3xl font-semibold text-white/50">
                  ?
                </span>
              )}

            </div>

            {revealed && (
              <p className="mt-2 text-center text-xs font-medium text-white/70">
                You
              </p>
            )}
          </div>

          {/* CENTER REVEAL */}

          <div className="relative z-10 flex flex-col items-center">

            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-700 ${
                revealed
                  ? "scale-110 border-violet-400/40 bg-violet-500/25 text-violet-200 shadow-lg shadow-violet-500/30"
                  : "border-white/10 bg-white/[0.04] text-white/40"
              }`}
            >
              {revealed ? (
                <Eye size={27} />
              ) : (
                <Timer size={24} />
              )}
            </div>

            <p
              className={`mt-3 text-xs font-medium tracking-[0.2em] transition-all duration-500 ${
                revealed
                  ? "text-violet-300 opacity-100"
                  : "text-white/30 opacity-70"
              }`}
            >
              {revealed
                ? "NOW YOU SEE"
                : "TIME'S UP"}
            </p>

          </div>

          {/* RIGHT PROFILE */}

          <div
            className={`absolute right-0 transition-all duration-700 ${
              revealed
                ? "translate-x-0 scale-100 opacity-100"
                : "-translate-x-10 scale-90 opacity-40 blur-sm"
            }`}
          >
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-fuchsia-500/20 to-violet-900/20 shadow-xl shadow-violet-950/30">

              {revealed ? (
                <div className="flex h-full w-full items-center justify-center bg-violet-500/10">
                  <UserRound
                    size={38}
                    className="text-violet-200"
                  />
                </div>
              ) : (
                <span className="text-3xl font-semibold text-white/50">
                  ?
                </span>
              )}

            </div>

            {revealed && (
              <p className="mt-2 text-center text-xs font-medium text-white/70">
                Your match
              </p>
            )}
          </div>

        </div>

        {/* BOTTOM STATUS */}

        <div className="mx-auto mt-4 flex max-w-md justify-center">

          <div
            className={`rounded-full border px-4 py-2 text-xs transition-all duration-500 ${
              revealed
                ? "border-violet-400/20 bg-violet-500/10 text-violet-200"
                : "border-white/[0.07] bg-white/[0.03] text-white/35"
            }`}
          >
            {revealed
              ? "The person behind the conversation is revealed."
              : "The conversation is about to end..."}
          </div>

        </div>

      </div>
    </div>
  );
}