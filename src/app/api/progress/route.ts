// Progression par utilisateur : chapitres terminés stockés en base.

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function getUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function GET(): Promise<Response> {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Non authentifié." }, { status: 401 });
  }

  const rows = await prisma.chapterProgress.findMany({
    where: { userId },
    select: { slug: true },
  });
  return Response.json({ slugs: rows.map((r) => r.slug) });
}

export async function POST(req: Request): Promise<Response> {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Non authentifié." }, { status: 401 });
  }

  let slug: string;
  let done: boolean;
  try {
    const body = (await req.json()) as { slug?: string; done?: boolean };
    if (typeof body.slug !== "string" || !body.slug || typeof body.done !== "boolean") {
      throw new Error();
    }
    slug = body.slug;
    done = body.done;
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (done) {
    await prisma.chapterProgress.upsert({
      where: { userId_slug: { userId, slug } },
      create: { userId, slug },
      update: {},
    });
  } else {
    await prisma.chapterProgress.deleteMany({ where: { userId, slug } });
  }

  return Response.json({ ok: true });
}

// Fusionne la progression locale (localStorage) dans le compte à la connexion.
export async function PUT(req: Request): Promise<Response> {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Non authentifié." }, { status: 401 });
  }

  let slugs: string[];
  try {
    const body = (await req.json()) as { slugs?: unknown };
    if (
      !Array.isArray(body.slugs) ||
      !body.slugs.every((s): s is string => typeof s === "string" && s.length > 0)
    ) {
      throw new Error();
    }
    slugs = body.slugs;
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (slugs.length > 0) {
    await prisma.chapterProgress.createMany({
      data: slugs.map((slug) => ({ userId, slug })),
      skipDuplicates: true,
    });
  }

  const rows = await prisma.chapterProgress.findMany({
    where: { userId },
    select: { slug: true },
  });
  return Response.json({ slugs: rows.map((r) => r.slug) });
}
