import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasNavAccess } from "@/lib/admin/actor";
import { getSiteContent, saveSiteContent, type SiteContent } from "@/lib/site-content";

export const runtime = "nodejs";

async function requireAdmin(): Promise<boolean> {
  return hasNavAccess("/admin/website");
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  return NextResponse.json(await getSiteContent());
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  let patch: Partial<SiteContent>;
  try {
    patch = (await req.json()) as Partial<SiteContent>;
  } catch {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }
  const saved = await saveSiteContent(patch);
  // Alle Seiten unter dem Root-Layout neu validieren → sofort live (Hero, Footer, Kontakt).
  revalidatePath("/", "layout");
  return NextResponse.json(saved);
}
