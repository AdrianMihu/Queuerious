"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function Home() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    
    if (!data.user?.email_confirmed_at) {
      setMessage("Please confirm your email before signing in.");
      setLoading(false);
      return;
    }

    const referralCode = data.user.user_metadata?.referral_code;

    if (referralCode) {
      const { data: referralProcessed, error: referralError } =
        await supabase.rpc("process_referral", {
          p_referral_code: referralCode,
        });
    
      if (referralError) {
        console.error("Error processing referral:", referralError);
      } else if (referralProcessed) {
        console.log("🔥 REFERRAL REWARDED");
      }
    }
    

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        {/* Background glow */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

        <section className="relative w-full max-w-md">
          {/* Logo */}
          <div className="mb-10 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl font-bold shadow-2xl">
                Q
              </div>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight">
              Queuerious
            </h1>

            <p className="mt-3 text-sm text-white/50">
              Meet the mind before the face.
            </p>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold">
                Welcome back.
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Sign in to continue your journey.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-5">
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  />

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-white/25 focus:border-violet-500/70"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-12 text-sm outline-none transition placeholder:text-white/25 focus:border-violet-500/70"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {message}
                </div>
              )}

              {/* Sign In */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 py-3.5 text-sm font-medium transition hover:bg-violet-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}

                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Sign up */}
            <div className="mt-8 text-center text-sm text-white/50">
            Don&apos;t have an account{" "}
              <Link
                href="/sign-up"
                className="font-medium text-violet-400 transition hover:text-violet-300"
              >
                Create one
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-white/25">
            © 2026 Queuerious
          </p>
        </section>
      </div>
    </main>
  );
}