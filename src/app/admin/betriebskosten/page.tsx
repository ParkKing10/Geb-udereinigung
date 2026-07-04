import { TrendingDown, Wallet, PiggyBank, Percent } from "lucide-react";
import { PageHeader, StatCard, Panel } from "@/components/admin/ui";
import { ExpensesClient } from "@/components/admin/ExpensesClient";
import { readExpenses, expenseSummary } from "@/lib/admin/expenses";
import { readInvoices, monthlyPaidGross } from "@/lib/admin/invoices";
import { scopeToAccount } from "@/lib/admin/scope";
import { formatEUR } from "@/lib/admin/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Betriebskosten – Deutsche Gebäudedienste" };

export default async function BetriebskostenPage() {
  const [expensesRaw, invoicesRaw] = await Promise.all([readExpenses(), readInvoices()]);
  const [expenses, invoices] = [await scopeToAccount(expensesRaw), await scopeToAccount(invoicesRaw)];
  const sum = expenseSummary(expenses);

  // Umsatz des laufenden Monats = brutto bezahlter Rechnungen.
  const revenue = monthlyPaidGross(invoices, 1)[0]?.gross ?? 0;
  const profit = revenue - sum.monthlyTotal;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const catMax = Math.max(...sum.byCategory.map((c) => c.amount), 1);

  return (
    <>
      <PageHeader title="Betriebskosten" subtitle="Fixkosten erfassen und Gewinn/Marge gegen den echten Umsatz rechnen." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monatliche Fixkosten" value={formatEUR(sum.monthlyFixed)} icon={TrendingDown} hint={`${formatEUR(sum.annualFixed)} / Jahr`} />
        <StatCard label="Umsatz (Monat)" value={formatEUR(revenue)} delta="bezahlte Rechnungen" trend="up" icon={Wallet} />
        <StatCard label="Gewinn (Monat)" value={formatEUR(profit)} delta={profit >= 0 ? "im Plus" : "im Minus"} trend={profit >= 0 ? "up" : "down"} icon={PiggyBank} hint="Umsatz − Kosten" />
        <StatCard label="Marge" value={`${margin.toFixed(1).replace(".", ",")} %`} trend={margin >= 0 ? "up" : "down"} icon={Percent} hint="Gewinn / Umsatz" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpensesClient expenses={expenses} />
        </div>

        <div className="space-y-6">
          <Panel title="Gewinn-Rechner" subtitle="Laufender Monat">
            <div className="space-y-2.5">
              <Row label="Umsatz (bezahlt)" value={formatEUR(revenue)} />
              <Row label="− Fixkosten" value={`− ${formatEUR(sum.monthlyFixed)}`} muted />
              {sum.oneOffThisMonth > 0 && <Row label="− Einmalige (Monat)" value={`− ${formatEUR(sum.oneOffThisMonth)}`} muted />}
              <div className="my-2 border-t border-neutral-100" />
              <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${profit >= 0 ? "bg-[#eef3e7]" : "bg-rose-50"}`}>
                <span className={`text-sm font-semibold ${profit >= 0 ? "text-[#3f5c22]" : "text-rose-700"}`}>Gewinn</span>
                <span className={`text-base font-bold tabular-nums ${profit >= 0 ? "text-[#3f5c22]" : "text-rose-700"}`}>{formatEUR(profit)}</span>
              </div>
              <p className="text-xs text-neutral-400">Umsatz kommt aus bezahlten Rechnungen des laufenden Monats. Fixkosten aus deinen monatlichen Kostenposten.</p>
            </div>
          </Panel>

          <Panel title="Fixkosten nach Kategorie" subtitle={`${sum.byCategory.length} Kategorien`}>
            {sum.byCategory.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">Noch keine monatlichen Kosten erfasst.</p>
            ) : (
              <ul className="space-y-3">
                {sum.byCategory.map((c) => (
                  <li key={c.category}>
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium text-neutral-700">{c.category}</span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">{formatEUR(c.amount)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-[#5d8a34]" style={{ width: `${Math.round((c.amount / catMax) * 100)}%` }} /></div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-neutral-500" : "text-neutral-700"}>{label}</span>
      <span className={`tabular-nums ${muted ? "text-neutral-500" : "font-semibold text-neutral-900"}`}>{value}</span>
    </div>
  );
}
