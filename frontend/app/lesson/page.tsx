"use client";

import { Suspense, useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  apiFetch,
  type LearningPath,
  type SessionStartPayload,
} from "@/lib/api";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { usePracticeModal } from "@/store/use-practice-modal";

import { Quiz } from "./quiz";

const LessonContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const skillIdParam = searchParams.get("skillId");

  const { open: openHeartsModal } = useHeartsModal();
  const { open: openPracticeModal } = usePracticeModal();

  const [sessionData, setSessionData] = useState<SessionStartPayload | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        if (mode === "practice") {
          const payload = await apiFetch<SessionStartPayload>(
            "/api/practice/sessions",
            {
              method: "POST",
              body: JSON.stringify({
                skill_id: skillIdParam ? Number(skillIdParam) : null,
              }),
            }
          );
          if (mounted) {
            setSessionData(payload);
            openPracticeModal();
          }
        } else {
          const path = await apiFetch<LearningPath>("/api/path");
          const targetLessonId =
            path.active_lesson_id || path.units[0]?.skills[0]?.lesson_ids[0];
          if (!targetLessonId) {
            router.push("/learn");
            return;
          }
          const payload = await apiFetch<SessionStartPayload>(
            `/api/lessons/${targetLessonId}/sessions`,
            { method: "POST" }
          );
          if (mounted) setSessionData(payload);
        }
      } catch (err: unknown) {
        const error = err as Error & { code?: string };
        if (error?.code === "out_of_hearts") {
          openHeartsModal();
          router.push("/learn");
        } else {
          toast.error(error?.message || "Could not start lesson.");
          router.push("/learn");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void init();
    return () => {
      mounted = false;
    };
  }, [mode, skillIdParam, router, openHeartsModal, openPracticeModal]);

  if (loading || !sessionData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return <Quiz initialSession={sessionData} />;
};

const LessonPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-green-500" />
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
};

export default LessonPage;
