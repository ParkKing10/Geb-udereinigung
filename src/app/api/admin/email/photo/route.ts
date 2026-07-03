import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { uploadPath } from "@/lib/data-dir";
import { hasNavAccess } from "@/lib/admin/actor";

export const runtime = "nodejs";

// Foto für E-Mail-Signaturen. Nur Raster-Formate (kein SVG → Stored-XSS-Vektor).
const ALLOWED: Record<string, string> = { "image/png": "png", "image/webp": "webp", "image/jpeg": "jpg" };
const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await hasNavAccess("/admin/email"))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("photo");
  if (!(file instanceof File)) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });

  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "Nur PNG, WebP oder JPG erlaubt." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Datei zu groß (max. 3 MB)." }, { status: 400 });

  const dir = uploadPath("email");
  await fs.mkdir(dir, { recursive: true });
  const name = `sig-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ path: `/uploads/email/${name}` });
}
