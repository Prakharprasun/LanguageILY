"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePracticeModal } from "@/store/use-practice-modal";

export const PracticeModal = () => {
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = usePracticeModal();

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
            Warm-Up Practice ❤️
          </DialogTitle>

          <DialogDescription className="text-center text-base font-medium">
            Practice rounds sharpen your lines and win back +1 Heart & +5 XP.
            You never lose hearts in practice mode!
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mb-4">
          <div className="flex w-full flex-col gap-y-4">
            <Button
              variant="secondary"
              className="w-full"
              size="lg"
              onClick={close}
            >
              Let&apos;s practice →
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
