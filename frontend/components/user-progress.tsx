"use client";

import { Clock, Flame, Gem, Sparkles, Target, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiFetch, type UserSummary } from "@/lib/api";

type UserProgressProps = {
  user: UserSummary;
  onRefresh?: () => void;
};

export const UserProgress = ({ user, onRefresh }: UserProgressProps) => {
  const handleAdvanceDay = async () => {
    try {
      await apiFetch("/api/dev/advance-day", {
        method: "POST",
        body: JSON.stringify({ days: 1 }),
      });
      toast.success("Simulated +1 day! Check your streak, hearts, and daily XP.");
      onRefresh?.();
    } catch {
      toast.error("Could not advance simulated day.");
    }
  };

  const goalPct = Math.min(
    100,
    Math.round((user.today_xp / Math.max(1, user.daily_goal_xp)) * 100)
  );

  // Compute minutes until next heart
  let regenMinutesLeft: number | null = null;
  if (user.hearts < user.max_hearts && user.next_heart_at) {
    const diffMs =
      new Date(user.next_heart_at).getTime() - new Date(user.now).getTime();
    regenMinutesLeft = Math.max(1, Math.ceil(diffMs / 60000));
  }

  return (
    <div className="flex flex-col gap-y-4">
      {/* Top Bar: Course Flag | Streak | XP | Gems | Hearts */}
      <div className="flex w-full items-center justify-between gap-x-1">
        <Link href="/courses" title="Switch language course">
          <Button variant="ghost" size="sm" className="px-2">
            <Image
              src={user.course?.flag_src || "/es.svg"}
              alt={user.course?.title || "Spanish"}
              className="rounded-md border"
              width={32}
              height={32}
            />
          </Button>
        </Link>

        <Link href="/profile" title="Day Streak">
          <Button
            variant="ghost"
            size="sm"
            className={
              user.extended_today
                ? "px-2 font-extrabold text-orange-500"
                : "px-2 font-extrabold text-amber-500"
            }
          >
            <Flame className="mr-1.5 h-5 w-5 fill-orange-500 text-orange-500" />
            {user.streak}
          </Button>
        </Link>

        <Link href="/leaderboard" title="Total XP">
          <Button variant="ghost" size="sm" className="px-2 font-extrabold text-amber-500">
            <Image
              src="/points.svg"
              height={24}
              width={24}
              alt="XP"
              className="mr-1"
            />
            {user.total_xp}
          </Button>
        </Link>

        <Link href="/shop" title="Gems">
          <Button variant="ghost" size="sm" className="px-2 font-extrabold text-sky-500">
            <Gem className="mr-1.5 h-5 w-5 fill-sky-400 text-sky-500" />
            {user.gems}
          </Button>
        </Link>

        <Link href="/shop" title="Hearts">
          <Button variant="ghost" size="sm" className="px-2 font-extrabold text-rose-500">
            <Image
              src="/heart.svg"
              height={22}
              width={22}
              alt="Hearts"
              className="mr-1.5"
            />
            {user.hearts}
          </Button>
        </Link>
      </div>

      {/* Heart Regeneration Notice when < 5 hearts */}
      {user.hearts < user.max_hearts && (
        <div className="flex items-center justify-between rounded-2xl border-2 border-rose-200 bg-rose-50/70 px-4 py-2.5 text-xs font-bold text-rose-600">
          <div className="flex items-center gap-x-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              Next heart in {regenMinutesLeft ?? 30}m (or Practice to earn +1)
            </span>
          </div>
          <Link href="/lesson?mode=practice" className="underline hover:text-rose-700">
            Practice
          </Link>
        </div>
      )}

      {/* Daily XP Goal Card & 7-Day Streak Strip */}
      <div className="space-y-3 rounded-2xl border-2 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <Target className="h-5 w-5 text-green-500" />
            <h3 className="text-base font-extrabold text-neutral-700">
              Daily Goal
            </h3>
          </div>
          <span className="text-sm font-extrabold text-green-600">
            {user.today_xp} / {user.daily_goal_xp} XP
          </span>
        </div>

        <Progress value={goalPct} className="h-3" />

        {/* 7-day mini calendar */}
        <div className="flex items-center justify-between pt-1">
          {user.week_activity.map((d) => {
            const weekday = new Date(d.date + "T00:00:00Z").toLocaleDateString(
              "en-US",
              { weekday: "narrow", timeZone: "UTC" }
            );
            return (
              <div key={d.date} className="flex flex-col items-center gap-y-1">
                <span className="text-[11px] font-bold text-slate-400">
                  {weekday}
                </span>
                <div
                  className={
                    d.active
                      ? "flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-extrabold text-white"
                      : "flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-200 text-xs font-bold text-slate-300"
                  }
                >
                  {d.active ? "✓" : ""}
                </div>
              </div>
            );
          })}
        </div>

        {/* Simulated Day Controls for Testing Streak & Heart Regen */}
        <div className="flex items-center justify-between border-t pt-2.5 text-xs text-slate-500">
          <span className="font-semibold">Date: {user.today}</span>
          <button
            onClick={handleAdvanceDay}
            className="inline-flex items-center gap-x-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-bold text-slate-600 transition hover:bg-slate-100"
            title="Advance simulated clock by 1 day to test streaks and heart regeneration"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Simulate +1 Day
          </button>
        </div>
      </div>

      {/* Quick Practice CTA */}
      <Link href="/lesson?mode=practice">
        <Button variant="primaryOutline" className="w-full justify-center gap-x-2 border-2 border-b-4 border-sky-200">
          <Zap className="h-4 w-4 fill-sky-500 text-sky-500" />
          Practice (+5 XP & +1 Heart)
        </Button>
      </Link>
    </div>
  );
};
