"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, CalendarDays, Sparkles, Play, Pause, Loader2, Zap } from "lucide-react";
import type { BlogPost, BlogConfig } from "@/lib/blog/store";

const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const FREQ = [{ v: 1, l: "Täglich" }, { v: 2, l: "Alle 2 Tage" }, { v: 3, l: "Alle 3 Tage" }, { v: 7, l: "Wöchentlich" }];

function grid(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7)); // Montag der ersten Woche
  const days: Date[] = [];
  const cur = new Date(start);
  for (let i = 0; i < 42; i++) { days.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
  return days;
}

export function BlogCalendar({ initialPosts, initialConfig }: { initialPosts: BlogPost[]; initialConfig: BlogConfig }) {
  const [posts, setPosts] = useState(initialPosts);
  const [config, setConfig] = useState(initialConfig);
  const [topicsText, setTopicsText] = useState(initialConfig.topics.join("\n"));
  const [anchor, setAnchor] = useState(() => new Date());
  const [busyDay, setBusyDay] = useState<string | null>(null);
  const [savingCfg, setSavingCfg] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const todayKey = key(new Date());
  const byDay = useMemo(() => {
    const m = new Map<string, BlogPost[]>();
    for (const p of posts) { const arr = m.get(p.publishDate) || []; arr.push(p); m.set(p.publishDate, arr); }
    return m;
  }, [posts]);
  const days = useMemo(() => grid(anchor), [anchor]);

  async function generate(date: string) {
    setBusyDay(date); setNote(null);
    try {
      const res = await fetch("/api/admin/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publishDate: date }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Fehler");
      setPosts((p) => [...p, j.post]);
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Fehler");
    } finally { setBusyDay(null); }
  }

  async function patchConfig(patch: Partial<BlogConfig>) {
    setSavingCfg(true); setNote(null);
    try {
      const res = await fetch("/api/admin/blog", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Fehler");
      setConfig(j.config);
    } catch (e) { setNote(e instanceof Error ? e.message : "Fehler"); }
    finally { setSavingCfg(false); }
  }

  async function runDue() {
    setNote("Prüfe fällige Artikel …");
    try {
      const res = await fetch("/api/admin/blog/run-due", { method: "POST" });
      const j = await res.json();
      if (j.post) { setNote(`Erstellt: „${j.post.title}"`); const r = await fetch("/api/admin/blog"); const d = await r.json(); setPosts(d.posts); }
      else setNote(j.reason || "Kein fälliger Artikel.");
    } catch { setNote("Fehler beim Generieren."); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef3e7] text-[#5d8a34]"><Sparkles size={20} /></span>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Content Calendar</h1>
            <p className="text-sm text-neutral-500">Die KI erstellt automatisch SEO-Blogartikel inkl. strukturierter Daten (JSON-LD).</p>
          </div>
        </div>
        <button onClick={() => generate(todayKey)} disabled={busyDay === todayKey} className="inline-flex items-center gap-2 rounded-lg bg-[#16241a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f1c14] disabled:opacity-60">
          {busyDay === todayKey ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Neuer Artikel
        </button>
      </div>

      {/* Automatik-Einstellungen */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`grid size-9 place-items-center rounded-full ${config.active ? "bg-emerald-100 text-emerald-600" : "bg-neutral-100 text-neutral-400"}`}>{config.active ? <Play size={16} /> : <Pause size={16} />}</span>
            <div>
              <div className="text-sm font-bold text-neutral-900">Automatische Generierung {config.active ? "aktiv" : "pausiert"}</div>
              <div className="text-xs text-neutral-500">Frequenz einstellen, Themen pflegen, starten – die KI übernimmt den Rest.</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={config.frequencyDays} onChange={(e) => patchConfig({ frequencyDays: Number(e.target.value) })} className="rounded-lg border border-neutral-200 px-3 py-2 text-sm">
              {FREQ.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
            </select>
            <button onClick={runDue} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"><Zap size={15} /> Jetzt fälligen erstellen</button>
            <button onClick={() => patchConfig({ active: !config.active })} disabled={savingCfg} className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${config.active ? "bg-rose-500 hover:bg-rose-600" : "bg-[#5d8a34] hover:bg-[#4a7029]"}`}>
              {savingCfg ? <Loader2 size={15} className="animate-spin" /> : config.active ? <Pause size={15} /> : <Play size={15} />} {config.active ? "Pausieren" : "Starten"}
            </button>
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-neutral-500">Themen-/Keyword-Pool (eine Zeile pro Thema – die KI rotiert automatisch)</label>
          <textarea value={topicsText} onChange={(e) => setTopicsText(e.target.value)} onBlur={() => patchConfig({ topics: topicsText.split("\n").map((t) => t.trim()).filter(Boolean) })} rows={4} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#5d8a34]" />
        </div>
        {note && <p className="mt-2 text-xs text-neutral-500">{note}</p>}
      </div>

      {/* Kalender */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-neutral-900">{MONTHS[anchor.getMonth()]} {anchor.getFullYear()}</h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))} className="grid size-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100"><ChevronLeft size={18} /></button>
            <button onClick={() => setAnchor(new Date())} className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100">Heute</button>
            <button onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))} className="grid size-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {WD.map((w) => <div key={w} className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{w}</div>)}
          {days.map((d) => {
            const k = key(d);
            const inMonth = d.getMonth() === anchor.getMonth();
            const items = byDay.get(k) || [];
            const isToday = k === todayKey;
            return (
              <div key={k} className={`min-h-[92px] rounded-xl border p-1.5 ${isToday ? "border-[#5d8a34] ring-1 ring-[#5d8a34]/30" : "border-neutral-150"} ${inMonth ? "bg-white" : "bg-neutral-50/60"}`}>
                <div className="mb-1 flex items-center justify-between px-0.5">
                  <span className={`text-[11px] font-semibold ${inMonth ? "text-neutral-500" : "text-neutral-300"}`}>{d.getDate()}</span>
                  {isToday && <span className="text-[10px] font-bold text-[#5d8a34]">Heute</span>}
                </div>
                <div className="space-y-1">
                  {items.map((p) => (
                    <a key={p.id} href={`/ratgeber/${p.slug}`} target="_blank" rel="noreferrer" title={p.title}
                      className={`block rounded-md px-1.5 py-1 text-[11px] font-medium leading-tight ${p.status === "published" ? "bg-emerald-50 text-emerald-800" : "bg-sky-50 text-sky-800"}`}>
                      <span className="mr-0.5 inline-block align-middle">{p.status === "published" ? <CheckCircle2 size={11} /> : <CalendarDays size={11} />}</span>
                      <span className="line-clamp-2 align-middle">{p.title}</span>
                    </a>
                  ))}
                  {items.length === 0 && inMonth && (
                    <button onClick={() => generate(k)} disabled={busyDay === k} className="grid w-full place-items-center rounded-md border border-dashed border-neutral-200 py-1.5 text-neutral-300 hover:border-[#5d8a34] hover:text-[#5d8a34] disabled:opacity-50">
                      {busyDay === k ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
