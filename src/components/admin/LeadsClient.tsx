"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Mail, Phone, Calendar, Camera } from "lucide-react";
import type { Lead } from "@/lib/admin/data";
import { leadStatus, type LeadStatus } from "@/lib/admin/data";
import { StatusBadge, table } from "./ui";
import { formatDate, initials } from "@/lib/admin/format";

const FILTERS: (LeadStatus | "Alle")[] = ["Alle", "Neu", "Kontaktiert", "Angebot", "Gewonnen", "Verloren"];

export function LeadsClient({ leads }: { leads: Lead[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Alle");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return leads.filter((l) => {
      const st = leadStatus(l.id);
      if (filter !== "Alle" && st !== filter) return false;
      if (!query) return true;
      return [l.name, l.service, l.location, l.email].some((v) => v.toLowerCase().includes(query));
    });
  }, [leads, q, filter]);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 px-5 py-3.5">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, Leistung, Ort …"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#5d8a34] focus:bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f ? "bg-[#16241a] text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th className={table.th}>Kunde</th>
              <th className={table.th}>Leistung</th>
              <th className={table.th}>Standort</th>
              <th className={table.th}>Kontakt</th>
              <th className={table.th}>Wunschstart</th>
              <th className={table.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className={table.tr}>
                <td className={table.td}>
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#eef3e7] text-[11px] font-bold text-[#4a7029]">{initials(l.name)}</span>
                    <Link href={`/admin/leads/${l.id}`} className="font-medium text-neutral-900 hover:text-[#4a7029] hover:underline">{l.name}</Link>
                    {l.images && l.images.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500" title={`${l.images.length} Foto(s)`}><Camera size={11} /> {l.images.length}</span>
                    )}
                  </div>
                </td>
                <td className={table.td}>{l.service}</td>
                <td className={table.td}>{l.location}</td>
                <td className={table.td}>
                  <div className="flex flex-col gap-0.5 text-xs">
                    <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-[#4a7029]"><Mail size={13} /> {l.email}</a>
                    <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-[#4a7029]"><Phone size={13} /> {l.phone}</a>
                  </div>
                </td>
                <td className={table.td}>
                  <span className="inline-flex items-center gap-1.5 text-neutral-600"><Calendar size={13} /> {formatDate(l.startDate)}</span>
                </td>
                <td className={table.td}><StatusBadge status={leadStatus(l.id)} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-neutral-400">Keine Leads gefunden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
