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
import { useExitModal } from "@/store/use-exit-modal";

export const ExitModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useExitModal();

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
            Wait, don&apos;t ghost your crush! ❤️
          </DialogTitle>

          <DialogDescription className="text-center text-base font-medium">
            You&apos;re about to leave the lesson. Your rizz progress in this
            round won&apos;t be saved.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mb-4">
          <div className="flex w-full flex-col gap-y-3">
            <Button
              variant="secondary"
              className="w-full"
              size="lg"
              onClick={close}
            >
              Keep learning ❤️
            </Button>

            <Button
              variant="dangerOutline"
              className="w-full"
              size="lg"
              onClick={() => {
                close();
                router.push("/learn");
              }}
            >
              End session
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
