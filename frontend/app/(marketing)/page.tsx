"use client";

import { useState } from "react";
import { Heart, Mic, Search, Sparkles, Volume2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { speakText } from "@/lib/api";
import { cn } from "@/lib/utils";

type CrushLang = {
  code: string;
  flag: string;
  name: string;
  locale: string;
  ily: string;
  romanized: string;
  context: string;
  phrases: Record<string, { target: string; romanized: string; note: string }>;
};

const CRUSH_LANGUAGES: CrushLang[] = [
  {
    code: "es",
    flag: "🇪🇸",
    name: "Spanish",
    locale: "es-ES",
    ily: "Te quiero mucho.",
    romanized: "teh kyeh-roh moo-choh",
    context: "Romantic • Warm • What you say to someone who has your heart",
    phrases: {
      "i love you": {
        target: "Te quiero / Te amo",
        romanized: "teh kyeh-roh",
        note: "Romantic • Start with 'Te quiero' before dropping 'Te amo'",
      },
      "you're cute": {
        target: "Eres muy lindo / linda",
        romanized: "eh-res mwee leen-doh",
        note: "Flirty • Casual • Instant smile guaranteed",
      },
      "coffee": {
        target: "¿Quieres tomar un café conmigo?",
        romanized: "kyeh-res toh-mar oon kah-feh kon-mee-goh",
        note: "First Date • Smooth • Low-pressure invite",
      },
    },
  },
  {
    code: "kr",
    flag: "🇰🇷",
    name: "Korean",
    locale: "ko-KR",
    ily: "사랑해 (Saranghae)",
    romanized: "sa-rang-hae",
    context: "Romantic • K-Drama Classic • Said to someone you're close to",
    phrases: {
      "i love you": {
        target: "사랑해 (Saranghae)",
        romanized: "sa-rang-hae",
        note: "Romantic • Informal • Use 사랑해요 (saranghaeyo) to be polite",
      },
      "you're cute": {
        target: "진짜 귀엽다 (Jinjja gwiyeopda)",
        romanized: "jin-jja gwi-yeop-da",
        note: "Flirty • Sweet • 'You are seriously cute'",
      },
      "coffee": {
        target: "우리 커피 마실래요?",
        romanized: "u-ri keo-pi ma-sil-lae-yo?",
        note: "Date Invite • Polite • 'Shall we grab coffee?'",
      },
    },
  },
  {
    code: "jp",
    flag: "🇯🇵",
    name: "Japanese",
    locale: "ja-JP",
    ily: "大好きだよ (Daisuki da yo)",
    romanized: "dai-su-ki da yo",
    context: "Romantic • Natural • How people actually confess in Japanese",
    phrases: {
      "i love you": {
        target: "大好きだよ (Daisuki da yo)",
        romanized: "dai-su-ki da yo",
        note: "Confession • Warm • More natural than 'Aishiteru'",
      },
      "you're cute": {
        target: "すごく可愛いね",
        romanized: "su-go-ku ka-wa-ii ne",
        note: "Compliment • Playful • 'You're super cute'",
      },
      "coffee": {
        target: "今度カフェ行かない？",
        romanized: "kon-do ka-fe i-ka-nai?",
        note: "Casual Date • 'Want to go to a café sometime?'",
      },
    },
  },
  {
    code: "fr",
    flag: "🇫🇷",
    name: "French",
    locale: "fr-FR",
    ily: "Je t'aime.",
    romanized: "zhuh tem",
    context: "Romantic • Iconic • Classic Parisian confession",
    phrases: {
      "i love you": {
        target: "Je t'aime",
        romanized: "zhuh tem",
        note: "Romantic • Classic • Add 'beaucoup' to keep it light",
      },
      "you're cute": {
        target: "Tu es vraiment mignon / mignonne",
        romanized: "too eh vreh-mohn mee-nyohn",
        note: "Charming • Sweet",
      },
      "coffee": {
        target: "On prend un café ensemble ?",
        romanized: "ohn prahn uhn kah-feh ahn-sahm-bluh",
        note: "Effortless • 'Shall we grab a coffee together?'",
      },
    },
  },
  {
    code: "it",
    flag: "🇮🇹",
    name: "Italian",
    locale: "it-IT",
    ily: "Ti voglio bene / Ti amo",
    romanized: "tee ah-moh",
    context: "Passionate • Expressive • Pure cinema",
    phrases: {
      "i love you": {
        target: "Ti amo",
        romanized: "tee ah-moh",
        note: "Deeply Romantic • Reserved for lovers",
      },
      "you're cute": {
        target: "Sei bellissimo / bellissima",
        romanized: "say bel-lees-see-mah",
        note: "Bold • 'You are gorgeous'",
      },
      "coffee": {
        target: "Ti va di prendere un caffè?",
        romanized: "tee vah dee pren-deh-reh oon kaf-feh",
        note: "Classic • 'Feel like grabbing an espresso?'",
      },
    },
  },
  {
    code: "de",
    flag: "🇩🇪",
    name: "German",
    locale: "de-DE",
    ily: "Ich hab dich lieb",
    romanized: "ikh hahb dikh leeb",
    context: "Sweet • Affectionate • Warm and genuine",
    phrases: {
      "i love you": {
        target: "Ich liebe dich",
        romanized: "ikh lee-beh dikh",
        note: "Strong • Sincere",
      },
      "you're cute": {
        target: "Du bist echt süß",
        romanized: "doo bist ekht zoos",
        note: "Flirty • 'You're really sweet/cute'",
      },
      "coffee": {
        target: "Wollen wir Kaffee trinken gehen?",
        romanized: "vol-len veer kah-feh trin-ken gay-en",
        note: "Date Invite • Direct & friendly",
      },
    },
  },
  {
    code: "hi",
    flag: "🇮🇳",
    name: "Hindi",
    locale: "hi-IN",
    ily: "मैं तुमसे प्यार करता हूँ (Main tumse pyaar karta hoon)",
    romanized: "main tum-se pyaar kar-ta/ti hoon",
    context: "Bollywood • Heartfelt • Unforgettable",
    phrases: {
      "i love you": {
        target: "मैं तुमसे प्यार करता हूँ",
        romanized: "main tumse pyaar karta/karti hoon",
        note: "Romantic • Classic Bollywood confession",
      },
      "you're cute": {
        target: "तुम बहुत प्यारे हो",
        romanized: "tum ba-hut pyaa-re ho",
        note: "Sweet • 'You are very lovely'",
      },
      "coffee": {
        target: "चाय या कॉफ़ी पर चलें?",
        romanized: "chai ya coffee par cha-lein?",
        note: "Smooth • 'Shall we go for chai or coffee?'",
      },
    },
  },
];

const QUICK_PROMPTS = [
  "I love you",
  "You're really cute",
  "Would you like to get coffee?",
  "I like talking to you",
  "Do you have plans this weekend?",
];

export default function MarketingPage() {
  const [selectedLang, setSelectedLang] = useState<CrushLang>(
    CRUSH_LANGUAGES[0]
  );
  const [query, setQuery] = useState("");
  const [practicedIly, setPracticedIly] = useState(false);

  const handleSelectCourseAndStart = async (langCode: string) => {
    // Map 'es' -> course 1, 'kr' -> course 2
    const targetCourseId = langCode === "kr" ? 2 : 1;
    try {
      await fetch("/api/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id":
            typeof window !== "undefined"
              ? window.localStorage.getItem("duolingo_user_id") || "1"
              : "1",
        },
        body: JSON.stringify({ active_course_id: targetCourseId }),
      });
    } catch {
      // ignore
    }
    window.location.href = "/learn";
  };

  const handlePracticeRecord = () => {
    speakText(selectedLang.ily, selectedLang.locale);
    setPracticedIly(true);
    toast.success(
      `❤️ +10 Rizz XP! Okay, Romeo. Now let's learn how to actually speak ${selectedLang.name}.`
    );
  };

  // Match query against custom phrases or show instant translation card
  const normalizedQ = query.toLowerCase();
  const matchedPhrase =
    normalizedQ.includes("cute") || normalizedQ.includes("beautiful")
      ? selectedLang.phrases["you're cute"]
      : normalizedQ.includes("coffee") ||
          normalizedQ.includes("weekend") ||
          normalizedQ.includes("out")
        ? selectedLang.phrases["coffee"]
        : selectedLang.phrases["i love you"];

  return (
    <div className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col items-center justify-center gap-10 px-4 py-8">
      {/* Hero Top Section */}
      <div className="flex w-full flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="relative flex flex-col items-center">
          <div className="relative h-[260px] w-[260px] overflow-hidden rounded-3xl border-2 border-pink-200 bg-white p-3 shadow-xl lg:h-[360px] lg:w-[360px]">
            <Image
              src="/logo.png"
              alt="Language ILY - Get your crush"
              fill
              className="object-contain p-2"
            />
          </div>
          <span className="mt-3 rounded-full border border-pink-200 bg-white px-4 py-1 text-xs font-extrabold text-rose-500 shadow-sm">
            ✨ Your crush won&apos;t learn your language. Probably.
          </span>
        </div>

        <div className="flex max-w-[540px] flex-col items-center gap-y-5 text-center lg:items-start lg:text-left">
          <div className="inline-flex items-center gap-x-2 rounded-full bg-rose-100 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#C81E3A]">
            <Heart className="h-3.5 w-3.5 fill-[#C81E3A]" />
            Romance • Texting • Real Fluency
          </div>

          <h1 className="text-3xl font-black tracking-tight text-neutral-900 lg:text-5xl">
            Language <span className="text-[#C81E3A]">ILY</span> ❤️
          </h1>

          <p className="font-script text-3xl text-[#C81E3A] lg:text-4xl">
            Who are you trying to impress?
          </p>

          <p className="text-base font-semibold text-neutral-600">
            Skip the boring textbook &ldquo;The boy eats an apple.&rdquo; Start
            with{" "}
            <span className="font-extrabold text-[#C81E3A]">
              &ldquo;I love you&rdquo;
            </span>
            , survive the coffee date, and actually master the language behind
            the rizz.
          </p>

          {/* Language Selector Pills */}
          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            {CRUSH_LANGUAGES.map((lang) => {
              const active = lang.code === selectedLang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLang(lang);
                    setPracticedIly(false);
                    speakText(lang.ily, lang.locale);
                  }}
                  className={cn(
                    "flex items-center gap-x-2 rounded-2xl border-2 border-b-4 px-3.5 py-2 text-sm font-extrabold transition active:border-b-2",
                    active
                      ? "border-[#C81E3A] bg-rose-50 text-[#C81E3A]"
                      : "border-pink-200 bg-white text-neutral-700 hover:bg-pink-50/60"
                  )}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="flex-1"
              onClick={() => handleSelectCourseAndStart(selectedLang.code)}
            >
              Start {selectedLang.name} Lesson 1: Make Your Intentions Clear ❤️
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive "Your First Phrase" + "What do you want to say?" Grid */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Your First Phrase ("I love you") */}
        <div className="flex flex-col justify-between rounded-3xl border-2 border-pink-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-rose-500">
                Your first {selectedLang.name} phrase
              </span>
              <span className="font-script text-xl font-bold text-[#C81E3A]">
                Lesson 01 ♡
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border-2 border-rose-100 bg-[#FFF9FA] p-4">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  ❤️ &ldquo;I love you.&rdquo;
                </p>
                <p className="mt-1 text-2xl font-black text-neutral-900">
                  {selectedLang.ily}
                </p>
                <p className="text-sm font-bold italic text-rose-500">
                  /{selectedLang.romanized}/
                </p>
              </div>

              <button
                type="button"
                onClick={() => speakText(selectedLang.ily, selectedLang.locale)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#C81E3A] to-rose-500 text-white shadow transition hover:opacity-90"
                title="Listen to pronunciation"
              >
                <Volume2 className="h-6 w-6" />
              </button>
            </div>

            <p className="text-xs font-extrabold text-slate-500">
              {selectedLang.context}
            </p>
          </div>

          <div className="mt-5 space-y-3 border-t border-pink-100 pt-4">
            {!practicedIly ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full gap-x-2"
                onClick={handlePracticeRecord}
              >
                <Mic className="h-5 w-5" />
                Say it yourself →
              </Button>
            ) : (
              <div className="space-y-2 rounded-2xl border-2 border-rose-200 bg-rose-50/70 p-3.5">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#C81E3A]">
                  <span>You learned this: ❤️ &ldquo;I love you.&rdquo;</span>
                  <span>Confidence: ███████░░░ 78%</span>
                </div>
                <p className="text-sm font-black text-neutral-800">
                  Okay, Romeo. Now let&apos;s learn how to actually speak{" "}
                  {selectedLang.name}.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-1 w-full"
                  onClick={() => handleSelectCourseAndStart(selectedLang.code)}
                >
                  Continue to the {selectedLang.name} Skill Tree →
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: "What do you want to say?" Giant Search Box */}
        <div className="flex flex-col justify-between rounded-3xl border-2 border-pink-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-neutral-900">
                &ldquo;What do you want to say?&rdquo;
              </h2>
              <Sparkles className="h-5 w-5 text-rose-500" />
            </div>

            <div className="relative">
              <Search className="Left-4 absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type what you want to text your crush..."
                className="w-full rounded-2xl border-2 border-pink-200 bg-[#FFF9FA] py-3.5 pl-12 pr-4 text-base font-bold text-neutral-800 placeholder:text-rose-300 focus:border-[#C81E3A] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Quick Romantic / Crush Chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setQuery(p)}
                  className="rounded-xl border border-pink-200 bg-rose-50/60 px-2.5 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                >
                  &ldquo;{p}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Instant Result Preview */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border-2 border-pink-100 bg-[#FFF9FA] p-4">
            <div className="space-y-0.5">
              <p className="text-xs font-extrabold uppercase text-rose-400">
                {selectedLang.flag} {selectedLang.name} Crush Line
              </p>
              <p className="text-lg font-black text-neutral-900">
                {matchedPhrase.target}
              </p>
              <p className="text-xs font-bold text-slate-500">
                {matchedPhrase.note}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                speakText(matchedPhrase.target, selectedLang.locale)
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-[#C81E3A] transition hover:bg-rose-200"
              title="Listen"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
