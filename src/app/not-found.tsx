import Link from "next/link";
import { Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-6xl font-black text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">Page introuvable</h1>
        <p className="mt-2 text-muted-foreground">
          Cette page n&apos;existe pas (encore). Reviens à l&apos;accueil pour choisir ton parcours.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-6" })}>
          <Home /> Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
