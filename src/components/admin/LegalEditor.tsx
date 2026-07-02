"use client";

import { useRef, useState } from "react";
import { Save, Check, Loader2, ExternalLink, Eye } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";
import { LEGAL_META, type LegalContent, type LegalKey } from "@/lib/admin/legal-meta";

export function LegalEditor({ initial }: { initial: LegalContent }) {
  const [tab, setTab] = useState<LegalKey>("impressum");
  // Aktueller (bearbeiteter) Stand je Rechtstext.
  const draft = useRef<LegalContent>({ ...initial });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<LegalKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const meta = LEGAL_META.find((m) => m.key === tab)!;
  const publicPath = `/${tab}`;

  async function save() {
    setSaving(true); setError(null); setSaved(null);
    try {
      const res = await fetch("/api/admin/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [tab]: draft.current[tab] }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Speichern fehlgeschlagen");
      setSaved(tab);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {LEGAL_META.map((m) => (
          <button
            key={m.key}
            onClick={() => { setTab(m.key); setSaved(null); setError(null); }}
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${tab === m.key ? "bg-[#16241a] text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">{meta.title}</h2>
            <p className="text-xs text-neutral-400">{meta.hint}</p>
          </div>
          <Link href={publicPath} target="_blank" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5d8a34] hover:underline">
            <Eye size={14} /> Seite ansehen <ExternalLink size={12} />
          </Link>
        </div>

        {/* key = tab → beim Tab-Wechsel frische Editor-Instanz mit dem jeweiligen HTML */}
        <RichTextEditor
          key={tab}
          initialHtml={draft.current[tab]}
          onChange={(html) => { draft.current[tab] = html; setSaved(null); }}
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            {error ? <span className="text-rose-600">{error}</span> : saved === tab ? "Gespeichert – Änderung ist live." : "Änderungen werden nach dem Speichern sofort auf der Website sichtbar."}
          </p>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#16241a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f1c14] disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved === tab ? <Check size={16} /> : <Save size={16} />}
            {saving ? "Speichern …" : `${meta.label} speichern`}
          </button>
        </div>
      </section>
    </div>
  );
}
