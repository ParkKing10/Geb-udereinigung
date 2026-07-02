import { NextResponse } from "next/server";
import { updateLead } from "@/lib/admin/store";
import type { AdminOffer, LeadStatus } from "@/lib/admin/data";

// Hinweis: /admin ist derzeit ohne Auth. Für Produktion Middleware-Schutz ergänzen.
export async function POST(req: Request) {
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
