import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-6xl font-black text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">Page introuvable</h1>
        <p className="mt-2 text-muted-foreground">
          Ce chapitre n&apos;existe pas (encore). Reviens au programme pour continuer à apprendre Rust.
        </p>
        <Button className="mt-6" render={<Link href="/" />}>
          <Home /> Retour à l&apos;accueil
        </Button>
      </div>
    </div>
  );
}
