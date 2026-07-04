import { ReceiptText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { InvoicesClient } from "@/components/admin/InvoicesClient";
import { InvoiceSettingsForm } from "@/components/admin/InvoiceSettingsForm";
import { readInvoices, readInvoiceSettings, effectiveStatus, grossCents } from "@/lib/admin/invoices";
import { readOrders } from "@/lib/admin/store";
import { scopeToAccount } from "@/lib/admin/scope";
import { formatEUR } from "@/lib/admin/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rechnungen – Deutsche Gebäudedienste" };

export default async function InvoicesPage() {
  const [invoicesRaw, ordersRaw, settings] = await Promise.all([readInvoices(), readOrders(), readInvoiceSettings()]);
  const [invoices, orders] = [await scopeToAccount(invoicesRaw), await scopeToAccount(ordersRaw)];

  const withStatus = invoices.map((i) => ({ i, eff: effectiveStatus(i), gross: grossCents(i) }));
  const total = withStatus.filter((x) => x.eff !== "Entwurf").reduce((a, x) => a + x.gross, 0);
  const paid = withStatus.filter((x) => x.eff === "Bezahlt").reduce((a, x) => a + x.gross, 0);
  const open = withStatus.filter((x) => x.eff === "Offen" || x.eff === "Überfällig").reduce((a, x) => a + x.gross, 0);
  const overdueCount = withStatus.filter((x) => x.eff === "Überfällig").length;

  return (
    <>
      <PageHeader title="Rechnungen" subtitle="Rechnungen erstellen, Status pflegen und als PDF drucken – aus echten Aufträgen oder manuell." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fakturiert (brutto)" value={formatEUR(total)} icon={ReceiptText} hint={`${invoices.length} Rechnungen`} />
        <StatCard label="Bezahlt" value={formatEUR(paid)} delta="eingegangen" trend="up" icon={CheckCircle2} />
        <StatCard label="Offen" value={formatEUR(open)} delta="ausstehend" trend="down" icon={Clock} hint="inkl. überfällig" />
        <StatCard label="Überfällig" value={String(overdueCount)} delta={overdueCount ? "Mahnung fällig" : "alles im Soll"} trend={overdueCount ? "down" : "up"} icon={AlertTriangle} />
      </div>

      <div className="mt-6">
        <InvoicesClient invoices={invoices} orders={orders} defaultTaxRate={settings.smallBusiness ? 0 : settings.defaultTaxRate} />
      </div>

      <div className="mt-6">
        <InvoiceSettingsForm initial={settings} />
      </div>
    </>
  );
}
