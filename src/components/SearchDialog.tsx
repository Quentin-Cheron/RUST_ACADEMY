"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import {
  BookOpen,
  CornerDownLeft,
  Dumbbell,
  FileText,
  FolderGit2,
  Hammer,
  Search,
  Sparkles,
} from "lucide-react";
import {
  search,
  queryTerms,
  splitHighlight,
  type SearchKind,
  type SearchResult,
} from "@/lib/search";
import { cn } from "@/lib/utils";

const KIND_ORDER: SearchKind[] = [
  "projet-réel",
  "chapitre",
  "section",
  "exercice",
  "projet",
  "révision",
];

const KIND_LABEL: Record<SearchKind, string> = {
  "projet-réel": "Projets",
  chapitre: "Chapitres",
  section: "Sections",
  exercice: "Exercices",
  projet: "Projets de chapitre",
  révision: "Révision",
};

const KIND_ICON: Record<
  SearchKind,
  React.ComponentType<{ className?: string }>
> = {
  "projet-réel": FolderGit2,
  chapitre: BookOpen,
  section: FileText,
  exercice: Sparkles,
  projet: Hammer,
  révision: Dumbbell,
};

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {splitHighlight(text, terms).map((seg, i) =>
        seg.hit ? (
          <mark key={i} className="rounded-[2px] bg-primary/20 text-primary">
            {seg.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        ),
      )}
    </>
  );
}

export default function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const [shortcut] = React.useState(() =>
    typeof navigator !== "undefined" &&
    !/Mac|iPhone|iPad/.test(navigator.userAgent)
      ? "Ctrl K"
      : "⌘K",
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const terms = React.useMemo(() => queryTerms(query), [query]);
  const results = React.useMemo(() => search(query), [query]);

  const groups = React.useMemo(() => {
    const byKind = new Map<SearchKind, SearchResult[]>();
    for (const r of results) {
      const list = byKind.get(r.doc.kind) ?? [];
      list.push(r);
      byKind.set(r.doc.kind, list);
    }
    return KIND_ORDER.filter((k) => byKind.has(k)).map((k) => ({
      kind: k,
      items: byKind.get(k)!,
    }));
  }, [results]);

  const flat = React.useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const go = React.useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      go(flat[active].doc.href);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <Dialog.Trigger
        className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label="Rechercher dans le cours"
      >
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Rechercher…</span>
        <kbd
          suppressHydrationWarning
          className="pointer-events-none hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium sm:inline"
        >
          {shortcut}
        </kbd>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
        <Dialog.Popup className="fixed left-1/2 top-[12%] z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <Dialog.Title className="sr-only">
            Rechercher dans le cours
          </Dialog.Title>

          <div className="flex items-center gap-2.5 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Chapitre, notion, exercice, code… (ex : ownership, Result, trait)"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              Esc
            </kbd>
          </div>

          <div className="max-h-[55vh] overflow-y-auto overscroll-contain p-2">
            {query.trim().length < 2 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                Tape au moins 2 caractères pour chercher dans les 22 chapitres,
                les exercices et les révisions.
              </p>
            ) : flat.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                Aucun résultat pour « {query} ».
              </p>
            ) : (
              groups.map((g) => {
                const Icon = KIND_ICON[g.kind];
                return (
                  <div key={g.kind} className="mb-1">
                    <div className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Icon className="size-3" /> {KIND_LABEL[g.kind]}
                    </div>
                    {g.items.map((r) => {
                      const index = flat.indexOf(r);
                      const isActive = index === active;
                      return (
                        <button
                          key={`${r.doc.href}-${r.doc.title}`}
                          type="button"
                          ref={(el) => {
                            if (isActive)
                              el?.scrollIntoView({ block: "nearest" });
                          }}
                          onClick={() => go(r.doc.href)}
                          onMouseMove={() => setActive(index)}
                          className={cn(
                            "block w-full rounded-lg px-3 py-2 text-left transition",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/60",
                          )}
                        >
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="min-w-0 truncate text-sm font-medium">
                              <Highlight text={r.doc.title} terms={terms} />
                            </span>
                            <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                              {r.doc.crumb}
                              {isActive && (
                                <CornerDownLeft className="size-3" />
                              )}
                            </span>
                          </span>
                          {r.excerpt && (
                            <span
                              className={cn(
                                "mt-0.5 line-clamp-2 block text-xs text-muted-foreground",
                                r.inCode && "font-mono",
                              )}
                            >
                              <Highlight text={r.excerpt} terms={terms} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            <span>
              <kbd className="rounded border border-border bg-muted px-1 font-mono">
                ↑↓
              </kbd>{" "}
              naviguer
            </span>
            <span>
              <kbd className="rounded border border-border bg-muted px-1 font-mono">
                ↵
              </kbd>{" "}
              ouvrir
            </span>
            <span>
              <kbd className="rounded border border-border bg-muted px-1 font-mono">
                Esc
              </kbd>{" "}
              fermer
            </span>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
