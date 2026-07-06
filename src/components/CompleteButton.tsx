"use client";

import { Check, CircleCheck } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";

export default function CompleteButton({ slug }: { slug: string }) {
  const { isDone, toggle } = useProgress();
  const done = isDone(slug);

  return (
    <Button
      onClick={() => toggle(slug)}
      size="lg"
      variant={done ? "outline" : "default"}
      className={done ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : ""}
    >
      {done ? <CircleCheck /> : <Check />}
      {done ? "Chapitre termine" : "Marquer comme termine"}
    </Button>
  );
}
