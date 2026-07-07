"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal, SquareX, Loader2, RotateCcw, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDockerSession } from "@/lib/useDockerSession";

interface Line {
  type: "input" | "output" | "error" | "system";
  text: string;
}

/**
 * Terminal Docker interactif.
 * Peut fonctionner en mode autonome (sa propre session) ou en mode partage
 * (consomme le DockerSessionProvider via useSharedSession).
 */
export default function DockerTerminal({ useSharedSession = false }: { useSharedSession?: boolean }) {
  const shared = useDockerSession();
  const [open, setOpen] = useState(!useSharedSession);
  const [ownSessionId, setOwnSessionId] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine the active session id
  const sessionId = useSharedSession && shared ? shared.sessionId : ownSessionId;

  const addLine = useCallback((line: Line) => {
    setLines((prev) => [...prev, line]);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  // Start a session (own or shared)
  const startSession = useCallback(async () => {
    if (useSharedSession && shared) {
      if (!shared.sessionId) {
        await shared.startSession();
      }
      addLine({ type: "system", text: "Terminal Docker connecte a la session partagee." });
      addLine({ type: "system", text: "Tape tes commandes Docker librement.\n" });
      scrollToBottom();
      return;
    }
    setLoading(true);
    setLines([]);
    try {
      const res = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await res.json();
      if (data.ok) {
        setOwnSessionId(data.sessionId);
        addLine({ type: "system", text: data.output ?? "Session demarree." });
        addLine({ type: "system", text: "Conteneur Docker pret. Tu peux taper des commandes Docker (docker run, docker ps, etc.)." });
        addLine({ type: "system", text: "Tape 'exit' pour fermer la session.\n" });
      } else {
        addLine({ type: "error", text: data.error ?? "Erreur de demarrage." });
      }
    } catch {
      addLine({ type: "error", text: "Impossible de contacter le serveur. Docker est-il lance ?" });
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, [addLine, useSharedSession, shared]);

  // Execute a command
  const execCommand = async (command: string) => {
    if (!sessionId || !command.trim()) return;

    if (command.trim() === "exit" && !useSharedSession) {
      await stopSession();
      return;
    }

    if (command.trim() === "clear") {
      setLines([]);
      return;
    }

    addLine({ type: "input", text: command });
    setHistory((prev) => [...prev, command]);
    setHistoryIdx(-1);
    setInput("");

    if (useSharedSession && shared) {
      setLoading(true);
      try {
        const output = await shared.execCommand(command);
        if (output?.trim()) addLine({ type: "output", text: output });
      } catch (err) {
        addLine({ type: "error", text: err instanceof Error ? err.message : "Erreur." });
      } finally {
        setLoading(false);
        scrollToBottom();
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "exec", sessionId: ownSessionId, command }),
      });
      const data = await res.json();
      if (data.ok) {
        if (data.output?.trim()) addLine({ type: "output", text: data.output });
      } else {
        addLine({ type: "error", text: data.error ?? "Erreur d'execution." });
        if (data.error?.includes("introuvable")) setOwnSessionId(null);
      }
    } catch {
      addLine({ type: "error", text: "Erreur reseau." });
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  // Stop the session (own mode only)
  const stopSession = async () => {
    if (!ownSessionId) return;
    try {
      await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop", sessionId: ownSessionId }),
      });
    } catch { /* ignore */ }
    setOwnSessionId(null);
    addLine({ type: "system", text: "\nSession terminee." });
    scrollToBottom();
  };

  // Auto-focus
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open, loading]);

  // Keyboard navigation (history)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void execCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const newIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(newIdx);
      setInput(history[newIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const newIdx = historyIdx + 1;
      if (newIdx >= history.length) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    }
  };

  // Collapsed mode for shared session
  if (useSharedSession && !open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          void startSession();
        }}
        className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
      >
        <ChevronRight className="size-4" />
        <Terminal className="size-4" />
        Terminal Docker libre — cliquer pour ouvrir
      </button>
    );
  }

  // Non-shared mode: show "Open" button
  if (!useSharedSession && !open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(true);
          void startSession();
        }}
        className="gap-2"
      >
        <Terminal className="size-4" /> Ouvrir le terminal Docker
      </Button>
    );
  }

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-border bg-[#1a1e26]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#14171e] px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          {useSharedSession && (
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-300">
              <ChevronDown className="size-4" />
            </button>
          )}
          <Terminal className="size-4 text-emerald-400" />
          Terminal Docker
          {sessionId && (
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
              connecte
            </span>
          )}
          {!sessionId && !loading && (
            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
              deconnecte
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!sessionId && !loading && !useSharedSession && (
            <Button variant="ghost" size="sm" onClick={() => void startSession()} className="h-7 text-xs text-zinc-400 hover:text-zinc-200">
              <RotateCcw className="size-3" /> Reconnecter
            </Button>
          )}
          {!useSharedSession && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void stopSession();
                setOpen(false);
              }}
              className="h-7 text-xs text-zinc-400 hover:text-red-400"
            >
              <SquareX className="size-3" />
            </Button>
          )}
          {useSharedSession && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-7 text-xs text-zinc-400 hover:text-zinc-200"
            >
              <SquareX className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Terminal body */}
      <div
        className="h-80 overflow-y-auto p-4 font-mono text-sm leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line.type === "input" && (
              <span>
                <span className="text-emerald-400">$ </span>
                <span className="text-zinc-200">{line.text}</span>
              </span>
            )}
            {line.type === "output" && <span className="text-zinc-300">{line.text}</span>}
            {line.type === "error" && <span className="text-red-400">{line.text}</span>}
            {line.type === "system" && <span className="text-sky-400">{line.text}</span>}
          </div>
        ))}

        {/* Input line */}
        {sessionId && (
          <div className="flex items-center">
            <span className="text-emerald-400">$ </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="ml-1 flex-1 border-none bg-transparent text-zinc-200 caret-emerald-400 outline-none"
              spellCheck={false}
              autoComplete="off"
            />
            {loading && <Loader2 className="size-4 animate-spin text-zinc-500" />}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
