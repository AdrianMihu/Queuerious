"use client";

import { createClient } from "../../lib/supabase/client";
import { useState } from "react";

export default function UpdateNamePage() {
  const supabase = createClient();

  const [message, setMessage] = useState("");

  async function updateName() {
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: "Adrian",
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Success! Your name is now Adrian 🎉");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090d] text-white">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <h1 className="text-2xl font-semibold">
          Fix my Queuerious identity 😎
        </h1>

        <button
          onClick={updateName}
          className="mt-6 rounded-xl bg-violet-500 px-6 py-3 font-medium transition hover:bg-violet-400"
        >
          Set my name to Adrian
        </button>

        {message && (
          <p className="mt-4 text-sm text-white/60">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}