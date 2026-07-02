"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Check, Loader2 } from "lucide-react";

const field = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5d8a34]";
const lbl = "mb-1 block text-xs font-medium text-neutral-500";

export function CreateOrderFromLead({
  lead,
  defaultAmount,
}: {
  lead: { id: string; name: string; email: string; phone: string; service: string; location: string; turnus?: string | null };
  defaultAmount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(defaultAmount ? String(Math.round(defaultAmount)) : "");
  const [turnus, setTurnus] = useState(lead.turnus || "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          customerName: lead.name,
          customerEmail: lead.email,
          customerPhone: lead.phone,
          service: lead.service,
          location: lead.location,
          turnus,
          amountEuro: Number(amount),
          note,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Fehler");
      setDone(true);
      router.refresh(); // Lead wird "Gewonnen", Auftrag erscheint
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <Check size={16} /> Auftrag erstellt · Lead auf „Gewonnen" gesetzt.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#16241a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f1c14]"
      >
        <CalendarPlus size={16} /> Auftrag aus diesem Lead erstellen
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={lbl}>Auftragswert (€)</span>
          <input className={field} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="z. B. 3600" />
        </label>
        <label className="block">
          <span className={lbl}>Turnus</span>
          <input className={field} value={turnus} onChange={(e) => setTurnus(e.target.value)} placeholder="z. B. Wöchentlich" />
        </label>
      </div>
      <label className="block">
        <span className={lbl}>Notiz (optional)</span>
        <input className={field} value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Start 01.08., Rechnung monatlich" />
      </label>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => setOpen(false)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">Abbrechen</button>
        <button onClick={submit} disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#5d8a34] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a7029] disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Auftrag speichern
        </button>
      </div>
      <p className="text-xs text-neutral-400">Kunde (E-Mail {lead.email}) wird automatisch auf Wiederbesteller geprüft.</p>
    </div>
  );
}
