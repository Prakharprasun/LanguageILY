"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Flame, Heart, Loader, RefreshCw, Sparkles, Volume2 } from "lucide-react";
import Image from "next/image";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { UserProgress } from "@/components/user-progress";
import {
  apiFetch,
  speakText,
  type LearningPath,
  type QuestItem,
  type UserSummary,
} from "@/lib/api";
import { cn } from "@/lib/utils";

import { Header } from "./header";
import { Unit } from "./unit";

const CRUSH_MODE_DECKS: Record<
  string,
  { target: string; en: string; vibe: string; confidence: number }[]
> = {
  es: [
    {
      target: "Te quiero mucho.",
      en: "I love you so much.",
      vibe: "Lesson 1 • Make your intentions clear ❤️",
      confidence: 92,
    },
    {
      target: "Eres muy lindo / linda.",
      en: "You're really cute.",
      vibe: "Compliment • Sweet & direct",
      confidence: 84,
    },
    {
      target: "Me gusta hablar contigo.",
      en: "I like talking to you.",
      vibe: "Texting • Late-night chat energy",
      confidence: 78,
    },
    {
      target: "¿Tienes planes este fin de semana?",
      en: "Do you have plans this weekend?",
      vibe: "The Setup • Smooth transition",
      confidence: 72,
    },
    {
      target: "¿Quieres tomar un café conmigo?",
      en: "Would you like to get coffee with me?",
      vibe: "Survive the Date • Casual & low-pressure",
      confidence: 88,
    },
    {
      target: "¿Quieres salir conmigo?",
      en: "Would you like to go out with me?",
      vibe: "Level 10 • You're on your own now ♡",
      confidence: 65,
    },
  ],
  kr: [
    {
      target: "너 너무 사랑해. (Neo neomu saranghae)",
      en: "I love you so much.",
      vibe: "Lesson 1 • Make your intentions clear ❤️",
      confidence: 94,
    },
    {
      target: "너 진짜 귀여워. (Neo jinjja gwiyeowo)",
      en: "You're really cute.",
      vibe: "K-Drama Compliment • Instant heart-flutter",
      confidence: 86,
    },
    {
      target: "너랑 이야기 좋아해요. (Neorang iyagi joahaeyo)",
      en: "I like talking with you.",
      vibe: "KakaoTalk • Late-night chat energy",
      confidence: 80,
    },
    {
      target: "이번 주말 시간 있어요? (Ibeon jumal sigan isseoyo?)",
      en: "Do you have time this weekend?",
      vibe: "The Setup • Smooth weekend invite",
      confidence: 75,
    },
    {
      target: "우리 커피 마실래요? (Uri keopi masillaeyo?)",
      en: "Shall we grab coffee together?",
      vibe: "Seoul Café Date • Sweet & polite",
      confidence: 89,
    },
    {
      target: "나랑 사귈래? (Narang sagwillae?)",
      en: "Will you go out with me?",
      vibe: "Level 10 • K-Drama Confession ♡",
      confidence: 68,
    },
  ],
};

