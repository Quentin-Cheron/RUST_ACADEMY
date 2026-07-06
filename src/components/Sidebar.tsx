"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Check } from "lucide-react";
import { chapters } from "@/content";
import { useProgress } from "@/lib/progress";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { done } = useProgress();
  const pct = Math.round((done.size / chapters.length) * 100);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border p-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-lg font-black text-primary-foreground">
            R
          </span>
          <div>
            <div className="font-black leading-tight text-sidebar-foreground">Rust Academy</div>
            <div className="text-xs text-muted-foreground">Apprends Rust de A a Z</div>
          </div>
        </Link>

        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Progression</span>
            <span className="font-medium text-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav className="p-3">
          {chapters.map((c) => {
            const href = `/cours/${c.slug}`;
            const active = pathname === href;
            const complete = done.has(c.slug);
            return (
              <Link
                key={c.slug}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "mb-0.5 flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                )}
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
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarBody />
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
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Chapitres</SheetTitle>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
