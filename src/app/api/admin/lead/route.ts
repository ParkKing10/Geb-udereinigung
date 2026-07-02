import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";
import { updateLead, deleteLead } from "@/lib/admin/store";
import type { AdminOffer, LeadStatus } from "@/lib/admin/data";

export const runtime = "nodejs";

async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(AUTH_COOKIE)?.value);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const id = body?.id ? String(body.id) : "";
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });

  const patch: { offer?: AdminOffer; status?: LeadStatus } = {};
  if (body.offer) patch.offer = body.offer as AdminOffer;
  if (body.status) patch.status = body.status as LeadStatus;

  const updated = await updateLead(id, patch);
  if (!updated) return NextResponse.json({ error: "Lead nicht gefunden" }, { status: 404 });
  return NextResponse.json({ ok: true, lead: updated });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const id = body?.id ? String(body.id) : "";
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });

  const ok = await deleteLead(id);
  if (!ok) return NextResponse.json({ error: "Lead nicht gefunden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
