import { NextResponse } from "next/server";
import { hasNavAccess } from "@/lib/admin/actor";
import { readSignatures, saveSignature, deleteSignature, type Signature } from "@/lib/email/store";

export const runtime = "nodejs";

async function ok(): Promise<boolean> {
  return hasNavAccess("/admin/email");
}

export async function GET() {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  return NextResponse.json(await readSignatures());
}

// POST legt an oder aktualisiert (wenn id mitgeschickt wird).
export async function POST(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as (Partial<Signature> & { name?: string }) | null;
  if (!body?.name) return NextResponse.json({ error: "Name der Signatur ist erforderlich." }, { status: 400 });
  const saved = await saveSignature({ ...body, name: body.name });
  return NextResponse.json(saved);
}

export async function DELETE(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  await deleteSignature(body.id);
  return NextResponse.json({ ok: true });
}
