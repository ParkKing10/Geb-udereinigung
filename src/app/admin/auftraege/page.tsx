import { CalendarCheck, Wallet, Repeat, TrendingUp } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { OrdersClient } from "@/components/admin/OrdersClient";
import { readOrders } from "@/lib/admin/store";
import { formatEUR } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function AuftraegePage() {
  const orders = (await readOrders()).slice().reverse(); // neueste zuerst
  const count = orders.length;
  const revenue = orders.reduce((a, o) => a + (o.status === "Storniert" ? 0 : o.amountCents), 0);
  const repeat = orders.filter((o) => o.repeat).length;
  const aov = count ? Math.round(revenue / count) : 0;
  const repeatPct = count ? Math.round((repeat / count) * 100) : 0;

  return (
    <>
      <PageHeader title="Aufträge" subtitle="Manuell angelegt oder aus einem Lead erstellt. Inkl. Wiederbesteller & Quelle." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Aufträge gesamt" value={String(count)} icon={CalendarCheck} hint="alle Aufträge" />
        <StatCard label="Umsatz" value={formatEUR(revenue)} delta="ohne Stornos" trend="up" icon={Wallet} />
        <StatCard label="Ø Auftragswert" value={formatEUR(aov)} icon={TrendingUp} hint="pro Auftrag" />
        <StatCard label="Wiederbesteller" value={`${repeat} · ${repeatPct}%`} delta="Empfehlungs-/Stammkunden" trend="up" icon={Repeat} />
      </div>

      <div className="mt-6">
        <OrdersClient orders={orders} />
      </div>
    </>
  );
}
