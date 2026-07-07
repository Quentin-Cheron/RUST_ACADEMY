import { notFound } from "next/navigation";
import { getCourse } from "@/content/courses";
import ReviewList from "@/components/ReviewList";

export async function generateMetadata({ params }: PageProps<"/cours/[course]/reviser">) {
  const { course: courseId } = await params;
  const course = getCourse(courseId);
  if (!course) return {};
  return {
    title: `Réviser — ${course.name}`,
    description:
      "Exercices transversaux qui mélangent les notions de plusieurs chapitres déjà terminés.",
  };
}

export default async function CourseReviserPage({ params }: PageProps<"/cours/[course]/reviser">) {
  const { course: courseId } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();
  return <ReviewList courseId={course.id} />;
}
