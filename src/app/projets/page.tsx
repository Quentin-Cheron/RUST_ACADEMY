import type { Metadata } from "next";
import ProjectList from "@/components/ProjectList";

export const metadata: Metadata = {
  title: "Projets",
  description:
    "De vrais projets d'application pour mettre en pratique Rust, avec relecture de code par IA.",
};

export default function ProjetsPage() {
  return <ProjectList />;
}
