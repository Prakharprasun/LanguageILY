"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { useAudio, useWindowSize } from "react-use";
import { toast } from "sonner";

import {
  apiFetch,
  speakText,
  type AnswerResponse,
  type Exercise,
  type SessionCompleteResponse,
  type SessionStartPayload,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { useHeartsModal } from "@/store/use-hearts-modal";

import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { Header } from "./header";
import { ResultCard } from "./result-card";

type QuizProps = {
  initialSession: SessionStartPayload;
};

export const Quiz = ({ initialSession }: QuizProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [incorrectAudio, _i, incorrectControls] = useAudio({
    src: "/incorrect.wav",
  });
  const [finishAudio] = useAudio({
    src: "/finish.mp3",
    autoPlay: true,
  });
  const { width, height } = useWindowSize();
  const router = useRouter();
  const { open: openHeartsModal } = useHeartsModal();

  const [session] = useState(initialSession.session);
  const [exercises, setExercises] = useState<Exercise[]>(
    initialSession.exercises
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [hearts, setHearts] = useState(initialSession.hearts);
  const [pending, setPending] = useState(false);

  // Per-exercise interactive state
  const [selectedOption, setSelectedOption] = useState<number>();
  const [selectedTileIds, setSelectedTileIds] = useState<number[]>([]);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedLeftPair, setSelectedLeftPair] = useState<number | null>(null);
  const [selectedRightPair, setSelectedRightPair] = useState<number | null>(
    null
  );
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [wrongPairFlash, setWrongPairFlash] = useState(false);

  const [status, setStatus] = useState<"none" | "wrong" | "correct">("none");
  const [lastFeedback, setLastFeedback] = useState<{
    solution: string;
    note: string | null;
  }>({ solution: "", note: null });

  const [completionSummary, setCompletionSummary] =
    useState<SessionCompleteResponse | null>(null);

  const exercise = exercises[activeIndex];
  const percentage =
    exercises.length === 0
      ? 0
      : Math.round((activeIndex / exercises.length) * 100);

  const resetExerciseState = () => {
    setSelectedOption(undefined);
    setSelectedTileIds([]);
    setTypedAnswer("");
    setSelectedLeftPair(null);
    setSelectedRightPair(null);
    setMatchedPairIds([]);
    setStatus("none");
    setLastFeedback({ solution: "", note: null });
  };

  // Handle tapping a pair card in MATCH_PAIRS
  const handleSelectPairCard = (side: "left" | "right", id: number) => {
    if (status !== "none" || matchedPairIds.includes(id) || wrongPairFlash)
      return;

    if (side === "left") {
      const item = exercise?.pairs?.left.find((l) => l.id === id);
      if (item) speakText(item.text, initialSession.speech_locale);
      const nextLeft = selectedLeftPair === id ? null : id;
      setSelectedLeftPair(nextLeft);
      if (nextLeft !== null && selectedRightPair !== null) {
        checkPairMatch(nextLeft, selectedRightPair);
      }
    } else {
      const nextRight = selectedRightPair === id ? null : id;
      setSelectedRightPair(nextRight);
      if (selectedLeftPair !== null && nextRight !== null) {
        checkPairMatch(selectedLeftPair, nextRight);
      }
    }
  };

  const checkPairMatch = (leftId: number, rightId: number) => {
    if (leftId === rightId) {
      setMatchedPairIds((prev) => [...prev, leftId]);
      setSelectedLeftPair(null);
      setSelectedRightPair(null);
    } else {
      setWrongPairFlash(true);
      setTimeout(() => {
        setSelectedLeftPair(null);
        setSelectedRightPair(null);
        setWrongPairFlash(false);
      }, 450);
    }
  };

  // Build answer string for current exercise
  const buildAnswerPayload = (): string | null => {
    if (!exercise) return null;
    switch (exercise.type) {
      case "MULTIPLE_CHOICE":
      case "FILL_BLANK":
        return selectedOption !== undefined ? String(selectedOption) : null;
      case "TRANSLATE": {
        if (selectedTileIds.length === 0) return null;
        const words = selectedTileIds
          .map((id) => exercise.tiles.find((t) => t.id === id)?.text || "")
          .filter(Boolean);
        return words.join(" ");
      }
      case "TYPE_ANSWER":
        return typedAnswer.trim().length > 0 ? typedAnswer.trim() : null;
      case "MATCH_PAIRS": {
        const totalPairs = exercise.pairs?.left.length || 0;
        if (matchedPairIds.length < totalPairs) return null;
        return JSON.stringify(matchedPairIds.map((id) => [id, id]));
      }
    }
  };

  const canCheck = status !== "none" || buildAnswerPayload() !== null;

  const onContinue = async () => {
    if (!exercise || pending) return;

    // Advancing after feedback
    if (status === "correct" || status === "wrong") {
      // If wrong, re-queue the exercise at the end of the lesson so every exercise is mastered
      let updatedExercises = exercises;
      if (status === "wrong") {
        updatedExercises = [...exercises, exercise];
        setExercises(updatedExercises);
      }

      const nextIndex = activeIndex + 1;
      resetExerciseState();

      if (nextIndex >= updatedExercises.length) {
        // Complete the session on the backend
        setPending(true);
        try {
          const summary = await apiFetch<SessionCompleteResponse>(
            `/api/sessions/${session.id}/complete`,
            { method: "POST" }
          );
          setCompletionSummary(summary);
          setActiveIndex(nextIndex);
        } catch (err: unknown) {
          toast.error((err as Error)?.message || "Could not finish lesson.");
        } finally {
          setPending(false);
        }
      } else {
        setActiveIndex(nextIndex);
      }
      return;
    }

    const answer = buildAnswerPayload();
    if (answer === null) return;

    setPending(true);
    try {
      const res = await apiFetch<AnswerResponse>(
        `/api/sessions/${session.id}/answers`,
        {
          method: "POST",
          body: JSON.stringify({
            exercise_id: exercise.id,
            answer,
          }),
        }
      );

      setHearts(res.hearts);
      setLastFeedback({ solution: res.solution, note: res.note });

      if (res.correct) {
        void correctControls.play();
        setStatus("correct");
      } else {
        void incorrectControls.play();
        setStatus("wrong");
        if (res.session_status === "failed") {
          openHeartsModal();
        }
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  // Completed Lesson Celebration Screen
  if (!exercise || completionSummary) {
    const xpEarned = completionSummary?.xp_earned ?? 15;
    const accuracy = completionSummary?.accuracy ?? 100;

    return (
      <>
        {finishAudio}
        <Confetti
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10_000}
          width={width}
          height={height}
        />
        <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-y-4 px-6 text-center lg:gap-y-6">
          <Image
            src="/logo.png"
            alt="Language ILY"
            height={110}
            width={110}
            className="rounded-2xl object-contain"
          />

          <h1 className="text-xl font-black text-neutral-800 lg:text-3xl">
            Okay, Romeo. Lesson complete! ❤️ <br />
            <span className="font-script text-2xl font-bold text-[#C81E3A]">
              {completionSummary?.streak_extended
                ? `🔥 ${completionSummary.streak}-day crush streak extended!`
                : `Fluency looks good on you — ${session.skill_title} mastered!`}
            </span>
          </h1>

          {/* Social-Media-Style Confidence Card */}
          <div className="w-full rounded-2xl border-2 border-pink-200 bg-white p-4 text-left shadow-sm">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-rose-500">
              <span>You learned this ❤️</span>
              <span>Want to try something harder?</span>
            </div>
            <p className="mt-1 text-base font-extrabold text-neutral-800">
              Stage unlocked: {session.skill_title}
            </p>
            <div className="mt-2 flex items-center justify-between font-mono text-xs font-extrabold text-[#C81E3A]">
              <span>Confidence: ████████░░ {accuracy}%</span>
              <span>+{xpEarned} Rizz XP</span>
            </div>
          </div>

          <div className="flex w-full items-center gap-x-4">
            <ResultCard variant="points" value={xpEarned} />
            <ResultCard variant="hearts" value={hearts} />
          </div>

          <div className="flex w-full items-center justify-around rounded-2xl border-2 border-pink-100 bg-rose-50/50 p-3.5 text-sm font-extrabold text-neutral-700">
            <div>Accuracy: {accuracy}%</div>
            {completionSummary?.bonus_xp ? (
              <div className="text-[#C81E3A]">
                +{completionSummary.bonus_xp} Flawless Rizz Bonus!
              </div>
            ) : null}
            {completionSummary?.quests_completed?.length ? (
              <div className="text-pink-600">
                +{completionSummary.quests_completed[0].gem_reward} Gems (Quest)
              </div>
            ) : null}
          </div>
        </div>

        <Footer
          lessonId={session.lesson_id}
          status="completed"
          onCheck={() => router.push("/learn")}
        />
      </>
    );
  }

  const courseTitle = session.course_title || "Spanish";
  // Heading title per exercise type
  const headingByType: Record<Exercise["type"], string> = {
    MULTIPLE_CHOICE: exercise.prompt,
    TRANSLATE:
      exercise.prompt_lang === "target"
        ? "Write this in English"
        : `Write this in ${courseTitle}`,
    MATCH_PAIRS: "Tap the matching pairs",
    FILL_BLANK: "Complete the sentence",
    TYPE_ANSWER:
      exercise.prompt_lang === "target"
        ? "Type this in English"
        : `Type this in ${courseTitle}`,
  };

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={false}
      />

      <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-8 px-6 lg:min-h-[380px] lg:w-[640px] lg:px-0">
            {/* Exercise Type Pill */}
            <div className="flex items-center gap-x-2">
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#C81E3A]">
                {exercise.type.replace("_", " ")}
              </span>
              <span className="text-xs font-bold text-rose-400">
                {session.skill_title} ❤️
              </span>
            </div>

            <h1 className="text-center text-xl font-extrabold text-neutral-800 lg:text-start lg:text-3xl">
              {headingByType[exercise.type]}
            </h1>

            {/* Prompt Bubble with Interactive Hover Word Hints & TTS Audio */}
            {(exercise.type === "TRANSLATE" ||
              exercise.type === "TYPE_ANSWER") && (
              <div className="flex items-center gap-x-4">
                <Image
                  src="/logo.png"
                  alt="Language ILY"
                  height={64}
                  width={64}
                  className="shrink-0 rounded-2xl object-contain"
                />
                <div className="relative flex items-center gap-x-3 rounded-2xl border-2 border-pink-200 bg-white px-5 py-3.5 shadow-sm">
                  {exercise.prompt_lang === "target" && (
                    <button
                      type="button"
                      onClick={() =>
                        speakText(exercise.prompt, initialSession.speech_locale)
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#C81E3A] to-rose-500 text-white transition hover:opacity-90"
                      title="Listen"
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>
                  )}
                  <div className="flex flex-wrap gap-x-1.5 text-base font-bold text-neutral-800 lg:text-lg">
                    {exercise.hints.length > 0
                      ? exercise.hints.map((seg, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              "group relative",
                              seg.hint &&
                                "cursor-help border-b-2 border-dotted border-rose-400"
                            )}
                          >
                            {seg.text}
                            {seg.hint && (
                              <span className="pointer-events-none absolute -top-9 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#C81E3A] px-2.5 py-1 text-xs font-bold text-white shadow group-hover:block">
                                {seg.hint}
                              </span>
                            )}
                          </span>
                        ))
                      : exercise.prompt}
                  </div>
                </div>
              </div>
            )}

            {/* 1. MULTIPLE_CHOICE */}
            {exercise.type === "MULTIPLE_CHOICE" && (
              <Challenge
                options={exercise.options}
                onSelect={(id) => {
                  if (status === "none") setSelectedOption(id);
                }}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type="SELECT"
                speechLocale={initialSession.speech_locale}
              />
            )}

            {/* 2. TRANSLATE (Word Bank / Tap the words) */}
            {exercise.type === "TRANSLATE" && (
              <div className="space-y-6">
                {/* Answer Line */}
                <div className="flex min-h-[68px] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-pink-300 bg-rose-50/40 p-3">
                  {selectedTileIds.length === 0 && (
                    <span className="text-sm font-semibold text-rose-400">
                      Tap the words below to craft your message...
                    </span>
                  )}
                  {selectedTileIds.map((id) => {
                    const tile = exercise.tiles.find((t) => t.id === id);
                    if (!tile) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={status !== "none"}
                        onClick={() =>
                          setSelectedTileIds((prev) =>
                            prev.filter((item) => item !== id)
                          )
                        }
                        className="rounded-xl border-2 border-b-4 border-rose-300 bg-white px-4 py-2 text-base font-bold text-neutral-800 shadow-sm transition active:border-b-2"
                      >
                        {tile.text}
                      </button>
                    );
                  })}
                </div>

                {/* Word Bank Tiles */}
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {exercise.tiles.map((tile) => {
                    const used = selectedTileIds.includes(tile.id);
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        disabled={used || status !== "none"}
                        onClick={() => {
                          if (exercise.prompt_lang === "source") {
                            speakText(tile.text, initialSession.speech_locale);
                          }
                          setSelectedTileIds((prev) => [...prev, tile.id]);
                        }}
                        className={cn(
                          "rounded-xl border-2 border-b-4 px-4 py-2 text-base font-bold transition",
                          used
                            ? "border-pink-100 bg-pink-100 text-transparent"
                            : "border-pink-200 bg-white text-neutral-800 hover:bg-rose-50 active:border-b-2"
                        )}
                      >
                        {tile.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. MATCH_PAIRS */}
            {exercise.type === "MATCH_PAIRS" && exercise.pairs && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-y-2.5">
                  {exercise.pairs.left.map((item) => {
                    const matched = matchedPairIds.includes(item.id);
                    const selected = selectedLeftPair === item.id;
                    return (
                      <button
                        key={`left-${item.id}`}
                        type="button"
                        disabled={matched || status !== "none"}
                        onClick={() => handleSelectPairCard("left", item.id)}
                        className={cn(
                          "rounded-xl border-2 border-b-4 p-3.5 text-center text-base font-bold transition",
                          matched &&
                            "border-pink-200 bg-rose-50/50 text-pink-300",
                          !matched &&
                            selected &&
                            !wrongPairFlash &&
                            "border-[#C81E3A] bg-rose-100 text-[#C81E3A]",
                          !matched &&
                            selected &&
                            wrongPairFlash &&
                            "border-rose-500 bg-rose-200 text-rose-700",
                          !matched &&
                            !selected &&
                            "border-pink-200 bg-white text-neutral-800 hover:bg-rose-50/60"
                        )}
                      >
                        {item.text}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-y-2.5">
                  {exercise.pairs.right.map((item) => {
                    const matched = matchedPairIds.includes(item.id);
                    const selected = selectedRightPair === item.id;
                    return (
                      <button
                        key={`right-${item.id}`}
                        type="button"
                        disabled={matched || status !== "none"}
                        onClick={() => handleSelectPairCard("right", item.id)}
                        className={cn(
                          "rounded-xl border-2 border-b-4 p-3.5 text-center text-base font-bold transition",
                          matched &&
                            "border-pink-200 bg-rose-50/50 text-pink-300",
                          !matched &&
                            selected &&
                            !wrongPairFlash &&
                            "border-[#C81E3A] bg-rose-100 text-[#C81E3A]",
                          !matched &&
                            selected &&
                            wrongPairFlash &&
                            "border-rose-500 bg-rose-200 text-rose-700",
                          !matched &&
                            !selected &&
                            "border-pink-200 bg-white text-neutral-800 hover:bg-rose-50/60"
                        )}
                      >
                        {item.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. FILL_BLANK */}
            {exercise.type === "FILL_BLANK" && (
              <div className="space-y-6">
                <div className="rounded-2xl border-2 border-pink-200 bg-white p-5">
                  <p className="text-xl font-extrabold text-neutral-800">
                    {exercise.prompt.split("___").map((part, i, arr) => {
                      const chosenText = exercise.options.find(
                        (o) => o.id === selectedOption
                      )?.text;
                      return (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="mx-1.5 inline-block min-w-[84px] border-b-4 border-[#C81E3A] px-2 text-center text-[#C81E3A]">
                              {chosenText || "____"}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </p>
                  {exercise.translation && (
                    <p className="mt-2 text-sm font-semibold text-rose-500">
                      {exercise.translation}
                    </p>
                  )}
                </div>

                <Challenge
                  options={exercise.options}
                  onSelect={(id) => {
                    if (status === "none") setSelectedOption(id);
                  }}
                  status={status}
                  selectedOption={selectedOption}
                  disabled={pending}
                  type="ASSIST"
                  speechLocale={initialSession.speech_locale}
                />
              </div>
            )}

            {/* 5. TYPE_ANSWER */}
            {exercise.type === "TYPE_ANSWER" && (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  disabled={status !== "none"}
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder={
                    exercise.prompt_lang === "target"
                      ? "Type the English meaning..."
                      : `Type in ${courseTitle} for your crush...`
                  }
                  className="w-full resize-none rounded-2xl border-2 border-pink-200 bg-white p-4 text-lg font-bold text-neutral-800 focus:border-[#C81E3A] focus:outline-none"
                />
                {exercise.prompt_lang === "source" && (
                  <div className="flex flex-wrap gap-1.5">
                    {(initialSession.speech_locale.startsWith("ko")
                      ? [
                          "사랑해",
                          "자기야",
                          "너무",
                          "진짜",
                          "좋아해요",
                          "커피",
                          "오늘",
                          "우리",
                        ]
                      : ["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"]
                    ).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        disabled={status !== "none"}
                        onClick={() =>
                          setTypedAnswer((prev) =>
                            ch.length > 1
                              ? `${prev}${prev.endsWith(" ") || !prev ? "" : " "}${ch}`
                              : prev + ch
                          )
                        }
                        className="rounded-lg border-2 border-b-4 border-pink-200 bg-white px-3 py-1 text-sm font-extrabold text-[#C81E3A] hover:bg-rose-50"
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer
        disabled={pending || !canCheck}
        status={status}
        solution={lastFeedback.solution}
        note={lastFeedback.note}
        onCheck={onContinue}
      />
    </>
  );
};
