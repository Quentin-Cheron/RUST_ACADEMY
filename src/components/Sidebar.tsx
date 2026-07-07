"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Check, Dumbbell, FolderGit2, ChevronRight, LogIn, LogOut, UserRound } from "lucide-react";
import { courses, getCourse, defaultCourse, type Course } from "@/content/courses";
import { useProgress } from "@/lib/progress";
import { signOut, useSession } from "@/lib/auth-client";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Cours disposant d'une page « Réviser » (exercices transversaux). */
const reviewCourses = new Set(["rust", "docker"]);

function AccountFooter({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) return null;

  if (!session) {
    return (
      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/connexion"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent/60 hover:text-primary"
        >
          <LogIn className="size-4 text-primary" />
          Se connecter
          <span className="ml-auto text-xs text-muted-foreground">sauvegarde ta progression</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-sidebar-border p-3">
      <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sidebar-accent text-primary">
          <UserRound className="size-4" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-sm font-semibold text-sidebar-foreground">
            {session.user.name}
          </div>
          <div className="truncate text-xs text-muted-foreground">{session.user.email}</div>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Se déconnecter"
          onClick={async () => {
            await signOut();
            router.refresh();
          }}
        >
          <LogOut />
        </Button>
      </div>
    </div>
  );
}

/** Bascule entre les cours (Rust / Docker…). */
function CourseSwitcher({ current, onNavigate }: { current: Course; onNavigate?: () => void }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-1">
      {courses.map((co) => {
        const active = co.id === current.id;
        return (
          <Link
            key={co.id}
            href={`/cours/${co.id}/${co.chapters[0].slug}`}
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold transition",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )}
          >
            <span className="grid size-4 place-items-center text-[11px] font-black">{co.emblem}</span>
            {co.short}
          </Link>
        );
      })}
    </div>
  );
}

function SidebarBody({ course, onNavigate }: { course: Course; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { done } = useProgress();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const doneInCourse = course.chapters.filter((c) => done.has(c.slug)).length;
  const pct = Math.round((doneInCourse / course.chapters.length) * 100);
  const reviserHref = course.id === "rust" ? "/reviser" : `/cours/${course.id}/reviser`;

  const toggleExpand = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border p-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-lg font-black text-primary-foreground">
            {course.emblem}
          </span>
          <div>
            <div className="font-black leading-tight text-sidebar-foreground">{course.name}</div>
            <div className="text-xs text-muted-foreground">{course.tagline}</div>
          </div>
        </Link>

        <div className="mt-4">
          <CourseSwitcher current={course} onNavigate={onNavigate} />
        </div>

        <div>
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Progression</span>
            <span className="font-medium text-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        {reviewCourses.has(course.id) && (
          <Link
            href={reviserHref}
            onClick={onNavigate}
            className={cn(
              "mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
              pathname === reviserHref
                ? "border-primary/40 bg-sidebar-accent text-primary"
                : "border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
            )}
          >
            <Dumbbell className="size-4 text-primary" />
            Réviser
            <span className="ml-auto text-xs text-muted-foreground">exercices mixés</span>
          </Link>
        )}

        {course.id === "rust" && (
          <>
            <Link
              href="/projets"
              onClick={onNavigate}
              className={cn(
                "mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
                pathname.startsWith("/projets")
                  ? "border-primary/40 bg-sidebar-accent text-primary"
                  : "border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
              )}
            >
              <FolderGit2 className="size-4 text-primary" />
              Projets
              <span className="ml-auto text-xs text-muted-foreground">+ relecture IA</span>
            </Link>
          </>
        )}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav className="p-3">
          {course.chapters.map((c) => {
            const href = `/cours/${course.id}/${c.slug}`;
            const active = pathname === href;
            const complete = done.has(c.slug);
            const open = active || expanded.has(c.slug);
            return (
              <div key={c.slug} className="mb-0.5">
                <div
                  className={cn(
                    "flex items-start gap-1 rounded-lg transition",
                    active
                      ? "bg-sidebar-accent text-primary"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                  )}
                >
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className="flex min-w-0 flex-1 items-start gap-3 px-3 py-2.5 text-sm"
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md text-[11px] font-bold",
                        complete
                          ? "bg-emerald-500 text-white"
                          : active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {complete ? <Check className="size-3" /> : c.number}
                    </span>
                    <span className="leading-tight">
                      <span className="font-medium">{c.title}</span>
                      <span className="block text-xs text-muted-foreground">{c.minutes} min</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    aria-label={open ? "Replier les sous-chapitres" : "Déplier les sous-chapitres"}
                    onClick={() => toggleExpand(c.slug)}
                    className="mt-2.5 mr-2 grid size-5 shrink-0 place-items-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
                  </button>
                </div>

                {open && (
                  <ol className="mt-0.5 mb-1 ml-[22px] border-l border-sidebar-border pl-3">
                    {c.sections.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`${href}#${s.id}`}
                          onClick={onNavigate}
                          className="flex items-baseline gap-1.5 rounded px-2 py-1 text-xs text-sidebar-foreground/70 transition hover:bg-sidebar-accent/60 hover:text-primary"
                        >
                          {s.number && (
                            <span className="shrink-0 font-mono font-semibold text-primary/80">
                              {s.number}
                            </span>
                          )}
                          <span className="leading-snug">{s.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <AccountFooter onNavigate={onNavigate} />
    </div>
  );
}

export default function Sidebar({ courseId }: { courseId?: string }) {
  const [open, setOpen] = useState(false);
  const course = (courseId && getCourse(courseId)) || defaultCourse;

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarBody course={course} />
      </aside>

      {/* Mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              size="icon-lg"
              className="fixed bottom-5 right-5 z-50 rounded-full shadow-lg lg:hidden"
            >
              <Menu />
            </Button>
          }
        />
        <SheetContent side="left" className={cn("w-72 bg-sidebar p-0", course.theme)}>
          <SheetTitle className="sr-only">Chapitres</SheetTitle>
          <SidebarBody course={course} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
