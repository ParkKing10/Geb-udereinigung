"use client";

// Zeitraum-Wähler fürs Dashboard: Presets (Heute/7/30 Tage) + freies von–bis.
// Zustand lebt in der URL (?von=YYYY-MM-DD&bis=…) → Server-Seite filtert danach.
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";

function berlinToday(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}
function daysAgo(n: number): string {
  const d = new Date(Date.now() - n * 86_400_000);
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

export function DateRange() {
  const router = useRouter();
  const params = useSearchParams();
  const today = berlinToday();
  const von = params.get("von") || today;
  const bis = params.get("bis") || today;

  function apply(v: string, b: string) {
    if (!v || !b) return;
    const [lo, hi] = v <= b ? [v, b] : [b, v];
    router.replace(`/admin?von=${lo}&bis=${hi}`, { scroll: false });
  }

  const isToday = von === today && bis === today;
  const is7 = von === daysAgo(6) && bis === today;
  const is30 = von === daysAgo(29) && bis === today;

  const preset = (active: boolean) =>
    `rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${active ? "bg-[#16241a] text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`;
  const dateField =
    "rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-700 outline-none focus:border-[#5d8a34]";

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 shadow-sm">
      <CalendarDays size={15} className="text-neutral-400" />
      <button onClick={() => apply(today, today)} className={preset(isToday)}>Heute</button>
      <button onClick={() => apply(daysAgo(6), today)} className={preset(is7)}>7 Tage</button>
      <button onClick={() => apply(daysAgo(29), today)} className={preset(is30)}>30 Tage</button>
      <span className="mx-0.5 hidden h-4 w-px bg-neutral-200 sm:block" />
      <input type="date" value={von} max={today} onChange={(e) => apply(e.target.value, bis)} className={dateField} aria-label="Von" />
      <span className="text-xs text-neutral-400">–</span>
      <input type="date" value={bis} max={today} onChange={(e) => apply(von, e.target.value)} className={dateField} aria-label="Bis" />
    </div>
  );
}
