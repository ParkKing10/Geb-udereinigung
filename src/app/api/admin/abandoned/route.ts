import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { guardNav } from "@/lib/admin/actor";
import { listAbandoned, deleteAbandoned, setAbandonedStatus, getAbandoned } from "@/lib/admin/abandoned";
import { dataPath } from "@/lib/data-dir";
import type { Lead } from "@/lib/admin/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const g = await guardNav("/admin/abgebrochen");
  if (g) return g;
  return NextResponse.json(await listAbandoned());
}

export async function POST(req: Request) {
  const g = await guardNav("/admin/abgebrochen");
  if (g) return g;
  const body = await req.json().catch(() => null);
  const id = body?.id ? String(body.id) : "";
  const op = body?.op ? String(body.op) : "";
  if (!id || !op) return NextResponse.json({ error: "id/op fehlt" }, { status: 400 });

  if (op === "status") {
    const ok = await setAbandonedStatus(id, body.status === "erledigt" ? "erledigt" : "offen");
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  if (op === "convert") {
    // Abgebrochene Anfrage als echten Lead übernehmen (Status Neu) und hier entfernen.
    const a = await getAbandoned(id);
    if (!a) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    const lead: Lead = {
      id: `lead_${Date.now()}`,
      service: a.service || "unbekannt",
      location: a.location || "–",
      name: a.name || "Unbekannt",
      phone: a.phone || "",
      email: a.email || "",
      startDate: null,
      createdAt: new Date().toISOString(),
      areaSqm: a.areaSqm ? Number(a.areaSqm) || null : null,
      objektart: a.objektart || null,
      turnus: a.turnus || null,
      firma: a.firma || null,
      besonderheiten: "Aus abgebrochener Anfrage übernommen (nicht abgeschickt).",
      attribution: a.attribution ?? null,
      images: [],
      estimate: null,
      offer: null,
      status: "Neu",
    };
    const p = dataPath("leads.json");
    let leads: Lead[] = [];
    try { leads = JSON.parse(await fs.readFile(p, "utf8")); } catch { leads = []; }
    leads.push(lead);
    await fs.writeFile(p, JSON.stringify(leads, null, 2), "utf8");
    await deleteAbandoned(id);
    return NextResponse.json({ ok: true, leadId: lead.id });
  }

  return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const g = await guardNav("/admin/abgebrochen");
  if (g) return g;
  const body = await req.json().catch(() => null);
  const id = body?.id ? String(body.id) : "";
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  const ok = await deleteAbandoned(id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
}
