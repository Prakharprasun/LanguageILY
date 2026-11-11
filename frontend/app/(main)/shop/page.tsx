"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader } from "lucide-react";
import Image from "next/image";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import {
  apiFetch,
  type QuestItem,
  type ShopCatalog,
  type UserSummary,
} from "@/lib/api";

import { Items } from "./items";

const ShopPage = () => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [shop, setShop] = useState<ShopCatalog | null>(null);
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [meData, shopData, questsData] = await Promise.all([
        apiFetch<UserSummary>("/api/me"),
        apiFetch<ShopCatalog>("/api/shop"),
        apiFetch<QuestItem[]>("/api/quests"),
      ]);
      setUser(meData);
      setShop(shopData);
      setQuests(questsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading || !user || !shop) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6 pb-16">
      <StickyWrapper>
        <UserProgress user={user} onRefresh={loadData} />
        <Quests quests={quests} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <Image src="/shop.svg" alt="Shop" height={90} width={90} />

          <h1 className="my-6 text-center text-2xl font-extrabold text-neutral-800">
            Shop
          </h1>
          <p className="mb-6 text-center text-lg font-medium text-muted-foreground">
            Spend your gems on heart refills and streak freezes.
          </p>

          <Items catalog={shop} onPurchased={loadData} />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default ShopPage;