const LearnPage = () => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"learn" | "crush">("learn");
  const [switchingLang, setSwitchingLang] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [meData, pathData, questsData] = await Promise.all([
        apiFetch<UserSummary>("/api/me"),
        apiFetch<LearningPath>("/api/path"),
        apiFetch<QuestItem[]>("/api/quests"),
      ]);
      setUser(meData);
      setPath(pathData);
      setQuests(questsData);
    } catch (err: any) {
      console.error("Failed to load /learn data:", err);
      setError(
        err?.message ||
          "Could not connect to the backend. Free-tier cloud instances sleep after 15m of inactivity and take ~30s to wake up."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQuickCourseSwitch = async (courseId: number) => {
    if (switchingLang || path?.course.id === courseId) return;
    setSwitchingLang(true);
    try {
      await apiFetch("/api/me", {
        method: "PATCH",
        body: JSON.stringify({ active_course_id: courseId }),
      });
      await loadData();
    } finally {
      setSwitchingLang(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (!user || !path) {
    if (error) {
      return (
        <div className="mx-auto flex h-[70vh] max-w-md flex-col items-center justify-center gap-y-4 px-6 text-center">
          <Image
            src="/logo.png"
            alt="Language ILY"
            width={64}
            height={64}
            className="rounded-2xl object-contain opacity-80"
          />
          <h2 className="text-xl font-extrabold text-neutral-800">
            Waking up backend server...
          </h2>
          <p className="text-sm text-neutral-500">{error}</p>
          <Button
            onClick={() => void loadData()}
            variant="primary"
            className="flex items-center gap-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      );
    }

    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-y-3 px-4 text-center">
        <Image
          src="/logo.png"
          alt="Language ILY"
          width={72}
          height={72}
          className="animate-bounce rounded-2xl object-contain"
        />
        <Loader className="h-6 w-6 animate-spin text-[#C81E3A]" />
        <p className="font-script text-2xl font-bold text-[#C81E3A]">
          Preparing your rizz...
        </p>
        <p className="max-w-xs text-xs text-neutral-400">
          Connecting to backend... If the server was idle, Render free tier takes ~30s on cold start.
        </p>
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
        <Header title={path.course.title} />

        {/* Mode & Language Switcher Bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border-2 border-pink-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-x-2">
            <div className="flex rounded-xl border border-pink-200 bg-rose-50/70 p-1">
              <button
                type="button"
                disabled={switchingLang}
                onClick={() => handleQuickCourseSwitch(1)}
                className={cn(
                  "flex items-center gap-x-1.5 rounded-lg px-2.5 py-1 text-xs font-extrabold transition",
                  path.course.language_code !== "kr"
                    ? "bg-white text-[#C81E3A] shadow-sm"
                    : "text-neutral-600 hover:text-[#C81E3A]"
                )}
              >
                <span>🇪🇸</span>
                <span>Spanish</span>
              </button>
              <button
                type="button"
                disabled={switchingLang}
                onClick={() => handleQuickCourseSwitch(2)}
                className={cn(
                  "flex items-center gap-x-1.5 rounded-lg px-2.5 py-1 text-xs font-extrabold transition",
                  path.course.language_code === "kr"
                    ? "bg-white text-[#C81E3A] shadow-sm"
                    : "text-neutral-600 hover:text-[#C81E3A]"
                )}
              >
                <span>🇰🇷</span>
                <span>Korean</span>
              </button>
            </div>
          </div>

          <div className="flex rounded-xl bg-rose-50 p-1">
            <button
              type="button"
              onClick={() => setMode("learn")}
              className={cn(
                "flex items-center gap-x-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition",
                mode === "learn"
                  ? "bg-[#C81E3A] text-white shadow-sm"
                  : "text-rose-700 hover:bg-rose-100/70"
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Actually Learn {path.course.title}
            </button>
            <button
              type="button"
              onClick={() => setMode("crush")}
              className={cn(
                "flex items-center gap-x-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition",
                mode === "crush"
                  ? "bg-gradient-to-r from-[#C81E3A] to-pink-500 text-white shadow-sm"
                  : "text-rose-700 hover:bg-rose-100/70"
              )}
            >
              <Heart className="h-3.5 w-3.5 fill-current" />
              Crush Mode ❤️
            </button>
          </div>
        </div>

        {mode === "crush" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-rose-200 bg-gradient-to-r from-[#C81E3A] to-rose-500 p-5 text-white shadow-md">
              <div className="flex items-center gap-x-2 text-xs font-black uppercase tracking-widest text-rose-100">
                <Flame className="h-4 w-4 fill-current" />
                High-Risk, High-Reward Phrasebook
              </div>
              <h2 className="mt-1 text-2xl font-black">
                Crush Mode: Instant Rizz Lines ❤️
              </h2>
              <p className="mt-1 text-sm font-medium text-rose-50">
                Tap any card to hear the native pronunciation. Then switch back
                to the skill tree so you can actually reply when they text back!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(
                CRUSH_MODE_DECKS[path.course.language_code || "es"] ||
                CRUSH_MODE_DECKS.es
              ).map((card) => (
                <div
                  key={card.target}
                  onClick={() =>
                    speakText(
                      card.target.split("(")[0].trim(),
                      path.course.speech_locale || "es-ES"
                    )
                  }
                  className="group cursor-pointer rounded-2xl border-2 border-b-4 border-pink-200 bg-white p-5 transition hover:border-[#C81E3A] hover:bg-rose-50/40 active:border-b-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="inline-block rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-extrabold text-[#C81E3A]">
                        {card.vibe}
                      </span>
                      <p className="pt-1 text-xl font-black text-neutral-900">
                        ❤️ &ldquo;{card.en}&rdquo;
                      </p>
                      <p className="text-lg font-extrabold text-[#C81E3A]">
                        {card.target}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-[#C81E3A] transition group-hover:bg-[#C81E3A] group-hover:text-white">
                      <Volume2 className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-pink-100 pt-3 text-xs font-extrabold text-slate-500">
                    <span>You learned this ✨</span>
                    <span className="font-mono text-[#C81E3A]">
                      Confidence: ███████░░░ {card.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          path.units.map((unit) => (
            <div key={unit.id} className="mb-12">
              <Unit
                unit={unit}
                activeLessonId={path.active_lesson_id}
                speechLocale={path.course.speech_locale || "es-ES"}
              />
            </div>
          ))
        )}
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
