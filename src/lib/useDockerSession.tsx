"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface DockerSession {
  sessionId: string | null;
  available: boolean;
  busy: boolean;
  startSession: () => Promise<string | null>;
  execCommand: (cmd: string, sessionIdOverride?: string) => Promise<string>;
  execBuild: (dockerfile: string, sessionIdOverride?: string) => Promise<string>;
  stopSession: () => Promise<void>;
}

const DockerSessionContext = createContext<DockerSession | null>(null);

export function DockerSessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [available, setAvailable] = useState(true);
  const [busy, setBusy] = useState(false);
  const startedRef = useRef(false);

  const sessionIdRef = useRef<string | null>(null);

  const startSession = useCallback(async (): Promise<string | null> => {
    if (sessionIdRef.current) return sessionIdRef.current;
    if (startedRef.current) return null;
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
        sessionIdRef.current = data.sessionId;
        setSessionId(data.sessionId);
        setAvailable(true);
        return data.sessionId;
      }
      setAvailable(false);
      startedRef.current = false;
      return null;
    } catch {
      setAvailable(false);
      startedRef.current = false;
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const execCommand = useCallback(
    async (cmd: string, sessionIdOverride?: string): Promise<string> => {
      const sid = sessionIdOverride ?? sessionIdRef.current ?? sessionId;
      if (!sid) throw new Error("Pas de session Docker");
      setBusy(true);
      try {
        const res = await fetch("/api/terminal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "exec", sessionId: sid, command: cmd }),
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
    async (dockerfile: string, sessionIdOverride?: string): Promise<string> => {
      const sid = sessionIdOverride ?? sessionIdRef.current ?? sessionId;
      if (!sid) throw new Error("Pas de session Docker");
      setBusy(true);
      try {
        const res = await fetch("/api/terminal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "build", sessionId: sid, dockerfile }),
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
    sessionIdRef.current = null;
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
