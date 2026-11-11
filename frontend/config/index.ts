import type { Metadata } from "next";

export const siteConfig: Metadata = {
  title: "Language ILY ❤️ — Learn the language. Get the crush.",
  description:
    "Learn a language because you have a crush. Interactive lessons, romantic & real-world phrases, streaks, and gamified mastery.",
  keywords: [
    "language-ily",
    "duolingo-clone",
    "learn-language",
    "nextjs",
    "fastapi",
    "sqlite",
  ] as Array<string>,
} as const;

export const links = {
  sourceCode: "https://github.com/sanidhyy/duolingo-clone",
  email: "sanidhyyy@gmail.com",
} as const;
