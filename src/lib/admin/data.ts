// Typen + Seed-Daten fürs Admin-Dashboard. Beträge in Cent (keine Float-Fehler).
// Leads & Messages kommen real aus leads.json / contacts.json (siehe store.ts).

// KI-Schätzung aus den hochgeladenen Bildern.
export type AiEstimate = {
  areaSqmEst: number;
  condition: "leicht" | "normal" | "stark";
  recommendedTurnus: string;
  estimatedHours: number;
  hourlyRateCents: number;
  priceLowCents: number;
  priceHighCents: number;
  summary: string;
  findings: string[];
  confidence: number; // 0..1
  model: string; // z.B. "claude-sonnet-4-6" oder "heuristik"
  createdAt: string;
};

// Vom Admin konfiguriertes Angebot (überschreibt/verfeinert die KI-Schätzung).
export type AdminOffer = {
  turnus: string;
  hours: number;
  hourlyRateCents: number;
  discountPct: number;
  pricePerVisitCents: number;
  pricePerMonthCents: number;
  note: string;
  updatedAt: string;
};

export type Lead = {
  id: string;
  service: string;
  location: string;
  name: string;
  phone: string;
  email: string;
  startDate: string | null;
  createdAt: string;
  areaSqm?: number | null; // optionale Kundenangabe zur Fläche
  objektart?: string | null;
  verschmutzung?: string | null; // leicht | normal | stark
  turnus?: string | null;
  zeitfenster?: string | null;
  firma?: string | null;
  besonderheiten?: string | null;
  details?: { label: string; value: string }[]; // weitere optionale Angaben (Etagen, Aufzug, …)
  attribution?: Record<string, string> | null; // gclid/utm/referrer für Ads-Zuordnung
  sid?: string | null; // Session-ID → verknüpft den Lead mit seiner Besucher-Session
  images?: string[]; // öffentliche Pfade unter /uploads/leads/<id>/
  estimate?: AiEstimate | null;
  offer?: AdminOffer | null;
  status?: LeadStatus;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
};

// Reale Buchung/Bestellung (orders.json) – aus einem Lead oder manuell erstellt.
export type OrderStatus = "Neu" | "Bestätigt" | "Aktiv" | "Abgeschlossen" | "Storniert";
export type Order = {
  id: string;
  createdAt: string;
  leadId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  service: string;
  location?: string;
  turnus?: string;
  amountCents: number; // Auftragswert
  note?: string;
  status: OrderStatus;
  // Attribution-Snapshot fürs Marketing-Reporting
  source: string;
  sourceLabel: string;
  sourceEmoji: string;
  keyword?: string;
  campaign?: string;
  // Kunden-Historie (Deduplizierung per E-Mail)
  repeat: boolean; // Wiederbesteller
  orderIndex: number; // 1 = Erstbestellung, 2 = 2. Bestellung …
};

// Rechnungen leben jetzt im echten Store (src/lib/admin/invoices.ts + invoices.json).
// Blog-Posts kommen aus src/lib/blog/store.ts. Frühere Mock-Arrays (INVOICES,
// BLOG_POSTS, REVENUE_SERIES) wurden entfernt.

// Pseudo-Status je Lead (deterministisch aus der id) für die Anzeige.
export type LeadStatus = "Neu" | "Kontaktiert" | "Angebot" | "Gewonnen" | "Verloren";
const LEAD_STATES: LeadStatus[] = ["Neu", "Kontaktiert", "Angebot", "Gewonnen", "Verloren"];
export function leadStatus(id: string): LeadStatus {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return LEAD_STATES[h % LEAD_STATES.length];
}
