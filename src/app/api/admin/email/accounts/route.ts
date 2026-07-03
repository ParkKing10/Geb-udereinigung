import { NextResponse } from "next/server";
import { hasNavAccess } from "@/lib/admin/actor";
import { readSafeAccounts, createAccount, updateAccount, deleteAccount, type MailAccount } from "@/lib/email/store";

export const runtime = "nodejs";

async function ok(): Promise<boolean> {
  return hasNavAccess("/admin/email");
}

export async function GET() {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  return NextResponse.json(await readSafeAccounts());
}

export async function POST(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Partial<MailAccount> | null;
  if (!body?.label || !body?.address) return NextResponse.json({ error: "Name und E-Mail-Adresse sind erforderlich." }, { status: 400 });
  const created = await createAccount({ ...body, label: body.label, address: body.address });
  return NextResponse.json(created);
}

export async function PATCH(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as (Partial<MailAccount> & { id?: string }) | null;
  if (!body?.id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  const updated = await updateAccount(body.id, body);
  if (!updated) return NextResponse.json({ error: "Postfach nicht gefunden" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  await deleteAccount(body.id);
  return NextResponse.json({ ok: true });
}
