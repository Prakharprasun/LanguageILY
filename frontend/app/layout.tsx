import type { Metadata, Viewport } from "next";
import { Caveat, Nunito } from "next/font/google";

import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config";

import "./globals.css";

const font = Nunito({ subsets: ["latin"], variable: "--font-sans" });
const scriptFont = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-script",
});

export const viewport: Viewport = {
  themeColor: "#C81E3A",
};

export const metadata: Metadata = siteConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} ${scriptFont.variable}`}>
        <Toaster theme="light" richColors closeButton />
        <ExitModal />
        <HeartsModal />
        <PracticeModal />
        {children}
      </body>
    </html>
  );
}
