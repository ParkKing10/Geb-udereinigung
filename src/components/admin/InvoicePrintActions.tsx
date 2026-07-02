"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Printer, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Invoice } from "@/lib/admin/invoice-utils";

export function InvoicePrintActions({ invoice, effStatus }: { invoice: Invoice; effStatus: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: Invoice["status"]) {
    setBusy(true);
    await fetch("/api/admin/invoice", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: invoice.id, status }) });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="invoice-actions mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <Link href="/admin/invoices" className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"><ArrowLeft size={16} /> Alle Rechnungen</Link>
      <div className="flex items-center gap-2">
        {effStatus !== "Bezahlt" ? (
          <button onClick={() => setStatus("Bezahlt")} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Als bezahlt markieren
          </button>
        ) : (
          <button onClick={() => setStatus("Offen")} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : null} Als offen markieren
          </button>
        )}
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-[#16241a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f1c14]">
          <Printer size={15} /> Drucken / als PDF speichern
        </button>
      </div>
    </div>
  );
}
