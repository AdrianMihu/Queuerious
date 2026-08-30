"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Check,
  CreditCard,
  Lock,
  LogOut,
  Moon,
  Settings,
  Sun,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const router = useRouter();

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

  return (
    <div className="min-h-full px-6 py-8 lg:px-10">
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

              <p className="mt-1 text-sm text-white/40">
                Manage your account and preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold">Appearance</h2>
              <p className="mt-1 text-sm text-white/40">
                Customize how Queuerious looks.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/10 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {darkMode ? "Dark mode" : "Light mode"}
                  </p>

                  <p className="text-xs text-white/35">
                    Choose your preferred appearance.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative h-7 w-12 rounded-full transition ${
                  darkMode ? "bg-violet-500" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    darkMode ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Security */}
          <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold">Security</h2>
              <p className="mt-1 text-sm text-white/40">
                Manage your account security.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <Lock size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium">Change password</p>

                  <p className="text-xs text-white/35">
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
                  className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-violet-400/40"
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
          <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold">Subscription</h2>
              <p className="mt-1 text-sm text-white/40">
                Manage your Queuerious subscription.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-black/10 p-4">
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
          </section>

          {/* Notifications */}
          <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold">Notifications</h2>
              <p className="mt-1 text-sm text-white/40">
                Notification settings will be available soon.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-black/10 p-4 opacity-60">
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
          <section className="rounded-3xl border border-red-500/15 bg-red-500/[0.025] p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-red-300">
                Danger zone
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Irreversible account actions.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-red-500/10 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                  <Trash2 size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium">Delete account</p>

                  <p className="text-xs text-white/35">
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
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/40 transition hover:text-white"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-[#121217] p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">Delete your account?</h2>

            <p className="mt-3 text-sm leading-relaxed text-white/45">
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

              <button className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-400">
                Yes, delete everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
