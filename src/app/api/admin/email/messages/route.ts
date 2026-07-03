import { NextResponse } from "next/server";
import { hasNavAccess } from "@/lib/admin/actor";
import { readMessages, patchMessage, deleteMessage, type MailMessage } from "@/lib/email/store";

export const runtime = "nodejs";

async function ok(): Promise<boolean> {
  return hasNavAccess("/admin/email");
}

export async function GET() {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  return NextResponse.json(await readMessages());
}

export async function PATCH(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as (Partial<MailMessage> & { id?: string }) | null;
  if (!body?.id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  const updated = await patchMessage(body.id, body);
  if (!updated) return NextResponse.json({ error: "Nachricht nicht gefunden" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  await deleteMessage(body.id);
  return NextResponse.json({ ok: true });
}
