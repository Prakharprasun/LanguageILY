"use client";

import { useState } from "react";
import { Gem, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiFetch, type ShopCatalog } from "@/lib/api";

type ItemsProps = {
  catalog: ShopCatalog;
  onPurchased: () => void;
};

export const Items = ({ catalog, onPurchased }: ItemsProps) => {
  const [pending, setPending] = useState(false);

  const handlePurchase = async (itemId: "refill_hearts" | "streak_freeze") => {
    if (pending) return;
    setPending(true);
    try {
      await apiFetch("/api/shop/purchases", {
        method: "POST",
        body: JSON.stringify({ item_id: itemId }),
      });
      toast.success(
        itemId === "refill_hearts"
          ? "Hearts refilled to full!"
          : "Streak Freeze equipped!"
      );
      onPurchased();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Could not complete purchase.");
    } finally {
      setPending(false);
    }
  };

  return (
    <ul className="w-full space-y-4">
      {catalog.items.map((item) => {
        const isHeart = item.id === "refill_hearts";
        return (
          <li
            key={item.id}
            className="flex w-full items-center gap-x-4 rounded-2xl border-2 p-5"
          >
            {isHeart ? (
              <Image src="/heart.svg" alt="Heart" height={60} width={60} />
            ) : (
              <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-500">
                <ShieldCheck className="h-9 w-9" />
              </div>
            )}

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-x-2">
                <p className="text-base font-extrabold text-neutral-700 lg:text-xl">
                  {item.title}
                </p>
                {item.status && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-extrabold text-slate-600">
                    {item.status}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-500">
                {item.description}
              </p>
            </div>

            <Button
              onClick={() => handlePurchase(item.id)}
              disabled={pending || !item.available || catalog.gems < item.cost}
            >
              {!item.available ? (
                item.status || "Full"
              ) : (
                <div className="flex items-center gap-x-1.5">
                  <Gem className="h-4 w-4 fill-sky-400 text-sky-500" />
                  <span>{item.cost}</span>
                </div>
              )}
            </Button>
          </li>
        );
      })}

      {/* Mocked Super Duolingo Placeholder */}
      <li className="flex w-full items-center gap-x-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 p-5">
        <Image src="/unlimited.svg" alt="Unlimited" height={60} width={60} />

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-x-2">
            <p className="text-base font-extrabold text-indigo-900 lg:text-xl">
              Super Lingo (Unlimited Hearts)
            </p>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-extrabold uppercase text-indigo-600">
              Mocked
            </span>
          </div>
          <p className="text-sm font-medium text-indigo-700/80">
            Ad-free learning, unlimited hearts, and personalized practice.
          </p>
        </div>

        <Button
          variant="super"
          onClick={() =>
            toast.info(
              "Super Lingo subscriptions are coming soon! Use Practice or Gems to refill hearts."
            )
          }
        >
          Coming Soon
        </Button>
      </li>
    </ul>
  );
};
