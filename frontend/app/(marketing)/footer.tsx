import Image from "next/image";

import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <div className="hidden h-20 w-full border-t-2 border-pink-100 bg-[#FFF9FA] p-2 lg:block">
      <div className="mx-auto flex h-full max-w-screen-lg items-center justify-evenly">
        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Image
            src="/kr.svg"
            alt="Korean"
            height={32}
            width={40}
            className="mr-4 rounded-md border"
          />
          Korean
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Image
            src="/es.svg"
            alt="Spanish"
            height={32}
            width={40}
            className="mr-4 rounded-md border"
          />
          Spanish
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Image
            src="/jp.svg"
            alt="Japanese"
            height={32}
            width={40}
            className="mr-4 rounded-md border"
          />
          Japanese
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Image
            src="/fr.svg"
            alt="French"
            height={32}
            width={40}
            className="mr-4 rounded-md border"
          />
          French
        </Button>

        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Image
            src="/it.svg"
            alt="Italian"
            height={32}
            width={40}
            className="mr-4 rounded-md border"
          />
          Italian
        </Button>
      </div>
    </div>
  );
};
