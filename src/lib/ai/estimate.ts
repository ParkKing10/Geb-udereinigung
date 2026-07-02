// KI-Kostenschätzung aus hochgeladenen Bildern.
// Nutzt Anthropic-Vision, wenn ANTHROPIC_API_KEY gesetzt ist – sonst eine
// deterministische Heuristik, damit die Berechnung immer ein Ergebnis liefert.
import type { AiEstimate } from "@/lib/admin/data";
import { anthropicConfig } from "@/lib/admin/app-settings";

export type EstimateInput = {
  service: string; // slug
  serviceName: string;
  location: string;
  images: { data: string; mime: string }[]; // base64 (ohne data:-Prefix)
  areaSqm?: number | null; // optionale Kundenangabe zur Fläche
  objektart?: string | null;
  verschmutzung?: string | null; // leicht | normal | stark
  turnus?: string | null;
  besonderheiten?: string | null;
  details?: { label: string; value: string }[];
};

const HOURLY_RATE_CENTS = 3200; // 32 €/h Standardsatz

const BASE_SQM: Record<string, number> = {
  hotelreinigung: 400, bueroreinigung: 150, treppenhausreinigung: 200, praxisreinigung: 100,
  industriereinigung: 900, glasreinigung: 80, bauendreinigung: 250, unterhaltsreinigung: 180,
  "kita-schulen": 350, "pv-solar": 300,
};
const TURNUS: Record<string, string> = {
  hotelreinigung: "Wöchentlich", bueroreinigung: "2× / Woche", treppenhausreinigung: "Wöchentlich",
  praxisreinigung: "Wöchentlich", industriereinigung: "Wöchentlich", glasreinigung: "Monatlich",
  bauendreinigung: "Einmalig", unterhaltsreinigung: "2× / Woche", "kita-schulen": "Wöchentlich",
  "pv-solar": "Einmalig",
};

function round(n: number, step = 1) { return Math.round(n / step) * step; }

function heuristic(input: EstimateInput): AiEstimate {
  const base = BASE_SQM[input.service] ?? 150;
  const hasArea = !!input.areaSqm && input.areaSqm > 0;
  const area = hasArea ? Math.round(input.areaSqm!) : round(base * (0.9 + Math.min(input.images.length, 6) * 0.05));
  const cond = (["leicht", "normal", "stark"].includes(input.verschmutzung ?? "") ? input.verschmutzung : "normal") as "leicht" | "normal" | "stark";
  const condMult = cond === "leicht" ? 0.85 : cond === "stark" ? 1.3 : 1;
  const hours = Math.max(2, round((area / 45) * condMult * 2) / 2); // halbe Stunden
  const turnus = input.turnus || TURNUS[input.service] || "Wöchentlich";
  const low = round(hours * HOURLY_RATE_CENTS * 0.9, 100);
  const high = round(hours * HOURLY_RATE_CENTS * 1.3, 100);
  return {
    areaSqmEst: area,
    condition: cond,
    recommendedTurnus: turnus,
    estimatedHours: hours,
    hourlyRateCents: HOURLY_RATE_CENTS,
    priceLowCents: low,
    priceHighCents: high,
    summary: `Grobschätzung für ${input.serviceName} auf ca. ${area} m². ${input.images.length > 0 ? "Basierend auf den Fotos und" : "Basierend auf"} typischen Werten für diese Leistung. Für ein verbindliches Angebot empfehlen wir eine kurze Vor-Ort-Besichtigung.`,
    findings: [
      hasArea ? `Fläche laut Kundenangabe: ${area} m²` : `Geschätzte Reinigungsfläche: ca. ${area} m²`,
      `Verschmutzungsgrad: ${cond}`,
      `Turnus: ${turnus}`,
      `Kalkulierter Aufwand: ca. ${hours} Std. pro Einsatz`,
    ],
    confidence: Math.min(0.9, (input.images.length > 0 ? 0.5 : 0.35) + (hasArea ? 0.2 : 0) + (input.verschmutzung ? 0.1 : 0) + (input.turnus ? 0.05 : 0)),
    model: "heuristik",
    createdAt: new Date().toISOString(),
  };
}

