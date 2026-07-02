"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Eye, Plus, X, Loader2, Check, Trash2, FileText, ChevronDown } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/lib/admin/invoice-utils";
import { effectiveStatus, grossCents } from "@/lib/admin/invoice-utils";
import type { Order } from "@/lib/admin/data";
import { StatusBadge, table } from "./ui";
import { formatEUR, formatDate } from "@/lib/admin/format";

const field = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5d8a34]";
const lbl = "mb-1 block text-xs font-medium text-neutral-500";
const FILTERS: (InvoiceStatus | "Alle")[] = ["Alle", "Offen", "Überfällig", "Bezahlt", "Entwurf"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function NewInvoice({ orders, defaultTaxRate, onDone }: { orders: Order[]; defaultTaxRate: number; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    orderId: "", customerName: "", customerEmail: "", customerAddress: "", service: "",
    description: "", netEuro: "", taxRate: String(defaultTaxRate), issuedAt: todayISO(), status: "Offen", note: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  function pickOrder(id: string) {
    const o = orders.find((x) => x.id === id);
    if (!o) { setF((p) => ({ ...p, orderId: "" })); return; }
    setF((p) => ({
      ...p, orderId: id, customerName: o.customerName, customerEmail: o.customerEmail,
      service: o.service, netEuro: String(Math.round(o.amountCents / 100)),
    }));
  }

  const net = Number(f.netEuro) || 0;
  const rate = Number(f.taxRate) || 0;
  const gross = net * (1 + rate / 100);

  async function submit() {
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/invoice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: f.orderId || undefined, customerName: f.customerName, customerEmail: f.customerEmail,
          customerAddress: f.customerAddress, service: f.service, description: f.description,
          netEuro: Number(f.netEuro), taxRate: Number(f.taxRate), issuedAt: f.issuedAt, status: f.status, note: f.note,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Fehler");
      setOpen(false);
      setF({ orderId: "", customerName: "", customerEmail: "", customerAddress: "", service: "", description: "", netEuro: "", taxRate: String(defaultTaxRate), issuedAt: todayISO(), status: "Offen", note: "" });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#16241a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f1c14]"><Plus size={16} /> Rechnung erstellen</button>;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900">Neue Rechnung</h3>
          <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-700"><X size={18} /></button>
        </div>

        {orders.length > 0 && (
          <label className="mb-3 block">
            <span className={lbl}>Aus Auftrag übernehmen (optional)</span>
            <select className={field} value={f.orderId} onChange={(e) => pickOrder(e.target.value)}>
              <option value="">— Manuell erfassen —</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>{o.customerName} · {o.service} · {formatEUR(o.amountCents)}</option>
              ))}
            </select>
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block"><span className={lbl}>Kunde *</span><input className={field} value={f.customerName} onChange={(e) => set("customerName", e.target.value)} /></label>
          <label className="block"><span className={lbl}>E-Mail</span><input className={field} value={f.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} placeholder="kunde@firma.de" /></label>
          <label className="block"><span className={lbl}>Leistung *</span><input className={field} value={f.service} onChange={(e) => set("service", e.target.value)} placeholder="Büroreinigung" /></label>
          <label className="col-span-2 block"><span className={lbl}>Kundenadresse (für die Rechnung)</span><textarea className={`${field} min-h-[56px] resize-y`} value={f.customerAddress} onChange={(e) => set("customerAddress", e.target.value)} placeholder="Firma&#10;Straße 1&#10;12345 Stadt" /></label>
          <label className="col-span-2 block"><span className={lbl}>Beschreibung / Leistungszeitraum</span><input className={field} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="z. B. Unterhaltsreinigung Juni 2026" /></label>
          <label className="block"><span className={lbl}>Netto (€) *</span><input className={field} inputMode="decimal" value={f.netEuro} onChange={(e) => set("netEuro", e.target.value)} placeholder="3600" /></label>
          <label className="block"><span className={lbl}>USt-Satz (%)</span><input className={field} inputMode="decimal" value={f.taxRate} onChange={(e) => set("taxRate", e.target.value)} /></label>
          <label className="block"><span className={lbl}>Rechnungsdatum</span><input type="date" className={field} value={f.issuedAt} onChange={(e) => set("issuedAt", e.target.value)} /></label>
          <label className="block"><span className={lbl}>Status</span>
            <select className={field} value={f.status} onChange={(e) => set("status", e.target.value)}>
              <option value="Offen">Offen</option>
              <option value="Entwurf">Entwurf</option>
              <option value="Bezahlt">Bezahlt</option>
            </select>
          </label>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-2.5 text-sm">
          <span className="text-neutral-500">Brutto (inkl. {rate}% USt)</span>
          <span className="font-bold tabular-nums text-neutral-900">{formatEUR(Math.round(gross * 100))}</span>
        </div>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">Abbrechen</button>
          <button onClick={submit} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#5d8a34] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a7029] disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Rechnung anlegen
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusMenu({ invoice, onChange }: { invoice: Invoice; onChange: (status: Invoice["status"]) => void }) {
  const [open, setOpen] = useState(false);
  const opts: Invoice["status"][] = ["Offen", "Bezahlt", "Entwurf"];
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} onBlur={() => setTimeout(() => setOpen(false), 150)} className="grid size-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100" aria-label="Status ändern"><ChevronDown size={15} /></button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
          {opts.map((s) => (
            <button key={s} onMouseDown={() => onChange(s)} className="block w-full px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-50">Als „{s}" markieren</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function InvoicesClient({ invoices, orders, defaultTaxRate }: { invoices: Invoice[]; orders: Order[]; defaultTaxRate: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Alle");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return invoices
      .map((i) => ({ ...i, eff: effectiveStatus(i) }))
      .filter((i) => {
        if (filter !== "Alle" && i.eff !== filter) return false;
        if (!query) return true;
        return [i.number, i.customerName, i.service].some((v) => (v || "").toLowerCase().includes(query));
      });
  }, [invoices, q, filter]);

  async function setStatus(id: string, status: Invoice["status"]) {
    await fetch("/api/admin/invoice", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    router.refresh();
  }
  async function remove(id: string, number: string) {
    if (!confirm(`Rechnung ${number} wirklich löschen?`)) return;
    await fetch("/api/admin/invoice", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 px-5 py-3.5">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechnungsnr., Kunde, Leistung …" className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5d8a34] focus:bg-white" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((ff) => (
            <button key={ff} onClick={() => setFilter(ff)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${filter === ff ? "bg-[#16241a] text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{ff}</button>
          ))}
        </div>
        <NewInvoice orders={orders} defaultTaxRate={defaultTaxRate} onDone={() => router.refresh()} />
      </div>

      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th className={table.th}>Nr.</th>
              <th className={table.th}>Kunde</th>
              <th className={table.th}>Leistung</th>
              <th className={`${table.th} text-right`}>Brutto</th>
              <th className={table.th}>Fällig</th>
              <th className={table.th}>Status</th>
              <th className={`${table.th} text-right`}>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i.id} className={table.tr}>
                <td className={`${table.td} font-mono font-medium text-neutral-900`}>{i.number}</td>
                <td className={`${table.td} font-medium text-neutral-900`}>{i.customerName}</td>
                <td className={table.td}>{i.service}</td>
                <td className={`${table.td} text-right font-medium tabular-nums`}>{formatEUR(grossCents(i))}</td>
                <td className={table.td}>{formatDate(i.dueAt)}</td>
                <td className={table.td}><StatusBadge status={i.eff} /></td>
                <td className={table.td}>
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/invoices/${i.id}`} aria-label="Rechnung ansehen" className="grid size-8 place-items-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#4a7029]"><Eye size={15} /></Link>
                    <StatusMenu invoice={i} onChange={(s) => setStatus(i.id, s)} />
                    <button onClick={() => remove(i.id, i.number)} aria-label="Rechnung löschen" className="grid size-8 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-neutral-400">
                <FileText size={24} className="mx-auto mb-2 text-neutral-300" />
                Keine Rechnungen. Erstelle eine – manuell oder aus einem Auftrag.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
