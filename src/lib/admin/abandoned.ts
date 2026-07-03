// Abgebrochene Angebots-Anfragen (abandoned-leads.json in DATA_DIR):
// Besucher hat E-Mail oder Handynummer eingetippt, aber nicht abgeschickt.
// Upsert per Session-ID (sid) – wiederholtes Tippen überschreibt denselben Eintrag.
import { promises as fs } from "node:fs";
import { dataPath } from "@/lib/data-dir";

export type AbandonedLead = {
  id: string; // = sid des Besuchers
  createdAt: string;
  updatedAt: string;
  step: number; // letzter Formular-Schritt (0..2)
  service?: string;
  location?: string;
  objektart?: string;
  areaSqm?: string;
  turnus?: string;
  firma?: string;
  name?: string;
  phone?: string;
  email?: string;
  attribution?: Record<string, string>;
  status: "offen" | "erledigt";
};

const FILE = "abandoned-leads.json";

async function readAll(): Promise<AbandonedLead[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(dataPath(FILE), "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
async function writeAll(list: AbandonedLead[]): Promise<void> {
  await fs.writeFile(dataPath(FILE), JSON.stringify(list, null, 2), "utf8");
}

export async function listAbandoned(): Promise<AbandonedLead[]> {
  return (await readAll()).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function upsertAbandoned(
  sid: string,
  patch: Omit<Partial<AbandonedLead>, "id" | "createdAt" | "updatedAt" | "status">,
): Promise<void> {
  const list = await readAll();
  const now = new Date().toISOString();
  const idx = list.findIndex((a) => a.id === sid);
  if (idx === -1) {
    list.push({ id: sid, createdAt: now, updatedAt: now, step: patch.step ?? 0, status: "offen", ...patch });
  } else {
    // Nur nicht-leere Felder übernehmen – späteres Löschen im Formular soll Daten nicht wegwerfen.
    const merged = { ...list[idx] };
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined && v !== null && v !== "") (merged as Record<string, unknown>)[k] = v;
    }
    merged.updatedAt = now;
    list[idx] = merged;
  }
  await writeAll(list);
}

export async function deleteAbandoned(id: string): Promise<boolean> {
  const list = await readAll();
  const next = list.filter((a) => a.id !== id);
  if (next.length === list.length) return false;
  await writeAll(next);
  return true;
}

export async function setAbandonedStatus(id: string, status: "offen" | "erledigt"): Promise<boolean> {
  const list = await readAll();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  list[idx] = { ...list[idx], status, updatedAt: new Date().toISOString() };
  await writeAll(list);
  return true;
}

export async function getAbandoned(id: string): Promise<AbandonedLead | null> {
  return (await readAll()).find((a) => a.id === id) ?? null;
}
