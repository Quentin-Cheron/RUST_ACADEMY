"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useSession } from "@/lib/auth-client";

const KEY = "rust-academy:progress";

function readLocal(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeLocal(done: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...done]));
  } catch {
    // stockage local indisponible : on garde l'état en mémoire
  }
}

interface Store {
  done: Set<string>;
  userId: string | null;
}

let store: Store = { done: new Set(), userId: null };
const listeners = new Set<() => void>();

function setStore(next: Partial<Store>) {
  store = { ...store, ...next };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const serverSnapshot: Store = store;
function getSnapshot() {
  return store;
}
function getServerSnapshot() {
  return serverSnapshot;
}

// Évite que chaque composant utilisant le hook relance la synchronisation.
let syncedUserId: string | null = null;
let syncing = false;

async function syncWithServer(userId: string) {
  if (syncing || syncedUserId === userId) return;
  syncing = true;
  try {
    // Fusionne la progression locale (mode invité) dans le compte,
    // puis récupère la progression complète du compte.
    const res = await fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: [...readLocal()] }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { slugs: string[] };
    syncedUserId = userId;
    setStore({ done: new Set(data.slugs), userId });
  } catch {
    // Hors-ligne / erreur : on retombe sur la progression locale.
    setStore({ done: readLocal(), userId });
  } finally {
    syncing = false;
  }
}

/** Hook de progression : quels chapitres (par slug) sont marqués « terminés ». */
export function useProgress() {
  const { data: session, isPending } = useSession();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (isPending) return;
    const userId = session?.user.id ?? null;

    if (userId) {
      void syncWithServer(userId);
      return;
    }

    syncedUserId = null;
    setStore({ done: readLocal(), userId: null });

    const sync = () => setStore({ done: readLocal() });
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [session, isPending]);

  const toggle = useCallback((slug: string) => {
    const next = new Set(store.done);
    const nowDone = !next.has(slug);
    if (nowDone) next.add(slug);
    else next.delete(slug);

    if (store.userId) {
      setStore({ done: next });
      void fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, done: nowDone }),
      }).catch(() => {
        // En cas d'échec réseau, l'état sera resynchronisé au prochain chargement.
      });
    } else {
      writeLocal(next);
      setStore({ done: next });
    }
  }, []);

  return {
    done: snapshot.done,
    isDone: (slug: string) => snapshot.done.has(slug),
    toggle,
  };
}
