"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface DockerSession {
  sessionId: string | null;
  available: boolean;
  busy: boolean;
  startSession: () => Promise<void>;
  execCommand: (cmd: string) => Promise<string>;
  execBuild: (dockerfile: string) => Promise<string>;
  stopSession: () => Promise<void>;
}

const DockerSessionContext = createContext<DockerSession | null>(null);

export function DockerSessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [available, setAvailable] = useState(true);
  const [busy, setBusy] = useState(false);
  const startedRef = useRef(false);

  const startSession = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setBusy(true);
    try {
      const res = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await res.json();
      if (data.ok) {
        setSessionId(data.sessionId);
        setAvailable(true);
      } else {
        setAvailable(false);
        startedRef.current = false;
      }
    } catch {
      setAvailable(false);
      startedRef.current = false;
    } finally {
      setBusy(false);
    }
  }, []);

  const execCommand = useCallback(
    async (cmd: string): Promise<string> => {
      if (!sessionId) throw new Error("Pas de session Docker");
      setBusy(true);
      try {
        const res = await fetch("/api/terminal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "exec", sessionId, command: cmd }),
        });
        const data = await res.json();
        if (data.ok) return data.output ?? "";
        throw new Error(data.error ?? "Erreur d'execution");
      } finally {
        setBusy(false);
      }
    },
    [sessionId],
  );

  const execBuild = useCallback(
    async (dockerfile: string): Promise<string> => {
      if (!sessionId) throw new Error("Pas de session Docker");
      setBusy(true);
      try {
        const res = await fetch("/api/terminal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "build", sessionId, dockerfile }),
        });
        const data = await res.json();
        if (data.ok) return data.output ?? "";
        throw new Error(data.error ?? "Erreur de build");
      } finally {
        setBusy(false);
      }
    },
    [sessionId],
  );

  const stopSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop", sessionId }),
      });
    } catch {
      /* ignore */
    }
    setSessionId(null);
    startedRef.current = false;
  }, [sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        fetch("/api/terminal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "stop", sessionId }),
        }).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DockerSessionContext.Provider
      value={{ sessionId, available, busy, startSession, execCommand, execBuild, stopSession }}
    >
      {children}
    </DockerSessionContext.Provider>
  );
}

export function useDockerSession(): DockerSession | null {
  return useContext(DockerSessionContext);
}
