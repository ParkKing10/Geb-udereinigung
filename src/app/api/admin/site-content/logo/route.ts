import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";

export const runtime = "nodejs";

// Kundenlogo-Upload. Bewusst nur Raster-Formate (kein SVG) – hochgeladene SVGs
// würden als same-origin ausgeliefert und wären ein gespeicherter-XSS-Vektor.
// Transparentes PNG oder WebP ist der Standard für Logos.
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/jpeg": "jpg",
};
const MAX_BYTES = 2 * 1024 * 1024; // Logos sind klein – 2 MB reichen locker.

export async function POST(req: Request) {
  const store = await cookies();
  if (!(await verifySession(store.get(AUTH_COOKIE)?.value))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("logo");
  if (!(file instanceof File)) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });

  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "Nur PNG, WebP oder JPG erlaubt (SVG wird nicht unterstützt)." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Datei zu groß (max. 2 MB)." }, { status: 400 });

  const dir = path.join(process.cwd(), "public", "uploads", "logos");
  await fs.mkdir(dir, { recursive: true });
  // Dateiname wird serverseitig erzeugt (nie aus dem Upload abgeleitet) → keine Pfad-Injektion.
  const name = `logo-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, name), bytes);

  return NextResponse.json({ path: `/uploads/logos/${name}` });
}
