import { Wallet, ReceiptText, Clock, AlertTriangle } from "lucide-react";
import { PageHeader, StatCard, Panel } from "@/components/admin/ui";
import { BarChart } from "@/components/admin/charts";
import { readInvoices, effectiveStatus, grossCents, monthlyPaidGross } from "@/lib/admin/invoices";
import { formatEUR } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const invoices = await readInvoices();
  const rows = invoices.map((i) => ({ i, eff: effectiveStatus(i), gross: grossCents(i) }));

  const paid = rows.filter((r) => r.eff === "Bezahlt").reduce((a, r) => a + r.gross, 0);
  const openRows = rows.filter((r) => r.eff === "Offen" || r.eff === "Überfällig");
  const openSum = openRows.reduce((a, r) => a + r.gross, 0);
  const overdue = rows.filter((r) => r.eff === "Überfällig");
  const overdueSum = overdue.reduce((a, r) => a + r.gross, 0);
  const fakturiert = rows.filter((r) => r.eff !== "Entwurf").reduce((a, r) => a + r.gross, 0);

  const series = monthlyPaidGross(invoices, 8);

  // Einnahmen nach Leistung (bezahlte Rechnungen, brutto)
  const byServiceMap = new Map<string, number>();
  for (const r of rows) {
    if (r.eff !== "Bezahlt") continue;
    byServiceMap.set(r.i.service, (byServiceMap.get(r.i.service) ?? 0) + r.gross);
  }
  const byService = Array.from(byServiceMap.entries()).map(([service, amount]) => ({ service, amount })).sort((a, b) => b.amount - a.amount);
  const serviceMax = Math.max(...byService.map((s) => s.amount), 1);

  const hasData = invoices.length > 0;

  return (
    <>
      <PageHeader title="Finanzen" subtitle="Umsatz & offene Posten aus echten Rechnungen." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Umsatz (bezahlt)" value={formatEUR(paid)} delta="eingegangen" trend="up" icon={Wallet} hint="brutto" />
        <StatCard label="Fakturiert gesamt" value={formatEUR(fakturiert)} icon={ReceiptText} hint={`${invoices.length} Rechnungen`} />
        <StatCard label="Offen" value={formatEUR(openSum)} delta={`${openRows.length} Rechnungen`} trend="down" icon={Clock} hint="inkl. überfällig" />
        <StatCard label="Überfällig" value={formatEUR(overdueSum)} delta={`${overdue.length} Rechnungen`} trend={overdue.length ? "down" : "up"} icon={AlertTriangle} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Umsatz pro Monat" subtitle="Bezahlte Rechnungen, letzte 8 Monate" className="lg:col-span-2">
          {hasData ? (
            <BarChart groups={series.map((s) => ({ label: s.month, values: [s.gross] }))} colors={["#5d8a34"]} legend={["Umsatz (bezahlt)"]} />
          ) : (
            <p className="py-12 text-center text-sm text-neutral-400">Noch keine bezahlten Rechnungen. Sobald du Rechnungen als „bezahlt" markierst, erscheint hier der Verlauf.</p>
          )}
        </Panel>

        <Panel title="Offene Posten" subtitle={`${openRows.length} Rechnungen ausstehend`}>
          <div className="rounded-2xl bg-[#16241a] px-5 py-4 text-white">
            <p className="text-xs font-medium uppercase tracking-wide text-white/60">Ausstehend gesamt</p>
            <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">{formatEUR(openSum)}</p>
          </div>
          <ul className="mt-4 space-y-2.5">
            <li className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-amber-800">Offen</p>
                <p className="text-xs text-amber-700/80">{openRows.length - overdue.length} Rechnung(en)</p>
              </div>
              <span className="text-sm font-bold tabular-nums text-amber-800">{formatEUR(openSum - overdueSum)}</span>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-rose-700">Überfällig</p>
                <p className="text-xs text-rose-600/80">{overdue.length} Rechnung(en)</p>
              </div>
              <span className="text-sm font-bold tabular-nums text-rose-700">{formatEUR(overdueSum)}</span>
            </li>
          </ul>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Einnahmen nach Leistung" subtitle={`${byService.length} Leistungsarten · aus bezahlten Rechnungen`}>
          {byService.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">Noch keine bezahlten Rechnungen erfasst.</p>
          ) : (
            <ul className="space-y-3.5">
              {byService.map((s) => {
                const pct = Math.round((s.amount / serviceMax) * 100);
                return (
                  <li key={s.service}>
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium text-neutral-700">{s.service}</span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">{formatEUR(s.amount)}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full rounded-full bg-[#5d8a34]" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <p className="mt-4 text-xs text-neutral-400">
        Hinweis: Betriebskosten/Gewinnmarge werden aktuell nicht erfasst – diese Ansicht zeigt reine Umsatz- und Forderungszahlen aus echten Rechnungen.
      </p>
    </>
  );
}
