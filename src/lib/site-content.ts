// Dynamischer Hero-/Trust-Content — im Admin-Dashboard editierbar, sofort live.
// Datei-basiert (site-content.json am cwd), Fallback = DEFAULT_CONTENT.
import { cache } from "react";
import { promises as fs } from "node:fs";
import { dataPath, readSeededJson } from "@/lib/data-dir";

export type Stat = { value: string; label: string };
export type Logo = { name: string; src?: string };
export type ContactPerson = {
  firstName: string;
  lastName: string;
  position: string;
  phone: string;
  email: string;
  photo?: string; // leer = Initialen-Avatar (kein Stockfoto)
  available: boolean;
  statusLabel: string; // z. B. "Heute erreichbar"
  responseTime: string; // z. B. "Antwort meist in 30 Minuten"
  quote: string;
};

export type SiteContent = {
  badge: string;
  h1Line1: string; // Keyword-Zeile (dunkel)
  h1Line2: string; // Keyword-Zeile (grün)
  socialProof: string; // Zeile direkt unter der H1
  subtitle: string;
  ctaPrimary: string;
  ctaMicro: string; // Hemmschwellen-Reducer unter dem Button
  riskReducers: string[]; // ✅ Kostenlos · Unverbindlich · Festpreis
  google: { rating: string; count: string };
  stats: Stat[]; // Trust-Leiste (Zahlen zählen beim Scrollen hoch)
  logos: Logo[]; // Kundenlogos (Graustufen)
  trustbox: string[]; // konkrete Vorteile in der Bild-Box
  person: ContactPerson;
};

export const DEFAULT_CONTENT: SiteContent = {
  badge: "Kostenloses Festpreis-Angebot",
  h1Line1: "Gebäudereinigung",
  h1Line2: "deutschlandweit",
  socialProof: "Bereits über 1.500 Unternehmen vertrauen auf Deutsche Gebäudedienste.",
  subtitle:
    "Deutsche Gebäudedienste übernimmt Ihre Gebäudereinigung in ganz Deutschland – Büro-, Unterhalts-, Glas- und Industriereinigung, zuverlässig und zum Festpreis.",
  ctaPrimary: "Jetzt Angebot berechnen",
  ctaMicro: "Dauert nur 60 Sekunden.",
  riskReducers: ["Kostenlos", "Unverbindlich", "Festpreis-Angebot"],
  google: { rating: "4,9", count: "124" },
  stats: [
    { value: "2.800+", label: "betreute Objekte" },
    { value: "500.000+", label: "gereinigte m²" },
    { value: "1.500+", label: "zufriedene Kunden" },
    { value: "Deutschlandweit", label: "im Einsatz" },
  ],
  // Kundenlogos (im Admin editierbar). WICHTIG: nur echte Kunden mit Erlaubnis anzeigen (§5 UWG).
  logos: [
    { name: "Mercedes-Benz" },
    { name: "EDEKA" },
    { name: "Sparkasse" },
    { name: "XXXLutz" },
    { name: "ENGEL & VÖLKERS" },
  ],
  trustbox: [
    "Festpreisgarantie",
    "Deutschlandweit im Einsatz",
    "Persönlicher Objektleiter",
    "Versichert bis 10 Mio. €",
  ],
  person: {
    firstName: "A.",
    lastName: "Christian",
    position: "Ihr persönlicher Objektberater",
    phone: "+49 152 07306840",
    email: "info@deutschegebäudedienste.de",
    photo: "/images/ansprechpartner.jpg",
    available: true,
    statusLabel: "Heute erreichbar",
    responseTime: "Antwort meist in 30 Minuten",
    quote: "Ich begleite Sie persönlich – von der Anfrage bis zum fertigen Angebot.",
  },
};

const FILE = "site-content.json";

// Tiefen-Merge (Defaults ⟵ gespeicherte Overrides), damit neue Felder nie fehlen.
function merge(base: SiteContent, patch: Partial<SiteContent>): SiteContent {
  return {
    ...base,
    ...patch,
    google: { ...base.google, ...(patch.google ?? {}) },
    person: { ...base.person, ...(patch.person ?? {}) },
    stats: patch.stats ?? base.stats,
    logos: patch.logos ?? base.logos,
    riskReducers: patch.riskReducers ?? base.riskReducers,
    trustbox: patch.trustbox ?? base.trustbox,
  };
}

// cache() dedupes repeated calls within the same request (layout + Footer + Hero + page
// all call this) to a single file read, important since (site) is force-dynamic.
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  try {
    // Seed-Fallback: liest die Repo-Kopie, falls die Disk (DATA_DIR) noch leer ist.
    return merge(DEFAULT_CONTENT, await readSeededJson<Partial<SiteContent>>(FILE));
  } catch {
    return DEFAULT_CONTENT;
  }
});

export async function saveSiteContent(patch: Partial<SiteContent>): Promise<SiteContent> {
  const next = merge(DEFAULT_CONTENT, patch);
  await fs.writeFile(dataPath(FILE), JSON.stringify(next, null, 2), "utf8");
  return next;
}
