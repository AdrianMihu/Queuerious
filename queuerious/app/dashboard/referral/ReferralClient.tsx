"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

type ReferralClientProps = {
  referralLink: string;
};

export default function ReferralClient({
  referralLink,
}: ReferralClientProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(referralLink);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-2.5 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}