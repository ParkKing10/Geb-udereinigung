// Client-sichere Rechnungs-Typen + reine Helfer (KEIN node:fs – auch im Browser nutzbar).

export type InvoiceStatus = "Entwurf" | "Offen" | "Bezahlt" | "Überfällig";

export type Invoice = {
  id: string;
  number: string; // z. B. RE-2026-0001
  orderId?: string | null;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string; // mehrzeilig (\n)
  service: string;
  description?: string;
  netCents: number; // Nettobetrag
  taxRate: number; // USt-Satz in % (0 = Kleinunternehmer §19)
  status: Exclude<InvoiceStatus, "Überfällig">; // gespeicherter Status
  issuedAt: string; // ISO-Datum (Rechnungsdatum)
  dueAt: string; // ISO-Datum (Zahlungsziel)
  paidAt?: string | null;
  note?: string;
  createdAt: string;
};

export type InvoiceSettings = {
  companyName: string;
  addressLines: string[];
  email: string;
  phone: string;
  web?: string;
  taxId: string; // Steuernummer
  vatId: string; // USt-IdNr.
  bankName: string;
  iban: string;
  bic: string;
  smallBusiness: boolean; // §19 UStG → keine USt
  defaultTaxRate: number;
  paymentTermDays: number;
  numberPrefix: string;
  footerNote?: string;
};

export function taxCents(inv: Pick<Invoice, "netCents" | "taxRate">): number {
  return Math.round(inv.netCents * (inv.taxRate / 100));
}
export function grossCents(inv: Pick<Invoice, "netCents" | "taxRate">): number {
  return inv.netCents + taxCents(inv);
}

// „Überfällig" wird nie gespeichert, sondern zur Laufzeit ermittelt: Offen + Fälligkeit vorbei.
export function effectiveStatus(inv: Invoice, now = new Date()): InvoiceStatus {
  if (inv.status === "Offen" && new Date(inv.dueAt).getTime() < now.getTime()) return "Überfällig";
  return inv.status;
}

const MONTHS_DE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

// Umsatz (brutto) bezahlter Rechnungen je Monat, letzte `months` Monate bis heute.
export function monthlyPaidGross(invoices: Invoice[], months = 8, now = new Date()): { month: string; gross: number }[] {
  const buckets = Array.from({ length: months }, (_, k) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - k), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, month: MONTHS_DE[d.getMonth()], gross: 0 };
  });
  const idx = new Map(buckets.map((b, i) => [b.key, i]));
  for (const inv of invoices) {
    if (inv.status !== "Bezahlt") continue;
    const d = new Date(inv.paidAt || inv.issuedAt);
    const i = idx.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i != null) buckets[i].gross += grossCents(inv);
  }
  return buckets.map((b) => ({ month: b.month, gross: b.gross }));
}
