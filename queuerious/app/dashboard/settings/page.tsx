"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Bell,
  Check,
  CreditCard,
  Lock,
  LogOut,
  Moon,
  Settings,
  Crown,
  X,
  Sun,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subscription, setSubscription] = useState<{
    id: string;
    plan: string;
    started_at: string;
    expires_at: string | null;
    stripe_subscription_id: string | null;
    cancelled_at: string | null;
  } | null>(null);

  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [showCancelSubscription, setShowCancelSubscription] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadSubscription() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingSubscription(false);
        return;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          "id, plan, started_at, expires_at, stripe_subscription_id, cancelled_at"
        )
        .eq("user_id", user.id)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.error("Error loading subscription:", error);
      }

      setSubscription(data);
      setLoadingSubscription(false);
    }

    loadSubscription();
  }, []);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/sign-up");
    router.refresh();
  }

  async function handleChangePassword() {
    if (!newPassword.trim()) return;

    setChangingPassword(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setChangingPassword(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password changed successfully!");
    setNewPassword("");
  }

  async function handleDeleteAccount() {
    try {
      const response = await fetch("/api/delete-account", {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Delete account error:", result);

        alert(JSON.stringify(result, null, 2));

        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Unexpected delete account error:", error);

      alert("Something went wrong while deleting your account.");
    }
  }

  async function handleCancelSubscription() {
    if (!subscription?.stripe_subscription_id) return;

    setCancellingSubscription(true);

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error cancelling subscription:", data);
        return;
      }

      setShowCancelSubscription(false);
    } catch (error) {
      console.error("Unexpected cancellation error:", error);
    } finally {
      setCancellingSubscription(false);
    }
  }

  return (
    <div className="min-h-full bg-[#f7f7fb] px-6 py-8 text-gray-900 transition-colors duration-300 dark:bg-[#09090d] dark:text-white lg:px-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <Settings size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Settings
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-white/40">
                Manage your account and preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Security */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-white/[0.07] dark:bg-white/[0.025] dark:shadow-none">
            <div className="mb-6">
              <h2 className="text-base font-semibold">Security</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-white/40">
                Manage your account security.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.06] dark:bg-black/10">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <Lock size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium">Change password</p>

                  <p className="text-xs text-gray-500 dark:text-white/35">
                    Update your account password.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-400/60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/25 dark:focus:border-violet-400/40"
                />

                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {changingPassword ? "Changing..." : "Change password"}
                </button>
              </div>
            </div>
          </section>

          {/* Subscription */}
          {/* Subscription */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-white/[0.07] dark:bg-white/[0.025] dark:shadow-none">
            <div className="mb-6">
              <h2 className="text-base font-semibold">Subscription</h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-white/40">
                Manage your Queuerious subscription.
              </p>
            </div>

            {loadingSubscription ? (
              <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/[0.06] dark:bg-black/10 p-4">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.05]" />

                <div className="space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-white/[0.05]" />

                  <div className="h-3 w-28 animate-pulse rounded bg-white/[0.05]" />
                </div>
              </div>
            ) : subscription ? (
              <div className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.06] p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        subscription.plan === "mind"
                          ? "bg-cyan-400/10 text-cyan-300"
                          : "bg-violet-500/10 text-violet-300"
                      }`}
                    >
                      <Crown size={20} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                          {subscription.plan === "mind"
                            ? "Queuerious Mind"
                            : "Queuerious Beyond"}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                            subscription.plan === "mind"
                              ? "bg-cyan-400/10 text-cyan-200"
                              : "bg-violet-500/10 text-violet-200"
                          }`}
                        >
                          {subscription.cancelled_at ? "Cancelled" : "Active"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
                        Active since{" "}
                        {new Date(subscription.started_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>

                      <p className="text-xs text-white/35">
                        {subscription.cancelled_at
                          ? `Your subscription will expire on ${new Date(
                              subscription.expires_at!
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}`
                          : `Next billing ${new Date(
                              subscription.expires_at!
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCancelSubscription(true)}
                    className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                  >
                    Cancel subscription
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/[0.06] dark:bg-black/10 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <CreditCard size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium">No active subscription</p>

                  <p className="text-xs text-white/35">
                    You are currently using the free plan.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Notifications */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-white/[0.07] dark:bg-white/[0.025] dark:shadow-none">
            <div className="mb-6">
              <h2 className="text-base font-semibold">Notifications</h2>
              <p className="mt-1 text-sm text-white/40">
                Notification settings will be available soon.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/[0.06] dark:bg-black/10 p-4 opacity-60">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <Bell size={18} />
              </div>

              <div>
                <p className="text-sm font-medium">Coming soon</p>
                <p className="text-xs text-white/35">
                  Control your Queuerious notifications.
                </p>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-3xl border border-red-200 bg-red-50/50 p-6 dark:border-red-500/15 dark:bg-red-500/[0.025]">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-red-300">
                Danger zone
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-white/40">
                Irreversible account actions.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-red-500/10 dark:bg-black/10">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                  <Trash2 size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium">Delete account</p>

                  <p className="text-xs text-gray-500 dark:text-white/35">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
              >
                Delete account
              </button>
            </div>
          </section>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500 transition hover:text-gray-900 dark:text-white/40 dark:hover:text-white"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </div>

      {/* Cancel subscription confirmation */}
      {showCancelSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl dark:border-white/[0.10] dark:bg-[#121217] dark:text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
              <X size={22} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Cancel your subscription?
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-white/45">
              Are you sure you want to cancel your{" "}
              <span className="font-medium text-gray-700 dark:text-white/70">
                {subscription?.plan === "mind"
                  ? "Queuerious Mind"
                  : "Queuerious Beyond"}
              </span>{" "}
              subscription?
            </p>

            <p className="mt-2 text-sm leading-relaxed text-gray-400 dark:text-white/30">
              Your subscription will remain active until the end of your current
              billing period.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setShowCancelSubscription(false)}
                disabled={cancellingSubscription}
                className="rounded-xl px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white"
              >
                Keep subscription
              </button>

              <button
                onClick={handleCancelSubscription}
                disabled={cancellingSubscription}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancellingSubscription
                  ? "Cancelling..."
                  : "Yes, cancel subscription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 text-gray-900 shadow-2xl dark:border-red-500/20 dark:bg-[#121217] dark:text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">Delete your account?</h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-white/45">
              This action is irreversible. Your account, profile, matches and
              associated data will be permanently deleted.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteAccount}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-400"
              >
                Yes, delete everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
