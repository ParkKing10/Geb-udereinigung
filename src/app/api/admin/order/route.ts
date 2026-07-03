import { NextResponse } from "next/server";
import { hasNavAccess } from "@/lib/admin/actor";
import { createOrder, getLead, updateLead, readOrders, deleteOrder } from "@/lib/admin/store";
import { deriveSource } from "@/lib/marketing/source";

export const runtime = "nodejs";

async function requireAdmin(): Promise<boolean> {
  return hasNavAccess("/admin/auftraege");
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  return NextResponse.json(await readOrders());
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });

  const customerName = String(b.customerName ?? "").trim();
  const customerEmail = String(b.customerEmail ?? "").trim();
  const service = String(b.service ?? "").trim();
  const amountEuro = Number(b.amountEuro);
  if (!customerName || !customerEmail || !service || !Number.isFinite(amountEuro) || amountEuro < 0) {
    return NextResponse.json({ error: "Name, E-Mail, Leistung und Betrag sind erforderlich." }, { status: 400 });
  }

  // Attribution-Snapshot: aus dem Lead (falls verknüpft) oder manuell "Direct".
  let src = { key: "direct", label: "Direct", emoji: "⚫" };
  let keyword: string | undefined;
  let campaign: string | undefined;
  const leadId = b.leadId ? String(b.leadId) : null;
  if (leadId) {
    const lead = await getLead(leadId);
    if (lead?.attribution) {
      const a = lead.attribution;
      src = deriveSource({ gclid: a.gclid, gbraid: a.gbraid, wbraid: a.wbraid, utm_source: a.utm_source, utm_medium: a.utm_medium, referrer: a.referrer });
      keyword = a.utm_term;
      campaign = a.utm_campaign;
    }
  }
  if (typeof b.source === "string" && b.source.trim()) {
    // manuelle Quellenangabe überschreibt (z. B. Telefon, Empfehlung)
    src = { key: b.source.trim().toLowerCase(), label: b.source.trim(), emoji: "🟣" };
  }

  const order = await createOrder({
    leadId,
    customerName,
    customerEmail,
    customerPhone: b.customerPhone ? String(b.customerPhone).trim() : undefined,
    service,
    location: b.location ? String(b.location).trim() : undefined,
    turnus: b.turnus ? String(b.turnus).trim() : undefined,
    amountCents: Math.round(amountEuro * 100),
    note: b.note ? String(b.note).trim() : undefined,
    status: "Bestätigt",
    source: src.key,
    sourceLabel: src.label,
    sourceEmoji: src.emoji,
    keyword,
    campaign,
  });

  // Verknüpften Lead als gewonnen markieren.
  if (leadId) await updateLead(leadId, { status: "Gewonnen" });

  return NextResponse.json({ ok: true, order });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const id = body?.id ? String(body.id) : "";
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });

  const ok = await deleteOrder(id);
  if (!ok) return NextResponse.json({ error: "Auftrag nicht gefunden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
