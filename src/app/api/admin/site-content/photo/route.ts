import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "node:fs";
import path from "node:path";
import { uploadPath } from "@/lib/data-dir";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";

export const runtime = "nodejs";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 6 * 1024 * 1024;

export async function POST(req: Request) {
  const store = await cookies();
  if (!(await verifySession(store.get(AUTH_COOKIE)?.value))) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("photo");
  if (!(file instanceof File)) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });

  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "Nur JPG, PNG oder WebP erlaubt." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Datei zu groß (max. 6 MB)." }, { status: 400 });

  const dir = uploadPath("team");
  await fs.mkdir(dir, { recursive: true });
  const name = `ansprechpartner-${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, name), bytes);

  return NextResponse.json({ path: `/uploads/team/${name}` });
}
