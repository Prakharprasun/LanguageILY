"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="h-20 w-full border-b-2 border-pink-100 bg-[#FFF9FA] px-4">
      <div className="mx-auto flex h-full items-center justify-between lg:max-w-screen-lg">
        <Link href="/" className="flex items-center gap-x-3 pl-2">
          <Image
            src="/logo.png"
            alt="Language ILY"
            height={48}
            width={48}
            className="rounded-xl object-contain"
          />

          <div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900">
              Language <span className="text-[#C81E3A]">ILY</span> ❤️
            </h1>
            <p className="font-script text-sm leading-none text-rose-600">
              Learn the language. Get the crush.
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-x-3">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/learn">Start Rizzing →</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
