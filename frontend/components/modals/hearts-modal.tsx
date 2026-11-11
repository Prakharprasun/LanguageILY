"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHeartsModal } from "@/store/use-hearts-modal";

export const HeartsModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useHeartsModal();

  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-4 flex w-full items-center justify-center">
            <Image
              src="/logo.png"
              alt="Language ILY"
              height={96}
              width={96}
              className="rounded-2xl object-contain"
            />
          </div>

          <DialogTitle className="text-center text-2xl font-black">
            Heartbroken! Out of hearts 💔
          </DialogTitle>

          <DialogDescription className="text-center text-base font-medium">
            Practice earlier skills to win a heart back for free, or refill your
            hearts in the shop.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mb-4">
          <div className="flex w-full flex-col gap-y-3">
            <Button
              variant="secondary"
              className="w-full"
              size="lg"
              onClick={() => {
                close();
                router.push("/lesson?mode=practice");
              }}
            >
              Practice to earn +1 Heart ❤️
            </Button>

            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={() => {
                close();
                router.push("/shop");
              }}
            >
              Refill Hearts in Shop
            </Button>

            <Button
              variant="primaryOutline"
              className="w-full"
              size="lg"
              onClick={() => {
                close();
                router.push("/learn");
              }}
            >
              Back to Path
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
