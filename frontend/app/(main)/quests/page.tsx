"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Gem, Loader } from "lucide-react";
import Image from "next/image";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Promo } from "@/components/promo";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Progress } from "@/components/ui/progress";
import { UserProgress } from "@/components/user-progress";
import { apiFetch, type QuestItem, type UserSummary } from "@/lib/api";

const QuestsPage = () => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [meData, questsData] = await Promise.all([
        apiFetch<UserSummary>("/api/me"),
        apiFetch<QuestItem[]>("/api/quests"),
      ]);
      setUser(meData);
      setQuests(questsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
        <Promo />
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <Image src="/quests.svg" alt="Quests" height={90} width={90} />

          <h1 className="my-6 text-center text-2xl font-extrabold text-neutral-800">
            Daily Quests
          </h1>
          <p className="mb-6 text-center text-lg font-medium text-muted-foreground">
            Complete daily quests by earning XP and finishing lessons to earn
            bonus gems!
          </p>

          <ul className="w-full space-y-3">
            {quests.map((quest) => {
              const progress = Math.min(
                100,
                Math.round((quest.progress / Math.max(1, quest.target)) * 100)
              );

              return (
                <li
                  className="flex w-full items-center gap-x-4 rounded-2xl border-2 p-5"
                  key={quest.code}
                >
                  <Image
                    src="/points.svg"
                    alt="Points"
                    width={56}
                    height={56}
                  />

                  <div className="flex w-full flex-col gap-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-extrabold text-neutral-700">
                        {quest.title}
                      </p>
                      <div className="flex items-center gap-x-1 text-sm font-extrabold text-sky-500">
                        <Gem className="h-4 w-4 fill-sky-400" />
                        +{quest.gem_reward}
                      </div>
                    </div>

                    <Progress value={progress} className="h-3.5" />

                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>
                        {quest.progress} / {quest.target}
                      </span>
                      {quest.completed && (
                        <span className="inline-flex items-center gap-x-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default QuestsPage;
