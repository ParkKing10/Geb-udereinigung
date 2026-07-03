"use client";

// Besucher-Journeys: pro Session jeder Schritt (Seiten, Formular-Schritte,
// Kontakt eingegeben, abgeschickt) + Status (Lead / Abgebrochen / nur besucht).
import { useState } from "react";
import { ChevronDown, ChevronUp, Eye, FileText, ListOrdered, Phone, CheckCircle2, Mail, Smartphone, Monitor, Building2 } from "lucide-react";
import { formatDateTime, relativeTime } from "@/lib/admin/format";

export type JourneyItem = {
  sid: string;
  start: string;
  end: string;
  source?: { label: string; emoji: string; keyword?: string };
  device?: string;
  company?: string;
  events: { ts: string; t: string; p?: string }[];
  lead?: { id: string; name: string };
  abandoned?: { name?: string; email?: string; phone?: string; service?: string; step: number; status: string };
};

function eventMeta(t: string, p?: string): { icon: React.ReactNode; text: string } {
  switch (t) {
    case "view": return { icon: <Eye size={13} />, text: `Seite besucht: ${p ?? "/"}` };
    case "quote_open": return { icon: <FileText size={13} />, text: "Angebots-Formular geöffnet" };
    case "quote_step": return { icon: <ListOrdered size={13} />, text: `Formular-Schritt ${p ?? "?"}/3 erreicht` };
    case "contact": return { icon: <Phone size={13} />, text: "Kontaktdaten eingetippt" };
    case "submit": return { icon: <CheckCircle2 size={13} />, text: "Anfrage abgeschickt ✓" };
    default: return { icon: <Eye size={13} />, text: t };
  }
}

function StatusBadge({ item }: { item: JourneyItem }) {
  if (item.lead) return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Lead: {item.lead.name}</span>;
  if (item.abandoned) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Abgebrochen (Schritt {item.abandoned.step + 1}/3)</span>;
  const openedForm = item.events.some((e) => e.t === "quote_open");
  if (openedForm) return <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">Formular geöffnet</span>;
  return <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">Nur besucht</span>;
}

function Row({ item }: { item: JourneyItem }) {
  const [open, setOpen] = useState(false);
  const now = Date.now();
  const pages = item.events.filter((e) => e.t === "view").length;

  return (
    <li>
      <button onClick={() => setOpen(!open)} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-left text-sm hover:bg-neutral-50">
        <span className="whitespace-nowrap text-xs text-neutral-400">{relativeTime(item.end, now)}</span>
        {item.source && (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600">
            {item.source.emoji} {item.source.label}{item.source.keyword ? <span className="font-normal text-neutral-400">· „{item.source.keyword}“</span> : null}
          </span>
        )}
        {item.company && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#eef3e7] px-2 py-0.5 text-[11px] font-bold text-[#4a7029]" title="Erkanntes Unternehmen (IP-Bereich)">
            <Building2 size={11} /> {item.company}
          </span>
        )}
        {item.device && (item.device === "mobile" ? <Smartphone size={12} className="text-neutral-400" /> : <Monitor size={12} className="text-neutral-400" />)}
        <span className="text-xs text-neutral-500">{pages} Seite{pages === 1 ? "" : "n"} · {item.events.length} Ereignisse</span>
        <span className="ml-auto inline-flex items-center gap-2">
          <StatusBadge item={item} />
          {open ? <ChevronUp size={15} className="text-neutral-400" /> : <ChevronDown size={15} className="text-neutral-400" />}
        </span>
      </button>

      {open && (
        <div className="border-t border-neutral-100 bg-neutral-50/60 px-5 py-3">
          <ol className="space-y-1.5">
            {item.events.map((e, i) => {
              const m = eventMeta(e.t, e.p);
              const strong = e.t === "submit" || e.t === "contact";
              return (
                <li key={i} className={`flex items-center gap-2 text-xs ${strong ? "font-semibold text-[#16241a]" : "text-neutral-600"}`}>
                  <span className={`grid size-5 shrink-0 place-items-center rounded-full ${e.t === "submit" ? "bg-emerald-100 text-emerald-700" : e.t === "contact" ? "bg-amber-100 text-amber-700" : "bg-white text-neutral-400 ring-1 ring-neutral-200"}`}>
                    {m.icon}
                  </span>
                  <span className="w-32 shrink-0 tabular-nums text-neutral-400">{formatDateTime(e.ts)}</span>
                  <span className="min-w-0 truncate">{m.text}</span>
                </li>
              );
            })}
          </ol>

          {item.abandoned && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <p className="mb-1 font-semibold">Bereits eingegeben (nicht abgeschickt):</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {item.abandoned.name && <span>👤 {item.abandoned.name}</span>}
                {item.abandoned.email && <a className="inline-flex items-center gap-1 underline" href={`mailto:${item.abandoned.email}`}><Mail size={11} /> {item.abandoned.email}</a>}
                {item.abandoned.phone && <a className="inline-flex items-center gap-1 underline" href={`tel:${item.abandoned.phone}`}><Phone size={11} /> {item.abandoned.phone}</a>}
                {item.abandoned.service && <span>🧹 {item.abandoned.service}</span>}
              </div>
              <p className="mt-1.5 text-[11px] text-amber-700">Vollständig unter Menü „Abgebrochen“ – dort anrufen, erledigen oder als Lead übernehmen.</p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export function JourneysPanel({ items }: { items: JourneyItem[] }) {
  return (
    <section className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-3.5">
        <h2 className="text-sm font-bold text-neutral-900">Besucher-Journeys</h2>
        <p className="text-xs text-neutral-400">Jede Session Schritt für Schritt: besuchte Seiten, Formular-Fortschritt, Abbruch oder Anfrage. Neueste zuerst.</p>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-neutral-400">Noch keine Journeys aufgezeichnet – sie erscheinen mit den nächsten Besuchern.</p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {items.map((it) => <Row key={it.sid + it.start} item={it} />)}
        </ul>
      )}
    </section>
  );
}
