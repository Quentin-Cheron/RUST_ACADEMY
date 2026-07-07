import Link from "next/link";
import { ArrowLeft, Code2 } from "lucide-react";
import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Connexion",
  description: "Crée un compte ou connecte-toi pour sauvegarder ta progression.",
};

export default function ConnexionPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Retour à l&apos;accueil
        </Link>

        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-xl font-black text-primary-foreground">
            <Code2 className="size-5" />
          </span>
          <div>
            <div className="font-black leading-tight text-foreground">Dev Academy</div>
            <div className="text-xs text-muted-foreground">
              Sauvegarde ta progression sur tous tes appareils
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
