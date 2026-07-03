import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasNavAccess } from "@/lib/admin/actor";
import { readLegal, saveLegal, type LegalContent } from "@/lib/admin/legal";

export const runtime = "nodejs";

async function ok(): Promise<boolean> {
  return hasNavAccess("/admin/settings");
}

export async function GET() {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  return NextResponse.json(await readLegal());
}

export async function POST(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const patch = (await req.json().catch(() => null)) as Partial<LegalContent> | null;
  if (!patch) return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  const saved = await saveLegal(patch);
  revalidatePath("/impressum");
  revalidatePath("/datenschutz");
  revalidatePath("/agb");
  return NextResponse.json(saved);
}
