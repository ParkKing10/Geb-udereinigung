"use client";

import { useState } from "react";
import Image from "next/image";
import { Save, Check, Plus, Trash2, Upload, Loader2, ImagePlus, X } from "lucide-react";
import type { SiteContent, Stat, Logo } from "@/lib/site-content";

const fieldCls =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#5d8a34] focus:ring-2 focus:ring-[#5d8a34]/15";
const labelCls = "mb-1 block text-xs font-medium text-neutral-500";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-neutral-900">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-neutral-400">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input className={fieldCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <textarea className={`${fieldCls} min-h-[72px] resize-y`} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function WebsiteContentForm({ initial }: { initial: SiteContent }) {
  const [c, setC] = useState<SiteContent>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof SiteContent>(k: K, v: SiteContent[K]) => { setC((p) => ({ ...p, [k]: v })); setSaved(false); };
  const setPerson = (patch: Partial<SiteContent["person"]>) => setC((p) => ({ ...p, person: { ...p.person, ...patch } }));

  const setStat = (i: number, patch: Partial<Stat>) => set("stats", c.stats.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const setLogo = (i: number, patch: Partial<Logo>) => set("logos", c.logos.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const setStr = (key: "riskReducers" | "trustbox", i: number, v: string) => set(key, c[key].map((s, j) => (j === i ? v : s)));

  async function uploadPhoto(file: File) {
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch("/api/admin/site-content/photo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload fehlgeschlagen");
      setPerson({ photo: json.path });
      setSaved(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  async function uploadLogo(i: number, file: File) {
    setUploadingLogo(i); setError(null);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/admin/site-content/logo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload fehlgeschlagen");
      // Funktionales Update → race-sicher, falls parallel getippt/hochgeladen wird.
      setC((prev) => ({ ...prev, logos: prev.logos.map((l, j) => (j === i ? { ...l, src: json.path } : l)) }));
      setSaved(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload fehlgeschlagen");
    } finally {
      setUploadingLogo(null);
    }
  }

  async function save() {
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Speichern fehlgeschlagen");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  }

  const p = c.person;

  return (
    <div className="space-y-5 pb-24">
      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Badge & Überschrift" hint="Der Badge oberhalb der H1. Keyword-Zeilen der Überschrift.">
          <Field label="Badge" value={c.badge} onChange={(v) => set("badge", v)} placeholder="Kostenloses Festpreis-Angebot" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Überschrift Zeile 1 (dunkel)" value={c.h1Line1} onChange={(v) => set("h1Line1", v)} />
            <Field label="Überschrift Zeile 2 (grün)" value={c.h1Line2} onChange={(v) => set("h1Line2", v)} />
          </div>
          <Field label="Social-Proof-Zeile (unter H1)" value={c.socialProof} onChange={(v) => set("socialProof", v)} placeholder="Bereits über 1.500 Unternehmen vertrauen …" />
          <Area label="Subtitle" value={c.subtitle} onChange={(v) => set("subtitle", v)} />
        </Section>

        <Section title="Call-to-Action" hint="Buttons + Hemmschwellen-Reducer.">
          <Field label="Button" value={c.ctaPrimary} onChange={(v) => set("ctaPrimary", v)} />
          <Field label="Micro-Text unter Button" value={c.ctaMicro} onChange={(v) => set("ctaMicro", v)} placeholder="Dauert nur 60 Sekunden." />
          <div>
            <span className={labelCls}>Risk-Reducer (unter dem Button)</span>
            <div className="grid grid-cols-3 gap-2">
              {c.riskReducers.map((r, i) => (
                <input key={i} className={fieldCls} value={r} onChange={(e) => setStr("riskReducers", i, e.target.value)} />
              ))}
            </div>
          </div>
        </Section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Google-Bewertung" hint="Bewertung und Anzahl.">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bewertung" value={c.google.rating} onChange={(v) => set("google", { ...c.google, rating: v })} placeholder="4,9" />
            <Field label="Anzahl Bewertungen" value={c.google.count} onChange={(v) => set("google", { ...c.google, count: v })} placeholder="124" />
          </div>
        </Section>

        <Section title="Trustbox (Bild-Box)" hint="Konkrete Vorteile in der Karte am Hero-Bild.">
          <div className="grid gap-2">
            {c.trustbox.map((t, i) => (
              <input key={i} className={fieldCls} value={t} onChange={(e) => setStr("trustbox", i, e.target.value)} />
            ))}
          </div>
        </Section>
      </div>

      <Section title="Trust-Statistiken" hint="Die Zahlenleiste unter den Buttons – zählt beim Scrollen hoch.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {c.stats.map((s, i) => (
            <div key={i} className="rounded-xl border border-neutral-150 bg-neutral-50 p-3">
              <Field label="Wert" value={s.value} onChange={(v) => setStat(i, { value: v })} placeholder="2.800+" />
              <div className="mt-2">
                <Field label="Label" value={s.label} onChange={(v) => setStat(i, { label: v })} placeholder="betreute Objekte" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Kundenlogos" hint="Logo-Bild hochladen (PNG mit transparentem Hintergrund ist ideal) – im Hero grau dargestellt, bunt beim Hovern. Ohne Bild wird der Firmenname als Text angezeigt.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.logos.map((l, i) => (
            <div key={i} className="rounded-xl border border-neutral-150 bg-neutral-50 p-2.5">
              <div className="flex items-center gap-2">
                {/* Vorschau: hochgeladenes Logo (grau, wie im Hero) oder Platzhalter */}
                <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  {l.src ? (
                    <Image src={l.src} alt={l.name || "Logo"} width={44} height={28} className="max-h-7 w-auto object-contain grayscale" />
                  ) : (
                    <ImagePlus size={17} className="text-neutral-300" />
                  )}
                </div>
                <input className={fieldCls} value={l.name} onChange={(e) => setLogo(i, { name: e.target.value })} placeholder="Firmenname" />
                <button
                  type="button"
                  onClick={() => set("logos", c.logos.filter((_, j) => j !== i))}
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Logo entfernen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 pl-[52px]">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:border-[#5d8a34] hover:text-[#5d8a34]">
                  {uploadingLogo === i ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {l.src ? "Bild ersetzen" : "Logo-Bild"}
                  <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(i, f); e.target.value = ""; }} />
                </label>
                {l.src && (
                  <button
                    type="button"
                    onClick={() => setLogo(i, { src: undefined })}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-neutral-400 hover:text-rose-600"
                  >
                    <X size={13} /> Bild entfernen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set("logos", [...c.logos, { name: "Neuer Kunde" }])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 hover:border-[#5d8a34] hover:text-[#5d8a34]"
        >
          <Plus size={15} /> Logo hinzufügen
        </button>
      </Section>

      <Section title="Persönlicher Ansprechpartner" hint="Zieht sich durch Hero, Formular, Kontakt und Footer. Nur echte Mitarbeiter, kein Stockfoto.">
        <div className="flex flex-wrap items-start gap-5">
          <div className="flex flex-col items-center gap-2">
            <div className="relative grid size-20 place-items-center overflow-hidden rounded-full bg-[#eef3e7] text-lg font-bold text-[#4a7029] ring-1 ring-[#5d8a34]/20">
              {p.photo ? (
                <Image src={p.photo} alt={`${p.firstName} ${p.lastName}`} fill sizes="80px" className="object-cover" />
              ) : (
                `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:border-[#5d8a34] hover:text-[#5d8a34]">
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Foto
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
            </label>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2" style={{ minWidth: 260 }}>
            <Field label="Vorname" value={p.firstName} onChange={(v) => setPerson({ firstName: v })} />
            <Field label="Nachname" value={p.lastName} onChange={(v) => setPerson({ lastName: v })} />
            <Field label="Position" value={p.position} onChange={(v) => setPerson({ position: v })} />
            <Field label="Status-Label" value={p.statusLabel} onChange={(v) => setPerson({ statusLabel: v })} placeholder="Heute erreichbar" />
            <Field label="Telefon" value={p.phone} onChange={(v) => setPerson({ phone: v })} />
            <Field label="E-Mail" value={p.email} onChange={(v) => setPerson({ email: v })} />
            <Field label="Antwortzeit" value={p.responseTime} onChange={(v) => setPerson({ responseTime: v })} placeholder="Antwort meist in 30 Minuten" />
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700">
              <input type="checkbox" checked={p.available} onChange={(e) => setPerson({ available: e.target.checked })} className="size-4 accent-[#5d8a34]" />
              Aktuell erreichbar (grüner Punkt)
            </label>
            <div className="sm:col-span-2">
              <Area label="Zitat" value={p.quote} onChange={(v) => setPerson({ quote: v })} />
            </div>
          </div>
        </div>
      </Section>

      {/* Sticky Speichern-Leiste */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur lg:pl-64">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            {error ? <span className="text-rose-600">{error}</span> : saved ? "Gespeichert – Änderungen sind live." : "Nicht gespeicherte Änderungen."}
          </p>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#16241a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f1c14] disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? "Speichern …" : saved ? "Gespeichert" : "Speichern & live schalten"}
          </button>
        </div>
      </div>
    </div>
  );
}
