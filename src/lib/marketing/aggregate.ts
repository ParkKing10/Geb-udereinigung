// Reine Aggregations-Helfer fürs Marketing-Dashboard (client- & serverseitig nutzbar).

export type MSession = {
  ts: string;
  source: string;
  label: string;
  emoji: string;
  device: string;
  landing: string;
  keyword?: string;
  campaign?: string;
};

export type MLead = {
  ts: string;
  id: string;
  source: string;
  label: string;
  emoji: string;
  keyword?: string;
  campaign?: string;
  landing?: string;
  device?: string;
};

// Reale Buchung (aus orders.json) – liefert Umsatz + „gebucht".
export type MOrder = {
  ts: string;
  source: string;
  label: string;
  emoji: string;
  value: number; // Auftragswert in €
  keyword?: string;
  campaign?: string;
  landing?: string;
  device?: string;
};

export type PerfRow = {
  key: string;
  label: string;
  emoji?: string;
  sessions: number;
  leads: number;
  paid: number;
  revenue: number;
};

export function cr(paid: number, sessions: number): number {
  return sessions > 0 ? paid / sessions : 0;
}
export function aov(revenue: number, paid: number): number {
  return paid > 0 ? revenue / paid : 0;
}

export function inRange(ts: string, fromMs: number, toMs: number): boolean {
  const t = Date.parse(ts);
  return Number.isFinite(t) && t >= fromMs && t <= toMs;
}

type Keyed = { key: string; label: string; emoji?: string } | null;
type AnyRow = MSession | MLead | MOrder;

// Sessions + Leads + Buchungen nach einer Dimension gruppieren (Quelle, Keyword, Kampagne, Landingpage, Gerät).
export function groupPerformance(
  sessions: MSession[],
  leads: MLead[],
  orders: MOrder[],
  keyOf: (row: AnyRow) => Keyed,
): PerfRow[] {
  const map = new Map<string, PerfRow>();
  const ensure = (k: string, label: string, emoji?: string): PerfRow => {
    let r = map.get(k);
    if (!r) {
      r = { key: k, label, emoji, sessions: 0, leads: 0, paid: 0, revenue: 0 };
      map.set(k, r);
    }
    return r;
  };
  for (const s of sessions) { const g = keyOf(s); if (g) ensure(g.key, g.label, g.emoji).sessions++; }
  for (const l of leads) { const g = keyOf(l); if (g) ensure(g.key, g.label, g.emoji).leads++; }
  for (const o of orders) { const g = keyOf(o); if (g) { const r = ensure(g.key, g.label, g.emoji); r.paid++; r.revenue += o.value; } }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue || b.paid - a.paid || b.leads - a.leads || b.sessions - a.sessions);
}

export const bySource = (row: AnyRow): Keyed => ({ key: row.source, label: row.label, emoji: row.emoji });
export const byKeyword = (row: AnyRow): Keyed => ({ key: row.keyword || "(kein Keyword)", label: row.keyword || "(kein Keyword)" });
export const byCampaign = (row: AnyRow): Keyed => ({ key: row.campaign || "(keine Kampagne)", label: row.campaign || "(keine Kampagne)" });
export const byDevice = (row: AnyRow): Keyed => ({ key: row.device || "unbekannt", label: (row.device || "unbekannt") === "mobile" ? "Mobil" : "Desktop" });
export function byLanding(row: AnyRow): Keyed {
  const path = ((row as { landing?: string }).landing || "/").split("?")[0];
  return { key: path, label: path };
}
