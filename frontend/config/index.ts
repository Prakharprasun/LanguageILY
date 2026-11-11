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
  icons: {
    icon: "/icon1.png",
    shortcut: "/icon1.png",
    apple: "/apple-icon.png",
  },
} as const;

export const links = {
  sourceCode: "https://github.com/Prakharprasun/LanguageILY",
  originalRepo: "https://github.com/sanidhyy/duolingo-clone",
  email: "hello@languageily.com",
} as const;
