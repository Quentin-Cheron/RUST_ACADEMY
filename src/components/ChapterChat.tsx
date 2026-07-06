"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { renderInline } from "@/lib/inline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CHAT_ENABLED = process.env.NEXT_PUBLIC_CHAT_ENABLED !== "false";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  ok: boolean;
  reply?: string;
  message?: string;
}

/** Rend une réponse d'assistant : blocs ```code```, titres, listes, inline markdown. */
function renderReply(text: string) {
  const nodes: React.ReactNode[] = [];
  const segments = text.split(/```/);

  segments.forEach((seg, i) => {
    const isCode = i % 2 === 1;
    if (isCode) {
      const body = seg.replace(/^[a-zA-Z]*\n/, "");
      nodes.push(
        <pre
          key={i}
          className="my-2 overflow-auto rounded-lg border border-border bg-code-bg p-3 font-mono text-xs leading-relaxed text-zinc-300"
        >
          {body.replace(/\n$/, "")}
        </pre>,
      );
      return;
    }
    seg.split("\n").forEach((line, j) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const key = `${i}-${j}`;
      if (/^#{1,6}\s/.test(trimmed)) {
        nodes.push(
          <p key={key} className="mt-2 font-semibold text-foreground">
            {renderInline(trimmed.replace(/^#{1,6}\s/, ""))}
          </p>,
        );
      } else if (/^[-*]\s/.test(trimmed)) {
        nodes.push(
          <p key={key} className="ml-3 flex gap-1.5">
            <span className="text-primary">•</span>
            <span>{renderInline(trimmed.replace(/^[-*]\s/, ""))}</span>
          </p>,
        );
      } else {
        nodes.push(<p key={key}>{renderInline(line)}</p>);
      }
    });
  });

  return nodes;
}

export default function ChapterChat({
  chapterSlug,
  chapterTitle,
}: {
  chapterSlug: string;
  chapterTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  if (!CHAT_ENABLED) return null;

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const next: Message[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterSlug, messages: next }),
      });
      const data = (await res.json()) as ChatResponse;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.ok && data.reply ? data.reply : (data.message ?? "Une erreur est survenue."),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erreur réseau. Réessaie." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <Button
          size="icon-lg"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir l'assistant du chapitre"
          className="fixed bottom-5 right-5 z-40 rounded-full shadow-lg lg:bottom-6 lg:right-6"
        >
          <MessageCircle />
        </Button>
      )}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl transition-transform duration-200",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <header className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Bot className="size-4" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-sm font-semibold text-foreground">Assistant du chapitre</div>
            <div className="truncate text-xs text-muted-foreground">{chapterTitle}</div>
          </div>
          <Button size="icon-sm" variant="ghost" aria-label="Fermer" onClick={() => setOpen(false)}>
            <X />
          </Button>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                <Sparkles className="size-4 text-primary" /> Pose-moi une question
              </div>
              Sur le chapitre <span className="font-medium text-foreground">« {chapterTitle} »</span>{" "}
              : une notion floue, un exemple, la différence entre deux concepts…
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-6",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground/90",
                )}
              >
                {m.role === "user" ? m.content : <div className="space-y-1">{renderReply(m.content)}</div>}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> L&apos;assistant réfléchit…
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ta question… (Entrée pour envoyer)"
              className="max-h-32 min-h-10 flex-1 resize-none rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none transition focus:border-primary/50 focus:bg-background"
            />
            <Button size="icon" aria-label="Envoyer" onClick={send} disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </div>
          <p className="mt-1.5 flex items-center gap-1 px-0.5 text-[11px] text-muted-foreground">
            <Sparkles className="size-3" /> Réponses générées par IA — vérifie avant de te fier.
          </p>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Fermer l'assistant"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}
    </>
  );
}
