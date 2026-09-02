"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  Heart,
  MapPin,
  SlidersHorizontal,
  UserRound,
  UsersRound,
} from "lucide-react";
import { createClient } from "../../../lib/supabase/client";

const genderOptions = ["Male", "Female", "Other"];
const lookingForOptions = ["Relationship", "Friends"];

export default function PreferencesPage() {
  const supabase = createClient();

  const [searchingFor, setSearchingFor] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(35);

  const [locationPreference, setLocationPreference] = useState("same_country");

  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchingForError, setSearchingForError] = useState("");
  const [lookingForError, setLookingForError] = useState("");
  const [minAgeError, setMinAgeError] = useState("");
  const [maxAgeError, setMaxAgeError] = useState("");
  const [ageRangeError, setAgeRangeError] = useState("");

  useEffect(() => {
    async function loadPreferences() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("Could not get authenticated user:", userError);
          return;
        }

        const { data, error } = await supabase
          .from("preferences")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error loading preferences:", error);
          return;
        }

        if (!data) return;

        /*
          searching_for = Male / Female / Other

          Fallback-ul la vechiul looking_for există doar ca
          preferințele vechi să nu dispară după update.
        */
        setSearchingFor(data.searching_for ?? data.looking_for ?? []);

        /*
          Noul looking_for = Relationship / Friends
        */
        setLookingFor(data.looking_for_type ?? []);

        setMinAge(data.min_age ?? 18);
        setMaxAge(data.max_age ?? 35);

        setLocationPreference(data.location_preference ?? "same_country");
      } catch (error) {
        console.error("Unexpected error while loading preferences:", error);
      } finally {
        setLoadingPreferences(false);
      }
    }

    loadPreferences();
  }, []);

  function toggleSearchingFor(option: string) {
    setSearchingForError("");
    setSearchingFor((current) => {
      if (current.includes(option)) {
        return current.filter((item) => item !== option);
      }

      return [...current, option];
    });
  }

  function toggleLookingFor(option: string) {
    setLookingForError("");
    setLookingFor((current) => {
      if (current.includes(option)) {
        return current.filter((item) => item !== option);
      }

      return [...current, option];
    });
  }

  async function handleSave() {
    setSaved(false);

    setSearchingForError("");
    setLookingForError("");
    setMinAgeError("");
    setMaxAgeError("");
    setAgeRangeError("");

    let hasError = false;

    if (searchingFor.length === 0) {
      setSearchingForError(
        "Please select at least one person you'd like to meet."
      );
      hasError = true;
    }

    if (lookingFor.length === 0) {
      setLookingForError(
        "Please select what kind of connection you're looking for."
      );
      hasError = true;
    }

    if (minAge < 16 || minAge > 90) {
      setMinAgeError("Minimum age must be between 16 and 90.");
      hasError = true;
    }

    if (maxAge < 16 || maxAge > 90) {
      setMaxAgeError("Maximum age must be between 16 and 90.");
      hasError = true;
    }

    if (minAge > maxAge) {
      setAgeRangeError("Minimum age cannot be higher than maximum age.");
      hasError = true;
    }

    if (hasError) return;

    setSavingPreferences(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("You must be signed in to save your preferences.");
        return;
      }

      const { error } = await supabase.from("preferences").upsert(
        {
          id: user.id,

          searching_for: searchingFor,
          looking_for_type: lookingFor,

          min_age: minAge,
          max_age: maxAge,
          location_preference: locationPreference,

          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (error) {
        console.error("Error saving preferences:", error);
        alert("Something went wrong while saving your preferences.");
        return;
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Unexpected error while saving preferences:", error);

      alert("Something went wrong while saving your preferences.");
    } finally {
      setSavingPreferences(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b10] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
        {/* HEADER */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
              <SlidersHorizontal size={23} />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Preferences
              </h1>

              <p className="mt-1 text-sm text-white/40">
                Fine-tune who you&apos;d like to meet.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            {/* SEARCHING FOR */}
            <section
              className={`rounded-3xl border bg-white/[0.025] p-6 backdrop-blur-xl ${
                searchingForError ? "border-red-500/40" : "border-white/[0.08]"
              }`}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                  <UserRound size={21} />
                </div>

                <div>
                  <h2 className="font-semibold">Searching for</h2>

                  <p className="mt-1 text-sm text-white/35">
                    Choose who you&apos;d like to meet.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {genderOptions.map((gender) => {
                  const selected = searchingFor.includes(gender);

                  return (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => toggleSearchingFor(gender)}
                      className={`relative flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-medium transition ${
                        selected
                          ? "border-violet-400/50 bg-violet-500/15 text-white shadow-lg shadow-violet-500/10"
                          : "border-white/[0.08] bg-white/[0.02] text-white/45 hover:border-white/20 hover:bg-white/[0.04] hover:text-white/80"
                      }`}
                    >
                      {selected && (
                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500">
                          <Check size={13} />
                        </div>
                      )}

                      <UserRound size={18} />

                      {gender}
                    </button>
                  );
                })}
              </div>
              {searchingForError && (
                <p className="mt-4 text-sm text-red-400">{searchingForError}</p>
              )}
            </section>

            {/* LOOKING FOR */}
            <section
              className={`rounded-3xl border bg-white/[0.025] p-6 backdrop-blur-xl ${
                lookingForError ? "border-red-500/40" : "border-white/[0.08]"
              }`}
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-300">
                  <Heart size={21} />
                </div>

                <div>
                  <h2 className="font-semibold">Looking for</h2>

                  <p className="mt-1 text-sm text-white/35">
                    What kind of connection would you like to discover?
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {lookingForOptions.map((option) => {
                  const selected = lookingFor.includes(option);

                  const Icon = option === "Relationship" ? Heart : UsersRound;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleLookingFor(option)}
                      className={`relative flex items-center justify-center gap-3 rounded-2xl border px-5 py-5 text-sm font-medium transition ${
                        selected
                          ? "border-pink-400/40 bg-pink-500/10 text-white shadow-lg shadow-pink-500/10"
                          : "border-white/[0.08] bg-white/[0.02] text-white/45 hover:border-white/20 hover:bg-white/[0.04] hover:text-white/80"
                      }`}
                    >
                      {selected && (
                        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500">
                          <Check size={13} />
                        </div>
                      )}

                      <Icon
                        size={19}
                        className={
                          option === "Relationship"
                            ? "text-pink-300"
                            : "text-violet-300"
                        }
                      />

                      {option}
                    </button>
                  );
                })}
              </div>
              {lookingForError && (
                <p className="mt-4 text-sm text-red-400">{lookingForError}</p>
              )}
            </section>

            {/* AGE RANGE */}
            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-xl">
              <div className="mb-6">
                <h2 className="font-semibold">Age range</h2>

                <p className="mt-1 text-sm text-white/35">
                  Choose the age range you&apos;re comfortable with.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/50">
                    Minimum age
                  </label>

                  <input
                    type="number"
                    min="16"
                    max="90"
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                    className={`w-full rounded-2xl border bg-white/[0.03] px-5 py-4 text-lg font-medium text-white outline-none transition focus:bg-white/[0.05] ${
                      minAgeError || ageRangeError
                        ? "border-red-500/50 focus:border-red-500/70"
                        : "border-white/[0.08] focus:border-violet-400/40"
                    }`}
                  />
                </div>

                {minAgeError && (
                  <p className="mt-2 text-sm text-red-400">{minAgeError}</p>
                )}

                <div>
                  <label className="mb-2 block text-sm text-white/50">
                    Maximum age
                  </label>

                  <input
                    type="number"
                    min="16"
                    max="90"
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                    className={`w-full rounded-2xl border bg-white/[0.03] px-5 py-4 text-lg font-medium text-white outline-none transition focus:bg-white/[0.05] ${
                      maxAgeError || ageRangeError
                        ? "border-red-500/50 focus:border-red-500/70"
                        : "border-white/[0.08] focus:border-violet-400/40"
                    }`}
                  />
                </div>
                {maxAgeError && (
                  <p className="mt-2 text-sm text-red-400">{maxAgeError}</p>
                )}
              </div>

              {ageRangeError && (
                <p className="mt-4 text-sm text-red-400">{ageRangeError}</p>
              )}

              <div className="mt-6 rounded-2xl border border-violet-500/10 bg-violet-500/[0.05] px-5 py-4">
                <p className="text-sm text-violet-200/80">
                  You&apos;re looking for people between{" "}
                  <span className="font-semibold text-white">{minAge}</span> and{" "}
                  <span className="font-semibold text-white">{maxAge}</span>{" "}
                  years old.
                </p>
              </div>
            </section>

            {/* LOCATION */}
            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
                  <MapPin size={21} />
                </div>

                <div>
                  <h2 className="font-semibold">Location preference</h2>

                  <p className="mt-1 text-sm text-white/35">
                    Decide how far you&apos;d like to search.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* SAME CITY */}
                <button
                  type="button"
                  onClick={() => setLocationPreference("same_city")}
                  className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                    locationPreference === "same_city"
                      ? "border-violet-400/50 bg-violet-500/10"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div>
                    <p className="font-medium">Same city</p>
                    <p className="mt-1 text-sm text-white/35">
                      Meet people from your own city.
                    </p>
                  </div>

                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      locationPreference === "same_city"
                        ? "border-violet-400 bg-violet-500"
                        : "border-white/20"
                    }`}
                  >
                    {locationPreference === "same_city" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>

                {/* SAME COUNTRY */}
                <button
                  type="button"
                  onClick={() => setLocationPreference("same_country")}
                  className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                    locationPreference === "same_country"
                      ? "border-violet-400/50 bg-violet-500/10"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div>
                    <p className="font-medium">Same country</p>
                    <p className="mt-1 text-sm text-white/35">
                      Meet people from your country.
                    </p>
                  </div>

                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      locationPreference === "same_country"
                        ? "border-violet-400 bg-violet-500"
                        : "border-white/20"
                    }`}
                  >
                    {locationPreference === "same_country" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>

                {/* ANY COUNTRY */}
                <button
                  type="button"
                  onClick={() => setLocationPreference("any_country")}
                  className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                    locationPreference === "any_country"
                      ? "border-violet-400/50 bg-violet-500/10"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div>
                    <p className="font-medium">Any country</p>
                    <p className="mt-1 text-sm text-white/35">
                      Meet people from anywhere in the world.
                    </p>
                  </div>

                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      locationPreference === "any_country"
                        ? "border-violet-400 bg-violet-500"
                        : "border-white/20"
                    }`}
                  >
                    {locationPreference === "any_country" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE */}
          <aside className="h-fit rounded-3xl border border-white/[0.08] bg-gradient-to-b from-violet-500/[0.08] to-white/[0.015] p-6 lg:sticky lg:top-8">
            <div className="mb-6">
              <p className="text-sm font-medium text-violet-300">
                YOUR DISCOVERY SETTINGS
              </p>

              <h2 className="mt-3 text-2xl font-semibold">
                Ready to meet someone new?
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/40">
                These preferences help Queuerious find people who match what
                you&apos;re looking for.
              </p>
            </div>

            <div className="space-y-4">
              {/* SEARCHING FOR SUMMARY */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wider text-white/30">
                  Searching for
                </p>

                <p className="mt-2 font-medium text-white/80">
                  {searchingFor.length > 0
                    ? searchingFor.join(", ")
                    : "Nothing selected"}
                </p>
              </div>

              {/* LOOKING FOR SUMMARY */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wider text-white/30">
                  Looking for
                </p>

                <p className="mt-2 font-medium text-white/80">
                  {lookingFor.length > 0
                    ? lookingFor.join(", ")
                    : "Nothing selected"}
                </p>
              </div>

              {/* AGE SUMMARY */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wider text-white/30">
                  Age range
                </p>

                <p className="mt-2 font-medium text-white/80">
                  {minAge} – {maxAge}
                </p>
              </div>

              {/* LOCATION SUMMARY */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <p className="text-xs uppercase tracking-wider text-white/30">
                  Location
                </p>

                <p className="mt-2 font-medium text-white/80">
                  {locationPreference === "same_city"
                    ? "Same city"
                    : locationPreference === "same_country"
                    ? "Same country"
                    : "Any country"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={savingPreferences || loadingPreferences}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-violet-500 px-6 py-4 font-medium transition hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPreferences ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving preferences...
                </>
              ) : saved ? (
                <>
                  <Check size={19} />
                  Preferences saved!
                </>
              ) : (
                <>
                  Save preferences
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-white/25">
              You can change these anytime.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
