"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Eye,
  EyeOff,
  Lock,
  CalendarDays,
  ChevronDown,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function SignUp() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [countryCode, setCountryCode] = useState("");
  const [countries, setCountries] = useState<
    { code: string; name: string; flag: string }[]
  >([]);

  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    setDateOfBirth(`${year}-${month}-${day}`);

    setIsDatePickerOpen(false);
  }

  useEffect(() => {
    async function loadCountries() {
      try {
        const response = await fetch("/api/countries");

        if (!response.ok) {
          throw new Error("Failed to load countries");
        }

        const data: {
          code: string;
          name: string;
          flag: string;
        }[] = await response.json();

        console.log("COUNTRIES:", data);

        setCountries(data);
      } catch (error) {
        console.error("Error loading countries:", error);
      }
    }

    loadCountries();
  }, []);

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");

    // Check passwords
    if (password !== repeatPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (!dateOfBirth) {
      setMessage("Please enter your date of birth.");
      return;
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    const dayDifference = today.getDate() - birthDate.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    if (age < 16 || age > 90) {
      setMessage(
        "You must be between 16 and 90 years old to create an account."
      );
      return;
    }

    if (!gender) {
      setMessage("Please select your gender.");
      return;
    }

    if (!countryCode) {
      setMessage("Please select your country.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          date_of_birth: dateOfBirth,
          gender,
          country_code: countryCode,
          referral_code: referralCode || null,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          first_name: firstName.trim(),
          date_of_birth: dateOfBirth,
          gender,
          country_code: countryCode,
          referral_code: crypto.randomUUID().replace(/-/g, "").slice(0, 8),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (profileError) {
        console.error("Error creating profile:", profileError);
        setMessage("Account was created, but we couldn't create your profile.");
        setLoading(false);
        return;
      }

      
    }

    setMessage(
      "Account created successfully! Check your email to confirm your account."
    );

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        {/* Background glow */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

        <section className="relative w-full max-w-md">
          {/* Back button */}
          <Link
            href="/"
            className="absolute -top-16 left-0 flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>

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
              <h2 className="text-2xl font-semibold">Get curious.</h2>

              <p className="mt-2 text-sm text-white/50">
                Create your account and start meeting people differently.
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Surname */}
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  First name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  />

                  <input
                    type="text"
                    placeholder="Adrian"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-white/25 focus:border-violet-500/70"
                  />
                </div>
              </div>

              {/* Date of birth */}
              {/* Date of birth */}
              <div className="relative">
                <label className="mb-2 block text-sm text-white/70">
                  Date of birth
                </label>

                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-left transition hover:border-violet-500/70"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays size={18} className="text-white/30" />

                    <span
                      className={dateOfBirth ? "text-white" : "text-white/25"}
                    >
                      {dateOfBirth
                        ? new Date(
                            dateOfBirth + "T00:00:00"
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "Select your date of birth"}
                    </span>
                  </div>

                  <ChevronDown
                    size={18}
                    className={`text-white/40 transition ${
                      isDatePickerOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <p className="mt-2 text-xs text-white/35">
                  Your date of birth cannot be changed later.
                </p>

                {isDatePickerOpen && (
                  <div className="absolute left-0 top-full z-50 mt-3 rounded-2xl border border-violet-400/20 bg-[#15121f] p-4 shadow-2xl shadow-black/50">
                    <DayPicker
                      mode="single"
                      selected={
                        dateOfBirth
                          ? new Date(dateOfBirth + "T00:00:00")
                          : undefined
                      }
                      onSelect={handleDateSelect}
                      captionLayout="dropdown"
                      startMonth={
                        new Date(
                          new Date().getFullYear() - 90,
                          new Date().getMonth(),
                          new Date().getDate()
                        )
                      }
                      endMonth={
                        new Date(
                          new Date().getFullYear() - 16,
                          new Date().getMonth(),
                          new Date().getDate()
                        )
                      }
                      className="text-white"
                    />
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Gender
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setGender(option.value as "Male" | "Female" | "Other")
                      }
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        gender === option.value
                          ? "border-violet-400 bg-violet-500/15 text-violet-200"
                          : "border-white/10 bg-black/20 text-white/50 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-xs text-white/30">
                  Your gender cannot be changed later.
                </p>
              </div>

              {/* Country */}
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Country
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCountryOpen(!countryOpen)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition focus:border-violet-500/70"
                  >
                    <span>
                      {countryCode
                        ? countries.find(
                            (country) => country.code === countryCode
                          )?.flag +
                          " " +
                          countries.find(
                            (country) => country.code === countryCode
                          )?.name
                        : "Select your country"}
                    </span>

                    <ChevronDown size={18} className="text-white/40" />
                  </button>

                  {countryOpen && (
                    <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#15121f] p-2 shadow-xl">
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search country..."
                        autoFocus
                        className="mb-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-500/70"
                      />

                      <div className="max-h-60 overflow-y-auto">
                        {countries
                          .filter((country) =>
                            country.name
                              .toLowerCase()
                              .includes(countrySearch.toLowerCase())
                          )
                          .map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setCountryCode(country.code);
                                setCountrySearch("");
                                setCountryOpen(false);
                              }}
                              className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-white transition hover:bg-white/10"
                            >
                              {country.flag} {country.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-2 text-xs text-white/30">
                  Your country cannot be changed later.
                </p>
              </div>

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
                    placeholder="Create a password"
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

              {/* Repeat password */}
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Repeat password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  />

                  <input
                    type={showRepeatPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-12 text-sm outline-none transition placeholder:text-white/25 focus:border-violet-500/70"
                  />

                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
                  >
                    {showRepeatPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">
                  {message}
                </div>
              )}

              {/* Create account */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 py-3.5 text-sm font-medium transition hover:bg-violet-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Sign in */}
            <div className="mt-8 text-center text-sm text-white/50">
              Already have an account?{" "}
              <Link
                href="/"
                className="font-medium text-violet-400 transition hover:text-violet-300"
              >
                Sign in
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
