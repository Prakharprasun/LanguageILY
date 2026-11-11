import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { QuestItem } from "@/lib/api";

type QuestsProps = {
  quests: QuestItem[];
};

export const Quests = ({ quests }: QuestsProps) => {
  return (
    <div className="space-y-4 rounded-2xl border-2 p-4">
      <div className="flex w-full items-center justify-between">
        <h3 className="text-lg font-extrabold text-neutral-700">Daily Quests</h3>

        <Link href="/quests">
          <Button size="sm" variant="primaryOutline">
            View all
          </Button>
        </Link>
      </div>

      <ul className="w-full space-y-3">
        {quests.map((quest) => {
          const progress = Math.min(
            100,
            Math.round((quest.progress / Math.max(1, quest.target)) * 100)
          );

          return (
            <li
              className="flex w-full items-center gap-x-3 pb-2"
              key={quest.code}
            >
              <Image src="/points.svg" alt="Points" width={36} height={36} />

              <div className="flex w-full flex-col gap-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span>{quest.title}</span>
                  <span className="text-slate-400">
                    {quest.progress}/{quest.target}
                  </span>
                </div>

                <Progress value={progress} className="h-2.5" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
