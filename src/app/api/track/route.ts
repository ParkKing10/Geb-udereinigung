import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { dataPath } from "@/lib/data-dir";
import { deriveSource } from "@/lib/marketing/source";

export const runtime = "nodejs";

const FILE = dataPath("sessions.json");
const MAX_ROWS = 50000; // Ringpuffer gegen unbegrenztes Wachstum

export type SessionRow = {
  ts: string;
  source: string;
  label: string;
  emoji: string;
  device: "mobile" | "desktop";
  landing: string;
  keyword?: string; // utm_term
  campaign?: string; // utm_campaign
  medium?: string;
  gclid?: string;
};

function s(v: unknown, max = 200): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t.slice(0, max) : undefined;
}

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const src = deriveSource({
    gclid: s(b.gclid),
    gbraid: s(b.gbraid),
    wbraid: s(b.wbraid),
    msclkid: s(b.msclkid),
    utm_source: s(b.utm_source),
    utm_medium: s(b.utm_medium),
    referrer: s(b.referrer, 300),
  });

  const row: SessionRow = {
    ts: new Date().toISOString(),
    source: src.key,
    label: src.label,
    emoji: src.emoji,
    device: b.device === "mobile" ? "mobile" : "desktop",
    landing: s(b.landing, 200) || "/",
    keyword: s(b.utm_term, 120),
    campaign: s(b.utm_campaign, 120),
    medium: s(b.utm_medium, 60),
    gclid: s(b.gclid, 120),
  };

  try {
    let rows: SessionRow[] = [];
    try {
      rows = JSON.parse(await fs.readFile(FILE, "utf8"));
      if (!Array.isArray(rows)) rows = [];
    } catch {
      rows = [];
    }
    rows.push(row);
    if (rows.length > MAX_ROWS) rows = rows.slice(rows.length - MAX_ROWS);
    await fs.writeFile(FILE, JSON.stringify(rows), "utf8");
  } catch {
    // Tracking darf nie den Nutzer stören
  }

  return NextResponse.json({ ok: true });
}
