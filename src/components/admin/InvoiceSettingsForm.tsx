"use client";

import { useState } from "react";
import { Save, Check, Loader2, ChevronDown, ChevronUp, Building2, TriangleAlert } from "lucide-react";
import type { InvoiceSettings } from "@/lib/admin/invoice-utils";

const field = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5d8a34]";
const lbl = "mb-1 block text-xs font-medium text-neutral-500";

export function InvoiceSettingsForm({ initial }: { initial: InvoiceSettings }) {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<InvoiceSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof InvoiceSettings>(k: K, v: InvoiceSettings[K]) => { setS((p) => ({ ...p, [k]: v })); setSaved(false); };

  const missing = !s.taxId && !s.vatId ? "Steuernummer oder USt-IdNr." : !s.iban ? "IBAN (Bankverbindung)" : null;

  async function save() {
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/invoice/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...s, addressLines: typeof s.addressLines === "string" ? String(s.addressLines).split("\n") : s.addressLines }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Fehler");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
        <span className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-[#eef3e7] text-[#5d8a34]"><Building2 size={17} /></span>
          <span>
            <span className="block text-sm font-bold text-neutral-900">Rechnungsdaten (Absender)</span>
            <span className="block text-xs text-neutral-400">Firmenangaben, Steuernummer & Bankverbindung – erscheinen auf jeder Rechnung.</span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          {missing && <span className="hidden items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 sm:inline-flex"><TriangleAlert size={12} /> {missing} fehlt</span>}
          {open ? <ChevronUp size={18} className="text-neutral-400" /> : <ChevronDown size={18} className="text-neutral-400" />}
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-neutral-100 p-5">
          {missing && (
            <p className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <TriangleAlert size={16} className="shrink-0" /> Für rechtsgültige Rechnungen fehlt noch: <b>{missing}</b>.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={lbl}>Firmenname (Rechnungssteller)</span><input className={field} value={s.companyName} onChange={(e) => set("companyName", e.target.value)} /></label>
            <label className="block"><span className={lbl}>Adresse (eine Zeile pro Feld)</span><textarea className={`${field} min-h-[56px] resize-y`} value={Array.isArray(s.addressLines) ? s.addressLines.join("\n") : s.addressLines} onChange={(e) => set("addressLines", e.target.value.split("\n"))} placeholder="Rellinger Weg 24&#10;22457 Hamburg" /></label>
            <label className="block"><span className={lbl}>E-Mail</span><input className={field} value={s.email} onChange={(e) => set("email", e.target.value)} /></label>
            <label className="block"><span className={lbl}>Telefon</span><input className={field} value={s.phone} onChange={(e) => set("phone", e.target.value)} /></label>
            <label className="block"><span className={lbl}>Steuernummer</span><input className={field} value={s.taxId} onChange={(e) => set("taxId", e.target.value)} placeholder="12/345/67890" /></label>
            <label className="block"><span className={lbl}>USt-IdNr.</span><input className={field} value={s.vatId} onChange={(e) => set("vatId", e.target.value)} placeholder="DE123456789" /></label>
            <label className="block"><span className={lbl}>Bank</span><input className={field} value={s.bankName} onChange={(e) => set("bankName", e.target.value)} placeholder="Hamburger Sparkasse" /></label>
            <label className="block"><span className={lbl}>IBAN</span><input className={field} value={s.iban} onChange={(e) => set("iban", e.target.value)} placeholder="DE00 0000 0000 0000 0000 00" /></label>
            <label className="block"><span className={lbl}>BIC</span><input className={field} value={s.bic} onChange={(e) => set("bic", e.target.value)} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className={lbl}>USt-Satz (%)</span><input className={field} inputMode="decimal" value={String(s.defaultTaxRate)} onChange={(e) => set("defaultTaxRate", Number(e.target.value) || 0)} /></label>
              <label className="block"><span className={lbl}>Zahlungsziel (Tage)</span><input className={field} inputMode="numeric" value={String(s.paymentTermDays)} onChange={(e) => set("paymentTermDays", Number(e.target.value) || 0)} /></label>
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700">
              <input type="checkbox" checked={s.smallBusiness} onChange={(e) => set("smallBusiness", e.target.checked)} className="size-4 accent-[#5d8a34]" />
              Kleinunternehmer §19 UStG (keine USt ausweisen)
            </label>
            <label className="block sm:col-span-2"><span className={lbl}>Fußzeile / Zahlungshinweis</span><input className={field} value={s.footerNote ?? ""} onChange={(e) => set("footerNote", e.target.value)} placeholder="Zahlbar innerhalb von 14 Tagen ohne Abzug." /></label>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-neutral-500">{error ? <span className="text-rose-600">{error}</span> : saved ? "Gespeichert." : ""}</p>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#16241a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f1c14] disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
              {saving ? "Speichern …" : "Speichern"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
