// Besucher-Journeys (journeys.json in DATA_DIR): Ereignis-Protokoll pro Session-ID.
// Anonym: nur Pfade/Schritte – KEINE Eingabewerte (die liegen ggf. in abandoned-leads/leads).
// view        – Seitenaufruf (p = Pfad)
// quote_open  – Angebots-Formular geöffnet
// quote_step  – Formular-Schritt erreicht (p = "1".."3")
// contact     – E-Mail/Telefon eingetippt (serverseitig aus der Abbruch-Erfassung)
// submit      – Lead abgeschickt (serverseitig aus /api/lead)
import { promises as fs } from "node:fs";
import { dataPath } from "@/lib/data-dir";

export type JourneyEvent = {
  sid: string;
  ts: string; // ISO
  t: "view" | "quote_open" | "quote_step" | "contact" | "submit";
  p?: string;
};

const FILE = "journeys.json";
const MAX_EVENTS = 20_000; // Ringpuffer gegen unbegrenztes Wachstum

async function readAll(): Promise<JourneyEvent[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(dataPath(FILE), "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendJourneyEvent(ev: Omit<JourneyEvent, "ts">): Promise<void> {
  try {
    let rows = await readAll();
    // Doppel-Beacons (z. B. sendBeacon + Retry) innerhalb von 2 s verwerfen.
    const last = [...rows].reverse().find((r) => r.sid === ev.sid);
    if (last && last.t === ev.t && last.p === ev.p && Date.now() - Date.parse(last.ts) < 2000) return;
    rows.push({ ...ev, ts: new Date().toISOString() });
    if (rows.length > MAX_EVENTS) rows = rows.slice(rows.length - MAX_EVENTS);
    await fs.writeFile(dataPath(FILE), JSON.stringify(rows), "utf8");
  } catch {
    // Journey-Protokoll darf nie stören
  }
}

export async function readJourneyEvents(): Promise<JourneyEvent[]> {
  return readAll();
}
