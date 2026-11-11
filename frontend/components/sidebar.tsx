"use client";

import { useEffect, useState } from "react";
import { Settings, User, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  apiFetch,
  setStoredUserId,
  type UserListItem,
  type UserSummary,
} from "@/lib/api";
import { cn } from "@/lib/utils";

import { SidebarItem } from "./sidebar-item";

type SidebarProps = {
  className?: string;
};

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const [me, setMe] = useState<UserSummary | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [showSwitcher, setShowSwitcher] = useState(false);

  useEffect(() => {
    apiFetch<UserSummary>("/api/me")
      .then(setMe)
      .catch(() => {});
    apiFetch<UserListItem[]>("/api/users")
      .then(setUsers)
      .catch(() => {});
  }, [pathname]);

  const handleSwitchUser = (userId: number) => {
    setStoredUserId(userId);
    setShowSwitcher(false);
    window.location.reload();
  };

  return (
    <div
      className={cn(
        "left-0 top-0 flex h-full flex-col border-r-2 border-pink-100 bg-[#FFF9FA] px-4 lg:fixed lg:w-[256px]",
        className
      )}
    >
      <Link href="/learn">
        <div className="flex flex-col pb-6 pl-3 pt-6">
          <div className="flex items-center gap-x-2.5">
            <Image
              src="/logo.png"
              alt="Language ILY"
              height={46}
              width={46}
              className="rounded-xl object-contain"
            />

            <div>
              <h1 className="text-xl font-black tracking-tight text-neutral-900">
                Language <span className="text-[#C81E3A]">ILY</span> ❤️
              </h1>
              <p className="font-script text-base leading-none text-rose-600">
                Get your crush. ♡
              </p>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-y-2">
        <SidebarItem label="Learn" href="/learn" iconSrc="/learn.svg" />
        <SidebarItem
          label="Leaderboard"
          href="/leaderboard"
          iconSrc="/leaderboard.svg"
        />
        <SidebarItem label="Quests" href="/quests" iconSrc="/quests.svg" />
        <SidebarItem label="Shop" href="/shop" iconSrc="/shop.svg" />

        <Button
          variant={pathname === "/profile" ? "sidebarOutline" : "sidebar"}
          className="h-[52px] justify-start"
          asChild
        >
          <Link href="/profile">
            <div className="mr-5 flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-[#C81E3A]">
              <User className="h-5 w-5 stroke-[2.5]" />
            </div>
            Profile
          </Link>
        </Button>

        <Button
          variant={pathname === "/settings" ? "sidebarOutline" : "sidebar"}
          className="h-[52px] justify-start"
          asChild
        >
          <Link href="/settings">
            <div className="mr-5 flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-rose-700">
              <Settings className="h-5 w-5 stroke-[2.5]" />
            </div>
            Settings
          </Link>
        </Button>
      </div>

      {/* Cheeky Tagline Pill */}
      <div className="mb-3 rounded-2xl border border-pink-200 bg-gradient-to-r from-rose-50 to-pink-50 px-3 py-2.5 text-center">
        <p className="font-script text-lg font-bold text-[#C81E3A]">
          “Fluency looks good on you.”
        </p>
        <p className="text-[11px] font-bold text-rose-400">
          Your crush won&apos;t learn your language. Probably.
        </p>
      </div>

      {/* Learner Account Badge & Switcher */}
      <div className="relative border-t-2 border-pink-100 py-4">
        {showSwitcher && (
          <div className="absolute bottom-20 left-0 z-50 max-h-64 w-full overflow-y-auto rounded-2xl border-2 border-pink-200 bg-white p-2 shadow-xl">
            <p className="px-2 py-1 text-xs font-extrabold uppercase tracking-wider text-rose-400">
              Switch Learner (Demo)
            </p>
            {users.slice(0, 6).map((u) => (
              <button
                key={u.id}
                onClick={() => handleSwitchUser(u.id)}
                className={cn(
                  "flex w-full items-center gap-x-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-bold transition hover:bg-rose-50",
                  me?.id === u.id && "bg-rose-50 text-[#C81E3A]"
                )}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                  style={{ backgroundColor: u.avatar_color }}
                >
                  {u.display_name[0]}
                </div>
                <div className="truncate">
                  <div className="truncate leading-tight">{u.display_name}</div>
                  <div className="text-xs font-normal text-slate-400">
                    @{u.username}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowSwitcher((s) => !s)}
          className="flex w-full items-center justify-between rounded-xl p-2 transition hover:bg-pink-100/50"
          title="Switch Demo Learner"
        >
          <div className="flex items-center gap-x-3 overflow-hidden">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-extrabold text-white shadow-sm"
              style={{ backgroundColor: me?.avatar_color || "#C81E3A" }}
            >
              {me?.display_name?.[0] || "L"}
            </div>
            <div className="truncate text-left">
              <p className="truncate text-sm font-extrabold text-neutral-800">
                {me?.display_name || "Romeo Learner"}
              </p>
              <p className="truncate text-xs font-semibold text-rose-400">
                @{me?.username || "learner"}
              </p>
            </div>
          </div>
          <Users className="h-4 w-4 shrink-0 text-rose-400" />
        </button>
      </div>
    </div>
  );
};
