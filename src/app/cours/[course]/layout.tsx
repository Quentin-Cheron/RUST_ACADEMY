import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCourse } from "@/content/courses";
import Sidebar from "@/components/Sidebar";
import SearchDialog from "@/components/SearchDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ course: string }>;
}) {
  const { course: courseId } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();

  return (
    <div className={`flex ${course.theme}`}>
      <Sidebar courseId={course.id} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <ArrowLeft /> Accueil
          </Link>
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
