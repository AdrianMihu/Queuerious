"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Brain,
  Check,
  Flame,
  Gem,
  Heart,
  Infinity,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

type ModalType =
  | "Queuetie Pack"
  | "Queuemunication Pack"
  | "Queuenquistador Pack"
  | "Queuerious Beyond"
  | "Queuerious Mind"
  | null;

export default function StorePage() {
  const [selectedProduct, setSelectedProduct] = useState<ModalType>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const [queueTokens, setQueueTokens] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function setupRealtime() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 1. Load current tokens
      const { data, error } = await supabase
        .from("queue_tokens")
        .select("tokens")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setQueueTokens(data.tokens);
      }

      // 2. Create realtime channel
      channel = supabase
        .channel(`store-queue-tokens-${user.id}-${crypto.randomUUID()}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "queue_tokens",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("STORE QUEUE TOKEN EVENT:", payload);

            const newData = payload.new as {
              tokens?: number;
            };

            if (typeof newData.tokens === "number") {
              setQueueTokens(newData.tokens);
            }
          }
        )
        .subscribe((status) => {
          console.log("STORE QUEUE TOKEN STATUS:", status);
        });
    }

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const closeModal = () => {
    setSelectedProduct(null);
  };

  async function startCheckout(
    product:
      | "queuetie"
      | "queuemunication"
      | "queuenquistador"
      | "beyond"
      | "mind"
  ) {
    setSubscriptionLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("You must be logged in to make a purchase.");
        return;
      }

      const response = await fetch("/api/delete-account/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product,
          userId: user.id,
        }),
      });

      const responseText = await response.text();

console.log("Checkout status:", response.status);
console.log("Checkout response:", responseText);

let data;

try {
  data = JSON.parse(responseText);
} catch {
  console.error("Response was not JSON:", responseText);

  alert(
    `Checkout returned an unexpected response. Status: ${response.status}`
  );

  return;
}

if (!response.ok) {
        console.error("Checkout error:", data);
        alert(data.error || "Unable to start checkout.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Unexpected checkout error:", error);
      alert("Something went wrong while starting checkout.");
    } finally {
      setSubscriptionLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090d] text-white">
      <section className="px-6 py-10 lg:px-10 xl:px-16">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm text-violet-300">
                <ShoppingIcon />
                <span>Queuerious Store</span>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Enhance your experience.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/45 sm:text-lg">
                Get more queues or explore what lies beyond the standard
                Queuerious experience.
              </p>
            </div>

            {/* CURRENT QUEUES */}
            <div className="flex w-fit items-center gap-4 rounded-3xl border border-violet-400/15 bg-violet-500/[0.07] px-5 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15">
                <Flame size={22} className="fill-violet-300 text-violet-300" />
              </div>

              <div>
                <p className="text-xl font-semibold">
                  {queueTokens} {queueTokens === 1 ? "Queue" : "Queues"}
                </p>

                <p className="text-sm text-white/35">currently available</p>
              </div>
            </div>
          </div>

          {/* QUEUE PACKS */}
          <div className="mb-16">
            <div className="mb-7">
              <div className="flex items-center gap-2 text-sm text-violet-300">
                <Zap size={16} />
                <span>Queue packs</span>
              </div>

              <h2 className="mt-2 text-2xl font-semibold">
                Get more conversations.
              </h2>

              <p className="mt-2 text-sm text-white/40">
                More queues means more chances to meet someone unexpectedly
                interesting.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* QUEUETIE */}
              <StoreCard
                icon={
                  <Heart size={25} className="fill-rose-300 text-rose-300" />
                }
                iconClass="border-rose-400/15 bg-rose-500/10"
                title="Queuetie Pack"
                subtitle="A little extra curiosity never hurt."
                queues="+5 Queues"
                price="20 lei"
                buttonText="Get Queuetie"
                onClick={() => setSelectedProduct("Queuetie Pack")}
              />

              {/* QUEUEMUNICATION */}
              <div className="relative">
                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                  <div className="rounded-full border border-violet-300/25 bg-violet-500 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-lg shadow-violet-500/30">
                    Most Popular
                  </div>
                </div>

                <StoreCard
                  featured
                  icon={<Sparkles size={25} className="text-violet-200" />}
                  iconClass="border-violet-400/25 bg-violet-500/15"
                  title="Queuemunication Pack"
                  subtitle="More conversations. More possibilities."
                  queues="+15 Queues"
                  price="45 lei"
                  buttonText="Get Queuemunication"
                  onClick={() => setSelectedProduct("Queuemunication Pack")}
                />
              </div>

              {/* QUEUENQUISTADOR */}
              <StoreCard
                icon={<Gem size={25} className="text-amber-300" />}
                iconClass="border-amber-400/15 bg-amber-500/10"
                title="Queuenquistador Pack"
                subtitle="Conquer the queue."
                queues="+50 Queues"
                price="150 lei"
                buttonText="Conquer the Queue"
                onClick={() => setSelectedProduct("Queuenquistador Pack")}
              />
            </div>
          </div>

          {/* MEMBERSHIPS */}
          <div>
            <div className="mb-7">
              <div className="flex items-center gap-2 text-sm text-white/45">
                <Infinity size={16} />
                <span>Memberships</span>
              </div>

              <h2 className="mt-2 text-2xl font-semibold">
                Go beyond the standard.
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Two different levels of Queuerious, ready for the future.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* BEYOND */}
              <button
                type="button"
                onClick={() => setSelectedProduct("Queuerious Beyond")}
                className="group relative overflow-hidden rounded-[32px] border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.18] via-[#171321] to-[#101015] p-8 text-left transition hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-950/30"
              >
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-[100px] transition group-hover:bg-violet-500/30" />

                <div className="relative">
                  <div className="mb-8 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/15">
                      <Sparkles size={25} className="text-violet-200" />
                    </div>

                    <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-200">
                      Premium
                    </span>
                  </div>

                  <p className="text-sm font-medium text-violet-300">
                    QUEUERIOUS
                  </p>

                  <h3 className="mt-1 text-3xl font-semibold">Beyond</h3>

                  <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
                    Go beyond the ordinary.
                  </p>

                  <div className="mt-8 flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-semibold">70 lei</span>

                      <span className="ml-2 text-sm text-white/35">
                        / month
                      </span>
                    </div>

                    <div className="rounded-2xl bg-violet-500 px-5 py-3 text-sm font-medium transition group-hover:bg-violet-400">
                      Explore Beyond
                    </div>
                  </div>
                </div>
              </button>

              {/* MIND */}
              <button
                type="button"
                onClick={() => setSelectedProduct("Queuerious Mind")}
                className="group relative overflow-hidden rounded-[32px] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/[0.13] via-[#101a20] to-[#101015] p-8 text-left transition hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-2xl hover:shadow-cyan-950/30"
              >
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/15 blur-[100px] transition group-hover:bg-cyan-400/25" />

                <div className="relative">
                  <div className="mb-8 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                      <Brain size={25} className="text-cyan-200" />
                    </div>

                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-200">
                      Signature
                    </span>
                  </div>

                  <p className="text-sm font-medium text-cyan-300">
                    QUEUERIOUS
                  </p>

                  <h3 className="mt-1 text-3xl font-semibold">Mind</h3>

                  <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
                    For those who connect differently.
                  </p>

                  <div className="mt-8 flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-semibold">100 lei</span>

                      <span className="ml-2 text-sm text-white/35">
                        / month
                      </span>
                    </div>

                    <div className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-medium text-[#071014] transition group-hover:bg-cyan-300">
                      Explore Mind
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* FOOTNOTE */}
          <div className="mt-12 border-t border-white/[0.07] pt-6 text-center">
            <p className="text-xs text-white/25">
              Payments are not available yet. Store functionality is currently
              in preview.
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[32px] border border-white/[0.10] bg-[#14141b] p-8 shadow-2xl shadow-black/70">
            <button
              type="button"
              onClick={closeModal}
              disabled={subscriptionLoading}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
            >
              <X size={19} />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
              {selectedProduct === "Queuerious Mind" ? (
                <Brain size={24} className="text-cyan-300" />
              ) : (
                <Sparkles size={24} />
              )}
            </div>

            {selectedProduct === "Queuerious Beyond" ||
            selectedProduct === "Queuerious Mind" ? (
              <>
                <p className="mt-7 text-sm text-violet-300">
                  MEMBERSHIP PREVIEW
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  {selectedProduct}
                </h2>

                <p className="mt-4 leading-relaxed text-white/45">
                  Continue securely to Stripe to activate your subscription.
                  Your membership will renew automatically every month.
                </p>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={subscriptionLoading}
                    className="flex-1 rounded-2xl bg-white/[0.06] px-5 py-3.5 text-sm font-medium transition hover:bg-white/[0.10] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={subscriptionLoading}
                    onClick={() =>
                      startCheckout(
                        selectedProduct === "Queuerious Beyond"
                          ? "beyond"
                          : "mind"
                      )
                    }
                    className="flex-1 rounded-2xl bg-violet-500 px-5 py-3.5 text-sm font-medium transition hover:bg-violet-400 disabled:opacity-60"
                  >
                    {subscriptionLoading ? "Activating..." : "Activate"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-7 text-sm text-violet-300">QUEUE PACK</p>

                <h2 className="mt-2 text-2xl font-semibold">
                  {selectedProduct}
                </h2>

                <p className="mt-4 leading-relaxed text-white/45">
                  Complete your purchase securely with Stripe. Your queue tokens
                  will be added after payment is confirmed.
                </p>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={subscriptionLoading}
                    className="flex-1 rounded-2xl bg-white/[0.06] px-5 py-3.5 text-sm font-medium transition hover:bg-white/[0.10] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={subscriptionLoading}
                    onClick={() => {
                      if (selectedProduct === "Queuetie Pack") {
                        startCheckout("queuetie");
                      }

                      if (selectedProduct === "Queuemunication Pack") {
                        startCheckout("queuemunication");
                      }

                      if (selectedProduct === "Queuenquistador Pack") {
                        startCheckout("queuenquistador");
                      }
                    }}
                    className="flex-1 rounded-2xl bg-violet-500 px-5 py-3.5 text-sm font-medium transition hover:bg-violet-400 disabled:opacity-60"
                  >
                    {subscriptionLoading
                      ? "Redirecting..."
                      : "Continue to payment"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function StoreCard({
  icon,
  iconClass,
  title,
  subtitle,
  queues,
  price,
  buttonText,
  onClick,
  featured = false,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  subtitle: string;
  queues: string;
  price: string;
  buttonText: string;
  onClick: () => void;
  featured?: boolean;
}) {
  return (
    <div
      className={`group flex h-full flex-col rounded-[32px] border p-7 transition ${
        featured
          ? "border-violet-400/30 bg-gradient-to-b from-violet-500/[0.12] to-white/[0.025] shadow-xl shadow-violet-950/20 hover:-translate-y-1 hover:border-violet-400/50"
          : "border-white/[0.07] bg-white/[0.025] hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.04]"
      }`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${iconClass}`}
      >
        {icon}
      </div>

      <h3 className="mt-7 text-2xl font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-relaxed text-white/40">{subtitle}</p>

      <div className="mt-8">
        <p className="text-sm text-white/35">Includes</p>

        <p className="mt-1 text-3xl font-semibold">{queues}</p>
      </div>

      <div className="mt-auto pt-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <span className="text-2xl font-semibold">{price}</span>

            <p className="mt-1 text-xs text-white/25">One-time purchase</p>
          </div>

          {featured && <Check size={18} className="text-violet-300" />}
        </div>

        <button
          type="button"
          onClick={onClick}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-medium transition active:scale-[0.98] ${
            featured
              ? "bg-violet-500 hover:bg-violet-400 hover:shadow-lg hover:shadow-violet-500/20"
              : "bg-white/[0.06] hover:bg-white/[0.10]"
          }`}
        >
          <Zap size={16} />
          {buttonText}
        </button>
      </div>
    </div>
  );
}

function ShoppingIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
