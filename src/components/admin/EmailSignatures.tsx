"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, Save, Upload, ChevronDown, ChevronUp } from "lucide-react";
import type { Signature } from "@/lib/email/store";

const field = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#5d8a34] focus:ring-2 focus:ring-[#5d8a34]/15";
const label = "mb-1 block text-xs font-medium text-neutral-500";

type Draft = { id?: string; name: string; displayName: string; role: string; photo?: string; html: string };
const BLANK: Draft = { name: "", displayName: "", role: "", html: "" };

export function EmailSignatures({ signatures, onChange }: { signatures: Signature[]; onChange: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(s: Signature) {
    setDraft({ id: s.id, name: s.name, displayName: s.displayName, role: s.role, photo: s.photo, html: s.html });
    setOpenId(s.id); setAdding(false); setError(null);
  }
  function startAdd() {
    setDraft(BLANK); setAdding(true); setOpenId(null); setError(null);
  }

  async function uploadPhoto(file: File) {
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch("/api/admin/email/photo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload fehlgeschlagen");
      setDraft((d) => ({ ...d, photo: json.path }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!draft.name.trim()) { setError("Name der Signatur ist erforderlich."); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/email/signatures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
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
    if (!confirm("Diese Signatur wirklich löschen?")) return;
    await fetch("/api/admin/email/signatures", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    onChange();
  }

  function Form() {
    return (
      <div className="space-y-3 rounded-xl border border-neutral-150 bg-neutral-50 p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="relative grid size-16 place-items-center overflow-hidden rounded-full bg-[#eef3e7] text-sm font-bold text-[#4a7029] ring-1 ring-[#5d8a34]/20">
              {draft.photo ? <Image src={draft.photo} alt="" fill sizes="64px" className="object-cover" /> : (draft.displayName?.[0] ?? "?")}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-600 hover:border-[#5d8a34] hover:text-[#5d8a34]">
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Foto
              <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ""; }} />
            </label>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <label className="block"><span className={label}>Interner Name</span><input className={field} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Kundensupport" /></label>
            <label className="block"><span className={label}>Angezeigter Name</span><input className={field} value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} placeholder="Nina Reiter" /></label>
            <label className="block sm:col-span-2"><span className={label}>Rolle / Zusatz</span><input className={field} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Kundenbetreuung · Deutsche Gebäudedienste" /></label>
          </div>
        </div>
        <label className="block">
          <span className={label}>Signaturtext</span>
          <textarea className={`${field} min-h-[70px] resize-y`} value={draft.html} onChange={(e) => setDraft({ ...draft, html: e.target.value })} placeholder="Vielen Dank für Ihre Nachricht.&#10;Ich kümmere mich schnellstmöglich um Ihr Anliegen." />
        </label>
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
          <h2 className="text-sm font-bold text-neutral-900">Signaturen</h2>
          <p className="mt-0.5 text-xs text-neutral-400">Wird an ausgehende Nachrichten angehängt.</p>
        </div>
        {!adding && (
          <button onClick={startAdd} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:border-[#5d8a34] hover:text-[#5d8a34]">
            <Plus size={15} /> Neu erstellen
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {signatures.map((s) => (
          <div key={s.id} className="rounded-xl border border-neutral-150">
            <button onClick={() => (openId === s.id ? setOpenId(null) : startEdit(s))} className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left">
              <span className="flex items-center gap-2 text-sm">
                <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#eef3e7] text-xs font-bold text-[#4a7029]">
                  {s.photo ? <Image src={s.photo} alt="" fill sizes="28px" className="object-cover" /> : (s.displayName?.[0] ?? "?")}
                </span>
                <span className="font-semibold text-neutral-900">{s.name}</span>
              </span>
              <span className="flex items-center gap-1">
                <span onClick={(e) => { e.stopPropagation(); remove(s.id); }} className="grid size-8 place-items-center rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600" role="button" aria-label="Signatur löschen"><Trash2 size={15} /></span>
                {openId === s.id ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
              </span>
            </button>
            {openId === s.id && <div className="border-t border-neutral-100 p-3.5"><Form /></div>}
          </div>
        ))}
      </div>
      {adding && <div className="mt-3"><Form /></div>}
    </section>
  );
}
