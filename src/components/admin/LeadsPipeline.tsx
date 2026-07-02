"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Phone, Mail, Camera, ArrowRight } from "lucide-react";
import type { Lead, LeadStatus } from "@/lib/admin/data";
import { deriveSource } from "@/lib/marketing/source";
import { leadValue } from "@/lib/analytics";
import { initials } from "@/lib/admin/format";

const COLUMNS: { key: LeadStatus; tint: string; dot: string }[] = [
  { key: "Neu", tint: "bg-sky-50 border-sky-200", dot: "bg-sky-400" },
  { key: "Kontaktiert", tint: "bg-amber-50 border-amber-200", dot: "bg-amber-400" },
  { key: "Angebot", tint: "bg-violet-50 border-violet-200", dot: "bg-violet-400" },
  { key: "Gewonnen", tint: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { key: "Verloren", tint: "bg-rose-50 border-rose-200", dot: "bg-rose-400" },
];

const eur = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);

type Enriched = Lead & { _status: LeadStatus; _srcEmoji: string; _srcLabel: string; _value: number; _keyword?: string };

function enrich(l: Lead): Enriched {
  const a = l.attribution || {};
  const src = deriveSource({ gclid: a.gclid, gbraid: a.gbraid, wbraid: a.wbraid, utm_source: a.utm_source, utm_medium: a.utm_medium, referrer: a.referrer });
  const est = l.estimate;
  const perVisit = est?.estimatedHours && est?.hourlyRateCents ? (est.estimatedHours * est.hourlyRateCents) / 100 : 0;
  return {
    ...l,
    _status: (l.status as LeadStatus) || "Neu",
    _srcEmoji: src.emoji,
    _srcLabel: src.label,
    _keyword: a.utm_term,
    _value: perVisit ? leadValue(perVisit, l.turnus || est?.recommendedTurnus) : 0,
  };
}

export function LeadsPipeline({ leads }: { leads: Lead[] }) {
  const [items, setItems] = useState<Enriched[]>(() => leads.map(enrich));
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((l) => [l.name, l.service, l.location, l.email, l._srcLabel, l._keyword].some((v) => (v || "").toLowerCase().includes(query)));
  }, [items, q]);

  async function move(id: string, status: LeadStatus) {
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, _status: status } : l)));
    setBusy(id);
    try {
      await fetch("/api/admin/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    } catch {
      /* optimistisch belassen */
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, Leistung, Quelle, Keyword …"
          className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5d8a34]"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {COLUMNS.map((col) => {
          const cards = filtered.filter((l) => l._status === col.key);
          const total = cards.reduce((a, l) => a + l._value, 0);
          return (
            <div key={col.key} className={`rounded-2xl border ${col.tint} p-2.5`}>
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-800">
                  <span className={`size-2 rounded-full ${col.dot}`} /> {col.key}
                  <span className="text-neutral-400">{cards.length}</span>
                </span>
                {total > 0 && <span className="text-[11px] font-medium text-neutral-500">{eur(total)}</span>}
              </div>
              <div className="space-y-2">
                {cards.map((l) => (
                  <div key={l.id} className={`rounded-xl border border-neutral-200 bg-white p-3 shadow-sm ${busy === l.id ? "opacity-60" : ""}`}>
                    <div className="flex items-start gap-2">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#eef3e7] text-[10px] font-bold text-[#4a7029]">{initials(l.name)}</span>
                      <div className="min-w-0 flex-1">
                        <Link href={`/admin/leads/${l.id}`} className="block truncate text-sm font-semibold text-neutral-900 hover:text-[#4a7029]">{l.name}</Link>
                        <p className="truncate text-xs text-neutral-500">{l.service} · {l.location}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 text-neutral-500" title={l._srcLabel}>{l._srcEmoji} <span className="truncate">{l._srcLabel}</span></span>
                      {l._value > 0 && <span className="shrink-0 font-semibold text-neutral-700">{eur(l._value)}</span>}
                    </div>
                    {l._keyword && <p className="mt-1 truncate text-[11px] text-neutral-400" title={l._keyword}>🔍 {l._keyword}</p>}
                    <div className="mt-2 flex items-center gap-1.5">
                      <a href={`tel:${l.phone}`} className="grid size-7 place-items-center rounded-lg bg-neutral-100 text-neutral-500 hover:bg-[#eef3e7] hover:text-[#4a7029]" title="Anrufen"><Phone size={13} /></a>
                      <a href={`mailto:${l.email}`} className="grid size-7 place-items-center rounded-lg bg-neutral-100 text-neutral-500 hover:bg-[#eef3e7] hover:text-[#4a7029]" title="E-Mail"><Mail size={13} /></a>
                      {l.images && l.images.length > 0 && <span className="inline-flex items-center gap-0.5 rounded-lg bg-neutral-100 px-1.5 text-[10px] font-semibold text-neutral-500"><Camera size={11} /> {l.images.length}</span>}
                      <Link href={`/admin/leads/${l.id}`} className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#4a7029] hover:underline">Öffnen <ArrowRight size={12} /></Link>
                    </div>
                    <select
                      value={l._status}
                      onChange={(e) => move(l.id, e.target.value as LeadStatus)}
                      className="mt-2 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-700 outline-none focus:border-[#5d8a34]"
                    >
                      {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
                    </select>
                  </div>
                ))}
                {cards.length === 0 && <p className="px-1 py-4 text-center text-xs text-neutral-400">–</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
