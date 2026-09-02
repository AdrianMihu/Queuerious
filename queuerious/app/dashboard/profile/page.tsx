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
  Eye,
  X,
  Ruler,
  Sparkles,
  User,
} from "lucide-react";

const interestCategories = [
  {
    category: "Music",
    emoji: "🎵",
    interests: [
      { name: "Pop", emoji: "🎤" },
      { name: "Rock", emoji: "🎸" },
      { name: "Metal", emoji: "🤘" },
      { name: "Hip-Hop", emoji: "🎧" },
      { name: "Rap", emoji: "🎙️" },
      { name: "R&B", emoji: "🎶" },
      { name: "Jazz", emoji: "🎷" },
      { name: "Blues", emoji: "🎼" },
      { name: "Classical Music", emoji: "🎻" },
      { name: "Electronic Music", emoji: "⚡" },
      { name: "Techno", emoji: "🔊" },
      { name: "House Music", emoji: "🏠" },
      { name: "Drum & Bass", emoji: "🥁" },
      { name: "Dubstep", emoji: "💥" },
      { name: "Indie Music", emoji: "🌙" },
      { name: "Alternative Music", emoji: "🖤" },
      { name: "Country Music", emoji: "🤠" },
      { name: "Folk Music", emoji: "🪕" },
      { name: "Punk", emoji: "⚡" },
      { name: "K-Pop", emoji: "✨" },
      { name: "Reggaeton", emoji: "🔥" },
      { name: "Latin Music", emoji: "💃" },
    ],
  },

  {
    category: "Sports & Fitness",
    emoji: "🏆",
    interests: [
      { name: "Football", emoji: "⚽" },
      { name: "Basketball", emoji: "🏀" },
      { name: "Tennis", emoji: "🎾" },
      { name: "Volleyball", emoji: "🏐" },
      { name: "Handball", emoji: "🤾" },
      { name: "Running", emoji: "🏃" },
      { name: "Gym", emoji: "🏋️" },
      { name: "Bodybuilding", emoji: "💪" },
      { name: "CrossFit", emoji: "🔥" },
      { name: "Swimming", emoji: "🏊" },
      { name: "Cycling", emoji: "🚴" },
      { name: "Hiking", emoji: "🥾" },
      { name: "Climbing", emoji: "🧗" },
      { name: "Boxing", emoji: "🥊" },
      { name: "MMA", emoji: "🥋" },
      { name: "Yoga", emoji: "🧘" },
      { name: "Pilates", emoji: "🤸" },
      { name: "Skiing", emoji: "⛷️" },
      { name: "Snowboarding", emoji: "🏂" },
      { name: "Surfing", emoji: "🏄" },
      { name: "Formula 1", emoji: "🏎️" },
      { name: "Motorsport", emoji: "🏁" },
    ],
  },

  {
    category: "Gaming",
    emoji: "🎮",
    interests: [
      { name: "Gaming", emoji: "🎮" },
      { name: "PC Gaming", emoji: "🖥️" },
      { name: "PlayStation", emoji: "🎮" },
      { name: "Xbox", emoji: "🟢" },
      { name: "Nintendo", emoji: "🍄" },
      { name: "RPG Games", emoji: "🗡️" },
      { name: "FPS Games", emoji: "🎯" },
      { name: "Strategy Games", emoji: "♟️" },
      { name: "Simulation Games", emoji: "🚜" },
      { name: "Indie Games", emoji: "🕹️" },
      { name: "Board Games", emoji: "🎲" },
      { name: "Chess", emoji: "♟️" },
      { name: "Esports", emoji: "🏆" },
    ],
  },

  {
    category: "Movies & Entertainment",
    emoji: "🎬",
    interests: [
      { name: "Movies", emoji: "🎬" },
      { name: "TV Series", emoji: "📺" },
      { name: "Anime", emoji: "🌸" },
      { name: "Documentaries", emoji: "🎥" },
      { name: "Comedy", emoji: "😂" },
      { name: "Horror Movies", emoji: "👻" },
      { name: "Thriller Movies", emoji: "😱" },
      { name: "Action Movies", emoji: "💥" },
      { name: "Sci-Fi", emoji: "🚀" },
      { name: "Fantasy", emoji: "🧙" },
      { name: "Marvel", emoji: "🦸" },
      { name: "Star Wars", emoji: "🌌" },
      { name: "Reality Shows", emoji: "📺" },
    ],
  },

  {
    category: "Creative",
    emoji: "🎨",
    interests: [
      { name: "Photography", emoji: "📸" },
      { name: "Drawing", emoji: "✏️" },
      { name: "Painting", emoji: "🎨" },
      { name: "Writing", emoji: "✍️" },
      { name: "Creative Writing", emoji: "📖" },
      { name: "Graphic Design", emoji: "🖥️" },
      { name: "Fashion", emoji: "👗" },
      { name: "Singing", emoji: "🎤" },
      { name: "Dancing", emoji: "💃" },
      { name: "Music Production", emoji: "🎛️" },
      { name: "Playing Guitar", emoji: "🎸" },
      { name: "Playing Piano", emoji: "🎹" },
      { name: "Filmmaking", emoji: "🎥" },
    ],
  },

  {
    category: "Travel & Outdoors",
    emoji: "🌍",
    interests: [
      { name: "Travel", emoji: "✈️" },
      { name: "Road Trips", emoji: "🚗" },
      { name: "Camping", emoji: "🏕️" },
      { name: "Backpacking", emoji: "🎒" },
      { name: "Nature", emoji: "🌲" },
      { name: "Exploring Cities", emoji: "🏙️" },
      { name: "Beaches", emoji: "🏖️" },
      { name: "Mountains", emoji: "⛰️" },
      { name: "Adventure Travel", emoji: "🧭" },
      { name: "Van Life", emoji: "🚐" },
    ],
  },

  {
    category: "Food & Lifestyle",
    emoji: "🍳",
    interests: [
      { name: "Cooking", emoji: "🍳" },
      { name: "Baking", emoji: "🧁" },
      { name: "Coffee", emoji: "☕" },
      { name: "Tea", emoji: "🍵" },
      { name: "Wine & Food", emoji: "🍷" },
      { name: "Restaurants", emoji: "🍽️" },
      { name: "Street Food", emoji: "🌮" },
      { name: "Healthy Living", emoji: "🥗" },
      { name: "Nightlife", emoji: "🌃" },
      { name: "Shopping", emoji: "🛍️" },
    ],
  },

  {
    category: "Books & Learning",
    emoji: "📚",
    interests: [
      { name: "Reading", emoji: "📚" },
      { name: "Fiction", emoji: "📖" },
      { name: "Fantasy Books", emoji: "🐉" },
      { name: "Sci-Fi Books", emoji: "🚀" },
      { name: "History", emoji: "🏛️" },
      { name: "Psychology", emoji: "🧠" },
      { name: "Philosophy", emoji: "💭" },
      { name: "Science", emoji: "🔬" },
      { name: "Astronomy", emoji: "🔭" },
      { name: "Languages", emoji: "🗣️" },
      { name: "Learning", emoji: "🎓" },
    ],
  },

  {
    category: "Tech & Geek",
    emoji: "💻",
    interests: [
      { name: "Technology", emoji: "💻" },
      { name: "Programming", emoji: "👨‍💻" },
      { name: "Web Development", emoji: "🌐" },
      { name: "AI", emoji: "🤖" },
      { name: "Cybersecurity", emoji: "🔐" },
      { name: "Space", emoji: "🪐" },
      { name: "Gadgets", emoji: "📱" },
      { name: "Startups", emoji: "🚀" },
      { name: "Robotics", emoji: "🦾" },
    ],
  },

  {
    category: "Animals & Nature",
    emoji: "🐾",
    interests: [
      { name: "Dogs", emoji: "🐶" },
      { name: "Cats", emoji: "🐱" },
      { name: "Animals", emoji: "🐾" },
      { name: "Wildlife", emoji: "🦁" },
      { name: "Birdwatching", emoji: "🦅" },
      { name: "Gardening", emoji: "🌱" },
      { name: "Plants", emoji: "🪴" },
    ],
  },

  {
    category: "Cars & Collecting",
    emoji: "🏎️",
    interests: [
      { name: "Cars", emoji: "🏎️" },
      { name: "Motorcycles", emoji: "🏍️" },
      { name: "Classic Cars", emoji: "🚘" },
      { name: "Car Modification", emoji: "🔧" },
      { name: "Motorcycles & Touring", emoji: "🛣️" },
      { name: "Collecting", emoji: "🧩" },
      { name: "Sneakers", emoji: "👟" },
    ],
  },
];

