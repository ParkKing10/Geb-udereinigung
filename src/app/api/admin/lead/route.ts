import { NextResponse } from "next/server";
import { hasNavAccess } from "@/lib/admin/actor";
import { updateLead, deleteLead, getLead } from "@/lib/admin/store";
import { ownsRecord } from "@/lib/admin/scope";
import type { AdminOffer, LeadStatus } from "@/lib/admin/data";

export const runtime = "nodejs";

// Leads dürfen von Nutzern mit Leads- ODER CRM-Recht bearbeitet werden
// (das CRM-Board ändert Lead-Status über dieselbe API).
async function requireAdmin(): Promise<boolean> {
  return (await hasNavAccess("/admin/leads")) || (await hasNavAccess("/admin/crm"));
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const id = body?.id ? String(body.id) : "";
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });

  if (!(await ownsRecord(await getLead(id)))) return NextResponse.json({ error: "Lead nicht gefunden" }, { status: 404 });

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

  if (!(await ownsRecord(await getLead(id)))) return NextResponse.json({ error: "Lead nicht gefunden" }, { status: 404 });
  const ok = await deleteLead(id);
  if (!ok) return NextResponse.json({ error: "Lead nicht gefunden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
