import { Share2, Users } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import ReferralClient from "./ReferralClient";

export default async function ReferralPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .maybeSingle();

  const referralCode = profile?.referral_code ?? "";
  const { count: referralCount } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", user.id);

  const referralTokensEarned = (referralCount ?? 0) * 2;

  const referralLink = referralCode
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/sign-up?ref=${referralCode}`
    : "";

  return (
    <main className="flex-1 px-6 py-10 lg:px-10 xl:px-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/10">
            <Share2 size={22} className="text-violet-300" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Bring someone queuerious.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
            Share Queuerious with someone you think would love it. When they
            join through your link, you earn 2 Queue Tokens.
          </p>
          <p className="mt-3 text-xs text-violet-300/60">
            You can earn rewards from up to 5 referrals per day.
          </p>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6">
          <div className="mb-5">
            <p className="text-sm font-medium text-white/70">
              Your referral link
            </p>
            <p className="mt-1 text-xs text-white/35">
              Anyone who signs up through this link can become your referral.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3.5">
              <p className="truncate text-sm text-white/60">{referralLink}</p>
            </div>

            <ReferralClient referralLink={referralLink} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5">
            <Users size={20} className="text-violet-300" />

            <p className="mt-4 text-2xl font-semibold text-white">
              {referralCount ?? 0}
            </p>

            <p className="mt-1 text-sm font-medium text-white/60">
              People invited
            </p>

            <p className="mt-1 text-xs leading-5 text-white/30">
              People who joined through your link.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5">
            <Share2 size={20} className="text-violet-300" />

            <p className="mt-4 text-2xl font-semibold text-white">
              +{referralTokensEarned}
            </p>

            <p className="mt-1 text-sm font-medium text-white/60">
              Queue Tokens earned
            </p>

            <p className="mt-1 text-xs leading-5 text-white/30">
              Earned from your referrals.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
