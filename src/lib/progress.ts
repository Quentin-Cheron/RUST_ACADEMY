"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "rust-academy:progress";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** Hook de progression : quels chapitres (par slug) sont marqués « terminés ». */
export function useProgress() {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDone(read());
    const sync = () => setDone(read());
    window.addEventListener("storage", sync);
    window.addEventListener("rust-academy:progress-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("rust-academy:progress-change", sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const next = read();
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    localStorage.setItem(KEY, JSON.stringify([...next]));
    window.dispatchEvent(new Event("rust-academy:progress-change"));
  }, []);

  return { done, isDone: (slug: string) => done.has(slug), toggle };
}
