import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";
import { uploadPath } from "@/lib/data-dir";
import { saveProfileData } from "@/lib/admin/profile";

export const runtime = "nodejs";

// Nur Raster-Formate (kein SVG → Stored-XSS-Vektor).
const ALLOWED: Record<string, string> = { "image/png": "png", "image/webp": "webp", "image/jpeg": "jpg" };
const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(req: Request) {
  const store = await cookies();
  if (!(await verifySession(store.get(AUTH_COOKIE)?.value))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("avatar");
  if (!(file instanceof File)) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });

  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "Nur PNG, WebP oder JPG erlaubt." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Datei zu groß (max. 3 MB)." }, { status: 400 });

  const dir = uploadPath("admin");
  await fs.mkdir(dir, { recursive: true });
  const name = `avatar-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  const publicPath = `/uploads/admin/${name}`;
  await saveProfileData({ avatar: publicPath });
  return NextResponse.json({ ok: true, path: publicPath });
}
