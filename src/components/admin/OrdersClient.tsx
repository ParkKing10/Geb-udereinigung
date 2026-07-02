"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Repeat, Check, Loader2, X } from "lucide-react";
import type { Order } from "@/lib/admin/data";
import { StatusBadge, table } from "./ui";
import { formatEUR, formatDate, initials } from "@/lib/admin/format";

const field = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5d8a34]";
const lbl = "mb-1 block text-xs font-medium text-neutral-500";

function NewOrder({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ customerName: "", customerEmail: "", customerPhone: "", service: "", location: "", turnus: "", amountEuro: "", source: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, amountEuro: Number(f.amountEuro) }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Fehler");
      setOpen(false);
      setF({ customerName: "", customerEmail: "", customerPhone: "", service: "", location: "", turnus: "", amountEuro: "", source: "", note: "" });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#16241a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f1c14]"><Plus size={16} /> Neuer Auftrag</button>;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900">Neuer Auftrag</h3>
          <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-700"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block"><span className={lbl}>Kundenname *</span><input className={field} value={f.customerName} onChange={(e) => set("customerName", e.target.value)} /></label>
          <label className="block"><span className={lbl}>E-Mail *</span><input className={field} value={f.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} placeholder="kunde@firma.de" /></label>
          <label className="block"><span className={lbl}>Telefon</span><input className={field} value={f.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} /></label>
          <label className="block"><span className={lbl}>Leistung *</span><input className={field} value={f.service} onChange={(e) => set("service", e.target.value)} placeholder="Büroreinigung" /></label>
          <label className="block"><span className={lbl}>Ort</span><input className={field} value={f.location} onChange={(e) => set("location", e.target.value)} /></label>
          <label className="block"><span className={lbl}>Auftragswert (€) *</span><input className={field} inputMode="decimal" value={f.amountEuro} onChange={(e) => set("amountEuro", e.target.value)} placeholder="3600" /></label>
          <label className="block"><span className={lbl}>Turnus</span><input className={field} value={f.turnus} onChange={(e) => set("turnus", e.target.value)} placeholder="Wöchentlich" /></label>
          <label className="col-span-2 block"><span className={lbl}>Quelle (z. B. Empfehlung, Telefon)</span><input className={field} value={f.source} onChange={(e) => set("source", e.target.value)} placeholder="Empfehlung" /></label>
          <label className="col-span-2 block"><span className={lbl}>Notiz</span><input className={field} value={f.note} onChange={(e) => set("note", e.target.value)} /></label>
        </div>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">Abbrechen</button>
          <button onClick={submit} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#5d8a34] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a7029] disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
        <span className="text-sm font-bold text-neutral-900">Alle Aufträge</span>
        <NewOrder onDone={() => router.refresh()} />
      </div>
      {orders.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-neutral-400">Noch keine Aufträge. Lege einen an oder erstelle ihn aus einem Lead.</p>
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Kunde</th>
                <th className={table.th}>Leistung</th>
                <th className={table.th}>Quelle</th>
                <th className={table.th}>Turnus</th>
                <th className={table.th}>Betrag</th>
                <th className={table.th}>Datum</th>
                <th className={table.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className={table.tr}>
                  <td className={table.td}>
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#eef3e7] text-[11px] font-bold text-[#4a7029]">{initials(o.customerName)}</span>
                      <div>
                        <div className="font-medium text-neutral-900">{o.customerName}</div>
                        {o.repeat ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"><Repeat size={10} /> {o.orderIndex}. Bestellung</span>
                        ) : (
                          <span className="text-[10px] text-neutral-400">Erstkunde</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={table.td}>{o.service}{o.location ? <span className="text-neutral-400"> · {o.location}</span> : null}</td>
                  <td className={table.td}><span className="inline-flex items-center gap-1">{o.sourceEmoji} {o.sourceLabel}</span></td>
                  <td className={table.td}>{o.turnus || "–"}</td>
                  <td className={`${table.td} font-semibold tabular-nums`}>{formatEUR(o.amountCents)}</td>
                  <td className={table.td}>{formatDate(o.createdAt)}</td>
                  <td className={table.td}><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
