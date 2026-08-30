"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DebugPage() {
  const [tokens, setTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAddToken() {
    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase.rpc("add_queue_token");

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTokens(data);
  }

  async function handleRemoveToken() {
    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase.rpc("consume_queue_token");

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    if (!data) {
      alert("You don't have any queue tokens to remove.");
      return;
    }

    setTokens((currentTokens) =>
      currentTokens !== null ? Math.max(0, currentTokens - 1) : 0
    );
  }

  return (
    <div className="min-h-full px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">Debug</h1>

        <p className="mt-2 text-sm text-white/40">
          Development tools and testing utilities.
        </p>

        <div className="mt-8 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
          <h2 className="text-base font-semibold">Queue tokens</h2>

          <p className="mt-2 text-sm text-white/40">
            Add queue tokens for testing purposes.
          </p>

          <button
            onClick={handleAddToken}
            disabled={loading}
            className="mt-5 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:opacity-50"
          >
            {loading ? "Adding..." : "+ Add 1 Queue Token"}
          </button>

          <button
            onClick={handleRemoveToken}
            disabled={loading}
            className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {loading ? "Removing..." : "- Remove 1 Queue Token"}
          </button>

          {tokens !== null && (
            <p className="mt-4 text-sm text-violet-300">
              You now have {tokens} queue token{tokens !== 1 ? "s" : ""}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
