"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader, Shield } from "lucide-react";
import Image from "next/image";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Separator } from "@/components/ui/separator";
import { UserProgress } from "@/components/user-progress";
import {
  apiFetch,
  type LeaderboardData,
  type QuestItem,
  type UserSummary,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const LeaderboardPage = () => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [board, setBoard] = useState<LeaderboardData | null>(null);
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [meData, boardData, questsData] = await Promise.all([
        apiFetch<UserSummary>("/api/me"),
        apiFetch<LeaderboardData>("/api/leaderboard"),
        apiFetch<QuestItem[]>("/api/quests"),
      ]);
      setUser(meData);
      setBoard(boardData);
      setQuests(questsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading || !user || !board) {
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
        <Promo />
        <Quests quests={quests} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <Image
            src="/leaderboard.svg"
            alt="Leaderboard"
            height={90}
            width={90}
          />

          <h1 className="mt-6 text-center text-2xl font-extrabold text-neutral-800">
            {board.league} League
          </h1>
          <p className="mb-2 text-center text-base font-semibold text-muted-foreground">
            Top {board.promotion_spots} advance to the next league ·{" "}
            {board.days_left} days left
          </p>

          <Separator className="my-4 h-0.5 rounded-full" />

          <div className="w-full space-y-1">
            {board.entries.map((entry, idx) => {
              const showPromoDivider = idx === board.promotion_spots - 1;
              return (
                <div key={entry.user_id}>
                  <div
                    className={cn(
                      "flex w-full items-center rounded-xl p-2.5 px-4 transition hover:bg-gray-200/50",
                      entry.is_current_user &&
                        "border-2 border-green-300 bg-green-50/70"
                    )}
                  >
                    <p
                      className={cn(
                        "mr-4 w-6 text-center font-extrabold",
                        entry.rank <= 3 ? "text-amber-500" : "text-lime-700"
                      )}
                    >
                      {entry.rank}
                    </p>

                    <div
                      className="ml-2 mr-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-extrabold text-white shadow-sm"
                      style={{ backgroundColor: entry.avatar_color }}
                    >
                      {entry.display_name[0]}
                    </div>

                    <div className="flex-1">
                      <p className="font-extrabold text-neutral-800">
                        {entry.display_name}
                        {entry.is_current_user && (
                          <span className="ml-2 rounded-md bg-green-500 px-2 py-0.5 text-xs font-extrabold uppercase text-white">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs font-semibold text-slate-400">
                        @{entry.username}
                      </p>
                    </div>

                    <p className="font-extrabold text-neutral-700">
                      {entry.xp} XP
                    </p>
                  </div>

                  {showPromoDivider && (
                    <div className="my-2 flex items-center justify-center gap-x-2 py-1 text-xs font-extrabold uppercase tracking-wider text-green-600">
                      <ArrowUp className="h-4 w-4" />
                      Promotion Zone
                      <ArrowUp className="h-4 w-4" />
                    </div>
                  )}

                  {idx ===
                    board.entries.length - board.demotion_spots - 1 && (
                    <div className="my-2 flex items-center justify-center gap-x-2 py-1 text-xs font-extrabold uppercase tracking-wider text-rose-500">
                      <ArrowDown className="h-4 w-4" />
                      Demotion Zone
                      <ArrowDown className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default LeaderboardPage;
