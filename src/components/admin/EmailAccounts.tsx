"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Save, ChevronDown, ChevronUp, Star } from "lucide-react";
import type { SafeAccount, Signature } from "@/lib/email/store";

const field = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#5d8a34] focus:ring-2 focus:ring-[#5d8a34]/15";
const label = "mb-1 block text-xs font-medium text-neutral-500";

type Draft = {
  id?: string;
  label: string;
  fromName: string;
  address: string;
  smtpHost: string; smtpPort: number; smtpSecure: boolean; smtpUser: string; smtpPass: string;
  imapHost: string; imapPort: number; imapSecure: boolean; imapUser: string; imapPass: string;
  signatureId: string;
  isDefault: boolean;
};

const BLANK: Draft = {
  label: "", fromName: "", address: "",
  smtpHost: "", smtpPort: 587, smtpSecure: false, smtpUser: "", smtpPass: "",
  imapHost: "", imapPort: 993, imapSecure: true, imapUser: "", imapPass: "",
  signatureId: "", isDefault: false,
};

const PRESETS: { label: string; hint?: string; v: Partial<Draft> }[] = [
  { label: "Gmail / Google Workspace", hint: "Erfordert ein App-Passwort (Google-Konto → Sicherheit → App-Passwörter) statt des normalen Passworts.", v: { smtpHost: "smtp.gmail.com", smtpPort: 465, smtpSecure: true, imapHost: "imap.gmail.com", imapPort: 993, imapSecure: true } },
  { label: "Outlook / Microsoft 365", v: { smtpHost: "smtp.office365.com", smtpPort: 587, smtpSecure: false, imapHost: "outlook.office365.com", imapPort: 993, imapSecure: true } },
  { label: "IONOS (1&1)", v: { smtpHost: "smtp.ionos.de", smtpPort: 465, smtpSecure: true, imapHost: "imap.ionos.de", imapPort: 993, imapSecure: true } },
  { label: "STRATO", v: { smtpHost: "smtp.strato.de", smtpPort: 465, smtpSecure: true, imapHost: "imap.strato.de", imapPort: 993, imapSecure: true } },
];

function toDraft(a: SafeAccount): Draft {
  return {
    id: a.id, label: a.label, fromName: a.fromName, address: a.address,
    smtpHost: a.smtpHost, smtpPort: a.smtpPort, smtpSecure: a.smtpSecure, smtpUser: a.smtpUser, smtpPass: "",
    imapHost: a.imapHost, imapPort: a.imapPort, imapSecure: a.imapSecure, imapUser: a.imapUser, imapPass: "",
    signatureId: a.signatureId ?? "", isDefault: Boolean(a.isDefault),
  };
}

