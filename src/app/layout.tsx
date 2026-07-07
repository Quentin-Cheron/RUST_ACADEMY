import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dev Academy — Apprends Rust & Docker en pratiquant",
    template: "%s — Dev Academy",
  },
  description:
    "Formations complètes et gratuites pour apprendre Rust et Docker, chapitre par chapitre, avec des exemples, des cas d'usage concrets, des exercices et une validation immédiate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn("dark", geistSans.variable, geistMono.variable)}
    >
      <head></head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
