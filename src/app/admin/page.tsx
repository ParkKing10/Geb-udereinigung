import Link from "next/link";
import { Wallet, ReceiptText, Inbox, CalendarCheck, Plus, ArrowRight } from "lucide-react";
import { PageHeader, StatCard, Panel, StatusBadge, table, btn } from "@/components/admin/ui";
import { AreaChart } from "@/components/admin/charts";
import { leadStatus } from "@/lib/admin/data";
import { readLeads, readOrders } from "@/lib/admin/store";
import { readInvoices, effectiveStatus, grossCents, monthlyPaidGross } from "@/lib/admin/invoices";
import { formatEUR, formatDate, relativeTime, initials } from "@/lib/admin/format";
import { LiveVisitors } from "@/components/admin/LiveVisitors";
import { getActor, can } from "@/lib/admin/actor";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [leads, orders, invoices, actor] = await Promise.all([readLeads(), readOrders(), readInvoices(), getActor()]);
  const now = Date.now();

  // Mitarbeiter sehen nur die Kennzahlen der Bereiche, für die sie Rechte haben.
  const show = (href: string) => (actor ? can(actor, href) : false);
  const showMoney = show("/admin/invoices") || show("/admin/finance");
  const showLeads = show("/admin/leads");
  const showOrders = show("/admin/auftraege");

  // Umsatz aus echten bezahlten Rechnungen (letzte 8 Monate; aktueller vs. Vormonat).
  const series = monthlyPaidGross(invoices, 8);
  const last = series[series.length - 1]?.gross ?? 0;
  const prev = series[series.length - 2]?.gross ?? 0;
  const revDelta = prev > 0 ? (((last - prev) / prev) * 100).toFixed(1).replace(".", ",") : null;

  const invRows = invoices.map((i) => ({ eff: effectiveStatus(i), gross: grossCents(i) }));
  const openInvoices = invRows.filter((r) => r.eff === "Offen" || r.eff === "Überfällig");
  const openSum = openInvoices.reduce((a, r) => a + r.gross, 0);
  const overdue = invRows.filter((r) => r.eff === "Überfällig").length;
  const activeOrders = orders.filter((o) => o.status === "Bestätigt" || o.status === "Aktiv");

  const recentOrders = orders.slice().reverse().slice(0, 5);
  const recentLeads = leads.slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Überblick über Umsatz, Aufträge und Anfragen"
        actions={showOrders ? <Link href="/admin/auftraege" className={btn("primary")}><Plus size={16} /> Neuer Auftrag</Link> : undefined}
      />

      {/* Live-Besucher: wer ist gerade auf der Website, wer steckt im Angebots-Formular? */}
      <div className="mb-6">
        <LiveVisitors />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {showMoney && <StatCard label="Umsatz (Monat)" value={formatEUR(last)} delta={revDelta ? `${revDelta} %` : "bezahlte Rechnungen"} trend="up" icon={Wallet} hint="vs. Vormonat" />}
        {showMoney && <StatCard label="Offene Rechnungen" value={formatEUR(openSum)} delta={`${overdue} überfällig`} trend="down" icon={ReceiptText} hint={`${openInvoices.length} offen`} />}
        {showLeads && <StatCard label="Neue Leads" value={String(leads.length)} delta="Anfragen gesamt" trend="up" icon={Inbox} hint="aus dem Formular" />}
        {showOrders && <StatCard label="Aktive Aufträge" value={String(activeOrders.length)} delta="in Bearbeitung" trend="up" icon={CalendarCheck} hint={`${orders.length} gesamt`} />}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {showMoney && <Panel
          title="Umsatzentwicklung"
          subtitle="Bezahlte Rechnungen, letzte 8 Monate"
          className="lg:col-span-2"
          action={revDelta ? <span className="rounded-full bg-[#eef3e7] px-2.5 py-1 text-xs font-semibold text-[#4a7029]">{revDelta} %</span> : null}
        >
          <AreaChart values={series.map((r) => r.gross)} labels={series.map((r) => r.month)} />
        </Panel>}

        {showLeads && <Panel
          title="Neueste Leads"
          subtitle={`${leads.length} Anfragen`}
          action={<Link href="/admin/leads" className="text-xs font-semibold text-[#4a7029] hover:underline">Alle →</Link>}
          bodyClassName="!p-0"
        >
          {recentLeads.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-400">Noch keine Leads. Anfragen aus dem Angebots-Formular erscheinen hier.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recentLeads.map((l) => (
                <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eef3e7] text-xs font-bold text-[#4a7029]">{initials(l.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{l.name}</p>
                    <p className="truncate text-xs text-neutral-500">{l.service} · {l.location}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={leadStatus(l.id)} />
                    <p className="mt-1 text-[11px] text-neutral-400">{relativeTime(l.createdAt, now)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>}
      </div>

      {showOrders && <div className="mt-6">
        <Panel
          title="Aktuelle Aufträge"
          subtitle="Die zuletzt angelegten Aufträge"
          action={<Link href="/admin/auftraege" className="text-xs font-semibold text-[#4a7029] hover:underline">Alle Aufträge →</Link>}
          bodyClassName="!p-0"
        >
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-400">Noch keine Aufträge. Lege einen an oder erstelle ihn aus einem Lead.</p>
          ) : (
            <div className={table.wrap}>
              <table className={table.table}>
                <thead>
                  <tr>
                    <th className={table.th}>Kunde</th>
                    <th className={table.th}>Leistung</th>
                    <th className={table.th}>Standort</th>
                    <th className={table.th}>Erstellt</th>
                    <th className={table.th}>Turnus</th>
                    <th className={`${table.th} text-right`}>Wert</th>
                    <th className={table.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className={table.tr}>
                      <td className={`${table.td} font-medium text-neutral-900`}>{o.customerName}</td>
                      <td className={table.td}>{o.service}</td>
                      <td className={table.td}>{o.location || "–"}</td>
                      <td className={table.td}>{formatDate(o.createdAt)}</td>
                      <td className={table.td}>{o.turnus || "–"}</td>
                      <td className={`${table.td} text-right font-medium tabular-nums`}>{formatEUR(o.amountCents)}</td>
                      <td className={table.td}><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>}
    </>
  );
}
