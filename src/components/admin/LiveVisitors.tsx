"use client";

// Live-Besucher-Widget fürs Dashboard: pollt alle 5 s die anonyme Präsenz-Liste.
// Zeigt wer online ist, wer das Angebots-Formular offen hat (inkl. Schritt) und
// ob bereits Kontaktdaten eingetippt wurden.
import { useEffect, useState } from "react";
import { Radio, FileText, Phone, Smartphone, Monitor } from "lucide-react";

type Visitor = {
  sid: string;
  path: string;
  seconds: number;
  quote: { open: boolean; step: number; hasContact: boolean } | null;
  label?: string;
  emoji?: string;
  keyword?: string;
  ip?: string;
  country?: string;
  device?: "mobile" | "desktop";
};

function fmtDuration(s: number): string {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

// ISO-Ländercode → Flaggen-Emoji (DE → 🇩🇪)
function flag(cc?: string): string {
  if (!cc || cc.length !== 2) return "";
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

export function LiveVisitors() {
  const [data, setData] = useState<{ count: number; inQuote: number; visitors: Visitor[] } | null>(null);

  useEffect(() => {
    let stop = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/presence", { cache: "no-store" });
        if (res.ok && !stop) setData(await res.json());
      } catch { /* nächster Poll */ }
    }
    load();
    const iv = window.setInterval(load, 5000);
    return () => { stop = true; window.clearInterval(iv); };
  }, []);

  const count = data?.count ?? 0;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="relative grid size-9 place-items-center rounded-full bg-[#eef3e7] text-[#4a7029]">
            <Radio size={17} />
            {count > 0 && <span className="absolute -right-0.5 -top-0.5 size-2.5 animate-pulse rounded-full bg-emerald-500 ring-2 ring-white" />}
          </span>
          <div>
            <p className="text-sm font-bold text-neutral-900">
              Live auf der Website: {count} {count === 1 ? "Besucher" : "Besucher"}
            </p>
            <p className="text-xs text-neutral-400">
              {data ? `${data.inQuote} im Angebots-Formular · aktualisiert alle 5 s` : "Lade …"}
            </p>
          </div>
        </div>
      </div>

      {count > 0 && (
        <ul className="mt-4 divide-y divide-neutral-100">
          {data!.visitors.slice(0, 8).map((v) => (
            <li key={v.sid} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
              <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span className="max-w-[220px] truncate font-medium text-neutral-800">{v.path}</span>
              <span className="text-xs text-neutral-400">{fmtDuration(v.seconds)}</span>
              {v.label && (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600" title="Herkunft">
                  {v.emoji} {v.label}{v.keyword ? <span className="font-normal text-neutral-400">· „{v.keyword}“</span> : null}
                </span>
              )}
              {v.device && (
                <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400" title={v.device === "mobile" ? "Handy" : "Desktop"}>
                  {v.device === "mobile" ? <Smartphone size={12} /> : <Monitor size={12} />}
                </span>
              )}
              {(v.country || v.ip) && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-neutral-400" title="Land / IP (nur live, wird nicht gespeichert)">
                  {flag(v.country)} {v.ip}
                </span>
              )}
              {v.quote?.open && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                  <FileText size={11} /> Formular · Schritt {v.quote.step + 1}/3
                </span>
              )}
              {v.quote?.hasContact && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  <Phone size={11} /> Kontakt eingegeben
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
