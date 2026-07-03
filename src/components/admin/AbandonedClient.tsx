"use client";

// Abgebrochene Anfragen abarbeiten: Kontakt aufnehmen, als Lead übernehmen,
// erledigt markieren oder löschen.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Trash2, Loader2, Check, ArrowRightCircle, RotateCcw } from "lucide-react";
import type { AbandonedLead } from "@/lib/admin/abandoned";
import { getService } from "@/lib/sauberfit-data";
import { deriveSource } from "@/lib/marketing/source";
import { table } from "./ui";
import { formatDateTime, relativeTime } from "@/lib/admin/format";

export function AbandonedClient({ items }: { items: AbandonedLead[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const now = Date.now();

  async function call(id: string, payload: Record<string, unknown>, method: "POST" | "DELETE" = "POST") {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/abandoned", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      if (!res.ok) alert((await res.json().catch(() => ({}))).error || "Aktion fehlgeschlagen.");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-neutral-400">
          Keine abgebrochenen Anfragen. Sobald jemand im Angebots-Formular E-Mail oder Handynummer
          eintippt, aber nicht absendet, erscheint er hier.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th className={table.th}>Zuletzt aktiv</th>
              <th className={table.th}>Kontakt</th>
              <th className={table.th}>Anfrage</th>
              <th className={table.th}>Schritt</th>
              <th className={table.th}>Quelle</th>
              <th className={table.th}>Status</th>
              <th className={`${table.th} text-right`}>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => {
              const attr = a.attribution || {};
              const src = deriveSource({ gclid: attr.gclid, gbraid: attr.gbraid, wbraid: attr.wbraid, utm_source: attr.utm_source, utm_medium: attr.utm_medium, referrer: attr.referrer });
              const done = a.status === "erledigt";
              return (
                <tr key={a.id} className={`${table.tr} ${done ? "opacity-50" : ""}`}>
                  <td className={table.td}>
                    <div className="whitespace-nowrap font-medium text-neutral-800">{formatDateTime(a.updatedAt)}</div>
                    <div className="text-[11px] text-neutral-400">{relativeTime(a.updatedAt, now)}</div>
                  </td>
                  <td className={table.td}>
                    <div className="font-medium text-neutral-900">{a.name || a.firma || "Unbekannt"}</div>
                    <div className="flex flex-col gap-0.5 text-xs">
                      {a.email && <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-[#4a7029]"><Mail size={12} /> {a.email}</a>}
                      {a.phone && <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-[#4a7029]"><Phone size={12} /> {a.phone}</a>}
                    </div>
                  </td>
                  <td className={table.td}>
                    {a.service ? (getService(a.service)?.name ?? a.service) : "–"}
                    {a.location ? <span className="text-neutral-400"> · {a.location}</span> : null}
                  </td>
                  <td className={table.td}>{a.step + 1}/3</td>
                  <td className={table.td}><span className="whitespace-nowrap">{src.emoji} {src.label}</span></td>
                  <td className={table.td}>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${done ? "bg-neutral-100 text-neutral-500" : "bg-amber-100 text-amber-800"}`}>
                      {done ? "Erledigt" : "Offen"}
                    </span>
                  </td>
                  <td className={`${table.td} text-right`}>
                    <div className="inline-flex items-center gap-2">
                      {busy === a.id ? (
                        <Loader2 size={15} className="animate-spin text-neutral-400" />
                      ) : (
                        <>
                          <button title="Als Lead übernehmen" onClick={() => call(a.id, { op: "convert" })} className="text-neutral-300 transition-colors hover:text-[#4a7029]">
                            <ArrowRightCircle size={16} />
                          </button>
                          {done ? (
                            <button title="Wieder öffnen" onClick={() => call(a.id, { op: "status", status: "offen" })} className="text-neutral-300 transition-colors hover:text-amber-600">
                              <RotateCcw size={15} />
                            </button>
                          ) : (
                            <button title="Erledigt markieren" onClick={() => call(a.id, { op: "status", status: "erledigt" })} className="text-neutral-300 transition-colors hover:text-emerald-600">
                              <Check size={16} />
                            </button>
                          )}
                          <button
                            title="Löschen"
                            onClick={() => { if (window.confirm("Eintrag endgültig löschen?")) call(a.id, {}, "DELETE"); }}
                            className="text-neutral-300 transition-colors hover:text-rose-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
