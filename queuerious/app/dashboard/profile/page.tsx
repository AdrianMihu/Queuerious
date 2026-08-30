"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

import {
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  ImagePlus,
  MapPin,
  Ruler,
  Sparkles,
  User,
} from "lucide-react";

const interestsList = [
  { name: "Gaming", emoji: "🎮" },
  { name: "Fitness", emoji: "🏋️" },
  { name: "Hiking", emoji: "🏔️" },
  { name: "Music", emoji: "🎵" },
  { name: "Movies", emoji: "🎬" },
  { name: "Travel", emoji: "✈️" },
  { name: "Cooking", emoji: "🍳" },
  { name: "Reading", emoji: "📚" },
  { name: "Art", emoji: "🎨" },
  { name: "Animals", emoji: "🐶" },
  { name: "Photography", emoji: "📸" },
  { name: "Cars", emoji: "🏎️" },
];

const romanianCities = [
  "Alba Iulia",
  "Alexandria",
  "Arad",
  "Bacău",
  "Baia Mare",
  "Bistrița",
  "Botoșani",
  "Brăila",
  "Brașov",
  "București",
  "Buzău",
  "Călărași",
  "Cluj-Napoca",
  "Constanța",
  "Craiova",
  "Deva",
  "Drobeta-Turnu Severin",
  "Focșani",
  "Galați",
  "Giurgiu",
  "Iași",
  "Miercurea Ciuc",
  "Oradea",
  "Piatra Neamț",
  "Pitești",
  "Ploiești",
  "Râmnicu Vâlcea",
  "Reșița",
  "Satu Mare",
  "Sfântu Gheorghe",
  "Sibiu",
  "Slatina",
  "Slobozia",
  "Suceava",
  "Târgu Jiu",
  "Târgu Mureș",
  "Timișoara",
  "Tulcea",
  "Vaslui",
  "Zalău",
];

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return null;

  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [location, setLocation] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [bio, setBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);

  const [photos, setPhotos] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);

  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedSlotRef = useRef<number | null>(null);

  const supabase = createClient();

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    setDateOfBirth(`${year}-${month}-${day}`);
    setIsDatePickerOpen(false);
  };

  const age = useMemo(() => calculateAge(dateOfBirth), [dateOfBirth]);

  const isAgeValid = age !== null && age >= 16 && age <= 90;

  const filteredCities = romanianCities.filter((city) =>
    city.toLowerCase().includes(locationSearch.toLowerCase())
  );

  function toggleInterest(interest: string) {
    setSelectedInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      if (current.length >= 4) {
        return current;
      }

      return [...current, interest];
    });
  }

  async function handleSave() {
    setSaved(false);

    if (!firstName.trim()) {
      alert("Please enter your first name.");
      return;
    }

    if (firstName.trim().length > 15) {
      alert("First name must be 15 characters or less.");
      return;
    }

    if (!isAgeValid) {
      alert("You must be between 16 and 90 years old.");
      return;
    }

    if (!gender) {
      alert("Please select your gender.");
      return;
    }

    const heightNumber = Number(height);

    if (!height || heightNumber < 130 || heightNumber > 230) {
      alert("Height must be between 130 and 230 cm.");
      return;
    }

    if (!location) {
      alert("Please select your city.");
      return;
    }

    setSavingProfile(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("You must be signed in to save your profile.");
        return;
      }

      const photoUrls = photos.filter(
        (photo): photo is string => photo !== null
      );

      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          first_name: firstName.trim(),
          date_of_birth: dateOfBirth,
          gender,
          height_cm: heightNumber,
          location,
          bio: bio.trim(),
          interests: selectedInterests,
          photo_urls: photoUrls,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (error) {
        console.error("Error saving profile:", error);
        alert("Something went wrong while saving your profile.");
        return;
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Unexpected error while saving profile:", error);
      alert("Something went wrong while saving your profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  useEffect(() => {
    async function loadProfile() {
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
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error loading profile:", error);
          return;
        }

        if (!data) {
          return;
        }

        setFirstName(data.first_name ?? "");
        setDateOfBirth(data.date_of_birth ?? "");
        setGender(data.gender ?? "");
        setHeight(data.height_cm ? String(data.height_cm) : "");
        setLocation(data.location ?? "");
        setLocationSearch(data.location ?? "");
        setBio(data.bio ?? "");
        setSelectedInterests(data.interests ?? []);

        if (data.photo_urls && Array.isArray(data.photo_urls)) {
          const loadedPhotos = [...data.photo_urls];

          while (loadedPhotos.length < 5) {
            loadedPhotos.push(null);
          }

          setPhotos(loadedPhotos.slice(0, 5));
        }
      } catch (error) {
        console.error("Unexpected error while loading profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, []);

  function openFilePicker(slot: number) {
    selectedSlotRef.current = slot;
    fileInputRef.current?.click();
  }

  async function handlePhotoUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    const slot = selectedSlotRef.current;

    if (!file || slot === null) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please choose an image smaller than 5 MB.");
      return;
    }

    setUploadingSlot(slot);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("You must be signed in to upload photos.");
        return;
      }

      const fileExtension = file.name.split(".").pop();

      const fileName = `${user.id}/${slot}-${Date.now()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        alert("Something went wrong while uploading the photo.");
        return;
      }

      const { data } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName);

      setPhotos((current) => {
        const updated = [...current];
        updated[slot] = data.publicUrl;
        return updated;
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong while uploading the photo.");
    } finally {
      setUploadingSlot(null);
      event.target.value = "";
    }
  }

  function removePhoto(slot: number) {
    setPhotos((current) => {
      const updated = [...current];
      updated[slot] = null;

      if (previewPhotoIndex === slot) {
        setPreviewPhotoIndex(0);
      }

      return updated;
    });
  }

  const avatarLetter = firstName.trim().charAt(0).toUpperCase() || "?";

  return (
    <section className="flex-1 px-6 py-10 lg:px-10 xl:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2 text-sm text-violet-300">
            <Sparkles size={16} />
            <span>Your reveal profile</span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            This is what they’ll discover.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/45 sm:text-lg">
            Your profile stays hidden while you talk. When the conversation
            ends, this is your moment to make a first visual impression.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {/* PHOTO AREA */}
        <div className="mb-6 rounded-[32px] border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Photos</h2>

              <p className="mt-1 text-sm text-white/40">
                Show them who they were talking to.
              </p>
            </div>

            <span className="text-xs text-white/30">Coming soon</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {photos.map((photo, index) => (
              <div
                key={index}
                className={`group relative aspect-[3/4] overflow-hidden rounded-3xl border ${
                  index === 0
                    ? "border-violet-400/25 bg-violet-500/[0.06]"
                    : "border-white/[0.10] bg-white/[0.015]"
                }`}
              >
                {photo ? (
                  <>
                    <img
                      src={photo}
                      alt={`Profile photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/10 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openFilePicker(index)}
                        className="rounded-xl bg-black/60 px-3 py-2 text-xs font-medium text-white backdrop-blur transition hover:bg-black/80"
                      >
                        Replace
                      </button>

                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="rounded-xl bg-red-500/80 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-500"
                      >
                        Remove
                      </button>
                    </div>

                    {index === 0 && (
                      <div className="absolute left-3 top-3 rounded-full bg-violet-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                        Main
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => openFilePicker(index)}
                    disabled={uploadingSlot === index}
                    className="flex h-full w-full flex-col items-center justify-center text-center transition hover:bg-white/[0.03]"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        index === 0
                          ? "bg-violet-500/15 text-violet-300"
                          : "bg-white/[0.05] text-white/30"
                      }`}
                    >
                      {uploadingSlot === index ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                      ) : index === 0 ? (
                        <Camera size={21} />
                      ) : (
                        <ImagePlus size={22} />
                      )}
                    </div>

                    <p className="mt-3 text-sm font-medium">
                      {uploadingSlot === index
                        ? "Uploading..."
                        : index === 0
                        ? "Main photo"
                        : `Photo ${index + 1}`}
                    </p>

                    <p className="mt-1 text-xs text-white/30">
                      {uploadingSlot === index
                        ? "Please wait"
                        : index === 0
                        ? "Your first impression"
                        : "Add a photo"}
                    </p>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Basics */}
            <div className="rounded-[32px] border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold">The basics</h2>

                <p className="mt-1 text-sm text-white/40">
                  The essentials about you.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* First name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    First name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />

                    <input
                      value={firstName}
                      onChange={(e) =>
                        setFirstName(e.target.value.slice(0, 15))
                      }
                      maxLength={15}
                      placeholder="Adrian"
                      className="w-full rounded-2xl border border-white/[0.08] bg-black/20 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-white/20 focus:border-violet-400/50"
                    />
                  </div>

                  <p className="mt-2 text-right text-xs text-white/25">
                    {firstName.length}/15
                  </p>
                </div>

                {/* Date of birth */}
                <div className="relative">
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Date of birth
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5 text-left transition hover:border-violet-400/40"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays size={18} className="text-white/40" />

                      <span
                        className={
                          dateOfBirth ? "text-white" : "text-white/30"
                        }
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
                        startMonth={new Date(1936, 0)}
                        endMonth={new Date(2010, 11)}
                        className="text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Gender
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {["Male", "Female", "Other"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setGender(option)}
                        className={`rounded-2xl border px-3 py-3 text-sm transition ${
                          gender === option
                            ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
                            : "border-white/[0.08] bg-black/20 text-white/40 hover:border-white/15 hover:text-white/70"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Height */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Height
                  </label>

                  <div className="relative">
                    <Ruler
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />

                    <input
                      type="number"
                      min="130"
                      max="230"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="180"
                      className="w-full rounded-2xl border border-white/[0.08] bg-black/20 py-3.5 pl-12 pr-14 text-sm outline-none transition placeholder:text-white/20 focus:border-violet-400/50"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">
                      cm
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-white/25">
                    Between 130 and 230 cm
                  </p>
                </div>

                {/* Location */}
                <div className="relative">
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Location
                  </label>

                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-white/35"
                    />

                    <input
                      value={isLocationOpen ? locationSearch : location}
                      onFocus={() => {
                        setLocationSearch(location);
                        setIsLocationOpen(true);
                      }}
                      onChange={(e) => {
                        setLocationSearch(e.target.value);
                        setIsLocationOpen(true);
                      }}
                      placeholder="Search for your city..."
                      className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-3.5 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/40 focus:bg-white/[0.05]"
                    />

                    <ChevronDown
                      size={18}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 text-white/35 transition ${
                        isLocationOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isLocationOpen && (
                    <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-white/[0.10] bg-[#14141b] p-2 shadow-2xl shadow-black/40">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              setLocation(city);
                              setLocationSearch(city);
                              setIsLocationOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white/70 transition hover:bg-violet-500/10 hover:text-white"
                          >
                            <MapPin
                              size={16}
                              className="text-violet-300/70"
                            />
                            {city}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-white/35">
                          No Romanian city found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="rounded-[32px] border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">About you</h2>

                <p className="mt-1 text-sm text-white/40">
                  Give them something interesting to discover.
                </p>
              </div>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 300))}
                maxLength={300}
                rows={6}
                placeholder="Tell people a little about yourself..."
                className="w-full resize-none rounded-3xl border border-white/[0.08] bg-black/20 p-5 text-sm leading-relaxed outline-none transition placeholder:text-white/20 focus:border-violet-400/50"
              />

              <div className="mt-3 flex justify-between text-xs">
                <span className="text-white/25">
                  Keep it real. Keep it interesting.
                </span>

                <span
                  className={
                    bio.length >= 270 ? "text-violet-300" : "text-white/30"
                  }
                >
                  {bio.length}/300
                </span>
              </div>
            </div>

            {/* Interests */}
            <div className="rounded-[32px] border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8">
              <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Your interests</h2>

                  <p className="mt-1 text-sm text-white/40">
                    Pick up to four things you genuinely enjoy.
                  </p>
                </div>

                <span
                  className={`text-sm ${
                    selectedInterests.length === 4
                      ? "text-violet-300"
                      : "text-white/35"
                  }`}
                >
                  {selectedInterests.length}/4 selected
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {interestsList.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.name);
                  const isDisabled =
                    !isSelected && selectedInterests.length >= 4;

                  return (
                    <button
                      key={interest.name}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggleInterest(interest.name)}
                      className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm transition ${
                        isSelected
                          ? "border-violet-400/50 bg-violet-500/15 text-violet-100"
                          : isDisabled
                          ? "cursor-not-allowed border-white/[0.04] bg-white/[0.01] text-white/15"
                          : "border-white/[0.08] bg-black/20 text-white/45 hover:border-white/20 hover:text-white/75"
                      }`}
                    >
                      <span>{interest.emoji}</span>
                      {interest.name}

                      {isSelected && (
                        <Check size={15} className="text-violet-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedInterests.length >= 4 && (
                <p className="mt-5 text-xs text-violet-300">
                  You’ve reached the maximum of 4 interests.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN / PREVIEW */}
          <div className="h-fit xl:sticky xl:top-8">
            <div className="overflow-hidden rounded-[32px] border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.12] via-[#14131b] to-[#101015]">
              <div className="border-b border-white/[0.07] p-6">
                <div className="flex items-center gap-2 text-sm text-violet-300">
                  <Sparkles size={16} />
                  Live preview
                </div>

                <p className="mt-2 text-xs leading-relaxed text-white/35">
                  This is roughly how your reveal could feel.
                </p>
              </div>

              <div className="p-6">
                <div className="relative">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-violet-500/20 to-purple-900/10">
                    {photos[previewPhotoIndex] ? (
                      <img
                        src={photos[previewPhotoIndex]!}
                        alt={`Profile preview ${previewPhotoIndex + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-4xl font-semibold text-white/70">
                          {avatarLetter}
                        </div>
                      </div>
                    )}

                    {photos.filter(Boolean).length > 0 && (
                      <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md">
                        {previewPhotoIndex + 1}/
                        {photos.filter(Boolean).length}
                      </div>
                    )}
                  </div>

                  {photos.filter(Boolean).length > 1 && (
                    <div className="mt-4 flex gap-2">
                      {photos.map((photo, index) => {
                        if (!photo) return null;

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setPreviewPhotoIndex(index)}
                            className={`relative aspect-square w-14 overflow-hidden rounded-xl border transition ${
                              previewPhotoIndex === index
                                ? "border-violet-400 ring-2 ring-violet-500/40"
                                : "border-white/10 opacity-60 hover:border-white/30 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              className="h-full w-full object-cover"
                            />

                            {index === 0 && (
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[8px] font-semibold text-white">
                                MAIN
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl font-semibold">
                    {firstName || "Your name"}
                    {isAgeValid && age !== null ? `, ${age}` : ""}
                  </h3>

                  {location && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-white/40">
                      <MapPin size={15} />
                      {location}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {selectedInterests.length > 0 ? (
                      selectedInterests.map((interest) => {
                        const item = interestsList.find(
                          (item) => item.name === interest
                        );

                        return (
                          <span
                            key={interest}
                            className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200"
                          >
                            {item?.emoji} {interest}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-sm text-white/25">
                        Your interests will appear here.
                      </span>
                    )}
                  </div>

                  {bio && (
                    <p className="mt-6 text-sm leading-relaxed text-white/50">
                      {bio}
                    </p>
                  )}

                  {height && (
                    <div className="mt-6 flex items-center gap-2 text-sm text-white/35">
                      <Ruler size={15} />
                      {height} cm
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={savingProfile || loadingProfile}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-violet-500 px-6 py-4 font-medium transition hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving profile...
                </>
              ) : saved ? (
                <>
                  <Check size={19} />
                  Profile saved!
                </>
              ) : (
                <>
                  Save changes
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-white/25">
              Your profile remains hidden until the reveal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}