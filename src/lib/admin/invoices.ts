// Echtes Rechnungs-Modul: datei-basierter Store (invoices.json) + Rechnungssteller-
// Einstellungen (invoice-settings.json). Beträge in Cent (netto). USt wird berechnet.
// Typen + reine Helfer liegen client-sicher in invoice-utils.ts.
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { BRAND, CONTACT } from "@/lib/sauberfit-data";
import type { Invoice, InvoiceSettings } from "./invoice-utils";

export type { Invoice, InvoiceStatus, InvoiceSettings } from "./invoice-utils";
export { taxCents, grossCents, effectiveStatus, monthlyPaidGross } from "./invoice-utils";

const FILE = "invoices.json";
const SETTINGS_FILE = "invoice-settings.json";

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  companyName: BRAND.name,
  addressLines: [...CONTACT.address].slice(1), // ohne den Namen (erste Zeile)
  email: CONTACT.email,
  phone: CONTACT.phone,
  web: CONTACT.web,
  taxId: "",
  vatId: "",
  bankName: "",
  iban: "",
  bic: "",
  smallBusiness: false,
  defaultTaxRate: 19,
  paymentTermDays: 14,
  numberPrefix: "RE",
  footerNote: "",
};

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(process.cwd(), file), "utf8")) as T;
  } catch {
    return fallback;
  }
}
async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.writeFile(path.join(process.cwd(), file), JSON.stringify(data, null, 2), "utf8");
}

// ── Einstellungen ───────────────────────────────────────────
export async function readInvoiceSettings(): Promise<InvoiceSettings> {
  const saved = await readJson<Partial<InvoiceSettings>>(SETTINGS_FILE, {});
  return { ...DEFAULT_INVOICE_SETTINGS, ...saved };
}
export async function saveInvoiceSettings(patch: Partial<InvoiceSettings>): Promise<InvoiceSettings> {
  const next = { ...(await readInvoiceSettings()), ...patch };
  await writeJson(SETTINGS_FILE, next);
  return next;
}

// ── Rechnungen ──────────────────────────────────────────────
export async function readInvoices(): Promise<Invoice[]> {
  const list = await readJson<Invoice[]>(FILE, []);
  return Array.isArray(list) ? list : [];
}
export async function getInvoice(id: string): Promise<Invoice | undefined> {
  return (await readInvoices()).find((i) => i.id === id);
}

// Fortlaufende Nummer je Jahr: PREFIX-YYYY-NNNN (kollisionsfrei aus Bestand ermittelt).
function nextNumber(existing: Invoice[], prefix: string, year: number): string {
  const yPrefix = `${prefix}-${year}-`;
  const maxSeq = existing
    .map((i) => i.number)
    .filter((n) => n.startsWith(yPrefix))
    .map((n) => parseInt(n.slice(yPrefix.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((m, n) => Math.max(m, n), 0);
  return `${yPrefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

type NewInvoice = {
  orderId?: string | null;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  service: string;
  description?: string;
  netCents: number;
  taxRate?: number;
  issuedAt?: string;
  dueAt?: string;
  status?: Invoice["status"];
  note?: string;
};

export async function createInvoice(input: NewInvoice): Promise<Invoice> {
  const [list, settings] = await Promise.all([readInvoices(), readInvoiceSettings()]);
  const now = new Date();
  const issued = input.issuedAt ? new Date(input.issuedAt) : now;
  const due = input.dueAt
    ? new Date(input.dueAt)
    : new Date(issued.getTime() + settings.paymentTermDays * 24 * 60 * 60 * 1000);
  const invoice: Invoice = {
    id: `inv_${Date.now()}_${randomUUID().slice(0, 8)}`,
    number: nextNumber(list, settings.numberPrefix, issued.getFullYear()),
    orderId: input.orderId ?? null,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerAddress: input.customerAddress,
    service: input.service,
    description: input.description,
    netCents: Math.round(input.netCents),
    taxRate: settings.smallBusiness ? 0 : input.taxRate ?? settings.defaultTaxRate,
    status: input.status ?? "Offen",
    issuedAt: issued.toISOString(),
    dueAt: due.toISOString(),
    paidAt: input.status === "Bezahlt" ? now.toISOString() : null,
    note: input.note,
    createdAt: now.toISOString(),
  };
  await writeJson(FILE, [invoice, ...list]);
  return invoice;
}

export async function updateInvoice(id: string, patch: Partial<Invoice>): Promise<Invoice | null> {
  const list = await readInvoices();
  const idx = list.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const cur = list[idx];
  const merged: Invoice = { ...cur, ...patch, id: cur.id, number: cur.number, createdAt: cur.createdAt };
  // paidAt automatisch setzen/löschen je nach Status.
  if (patch.status === "Bezahlt" && !merged.paidAt) merged.paidAt = new Date().toISOString();
  if (patch.status && patch.status !== "Bezahlt") merged.paidAt = null;
  await writeJson(FILE, list.map((i, j) => (j === idx ? merged : i)));
  return merged;
}

export async function deleteInvoice(id: string): Promise<void> {
  const list = await readInvoices();
  await writeJson(FILE, list.filter((i) => i.id !== id));
}
