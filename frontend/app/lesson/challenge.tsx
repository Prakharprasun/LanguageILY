import type { ExerciseOption } from "@/lib/api";
import { cn } from "@/lib/utils";

import { Card } from "./card";

type ChallengeProps = {
  options: ExerciseOption[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  type: "SELECT" | "ASSIST";
  speechLocale?: string;
};

export const Challenge = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  type,
  speechLocale = "es-ES",
}: ChallengeProps) => {
  return (
    <div
      className={cn(
        "grid gap-2",
        type === "ASSIST" && "grid-cols-1",
        type === "SELECT" &&
          "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
      )}
    >
      {options.map((option, i) => (
        <Card
          key={option.id}
          id={option.id}
          text={option.text}
          imageSrc={option.image_src}
          shortcut={`${i + 1}`}
          selected={selectedOption === option.id}
          onClick={() => onSelect(option.id)}
          status={status}
          audioSrc={option.audio_src}
          disabled={disabled}
          type={type}
          speechLocale={speechLocale}
        />
      ))}
    </div>
  );
};
