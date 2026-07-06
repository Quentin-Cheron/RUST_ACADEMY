import { notFound } from "next/navigation";
import { projects, getProject } from "@/content/projects";
import ProjectWorkbench from "@/components/ProjectWorkbench";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projets/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: p.title, description: p.tagline };
}

export default async function ProjetPage({ params }: PageProps<"/projets/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  return <ProjectWorkbench project={p} />;
}
