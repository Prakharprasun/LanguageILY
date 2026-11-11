import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const Promo = () => {
  return (
    <div className="space-y-3 rounded-2xl border-2 border-pink-200 bg-white p-4 shadow-sm">
      <div className="space-y-1.5">
        <div className="flex items-center gap-x-2.5">
          <Image
            src="/logo.png"
            alt="Language ILY"
            height={36}
            width={36}
            className="rounded-lg object-contain"
          />

          <div>
            <h3 className="text-base font-black text-neutral-900">
              Super ILY ❤️
            </h3>
            <p className="font-script text-sm text-[#C81E3A]">
              Unlimited hearts. Unlimited rizz.
            </p>
          </div>
        </div>

        <p className="text-xs font-semibold text-muted-foreground">
          Never run out of hearts before the big date.
        </p>
      </div>

      <Button variant="super" className="w-full" size="default" asChild>
        <Link href="/shop">Unlock in Shop</Link>
      </Button>
    </div>
  );
};
