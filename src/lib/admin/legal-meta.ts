// Client-sichere Rechtstext-Typen + Metadaten (KEIN node:fs – auch im Browser nutzbar).
export type LegalKey = "impressum" | "datenschutz" | "agb";
export type LegalContent = Record<LegalKey, string>;

export const LEGAL_META: { key: LegalKey; label: string; title: string; hint: string }[] = [
  { key: "impressum", label: "Impressum", title: "Impressum", hint: "Pflichtangaben nach § 5 TMG." },
  { key: "datenschutz", label: "Datenschutz", title: "Datenschutzerklärung", hint: "Der Cookie-/Tracking-Abschnitt wird automatisch ergänzt – hier nur den restlichen Text pflegen." },
  { key: "agb", label: "AGB", title: "Allgemeine Geschäftsbedingungen", hint: "Allgemeine Geschäftsbedingungen." },
];
