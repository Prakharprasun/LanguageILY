"use client";

import { useState } from "react";
import {
  Check,
  Clock,
  Crown,
  Heart,
  Lock,
  MapPin,
  MessageCircle,
  Plane,
  Star,
  Users,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";

import { Button } from "@/components/ui/button";
import type { SkillNode } from "@/lib/api";
import { cn } from "@/lib/utils";

import "react-circular-progressbar/dist/styles.css";

type SkillButtonProps = {
  skill: SkillNode;
  index: number;
  totalCount: number;
  unitColor: string;
};

const SKILL_ICONS: Record<string, typeof Star> = {
  star: Heart,
  chat: MessageCircle,
  food: Utensils,
  family: Users,
  map: MapPin,
  clock: Clock,
  plane: Plane,
};

export const SkillButton = ({
  skill,
  index,
  totalCount,
}: SkillButtonProps) => {
  const [openPopover, setOpenPopover] = useState(false);

  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  let indentationLevel;
  if (cycleIndex <= 2) indentationLevel = cycleIndex;
  else if (cycleIndex <= 4) indentationLevel = 4 - cycleIndex;
  else if (cycleIndex <= 6) indentationLevel = 4 - cycleIndex;
  else indentationLevel = cycleIndex - 8;

  const rightPosition = indentationLevel * 40;

  const isFirst = index === 0;
  const isLast = index === totalCount;
  const isCompleted = skill.state === "completed";
  const isCurrent = skill.state === "active";
  const isLocked = skill.state === "locked";

  const BaseIcon = SKILL_ICONS[skill.icon] || Heart;
  const Icon = isCompleted ? Check : isLast ? Crown : BaseIcon;

  const percentage =
    skill.lessons_total > 0
      ? Math.round((skill.lessons_completed / skill.lessons_total) * 100)
      : 0;

  const targetHref = isCompleted
    ? `/lesson?mode=practice&skillId=${skill.id}`
    : skill.next_lesson_id
      ? `/lesson/${skill.next_lesson_id}`
      : "/lesson";

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        right: `${rightPosition}px`,
        marginTop: isFirst && !isCompleted ? 52 : 24,
      }}
    >
      {isCurrent ? (
        <div className="relative h-[102px] w-[102px]">
          <div className="absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap animate-bounce rounded-xl border-2 border-rose-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-[#C81E3A] shadow-sm">
            Start ❤️
            <div
              className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-x-8 border-t-8 border-x-transparent"
              aria-hidden
            />
          </div>
          <CircularProgressbarWithChildren
            value={Number.isNaN(percentage) ? 0 : percentage}
            styles={{
              path: {
                stroke: "#C81E3A",
              },
              trail: {
                stroke: "#FCE7F3",
              },
            }}
          >
            <Button
              size="rounded"
              variant="secondary"
              onClick={() => setOpenPopover((o) => !o)}
              className="h-[70px] w-[70px] border-b-8"
            >
              <Icon className="h-10 w-10 fill-primary-foreground text-primary-foreground" />
            </Button>
          </CircularProgressbarWithChildren>
        </div>
      ) : (
        <div className="relative">
          <Button
            size="rounded"
            variant={isLocked ? "locked" : "secondary"}
            onClick={() => setOpenPopover((o) => !o)}
            className={cn(
              "h-[70px] w-[70px] border-b-8",
              isCompleted &&
                "border-pink-600 bg-gradient-to-b from-pink-500 to-rose-500 hover:opacity-95"
            )}
          >
            <Icon
              className={cn(
                "h-10 w-10",
                isLocked
                  ? "fill-neutral-400 stroke-neutral-400 text-neutral-400"
                  : "fill-primary-foreground text-primary-foreground",
                isCompleted && "fill-none stroke-[4]"
              )}
            />
          </Button>
          {/* Crown badge showing skill completion */}
          {isCompleted && (
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#C81E3A] text-white shadow">
              <Crown className="h-4 w-4 fill-white" />
            </div>
          )}
        </div>
      )}

      {/* Skill Title Pill below button */}
      <span className="mt-1.5 text-xs font-extrabold text-neutral-700">
        {skill.title} ({skill.lessons_completed}/{skill.lessons_total})
      </span>

      {/* Interactive Duolingo Skill Popover */}
      {openPopover && (
        <div className="z-30 mt-2 w-64 rounded-2xl border-2 border-pink-200 bg-white p-4 text-center shadow-xl">
          <div className="mb-1 flex items-center justify-center gap-x-1.5">
            {isCompleted && (
              <Crown className="h-5 w-5 fill-rose-500 text-[#C81E3A]" />
            )}
            {isLocked && <Lock className="h-4 w-4 text-slate-400" />}
            <h4 className="text-base font-extrabold text-neutral-900">
              {skill.title}
            </h4>
          </div>

          <p className="mb-3 text-xs font-semibold text-rose-500">
            {isCompleted
              ? `Rizz unlocked! All ${skill.lessons_total} lessons complete.`
              : isCurrent
                ? `Lesson ${skill.lessons_completed + 1} of ${skill.lessons_total}`
                : "Finish the earlier stages first — don't rush the confession!"}
          </p>

          {isLocked ? (
            <Button variant="locked" className="w-full" disabled>
              Locked
            </Button>
          ) : (
            <div className="flex flex-col gap-y-2">
              <Link href={targetHref} onClick={() => setOpenPopover(false)}>
                <Button
                  variant={isCompleted ? "primary" : "secondary"}
                  className="w-full"
                >
                  {isCompleted
                    ? "Practice (+5 XP)"
                    : `Start +${skill.next_lesson_xp || 10} XP`}
                </Button>
              </Link>
              {isCompleted && skill.lesson_ids[0] && (
                <Link
                  href={`/lesson/${skill.lesson_ids[0]}`}
                  onClick={() => setOpenPopover(false)}
                >
                  <Button variant="default" size="sm" className="w-full text-xs">
                    Replay Lesson (+10 XP)
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
