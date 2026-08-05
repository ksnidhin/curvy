import type { Metadata } from "next";
import { Tenor_Sans, Jost } from "next/font/google";
import "./globals.css";

const tenorSans = Tenor_Sans({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Curvy Girls | Curated with care",
  description: "Curated fashion for curvy women.",
};

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomTabBar } from "@/components/layout/BottomTabBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${tenorSans.variable} ${jost.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <BottomTabBar />
      </body>
    </html>
  );
}
