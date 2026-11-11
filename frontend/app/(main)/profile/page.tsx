"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Flame,
  Loader,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import Image from "next/image";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Progress } from "@/components/ui/progress";
import { UserProgress } from "@/components/user-progress";
import {
  apiFetch,
  type QuestItem,
  type UserProfile,
  type UserSummary,
} from "@/lib/api";

const ProfilePage = () => {
  const [me, setMe] = useState<UserSummary | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const meData = await apiFetch<UserSummary>("/api/me");
      const [profileData, questsData] = await Promise.all([
        apiFetch<UserProfile>(`/api/users/${meData.id}/profile`),
        apiFetch<QuestItem[]>("/api/quests"),
      ]);
      setMe(meData);
      setProfile(profileData);
      setQuests(questsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading || !me || !profile) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const maxWeeklyXp = Math.max(
    30,
    ...profile.weekly_xp.map((d) => d.xp)
  );

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6 pb-16">
      <StickyWrapper>
        <UserProgress user={me} onRefresh={loadData} />
        <Quests quests={quests} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="space-y-8">
          {/* Profile Header Banner */}
          <div className="flex flex-col items-start justify-between gap-4 border-b-2 pb-6 sm:flex-row sm:items-center">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-extrabold text-neutral-800">
                {profile.display_name}
              </h1>
              <p className="text-base font-bold text-slate-400">
                @{profile.username}
              </p>
              <div className="flex items-center gap-x-2 pt-1 text-sm font-semibold text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-x-4">
              {profile.courses.map((c) => (
                <Image
                  key={c.title}
                  src={c.flag_src}
                  alt={c.title}
                  width={40}
                  height={32}
                  className="rounded-md border"
                />
              ))}
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-extrabold text-white shadow-md"
                style={{ backgroundColor: profile.avatar_color }}
              >
                {profile.display_name[0]}
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-neutral-800">
              Statistics
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-x-3 rounded-2xl border-2 p-4">
                <Flame className="h-7 w-7 shrink-0 fill-orange-500 text-orange-500" />
                <div>
                  <p className="text-xl font-extrabold text-neutral-800">
                    {profile.stats.streak}
                  </p>
                  <p className="text-xs font-bold text-slate-400">Day streak</p>
                </div>
              </div>

              <div className="flex items-center gap-x-3 rounded-2xl border-2 p-4">
                <Zap className="h-7 w-7 shrink-0 fill-amber-400 text-amber-500" />
                <div>
                  <p className="text-xl font-extrabold text-neutral-800">
                    {profile.stats.total_xp}
                  </p>
                  <p className="text-xs font-bold text-slate-400">Total XP</p>
                </div>
              </div>

              <div className="flex items-center gap-x-3 rounded-2xl border-2 p-4">
                <Trophy className="h-7 w-7 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xl font-extrabold text-neutral-800">
                    {profile.stats.league} (#{profile.stats.league_rank})
                  </p>
                  <p className="text-xs font-bold text-slate-400">
                    Current league
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-x-3 rounded-2xl border-2 p-4">
                <CheckCircle2 className="h-7 w-7 shrink-0 text-green-500" />
                <div>
                  <p className="text-xl font-extrabold text-neutral-800">
                    {profile.stats.lessons_completed}
                  </p>
                  <p className="text-xs font-bold text-slate-400">
                    Lessons completed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-x-3 rounded-2xl border-2 p-4">
                <Sparkles className="h-7 w-7 shrink-0 text-purple-500" />
                <div>
                  <p className="text-xl font-extrabold text-neutral-800">
                    {profile.stats.perfect_lessons}
                  </p>
                  <p className="text-xs font-bold text-slate-400">
                    Perfect lessons
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-x-3 rounded-2xl border-2 p-4">
                <BookOpen className="h-7 w-7 shrink-0 text-sky-500" />
                <div>
                  <p className="text-xl font-extrabold text-neutral-800">
                    {profile.stats.words_learned}
                  </p>
                  <p className="text-xs font-bold text-slate-400">
                    Words learned
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day XP Activity Bar Chart */}
          <div className="space-y-3 rounded-2xl border-2 p-5">
            <h2 className="text-lg font-extrabold text-neutral-800">
              Last 7 Days XP
            </h2>
            <div className="flex h-36 items-end justify-between gap-2 pt-4">
              {profile.weekly_xp.map((item) => {
                const heightPct = Math.max(
                  8,
                  Math.round((item.xp / maxWeeklyXp) * 100)
                );
                const dayLabel = new Date(
                  item.date + "T00:00:00Z"
                ).toLocaleDateString("en-US", {
                  weekday: "short",
                  timeZone: "UTC",
                });
                return (
                  <div
                    key={item.date}
                    className="flex flex-1 flex-col items-center gap-y-1.5"
                  >
                    <span className="text-[11px] font-bold text-slate-500">
                      {item.xp}
                    </span>
                    <div className="flex h-24 w-full items-end justify-center">
                      <div
                        className="w-full max-w-[32px] rounded-t-lg bg-green-500 transition-all"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-neutral-800">
              Achievements
            </h2>
            <div className="space-y-3">
              {profile.achievements.map((ach) => {
                const pct = Math.min(
                  100,
                  Math.round((ach.progress / Math.max(1, ach.target)) * 100)
                );
                return (
                  <div
                    key={ach.family}
                    className="flex items-center gap-x-4 rounded-2xl border-2 p-4"
                  >
                    <div
                      className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-sm"
                      style={{ backgroundColor: ach.color }}
                    >
                      <Award className="h-7 w-7" />
                      <span className="text-[10px] font-extrabold uppercase">
                        Lv {ach.level}/{ach.max_level}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-extrabold text-neutral-800">
                          {ach.title}
                        </h3>
                        <span className="text-xs font-extrabold text-slate-400">
                          {ach.progress} / {ach.target}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500">
                        {ach.description}
                      </p>
                      <Progress value={pct} className="h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default ProfilePage;

