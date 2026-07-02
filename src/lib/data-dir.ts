// Zentrales Basisverzeichnis für ALLE Laufzeitdaten (JSON-Stores + Uploads).
//
// - Lokal (Dev): DATA_DIR ist nicht gesetzt → Fallback auf das Projektverzeichnis
//   (process.cwd()), also Verhalten wie bisher.
// - Produktion (Render): DATA_DIR zeigt auf eine gemountete persistente Disk
//   (z. B. /var/data). Dann überleben Leads/Aufträge/Rechnungen/Content/Uploads
//   jeden Deploy und Neustart.
//
// Server-only (nutzt node:fs). Niemals aus Client-Komponenten importieren.
import { promises as fs } from "node:fs";
import path from "node:path";

export const DATA_DIR = process.env.DATA_DIR?.trim() || process.cwd();

// True, wenn DATA_DIR ein anderes Verzeichnis als das Projektverzeichnis ist
// (also eine externe Disk). Steuert das Seed-Fallback.
const usingExternalDir = path.resolve(DATA_DIR) !== path.resolve(process.cwd());

/** Pfad einer Datei/eines Ordners innerhalb von DATA_DIR. */
export function dataPath(...segments: string[]): string {
  return path.join(DATA_DIR, ...segments);
}

/** Wurzelverzeichnis für hochgeladene Dateien (Kundenfotos, Logos, Team, E-Mail). */
export const UPLOAD_DIR = dataPath("uploads");

/** Pfad einer hochgeladenen Datei innerhalb von DATA_DIR/uploads. */
export function uploadPath(...segments: string[]): string {
  return path.join(UPLOAD_DIR, ...segments);
}

/**
 * Liest eine JSON-Datei aus DATA_DIR. Existiert sie dort nicht und ist DATA_DIR
 * ein externes Verzeichnis, wird als Seed die im Repo mitgelieferte Kopie aus dem
 * Projektverzeichnis gelesen (z. B. site-content.json, blog-posts.json beim ersten
 * Deploy auf leerer Disk). Wirft, wenn beide fehlen – Aufrufer fangen das ab und
 * liefern ihre Defaults.
 */
export async function readSeededJson<T>(file: string): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(dataPath(file), "utf8")) as T;
  } catch {
    if (usingExternalDir) {
      return JSON.parse(await fs.readFile(path.join(process.cwd(), file), "utf8")) as T;
    }
    throw new Error(`readSeededJson: ${file} nicht gefunden`);
  }
}

/** Stellt sicher, dass DATA_DIR existiert (für Writes auf einer frischen Disk). */
export async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}
