import Image from "next/image";

type QuestionBubbleProps = {
  question: string;
};

export const QuestionBubble = ({ question }: QuestionBubbleProps) => {
  return (
    <div className="mb-6 flex items-center gap-x-4">
      <Image
        src="/logo.png"
        alt="Language ILY"
        height={60}
        width={60}
        className="hidden rounded-xl object-contain lg:block"
      />
      <Image
        src="/logo.png"
        alt="Language ILY"
        height={40}
        width={40}
        className="block rounded-xl object-contain lg:hidden"
      />

      <div className="relative rounded-xl border-2 border-pink-200 bg-white px-4 py-2 text-sm font-bold lg:text-base">
        {question}

        <div
          className="absolute -left-3 top-1/2 h-0 w-0 -translate-y-1/2 rotate-90 transform border-x-8 border-t-8 border-x-transparent"
          aria-hidden
        />
      </div>
    </div>
  );
};
