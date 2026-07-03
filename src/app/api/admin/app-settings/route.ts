import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasNavAccess } from "@/lib/admin/actor";
import { readSafeAppSettings, saveAppSettings, type AppSettings } from "@/lib/admin/app-settings";

export const runtime = "nodejs";

async function ok(): Promise<boolean> {
  return hasNavAccess("/admin/settings");
}

export async function GET() {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  return NextResponse.json(await readSafeAppSettings());
}

export async function POST(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const patch = (await req.json().catch(() => null)) as Partial<AppSettings> | null;
  if (!patch) return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  const saved = await saveAppSettings(patch);
  // Öffentliche Seiten neu rendern → geänderte Tracking-IDs sofort aktiv.
  revalidatePath("/", "layout");
  return NextResponse.json(saved);
}
