"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "connexion" | "inscription";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("connexion");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result =
        mode === "inscription"
          ? await signUp.email({ name: name.trim(), email: email.trim(), password })
          : await signIn.email({ email: email.trim(), password });

      if (result.error) {
        setError(traduire(result.error.message));
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs
      value={mode}
      onValueChange={(v) => {
        setMode(v as Mode);
        setError(null);
      }}
    >
      <TabsList className="w-full">
        <TabsTrigger value="connexion">Connexion</TabsTrigger>
        <TabsTrigger value="inscription">Inscription</TabsTrigger>
      </TabsList>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <TabsContent value="inscription" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Ton prénom ou pseudo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={mode === "inscription"}
            />
          </div>
        </TabsContent>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="toi@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "inscription" ? "new-password" : "current-password"}
            placeholder="8 caractères minimum"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : mode === "inscription" ? (
            <UserPlus />
          ) : (
            <LogIn />
          )}
          {mode === "inscription" ? "Créer mon compte" : "Se connecter"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Ta progression locale sera automatiquement rattachée à ton compte.
        </p>
      </form>
    </Tabs>
  );
}

function traduire(message?: string): string {
  switch (message) {
    case "Invalid email or password":
      return "Email ou mot de passe invalide.";
    case "User already exists":
    case "User already exists. Use another email.":
      return "Un compte existe déjà avec cet email.";
    case "Password too short":
      return "Le mot de passe doit contenir au moins 8 caractères.";
    case "Invalid email":
      return "Adresse email invalide.";
    default:
      return message || "Une erreur est survenue. Réessaie.";
  }
}
