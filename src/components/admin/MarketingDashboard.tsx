"use client";

import { useMemo, useState } from "react";
import { ChevronRight, TriangleAlert, Target } from "lucide-react";
import {
  type MSession, type MLead, type MOrder, type PerfRow,
  groupPerformance, bySource, byKeyword, byCampaign, byDevice, byLanding, inRange, cr, aov,
} from "@/lib/marketing/aggregate";

const eur = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n || 0);
const num = (n: number) => new Intl.NumberFormat("de-DE").format(n || 0);
const pct = (n: number) => `${(n * 100).toFixed(1)} %`;

type Preset = "today" | "yesterday" | "7d" | "30d" | "custom";
const PRESETS: { key: Preset; label: string }[] = [
  { key: "today", label: "Heute" },
  { key: "yesterday", label: "Gestern" },
  { key: "7d", label: "Letzte 7 Tage" },
  { key: "30d", label: "Letzte 30 Tage" },
];

function presetRange(p: Preset, from: string, to: string): { fromMs: number; toMs: number } {
  const now = Date.now();
  const day = 86400000;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (p === "today") return { fromMs: startOfDay(new Date()), toMs: now };
  if (p === "yesterday") { const s = startOfDay(new Date()) - day; return { fromMs: s, toMs: s + day - 1 }; }
  if (p === "7d") return { fromMs: now - 7 * day, toMs: now };
  if (p === "custom") {
    const f = from ? Date.parse(from) : now - 30 * day;
    const t = to ? Date.parse(to) + day - 1 : now;
    return { fromMs: f, toMs: t };
  }
  return { fromMs: now - 30 * day, toMs: now };
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent ? "text-[#5d8a34]" : "text-neutral-900"}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-neutral-400">{sub}</div>}
    </div>
  );
}

