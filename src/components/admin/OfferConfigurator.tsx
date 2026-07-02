"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import type { Lead, LeadStatus } from "@/lib/admin/data";
import { formatEUR } from "@/lib/admin/format";
import { btn } from "./ui";

const TURNUS_PRESETS = ["Einmalig", "Täglich", "Mehrmals pro Woche", "Wöchentlich", "2× / Woche", "3× / Woche", "Alle 2 Wochen", "Monatlich", "Nach Bedarf"];
const VPM: Record<string, number> = {
  "Einmalig": 1, "Täglich": 21.7, "Monatlich": 1, "Alle 2 Wochen": 2.17,
  "Wöchentlich": 4.33, "2× / Woche": 8.66, "2× pro Woche": 8.66, "3× / Woche": 13, "3× pro Woche": 13,
  "Mehrmals pro Woche": 8.66, "Nach Bedarf": 1,
};
function visitsPerMonth(t: string): number {
  if (VPM[t] != null) return VPM[t];
  const days = t.match(/alle\s*(\d+)\s*tage/i);
  if (days && Number(days[1]) > 0) return 30 / Number(days[1]);
  const wk = t.match(/(\d+)\s*[x×]\s*(?:pro\s*)?woche/i);
  if (wk) return Number(wk[1]) * 4.33;
  return 1;
}
const STATUS_OPTS: LeadStatus[] = ["Neu", "Kontaktiert", "Angebot", "Gewonnen", "Verloren"];

function fieldCls() {
  return "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5d8a34]";
}

export function OfferConfigurator({ lead }: { lead: Lead }) {
  const router = useRouter();
  const est = lead.estimate;
  const of = lead.offer;

  const [turnus, setTurnus] = useState(of?.turnus ?? est?.recommendedTurnus ?? "Wöchentlich");
  const [hours, setHours] = useState(of?.hours ?? est?.estimatedHours ?? 3);
  const [rate, setRate] = useState((of?.hourlyRateCents ?? est?.hourlyRateCents ?? 3200) / 100);
  const [discount, setDiscount] = useState(of?.discountPct ?? 0);
  const [status, setStatus] = useState<LeadStatus>(lead.status ?? "Neu");
  const [note, setNote] = useState(of?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const rateCents = Math.round(rate * 100);
  const perVisit = Math.max(0, Math.round(hours * rateCents * (1 - discount / 100)));
  const perMonth = Math.round(perVisit * visitsPerMonth(turnus));
  const oneTime = turnus === "Einmalig";

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const offer = {
        turnus, hours, hourlyRateCents: rateCents, discountPct: discount,
        pricePerVisitCents: perVisit, pricePerMonthCents: perMonth, note,
        updatedAt: new Date().toISOString(),
      };
      const res = await fetch("/api/admin/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: lead.id, offer, status }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
        <span className="grid size-8 place-items-center rounded-lg bg-[#eef3e7] text-[#4a7029]"><Sparkles size={16} /></span>
        <h2 className="text-sm font-semibold text-neutral-900">Angebot konfigurieren</h2>
      </div>

      <div className="space-y-4 px-5 py-4">
        {/* Live-Preis */}
        <div className="rounded-xl bg-[#16241a] px-4 py-4 text-white">
          <div className="text-[11px] uppercase tracking-wide text-neutral-400">{oneTime ? "Festpreis" : "Preis pro Monat"}</div>
          <div className="text-3xl font-bold tracking-tight">{formatEUR(oneTime ? perVisit : perMonth)}</div>
          {!oneTime && <div className="mt-0.5 text-xs text-neutral-400">{formatEUR(perVisit)} pro Einsatz · {turnus}</div>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">Turnus</span>
            <input className={fieldCls()} list="admin-turnus" value={turnus} onChange={(e) => setTurnus(e.target.value)} placeholder="z. B. Wöchentlich oder alle 3 Tage" />
            <datalist id="admin-turnus">{TURNUS_PRESETS.map((t) => <option key={t} value={t} />)}</datalist>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">Stunden / Einsatz</span>
            <input type="number" step="0.5" min="0" className={fieldCls()} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">Stundensatz (€)</span>
            <input type="number" step="1" min="0" className={fieldCls()} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">Rabatt (%)</span>
            <input type="number" step="1" min="0" max="100" className={fieldCls()} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">Status</span>
          <select className={fieldCls()} value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
            {STATUS_OPTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-500">Interne Notiz</span>
          <textarea className={`${fieldCls()} min-h-[70px] resize-y`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Vor-Ort-Termin vereinbaren …" />
        </label>

        <button className={`${btn("primary")} w-full justify-center`} onClick={save} disabled={saving}>
          {saved ? <><Check size={16} /> Gespeichert</> : saving ? "Speichert …" : "Als Angebot speichern"}
        </button>
      </div>
    </div>
  );
}
