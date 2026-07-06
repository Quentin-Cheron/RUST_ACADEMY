import type { Metadata } from "next";
import ReviewList from "@/components/ReviewList";

export const metadata: Metadata = {
  title: "Réviser",
  description:
    "Exercices transversaux qui mélangent les notions de plusieurs chapitres déjà terminés.",
};

export default function ReviserPage() {
  return <ReviewList />;
}