function PerfTable({ rows, firstLabel, onRow }: { rows: PerfRow[]; firstLabel: string; onRow?: (key: string) => void }) {
  if (!rows.length) return <p className="px-5 py-8 text-center text-sm text-neutral-400">Noch keine Daten im gewählten Zeitraum.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-[11px] uppercase tracking-wide text-neutral-400">
            <th className="px-5 py-3 font-semibold">{firstLabel}</th>
            <th className="px-3 py-3 text-right font-semibold">Sessions</th>
            <th className="px-3 py-3 text-right font-semibold">Leads</th>
            <th className="px-3 py-3 text-right font-semibold">Gebucht</th>
            <th className="px-3 py-3 text-right font-semibold">CR</th>
            <th className="px-3 py-3 text-right font-semibold">Umsatz</th>
            <th className="px-5 py-3 text-right font-semibold">AOV</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.key}
              className={`border-b border-neutral-100 last:border-0 ${onRow ? "cursor-pointer hover:bg-neutral-50" : ""}`}
              onClick={onRow ? () => onRow(r.key) : undefined}
            >
              <td className="px-5 py-3 font-medium text-neutral-900">
                <span className="inline-flex items-center gap-2">
                  {r.emoji && <span>{r.emoji}</span>}
                  {r.label}
                  {onRow && <ChevronRight size={14} className="text-neutral-300" />}
                </span>
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-neutral-700">{num(r.sessions)}</td>
              <td className="px-3 py-3 text-right tabular-nums text-neutral-700">{num(r.leads)}</td>
              <td className="px-3 py-3 text-right tabular-nums font-semibold text-neutral-900">{num(r.paid)}</td>
              <td className="px-3 py-3 text-right tabular-nums text-neutral-700">{pct(cr(r.paid, r.sessions))}</td>
              <td className="px-3 py-3 text-right tabular-nums font-semibold text-neutral-900">{eur(r.revenue)}</td>
              <td className="px-5 py-3 text-right tabular-nums text-neutral-700">{eur(aov(r.revenue, r.paid))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DRILL_TABS = [
  { key: "keywords", label: "Keywords", fn: byKeyword, col: "Keyword" },
  { key: "campaigns", label: "Kampagnen", fn: byCampaign, col: "Kampagne" },
  { key: "landing", label: "Landingpages", fn: byLanding, col: "Landingpage" },
  { key: "devices", label: "Geräte", fn: byDevice, col: "Gerät" },
] as const;

export function MarketingDashboard({ sessions, leads, orders }: { sessions: MSession[]; leads: MLead[]; orders: MOrder[] }) {
  const [preset, setPreset] = useState<Preset>("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [source, setSource] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof DRILL_TABS)[number]["key"]>("keywords");

  const { fromMs, toMs } = presetRange(preset, from, to);

  const fSessions = useMemo(() => sessions.filter((s) => inRange(s.ts, fromMs, toMs)), [sessions, fromMs, toMs]);
  const fLeads = useMemo(() => leads.filter((l) => inRange(l.ts, fromMs, toMs)), [leads, fromMs, toMs]);
  const fOrders = useMemo(() => orders.filter((o) => inRange(o.ts, fromMs, toMs)), [orders, fromMs, toMs]);

  const paid = fOrders.length;
  const revenue = fOrders.reduce((a, o) => a + o.value, 0);
  const missing = fOrders.filter((o) => o.source === "direct").length;

  const sourceRows = useMemo(() => groupPerformance(fSessions, fLeads, fOrders, bySource), [fSessions, fLeads, fOrders]);

  // Drilldown: auf die gewählte Quelle einschränken.
  const drill = useMemo(() => {
    if (!source) return null;
    const ds = fSessions.filter((s) => s.source === source);
    const dl = fLeads.filter((l) => l.source === source);
    const dord = fOrders.filter((o) => o.source === source);
    const t = DRILL_TABS.find((x) => x.key === tab)!;
    return { label: dl[0]?.label || ds[0]?.label || dord[0]?.label || source, emoji: dl[0]?.emoji || ds[0]?.emoji || dord[0]?.emoji, rows: groupPerformance(ds, dl, dord, t.fn), col: t.col };
  }, [source, tab, fSessions, fLeads, fOrders]);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef3e7] text-[#5d8a34]"><Target size={20} /></span>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Marketing &amp; Attribution</h1>
          <p className="text-sm text-neutral-500">Woher kommen Ihre Leads &amp; Aufträge – aus eigenem First-Party-Tracking.</p>
        </div>
      </div>

      {/* Zeitraum */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${preset === p.key ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
          >
            {p.label}
          </button>
        ))}
        <span className="mx-1 hidden text-neutral-300 sm:inline">|</span>
        <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPreset("custom"); }} className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm" />
        <span className="text-neutral-400">–</span>
        <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPreset("custom"); }} className="rounded-lg border border-neutral-200 px-2 py-1.5 text-sm" />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Bezahlte Aufträge" value={num(paid)} sub={`${num(fSessions.length)} Sessions`} />
        <Kpi label="Umsatz" value={eur(revenue)} sub="aus echten Aufträgen" />
        <Kpi label="AOV" value={eur(aov(revenue, paid))} sub="Ø pro Auftrag" />
        <Kpi label="Leads gesamt" value={num(fLeads.length)} sub="Anfragen im Zeitraum" />
        <Kpi label="Conversion-Rate" value={pct(cr(paid, fSessions.length))} sub="Session → Auftrag" accent />
      </div>

      {missing > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <TriangleAlert size={20} className="shrink-0 text-amber-500" />
          <p className="text-sm text-amber-800">
            <b>{missing} {missing === 1 ? "Auftrag" : "Aufträge"}</b> ohne klare Quelle (Direct / unbekannt). Tracking-Lücken – möglicherweise Ad-Blocker oder abgelehnte Cookies.
          </p>
        </div>
      )}

      {/* Source Performance / Drilldown */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {!drill ? (
          <>
            <div className="border-b border-neutral-100 px-5 py-4 text-sm font-bold text-neutral-900">📊 Quellen-Performance</div>
            <PerfTable rows={sourceRows} firstLabel="Quelle" onRow={(k) => { setSource(k); setTab("keywords"); }} />
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 px-5 py-4">
              <button onClick={() => setSource(null)} className="text-sm font-medium text-[#5d8a34] hover:underline">← Quellen</button>
              <span className="text-neutral-300">/</span>
              <span className="text-sm font-bold text-neutral-900">{drill.emoji} {drill.label}</span>
            </div>
            <div className="flex flex-wrap gap-1 border-b border-neutral-100 px-4 py-2">
              {DRILL_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${tab === t.key ? "bg-[#eef3e7] text-[#4a7029]" : "text-neutral-500 hover:bg-neutral-100"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <PerfTable rows={drill.rows} firstLabel={drill.col} />
          </>
        )}
      </div>
    </div>
  );
}
