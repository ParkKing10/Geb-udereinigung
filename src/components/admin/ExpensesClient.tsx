"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Check, Repeat, CircleDot } from "lucide-react";
import type { Expense, ExpenseCategory } from "@/lib/admin/expense-types";
import { EXPENSE_CATEGORIES } from "@/lib/admin/expense-types";
import { table } from "./ui";
import { formatEUR, formatDate } from "@/lib/admin/format";

const field = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5d8a34]";
const lbl = "mb-1 block text-xs font-medium text-neutral-500";

export function ExpensesClient({ expenses }: { expenses: Expense[] }) {
  const router = useRouter();
  const [f, setF] = useState({ label: "", category: EXPENSE_CATEGORIES[0] as ExpenseCategory, amountEuro: "", cadence: "monatlich" as "monatlich" | "einmalig" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  async function add() {
    if (!f.label.trim() || !f.amountEuro) { setError("Bezeichnung und Betrag angeben."); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/expense", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, amountEuro: Number(f.amountEuro) }) });
      if (!res.ok) throw new Error((await res.json()).error || "Fehler");
      setF({ label: "", category: EXPENSE_CATEGORIES[0], amountEuro: "", cadence: f.cadence });
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Fehler"); } finally { setSaving(false); }
  }
  async function remove(id: string) {
    await fetch("/api/admin/expense", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <h2 className="text-sm font-bold text-neutral-900">Kostenposten</h2>
        <p className="text-xs text-neutral-400">Monatliche Fixkosten und einmalige Ausgaben erfassen.</p>
      </div>

      {/* Erfassung */}
      <div className="grid gap-3 border-b border-neutral-100 p-4 sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-end">
        <label className="block"><span className={lbl}>Bezeichnung</span><input className={field} value={f.label} onChange={(e) => set("label", e.target.value)} placeholder="z. B. Löhne Reinigungsteam" /></label>
        <label className="block"><span className={lbl}>Kategorie</span>
          <select className={field} value={f.category} onChange={(e) => set("category", e.target.value as ExpenseCategory)}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block"><span className={lbl}>Betrag (€)</span><input className={`${field} w-28`} inputMode="decimal" value={f.amountEuro} onChange={(e) => set("amountEuro", e.target.value)} placeholder="0" /></label>
        <label className="block"><span className={lbl}>Turnus</span>
          <select className={`${field} w-32`} value={f.cadence} onChange={(e) => set("cadence", e.target.value as "monatlich" | "einmalig")}>
            <option value="monatlich">monatlich</option>
            <option value="einmalig">einmalig</option>
          </select>
        </label>
        <button onClick={add} disabled={saving} className="inline-flex h-[38px] items-center gap-1.5 rounded-lg bg-[#5d8a34] px-4 text-sm font-semibold text-white hover:bg-[#4a7029] disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Hinzufügen
        </button>
      </div>
      {error && <p className="px-4 pt-2 text-sm text-rose-600">{error}</p>}

      {/* Liste */}
      {expenses.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-neutral-400">Noch keine Kostenposten erfasst.</p>
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Bezeichnung</th>
                <th className={table.th}>Kategorie</th>
                <th className={table.th}>Turnus</th>
                <th className={`${table.th} text-right`}>Betrag</th>
                <th className={table.th}>Erfasst</th>
                <th className={`${table.th} text-right`}></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className={table.tr}>
                  <td className={`${table.td} font-medium text-neutral-900`}>{e.label}</td>
                  <td className={table.td}>{e.category}</td>
                  <td className={table.td}>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${e.cadence === "monatlich" ? "bg-[#eef3e7] text-[#3f5c22]" : "bg-neutral-100 text-neutral-600"}`}>
                      {e.cadence === "monatlich" ? <Repeat size={11} /> : <CircleDot size={11} />} {e.cadence}
                    </span>
                  </td>
                  <td className={`${table.td} text-right font-semibold tabular-nums`}>{formatEUR(e.amountCents)}</td>
                  <td className={table.td}>{formatDate(e.date)}</td>
                  <td className={table.td}><div className="flex justify-end"><button onClick={() => remove(e.id)} className="grid size-8 place-items-center rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Löschen"><Trash2 size={15} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
