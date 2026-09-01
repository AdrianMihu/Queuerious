import Link from "next/link";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-full px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-3xl">

        {/* Success Card */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.10] bg-[#0d1019] px-6 py-8 shadow-2xl md:px-10 md:py-10">

          {/* Subtle green glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[80px]" />

          <div className="relative">

            {/* Confetti */}
            <div className="mb-5 text-center text-xl tracking-[14px] opacity-90">
              ✦ · ✧ · ✦ · ✧ · ✦
            </div>

            {/* Success icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-emerald-400/80 bg-emerald-500/[0.08] shadow-[0_0_50px_rgba(16,185,129,0.18)]">
              <Check
                size={40}
                strokeWidth={2.5}
                className="text-emerald-400"
              />
            </div>

            {/* Title */}
            <div className="mt-6 text-center">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Payment successful! 🎉
              </h1>

              <p className="mt-3 text-lg text-white/65">
                Thank you for supporting Queuerious.
              </p>

              <p className="mt-2 text-base text-white/40">
                Your purchase was completed successfully.
              </p>
            </div>

            {/* Confirmation box */}
            <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.05] p-5">
              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check
                    size={24}
                    className="text-emerald-400"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-emerald-300">
                    Your purchase has been confirmed!
                  </h2>

                  <p className="mt-1 text-sm text-white/50">
                    Everything is ready. Enjoy Queuerious.
                  </p>
                </div>

              </div>
            </div>

            {/* Main button */}
            <Link
              href="/dashboard"
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-700 via-purple-600 to-purple-500 px-6 py-4 font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.25)] transition hover:scale-[1.01] hover:brightness-110"
            >
              Back to Queuerious
              <ArrowRight size={20} />
            </Link>

            {/* Back to store */}
            <div className="mt-5 text-center">
              <Link
                href="/dashboard/store"
                className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white/80"
              >
                <ArrowLeft size={16} />
                Back to Store
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}