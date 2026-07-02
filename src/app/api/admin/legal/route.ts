import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";
import { readLegal, saveLegal, type LegalContent } from "@/lib/admin/legal";

export const runtime = "nodejs";

async function ok(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(AUTH_COOKIE)?.value);
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
