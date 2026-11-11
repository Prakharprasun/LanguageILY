"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useKey, useMedia } from "react-use";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FooterProps = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number | null;
  solution?: string;
  note?: string | null;
};

export const Footer = ({
  onCheck,
  status,
  disabled,
  lessonId,
  solution,
  note,
}: FooterProps) => {
  const router = useRouter();

  useKey("Enter", onCheck, {}, [onCheck]);
  const isMobile = useMedia("(max-width: 1024px)", false);

  return (
    <footer
      className={cn(
        "h-[100px] border-t-2 lg:h-[140px]",
        status === "correct" && "border-transparent bg-green-100",
        status === "wrong" && "border-transparent bg-rose-100"
      )}
    >
      <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-6 lg:px-10">
        {status === "correct" && (
          <div className="flex items-center text-base font-bold text-green-600 lg:text-2xl">
            <CheckCircle className="mr-4 h-6 w-6 shrink-0 lg:h-10 lg:w-10" />
            <div>
              <div>Nicely done!</div>
              {note && (
                <div className="text-xs font-semibold text-green-700 lg:text-sm">
                  {note}
                </div>
              )}
            </div>
          </div>
        )}

        {status === "wrong" && (
          <div className="flex items-center text-base font-bold text-rose-600 lg:text-2xl">
            <XCircle className="mr-4 h-6 w-6 shrink-0 lg:h-10 lg:w-10" />
            <div>
              <div>Correct solution:</div>
              <div className="text-sm font-extrabold text-rose-700 lg:text-lg">
                {solution || "Try again."}
              </div>
            </div>
          </div>
        )}

        {status === "completed" && (
          <Button
            variant="default"
            size={isMobile ? "sm" : "lg"}
            onClick={() =>
              router.push(lessonId ? `/lesson/${lessonId}` : "/lesson?mode=practice")
            }
          >
            Practice again
          </Button>
        )}

        <Button
          disabled={disabled}
          aria-disabled={disabled}
          className="ml-auto"
          onClick={onCheck}
          size={isMobile ? "sm" : "lg"}
          variant={status === "wrong" ? "danger" : "secondary"}
        >
          {status === "none" && "Check"}
          {status === "correct" && "Continue"}
          {status === "wrong" && "Got it"}
          {status === "completed" && "Continue"}
        </Button>
      </div>
    </footer>
  );
};
