import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { dataPath, uploadPath } from "@/lib/data-dir";
import { deleteAbandoned } from "@/lib/admin/abandoned";
import { appendJourneyEvent } from "@/lib/journeys";
import { sendLeadAlert } from "@/lib/notify";
import { SERVICES } from "@/lib/sauberfit-data";
import { estimateLead } from "@/lib/ai/estimate";
import type { Lead } from "@/lib/admin/data";

const FILE = dataPath("leads.json");
const MAX_IMAGES = 8;
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });

  const service = String(form.get("service") ?? "").trim();
  const location = String(form.get("location") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const startDate = String(form.get("startDate") ?? "").trim() || null;
  const areaRaw = Number(form.get("areaSqm"));
  const areaSqm = Number.isFinite(areaRaw) && areaRaw > 0 ? Math.round(areaRaw) : null;
  const objektart = String(form.get("objektart") ?? "").trim() || null;
  const verschmutzung = String(form.get("verschmutzung") ?? "").trim() || null;
  const turnus = String(form.get("turnus") ?? "").trim() || null;
  const zeitfenster = String(form.get("zeitfenster") ?? "").trim() || null;
  const firma = String(form.get("firma") ?? "").trim() || null;
  const besonderheiten = String(form.get("besonderheiten") ?? "").trim() || null;
  const details = (
    [
      ["Anzahl Etagen", String(form.get("etagen") ?? "").trim()],
      ["Aufzug vorhanden", String(form.get("aufzug") ?? "").trim()],
      ["Sanitärbereiche", String(form.get("sanitaer") ?? "").trim()],
      ["Viel Glas / Fenster", String(form.get("glas") ?? "").trim()],
      ["Möbliert", String(form.get("moebliert") ?? "").trim()],
      ["Parkmöglichkeiten", String(form.get("parken") ?? "").trim()],
      ["Außenflächen reinigen", String(form.get("aussen") ?? "").trim()],
    ] as [string, string][]
  )
    .filter(([, v]) => v)
    .map(([label, value]) => ({ label, value }));

  // Kontakt-zuerst: Name + Telefon reichen für einen Lead – Leistung, Ort & Objektdaten
  // klären wir telefonisch. Der Rückruf-Shortcut ("quick") braucht sogar nur die Nummer.
  const quick = String(form.get("quick") ?? "") === "1";
  if (quick) {
    if (!phone) return NextResponse.json({ error: "Bitte Handynummer angeben." }, { status: 400 });
  } else if (!name || !phone) {
    return NextResponse.json({ error: "Bitte Name und Telefonnummer angeben." }, { status: 400 });
  }

  const leadName = name || (quick ? "Rückruf erbeten" : name);
  const leadLocation = location || "—";
  const leadBesonderheiten = quick
    ? ["⚡ Schnell-Anfrage: Rückruf gewünscht", besonderheiten].filter(Boolean).join(" · ")
    : besonderheiten;

  const id = `lead_${Date.now()}`;
  const serviceName = SERVICES.find((s) => s.slug === service)?.name ?? service;
  const sidRaw = String(form.get("sid") ?? "").trim();
  const sid = /^[a-f0-9-]{8,40}$/i.test(sidRaw) ? sidRaw : null;

  // Attribution (gclid/utm/referrer) aus den attr_*-Feldern übernehmen – für Ads-Offline-Conversions & Quellen-Reporting.
  const attribution: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (k.startsWith("attr_") && typeof v === "string" && v.trim()) {
      attribution[k.slice(5)] = v.trim().slice(0, 300);
    }
  }

  // Bilder speichern (optional) + für die KI als base64 sammeln.
  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0).slice(0, MAX_IMAGES);
  const imagePaths: string[] = [];
  const aiImages: { data: string; mime: string }[] = [];
  if (files.length) {
    const dir = uploadPath("leads", id);
    await fs.mkdir(dir, { recursive: true });
    let i = 0;
    for (const file of files) {
      if (!ALLOWED.has(file.type) || file.size > MAX_BYTES) continue;
      const buf = Buffer.from(await file.arrayBuffer());
      const fname = `bild_${++i}.${EXT[file.type]}`;
      await fs.writeFile(path.join(dir, fname), buf);
      imagePaths.push(`/uploads/leads/${id}/${fname}`);
      aiImages.push({ data: buf.toString("base64"), mime: file.type });
    }
  }

  // KI-Schätzung nur, wenn Objektdaten vorliegen (Bilder, Fläche oder Objektart).
  // Kontakt-zuerst-/Rückruf-Anfragen liefern die nicht – dort telefonisch klären.
  const hasObjektData = aiImages.length > 0 || !!areaSqm || !!objektart;
  const estimate = quick || !hasObjektData
    ? null
    : await estimateLead({ service, serviceName, location, images: aiImages, areaSqm, objektart, verschmutzung, turnus, besonderheiten, details });

  const lead: Lead = {
    id, service, location: leadLocation, name: leadName, phone, email, startDate,
    createdAt: new Date().toISOString(),
    areaSqm, objektart, verschmutzung, turnus, zeitfenster, firma, besonderheiten: leadBesonderheiten, details,
    attribution: Object.keys(attribution).length ? attribution : null,
    sid,
    images: imagePaths,
    estimate,
    offer: null,
    status: "Neu",
  };

  try {
    let leads: Lead[] = [];
    try { leads = JSON.parse(await fs.readFile(FILE, "utf8")); } catch { leads = []; }
    leads.push(lead);
    await fs.writeFile(FILE, JSON.stringify(leads, null, 2), "utf8");
  } catch (err) {
    console.error("Lead konnte nicht gespeichert werden:", err);
  }

  // Erfolgreich abgeschickt → evtl. vorhandenen "abgebrochen"-Eintrag dieser Session entfernen.
  if (sid) {
    await deleteAbandoned(sid).catch(() => {});
    await appendJourneyEvent({ sid, t: "submit", p: id }).catch(() => {});
  }

  // Push-Benachrichtigung an den Betreiber (fire-and-forget, blockiert die Antwort nicht).
  void sendLeadAlert({ name: leadName, phone });

  console.log("📥 Neuer Lead:", { id, service, name: leadName, quick, images: imagePaths.length, estimateModel: estimate?.model ?? "—" });
  return NextResponse.json({ ok: true, id, estimate });
}
