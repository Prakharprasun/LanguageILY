"use client";

import { use, useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiFetch, type SessionStartPayload } from "@/lib/api";
import { useHeartsModal } from "@/store/use-hearts-modal";

import { Quiz } from "../quiz";

type LessonIdPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

const LessonIdPage = ({ params }: LessonIdPageProps) => {
  const { lessonId } = use(params);
  const router = useRouter();
  const { open: openHeartsModal } = useHeartsModal();

  const [sessionData, setSessionData] = useState<SessionStartPayload | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const payload = await apiFetch<SessionStartPayload>(
          `/api/lessons/${Number(lessonId)}/sessions`,
          { method: "POST" }
        );
        if (mounted) setSessionData(payload);
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
  }, [lessonId, router, openHeartsModal]);

  if (loading || !sessionData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return <Quiz initialSession={sessionData} />;
};

export default LessonIdPage;
