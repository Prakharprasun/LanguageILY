"use client";

import { useState } from "react";
import { BookOpen, NotebookText, Volume2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch, speakText, type Guidebook, type UnitNode } from "@/lib/api";
import { cn } from "@/lib/utils";

import { SkillButton } from "./lesson-button";

type UnitProps = {
  unit: UnitNode;
  activeLessonId: number | null;
  speechLocale?: string;
};

const UNIT_BG: Record<string, string> = {
  green: "bg-gradient-to-r from-[#C81E3A] to-rose-500 border-[#9E142B]",
  purple: "bg-gradient-to-r from-pink-600 to-rose-500 border-pink-800",
  blue: "bg-gradient-to-r from-rose-700 to-[#C81E3A] border-rose-950",
};

export const Unit = ({
  unit,
  activeLessonId,
  speechLocale = "es-ES",
}: UnitProps) => {
  const [guidebook, setGuidebook] = useState<Guidebook | null>(null);
  const [openGuide, setOpenGuide] = useState(false);

  const handleOpenGuidebook = async () => {
    setOpenGuide(true);
    if (!guidebook) {
      const data = await apiFetch<Guidebook>(`/api/units/${unit.id}/guidebook`);
      setGuidebook(data);
    }
  };

  const bannerColor = UNIT_BG[unit.color] || UNIT_BG.green;

  return (
    <>
      <div
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border-b-4 p-5 text-white shadow-sm",
          bannerColor
        )}
      >
        <div className="space-y-1.5">
          <p className="text-xs font-extrabold uppercase tracking-widest text-rose-100">
            Stage {unit.position} • Love & Fluency
          </p>
          <h3 className="text-2xl font-black">{unit.title}</h3>
          <p className="text-sm font-semibold text-rose-50">
            {unit.description}
          </p>
        </div>

        <div className="flex items-center gap-x-2">
          <Button
            size="lg"
            variant="default"
            onClick={handleOpenGuidebook}
            className="border-2 border-b-4 border-white/30 bg-white/15 text-white hover:bg-white/25"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Rizz Book
          </Button>

          {activeLessonId && unit.state === "active" && (
            <Link href={`/lesson/${activeLessonId}`}>
              <Button
                size="lg"
                variant="default"
                className="hidden border-2 border-b-4 border-rose-200 bg-white text-[#C81E3A] hover:bg-rose-50 active:border-b-2 xl:flex"
              >
                <NotebookText className="mr-2 h-5 w-5" />
                Continue
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="relative flex flex-col items-center pt-4">
        {unit.skills.map((skill, i) => (
          <SkillButton
            key={skill.id}
            skill={skill}
            index={i}
            totalCount={unit.skills.length - 1}
            unitColor={unit.color}
          />
        ))}
      </div>

      <Dialog open={openGuide} onOpenChange={setOpenGuide}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-neutral-900">
              Stage {unit.position} Rizz Book: {unit.title}
            </DialogTitle>
            <DialogDescription className="text-base">
              Key phrases & vocabulary in this stage. Click any phrase to hear
              its pronunciation before texting your crush.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {guidebook?.sections.map((sec) => (
              <div key={sec.skill} className="space-y-2.5">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#C81E3A]">
                  {sec.skill}
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {sec.phrases.map((p) => (
                    <button
                      key={p.term}
                      onClick={() => speakText(p.term, speechLocale)}
                      className="flex items-center justify-between rounded-xl border-2 border-pink-100 bg-[#FFF9FA] p-3 text-left transition hover:border-[#C81E3A] hover:bg-rose-50"
                    >
                      <div>
                        <p className="font-extrabold text-neutral-800">
                          {p.term}
                        </p>
                        <p className="text-xs font-semibold text-rose-500">
                          {p.translation}
                        </p>
                      </div>
                      <Volume2 className="h-4 w-4 shrink-0 text-[#C81E3A]" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
