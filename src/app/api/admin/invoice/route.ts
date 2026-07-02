import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifySession } from "@/lib/admin/auth";
import { readInvoices, createInvoice, updateInvoice, deleteInvoice, type Invoice } from "@/lib/admin/invoices";
import { getOrder } from "@/lib/admin/store";

export const runtime = "nodejs";

async function ok(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(AUTH_COOKIE)?.value);
}

export async function GET() {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  return NextResponse.json(await readInvoices());
}

// Anlegen – manuell (netEuro + Kundendaten) ODER aus einem Auftrag (orderId).
export async function POST(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });

  let customerName = String(b.customerName ?? "").trim();
  let customerEmail = b.customerEmail ? String(b.customerEmail).trim() : undefined;
  let service = String(b.service ?? "").trim();
  let netCents: number;
  const orderId = b.orderId ? String(b.orderId) : null;

  if (orderId) {
    const order = await getOrder(orderId);
    if (!order) return NextResponse.json({ error: "Auftrag nicht gefunden." }, { status: 404 });
    customerName = customerName || order.customerName;
    customerEmail = customerEmail || order.customerEmail;
    service = service || order.service;
    // netEuro darf den Auftragswert überschreiben; sonst Auftragswert als Netto.
    netCents = b.netEuro != null && Number.isFinite(Number(b.netEuro)) ? Math.round(Number(b.netEuro) * 100) : order.amountCents;
  } else {
    const netEuro = Number(b.netEuro);
    if (!Number.isFinite(netEuro) || netEuro < 0) return NextResponse.json({ error: "Nettobetrag ist erforderlich." }, { status: 400 });
    netCents = Math.round(netEuro * 100);
  }

  if (!customerName || !service) return NextResponse.json({ error: "Kunde und Leistung sind erforderlich." }, { status: 400 });

  const invoice = await createInvoice({
    orderId,
    customerName,
    customerEmail,
    customerAddress: b.customerAddress ? String(b.customerAddress) : undefined,
    service,
    description: b.description ? String(b.description) : undefined,
    netCents,
    taxRate: b.taxRate != null ? Number(b.taxRate) : undefined,
    issuedAt: b.issuedAt ? String(b.issuedAt) : undefined,
    dueAt: b.dueAt ? String(b.dueAt) : undefined,
    status: (b.status as Invoice["status"]) ?? "Offen",
    note: b.note ? String(b.note) : undefined,
  });
  return NextResponse.json(invoice);
}

export async function PATCH(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const b = (await req.json().catch(() => null)) as (Partial<Invoice> & { id?: string }) | null;
  if (!b?.id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  const updated = await updateInvoice(b.id, b);
  if (!updated) return NextResponse.json({ error: "Rechnung nicht gefunden" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  if (!(await ok())) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  const b = (await req.json().catch(() => null)) as { id?: string } | null;
  if (!b?.id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  await deleteInvoice(b.id);
  return NextResponse.json({ ok: true });
}