const interestsList = interestCategories.flatMap(
  (category) => category.interests
);

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
  const [countryCode, setCountryCode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [countryFlag, setCountryFlag] = useState("");
  const [height, setHeight] = useState("");
  const [location, setLocation] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [bio, setBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);
  const [interestSearch, setInterestSearch] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [locationError, setLocationError] = useState("");

  const filteredInterestCategories = interestCategories
    .map((category) => ({
      ...category,
      interests: category.interests.filter((interest) =>
        interest.name.toLowerCase().includes(interestSearch.toLowerCase())
      ),
    }))
    .filter((category) => category.interests.length > 0);

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

  const [heightError, setHeightError] = useState("");

  const age = useMemo(() => calculateAge(dateOfBirth), [dateOfBirth]);

  const isAgeValid = age !== null && age >= 16 && age <= 90;

  const [cities, setCities] = useState<
    { id: number; name: string; countryCode: string }[]
  >([]);

  useEffect(() => {
    if (!countryCode || locationSearch.trim().length < 2) {
      const timeout = setTimeout(() => {
        setCities([]);
      }, 0);

      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/locations/cities?country=${encodeURIComponent(
            countryCode
          )}&q=${encodeURIComponent(locationSearch.trim())}`
        );

        if (!response.ok) {
          throw new Error("Failed to load cities");
        }

        const data = await response.json();

        setCities(data);
      } catch (error) {
        console.error("Error loading cities:", error);
        setCities([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [countryCode, locationSearch]);

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
    setHeightError("");
    setLocationError("");

    if (!firstName.trim()) {
      alert("Please enter your first name.");
      return;
    }

    if (firstName.trim().length > 15) {
      alert("First name must be 15 characters or less.");
      return;
    }

    const heightNumber = Number(height);

    if (!height || heightNumber < 130 || heightNumber > 230) {
      setHeightError("Height must be between 130 and 230 cm.");
      return;
    }

    if (!location) {
      setLocationError("Please select your city.");
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
        setCountryCode(data.country_code ?? "");
        const countryResponse = await fetch("/api/countries");

        if (countryResponse.ok) {
          const countries: {
            code: string;
            name: string;
            flag: string;
          }[] = await countryResponse.json();

          const country = countries.find(
            (item) => item.code === data.country_code
          );

          setCountryName(country?.name ?? "");
          setCountryFlag(country?.flag ?? "");
        }
        setDateOfBirth(data.date_of_birth ?? "");
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

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
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

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* PHOTO AREA */}
            <div className="rounded-[32px] border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8">
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
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Date of birth
                  </label>

                  <div className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5">
                    <CalendarDays size={18} className="text-white/30" />

                    <span
                      className={
                        dateOfBirth
                          ? "text-sm text-white/70"
                          : "text-sm text-white/30"
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
                        : "Not available"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-white/25">
                    Your date of birth cannot be changed.
                  </p>
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
                      onChange={(e) => {
                        setHeight(e.target.value);
                        setHeightError("");
                      }}
                      placeholder="180"
                      className="w-full rounded-2xl border border-white/[0.08] bg-black/20 py-3.5 pl-12 pr-14 text-sm outline-none transition placeholder:text-white/20 focus:border-violet-400/50"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">
                      cm
                    </span>
                  </div>

                  <div className="mt-2 min-h-[20px]">
                    {heightError ? (
                      <div className="flex items-center gap-2 text-xs font-medium text-red-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        {heightError}
                      </div>
                    ) : (
                      <p className="text-xs text-white/30">
                        Between 130 and 230 cm
                      </p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Country
                  </label>

                  <div className="flex w-full items-center rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3.5">
                    <span className="text-sm text-white/60">
                      {countryFlag}{" "}
                      {countryName || countryCode || "Not available"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-white/25">
                    Your country cannot be changed.
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
                    {locationError && (
                      <p className="mt-2 text-sm text-red-400">
                        {locationError}
                      </p>
                    )}

                    <ChevronDown
                      size={18}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 text-white/35 transition ${
                        isLocationOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isLocationOpen && (
                    <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-white/[0.10] bg-[#14141b] p-2 shadow-2xl shadow-black/40">
                      {cities.length > 0 ? (
                        cities.map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => {
                              setLocation(city.name);
                              setLocationSearch(city.name);
                              setIsLocationOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white/70 transition hover:bg-violet-500/10 hover:text-white"
                          >
                            <MapPin size={16} className="text-violet-300/70" />
                            {city.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-white/35">
                          No city found
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

            <div className="relative mb-6">
              <input
                type="text"
                value={interestSearch}
                onChange={(e) => setInterestSearch(e.target.value)}
                placeholder="Search interests..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/40 focus:bg-violet-500/[0.04]"
              />
            </div>

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

              <div className="space-y-8">
                {filteredInterestCategories.map((category) => (
                  <div key={category.category}>
                    {/* Category title */}

                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">{category.emoji}</span>

                      <h3 className="text-sm font-semibold text-white/70">
                        {category.category}
                      </h3>
                    </div>

                    {/* Interests */}

                    <div className="flex flex-wrap gap-2">
                      {category.interests.map((interest) => {
                        const isSelected = selectedInterests.includes(
                          interest.name
                        );

                        return (
                          <button
                            key={interest.name}
                            type="button"
                            onClick={() => toggleInterest(interest.name)}
                            className={`rounded-xl border px-3 py-2 text-sm transition ${
                              isSelected
                                ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                                : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-violet-400/20 hover:bg-violet-500/[0.06] hover:text-white/80"
                            }`}
                          >
                            <span className="mr-2">{interest.emoji}</span>

                            {interest.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {selectedInterests.length >= 4 && (
                <p className="mt-5 text-xs text-violet-300">
                  You’ve reached the maximum of 4 interests.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN / PREVIEW */}
          <div className="xl:sticky xl:top-8 xl:max-h-[calc(100vh-4rem)]">
            <div className="flex h-[calc(100vh-4rem)] flex-col">
              <div className="premium-scrollbar min-h-0 flex-1 overflow-y-auto pr-2">
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

                <div className="sticky bottom-6 mt-5 z-20">
                  <div className="rounded-[24px] border border-white/[0.08] bg-[#14131b]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={savingProfile || loadingProfile}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-violet-500 px-6 py-4 font-medium transition hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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

                    <p className="mt-3 text-center text-xs text-white/25">
                      Your profile remains hidden until the reveal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
