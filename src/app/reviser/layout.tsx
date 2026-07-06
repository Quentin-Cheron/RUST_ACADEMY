import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SearchDialog from "@/components/SearchDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export default function ReviserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <Button variant="ghost" size="sm" render={<Link href="/" />}>
            <ArrowLeft /> Accueil
          </Button>
          <div className="flex items-center gap-2">
            <SearchDialog />
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl px-4 py-10 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
