"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { UserProgress } from "@/components/user-progress";
import { apiFetch, type UserSettings, type UserSummary } from "@/lib/api";
import { cn } from "@/lib/utils";

const SettingsPage = () => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [dailyGoal, setDailyGoal] = useState(20);
  const [settings, setSettings] = useState<UserSettings>({
    sound_effects: true,
    animations: true,
    motivational_messages: true,
    listening_exercises: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const me = await apiFetch<UserSummary>("/api/me");
      setUser(me);
      setDisplayName(me.display_name);
      setDailyGoal(me.daily_goal_xp);
      setSettings(me.settings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        apiFetch("/api/me", {
          method: "PATCH",
          body: JSON.stringify({
            display_name: displayName,
            daily_goal_xp: dailyGoal,
          }),
        }),
        apiFetch("/api/me/settings", {
          method: "PATCH",
          body: JSON.stringify(settings),
        }),
      ]);
      toast.success("Settings saved!");
      await loadData();
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    setSaving(true);
    try {
      await apiFetch("/api/dev/reset", { method: "POST" });
      toast.success("Database reset to initial seeded state!");
      await loadData();
    } catch {
      toast.error("Could not reset database.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6 pb-16">
      <StickyWrapper>
        <UserProgress user={user} onRefresh={loadData} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-800">
              Account & Learning Settings
            </h1>
            <p className="text-sm font-semibold text-slate-500">
              Customize your profile, daily XP goal, and lesson preferences.
            </p>
          </div>

          {/* Profile Name */}
          <div className="space-y-3 rounded-2xl border-2 p-5">
            <h2 className="text-lg font-extrabold text-neutral-800">Profile</h2>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border-2 px-4 py-2.5 font-bold text-neutral-700 focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Daily XP Goal Selector */}
          <div className="space-y-3 rounded-2xl border-2 p-5">
            <h2 className="text-lg font-extrabold text-neutral-800">
              Daily XP Goal
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(user.daily_goal_options).map(([label, xpVal]) => {
                const active = dailyGoal === xpVal;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDailyGoal(xpVal)}
                    className={cn(
                      "flex flex-col items-center rounded-xl border-2 border-b-4 p-3 transition",
                      active
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <span className="font-extrabold">{label}</span>
                    <span className="text-xs font-bold text-slate-500">
                      {xpVal} XP / day
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lesson Preferences */}
          <div className="space-y-4 rounded-2xl border-2 p-5">
            <h2 className="text-lg font-extrabold text-neutral-800">
              Lesson Experience
            </h2>

            {(
              [
                ["sound_effects", "Sound effects", "Play audio feedback on answers"],
                ["animations", "Animations", "Celebratory animations during lessons"],
                [
                  "motivational_messages",
                  "Motivational messages",
                  "Encouraging mascot banners",
                ],
                [
                  "listening_exercises",
                  "Listening & Speech (TTS)",
                  "Enable Spanish pronunciation audio",
                ],
              ] as const
            ).map(([key, title, desc]) => (
              <div
                key={key}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-extrabold text-neutral-700">{title}</p>
                  <p className="text-xs font-semibold text-slate-400">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings((s) => ({ ...s, [key]: !s[key] }))
                  }
                  className={cn(
                    "h-7 w-12 rounded-full p-1 transition",
                    settings[key] ? "bg-green-500" : "bg-slate-300"
                  )}
                >
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full bg-white shadow transition",
                      settings[key] ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>

            <Button
              variant="dangerOutline"
              onClick={handleResetDemo}
              disabled={saving}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Seeded Demo Data
            </Button>
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default SettingsPage;