export function EmailAccounts({ accounts, signatures, onChange }: { accounts: SafeAccount[]; signatures: Signature[]; onChange: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(a: SafeAccount) {
    setDraft(toDraft(a));
    setOpenId(a.id);
    setAdding(false);
    setError(null);
  }
  function startAdd() {
    setDraft({ ...BLANK, address: draft.address });
    setAdding(true);
    setOpenId(null);
    setError(null);
  }
  function applyPreset(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p, smtpUser: d.smtpUser || d.address, imapUser: d.imapUser || d.address }));
  }

  async function save() {
    if (!draft.label.trim() || !draft.address.trim()) { setError("Name und E-Mail-Adresse sind erforderlich."); return; }
    setSaving(true); setError(null);
    try {
      const method = draft.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/email/accounts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, signatureId: draft.signatureId || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Speichern fehlgeschlagen");
      setOpenId(null); setAdding(false); setDraft(BLANK);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Dieses Postfach wirklich entfernen? Bereits abgerufene Nachrichten bleiben erhalten.")) return;
    await fetch("/api/admin/email/accounts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    onChange();
  }

  function Form() {
    return (
      <div className="space-y-4 rounded-xl border border-neutral-150 bg-neutral-50 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block"><span className={label}>Interner Name</span><input className={field} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="z. B. Info-Postfach" /></label>
          <label className="block"><span className={label}>Angezeigter Absendername</span><input className={field} value={draft.fromName} onChange={(e) => setDraft({ ...draft, fromName: e.target.value })} placeholder="Deutsche Gebäudedienste" /></label>
        </div>
        <label className="block"><span className={label}>E-Mail-Adresse</span><input className={field} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="info@dgd-facility.de" /></label>

        <div>
          <span className={label}>Schnellauswahl</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" onClick={() => applyPreset(p.v)} className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 hover:border-[#5d8a34] hover:text-[#5d8a34]">{p.label}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-3 sm:grid-cols-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 sm:col-span-2">SMTP (Senden)</p>
          <label className="block"><span className={label}>Server</span><input className={field} value={draft.smtpHost} onChange={(e) => setDraft({ ...draft, smtpHost: e.target.value })} placeholder="smtp.anbieter.de" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className={label}>Port</span><input type="number" className={field} value={draft.smtpPort} onChange={(e) => setDraft({ ...draft, smtpPort: Number(e.target.value) || 587 })} /></label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700"><input type="checkbox" checked={draft.smtpSecure} onChange={(e) => setDraft({ ...draft, smtpSecure: e.target.checked })} className="size-4 accent-[#5d8a34]" /> SSL (465)</label>
          </div>
          <label className="block"><span className={label}>Benutzer</span><input className={field} value={draft.smtpUser} onChange={(e) => setDraft({ ...draft, smtpUser: e.target.value })} placeholder={draft.address || "meist die E-Mail-Adresse"} /></label>
          <label className="block"><span className={label}>Passwort</span><input type="password" className={field} value={draft.smtpPass} onChange={(e) => setDraft({ ...draft, smtpPass: e.target.value })} placeholder={draft.id ? "•••• (unverändert lassen)" : ""} /></label>
        </div>

        <div className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-3 sm:grid-cols-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 sm:col-span-2">IMAP (Empfangen)</p>
          <label className="block"><span className={label}>Server</span><input className={field} value={draft.imapHost} onChange={(e) => setDraft({ ...draft, imapHost: e.target.value })} placeholder="imap.anbieter.de" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className={label}>Port</span><input type="number" className={field} value={draft.imapPort} onChange={(e) => setDraft({ ...draft, imapPort: Number(e.target.value) || 993 })} /></label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700"><input type="checkbox" checked={draft.imapSecure} onChange={(e) => setDraft({ ...draft, imapSecure: e.target.checked })} className="size-4 accent-[#5d8a34]" /> SSL (993)</label>
          </div>
          <label className="block"><span className={label}>Benutzer</span><input className={field} value={draft.imapUser} onChange={(e) => setDraft({ ...draft, imapUser: e.target.value })} placeholder={draft.address || "meist die E-Mail-Adresse"} /></label>
          <label className="block"><span className={label}>Passwort</span><input type="password" className={field} value={draft.imapPass} onChange={(e) => setDraft({ ...draft, imapPass: e.target.value })} placeholder={draft.id ? "•••• (unverändert lassen)" : ""} /></label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Standard-Signatur</span>
            <select className={field} value={draft.signatureId} onChange={(e) => setDraft({ ...draft, signatureId: e.target.value })}>
              <option value="">Keine</option>
              {signatures.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700">
            <input type="checkbox" checked={draft.isDefault} onChange={(e) => setDraft({ ...draft, isDefault: e.target.checked })} className="size-4 accent-[#5d8a34]" /> Als Standard-Postfach verwenden
          </label>
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={() => { setOpenId(null); setAdding(false); }} className="px-3 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-800">Abbrechen</button>
          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-[#16241a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f1c14] disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Speichern
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">Postfächer</h2>
          <p className="mt-0.5 text-xs text-neutral-400">SMTP zum Senden, IMAP zum Empfangen. Mehrere Postfächer möglich (z. B. info@, bewerbung@).</p>
        </div>
        {!adding && (
          <button onClick={startAdd} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:border-[#5d8a34] hover:text-[#5d8a34]">
            <Plus size={15} /> Postfach hinzufügen
          </button>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {accounts.map((a) => (
          <div key={a.id} className="rounded-xl border border-neutral-150">
            <button onClick={() => (openId === a.id ? setOpenId(null) : startEdit(a))} className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left">
              <span className="flex items-center gap-2 text-sm">
                {a.isDefault && <Star size={14} className="fill-[#5d8a34] text-[#5d8a34]" />}
                <span className="font-semibold text-neutral-900">{a.label}</span>
                <span className="text-neutral-400">· {a.address}</span>
                {!a.hasSmtpPass && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">SMTP fehlt</span>}
                {!a.hasImapPass && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">IMAP fehlt</span>}
              </span>
              <span className="flex items-center gap-1">
                <span onClick={(e) => { e.stopPropagation(); remove(a.id); }} className="grid size-8 place-items-center rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600" role="button" aria-label="Postfach löschen"><Trash2 size={15} /></span>
                {openId === a.id ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
              </span>
            </button>
            {openId === a.id && <div className="border-t border-neutral-100 p-3.5"><Form /></div>}
          </div>
        ))}
        {adding && <Form />}
      </div>
    </section>
  );
}