async function anthropic(input: EstimateInput, apiKey: string, model: string): Promise<AiEstimate> {
  const content: unknown[] = input.images.slice(0, 8).map((img) => ({
    type: "image",
    source: { type: "base64", media_type: img.mime, data: img.data },
  }));
  content.push({
    type: "text",
    text: `Du bist Kalkulator einer deutschen Gebäudereinigungsfirma. Schätze anhand der Fotos den Reinigungsaufwand.
Leistung: ${input.serviceName}. Ort: ${input.location || "unbekannt"}. Stundensatz: 32 €/h.${input.areaSqm && input.areaSqm > 0 ? `\nDer Kunde gibt die Fläche mit ca. ${Math.round(input.areaSqm)} m² an – nutze diesen Wert als starken Anhaltspunkt.` : ""}${input.objektart ? `\nObjektart: ${input.objektart}.` : ""}${input.verschmutzung ? `\nVerschmutzungsgrad laut Kunde: ${input.verschmutzung} – berücksichtige das im Aufwand.` : ""}${input.turnus ? `\nGewünschter Turnus: ${input.turnus} – verwende ihn als recommendedTurnus.` : ""}${input.details && input.details.length ? `\nWeitere Angaben: ${input.details.map((d) => `${d.label}: ${d.value}`).join(", ")}.` : ""}${input.besonderheiten ? `\nBesonderheiten laut Kunde: ${input.besonderheiten} – berücksichtige diese im Aufwand.` : ""}
Antworte AUSSCHLIESSLICH mit einem JSON-Objekt (kein Markdown, kein Text drumherum) exakt in diesem Schema:
{"areaSqmEst": number, "condition": "leicht"|"normal"|"stark", "recommendedTurnus": string, "estimatedHours": number, "priceLowEur": number, "priceHighEur": number, "summary": string (deutsch, 1-2 Sätze), "findings": string[] (3-5 kurze deutsche Beobachtungen aus den Fotos), "confidence": number (0..1)}`,
  });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens: 1024, messages: [{ role: "user", content }] }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = await res.json();
    const text: string = (data?.content ?? []).map((b: { text?: string }) => b.text ?? "").join("").trim();
    const jsonStr = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const p = JSON.parse(jsonStr);
    const hours = Math.max(0.5, Number(p.estimatedHours) || 2);
    const low = Math.round((Number(p.priceLowEur) || 0) * 100);
    const high = Math.round((Number(p.priceHighEur) || 0) * 100);
    const rate = hours > 0 && high > 0 ? Math.round((low + high) / 2 / hours) : HOURLY_RATE_CENTS;
    const cond = ["leicht", "normal", "stark"].includes(p.condition) ? p.condition : "normal";
    return {
      areaSqmEst: Math.round(Number(p.areaSqmEst) || 0),
      condition: cond,
      recommendedTurnus: String(p.recommendedTurnus || TURNUS[input.service] || "Wöchentlich"),
      estimatedHours: hours,
      hourlyRateCents: rate,
      priceLowCents: low || Math.round(hours * HOURLY_RATE_CENTS * 0.9),
      priceHighCents: high || Math.round(hours * HOURLY_RATE_CENTS * 1.3),
      summary: String(p.summary || "KI-Schätzung auf Basis der hochgeladenen Fotos."),
      findings: Array.isArray(p.findings) ? p.findings.map(String).slice(0, 6) : [],
      confidence: Math.max(0, Math.min(1, Number(p.confidence) || 0.7)),
      model,
      createdAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function estimateLead(input: EstimateInput): Promise<AiEstimate> {
  const { key, model } = await anthropicConfig();
  if (key && input.images.length > 0) {
    try {
      return await anthropic(input, key, model);
    } catch (err) {
      console.error("KI-Schätzung fehlgeschlagen, nutze Heuristik:", err);
    }
  }
  return heuristic(input);
}
