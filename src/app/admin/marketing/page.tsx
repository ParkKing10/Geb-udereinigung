import { readSessions, readLeads, readOrders } from "@/lib/admin/store";
import { deriveSource } from "@/lib/marketing/source";
import type { MSession, MLead, MOrder } from "@/lib/marketing/aggregate";
import { MarketingDashboard } from "@/components/admin/MarketingDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marketing – Deutsche Gebäudedienste" };

type StoredSession = {
  ts: string; source: string; label: string; emoji: string; device: string; landing: string; keyword?: string; campaign?: string;
};

export default async function MarketingPage() {
  const [rawSessions, leads, orders] = await Promise.all([readSessions<StoredSession>(), readLeads(), readOrders()]);

  const sessions: MSession[] = rawSessions.map((s) => ({
    ts: s.ts, source: s.source, label: s.label, emoji: s.emoji, device: s.device, landing: s.landing, keyword: s.keyword, campaign: s.campaign,
  }));

  const mLeads: MLead[] = leads.map((l) => {
    const attr = l.attribution || {};
    const src = deriveSource({ gclid: attr.gclid, gbraid: attr.gbraid, wbraid: attr.wbraid, utm_source: attr.utm_source, utm_medium: attr.utm_medium, referrer: attr.referrer });
    return { ts: l.createdAt, id: l.id, source: src.key, label: src.label, emoji: src.emoji, keyword: attr.utm_term, campaign: attr.utm_campaign, landing: attr.landing_page };
  });

  // Reale Aufträge = Umsatz + „gebucht" (Quelle aus Snapshot der Bestellung).
  const mOrders: MOrder[] = orders
    .filter((o) => o.status !== "Storniert")
    .map((o) => ({ ts: o.createdAt, source: o.source, label: o.sourceLabel, emoji: o.sourceEmoji, value: o.amountCents / 100, keyword: o.keyword, campaign: o.campaign }));

  return <MarketingDashboard sessions={sessions} leads={mLeads} orders={mOrders} />;
}
