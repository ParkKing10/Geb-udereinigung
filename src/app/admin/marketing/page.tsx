import { readSessions, readLeads, readOrders } from "@/lib/admin/store";
import { scopeToAccount, isOwnerAccount } from "@/lib/admin/scope";
import { deriveSource } from "@/lib/marketing/source";
import type { MSession, MLead, MOrder } from "@/lib/marketing/aggregate";
import { MarketingDashboard } from "@/components/admin/MarketingDashboard";
import { JourneysPanel, type JourneyItem } from "@/components/admin/JourneysPanel";
import { readJourneyEvents } from "@/lib/journeys";
import { listAbandoned } from "@/lib/admin/abandoned";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marketing – Deutsche Gebäudedienste" };

type StoredSession = {
  ts: string; sid?: string; source: string; label: string; emoji: string; device: string; landing: string; keyword?: string; campaign?: string; company?: string;
};

export default async function MarketingPage() {
  // Marketing = Website-Analytik → nur der Inhaber sieht Sessions/Journey/Abbrüche.
  // Leads/Aufträge bleiben pro Account getrennt.
  const owner = await isOwnerAccount();
  const [rawSessionsAll, leadsRaw, ordersRaw, journeyAll, abandonedAll] = await Promise.all([
    readSessions<StoredSession>(), readLeads(), readOrders(), readJourneyEvents(), listAbandoned(),
  ]);
  const rawSessions = owner ? rawSessionsAll : [];
  const leads = await scopeToAccount(leadsRaw);
  const orders = await scopeToAccount(ordersRaw);
  const journeyEvents = owner ? journeyAll : [];
  const abandoned = owner ? abandonedAll : [];

  const sessions: MSession[] = rawSessions.map((s) => ({
    ts: s.ts, source: s.source, label: s.label, emoji: s.emoji, device: s.device, landing: s.landing, keyword: s.keyword, campaign: s.campaign,
  }));

  // Session-Verknüpfung: Leads ohne Cookie-Attribution (z. B. Einwilligung abgelehnt)
  // erben Quelle/Keyword ihrer Besucher-Session über die Session-ID.
  const bySid = new Map(rawSessions.filter((s) => s.sid).map((s) => [s.sid as string, s]));

  const mLeads: MLead[] = leads.map((l) => {
    const attr = l.attribution || {};
    const src = deriveSource({ gclid: attr.gclid, gbraid: attr.gbraid, wbraid: attr.wbraid, utm_source: attr.utm_source, utm_medium: attr.utm_medium, referrer: attr.referrer });
    const sess = l.sid ? bySid.get(l.sid) : undefined;
    if (src.key === "direct" && sess && sess.source !== "direct") {
      return { ts: l.createdAt, id: l.id, source: sess.source, label: sess.label, emoji: sess.emoji, keyword: sess.keyword, campaign: sess.campaign, landing: sess.landing };
    }
    return { ts: l.createdAt, id: l.id, source: src.key, label: src.label, emoji: src.emoji, keyword: attr.utm_term, campaign: attr.utm_campaign, landing: attr.landing_page };
  });

  // Reale Aufträge = Umsatz + „gebucht" (Quelle aus Snapshot der Bestellung).
  const mOrders: MOrder[] = orders
    .filter((o) => o.status !== "Storniert")
    .map((o) => ({ ts: o.createdAt, source: o.source, label: o.sourceLabel, emoji: o.sourceEmoji, value: o.amountCents / 100, keyword: o.keyword, campaign: o.campaign }));

  // ── Besucher-Journeys: Events je Session gruppieren + mit Quelle/Lead/Abbruch verknüpfen ──
  const grouped = new Map<string, { ts: string; t: string; p?: string }[]>();
  for (const ev of journeyEvents) {
    const list = grouped.get(ev.sid) ?? [];
    list.push({ ts: ev.ts, t: ev.t, p: ev.p });
    grouped.set(ev.sid, list);
  }
  const leadBySid = new Map(leads.filter((l) => l.sid).map((l) => [l.sid as string, l]));
  const abandonedById = new Map(abandoned.map((a) => [a.id, a]));

  const journeys: JourneyItem[] = Array.from(grouped.entries())
    .map(([sid, events]) => {
      events.sort((a, b) => (a.ts < b.ts ? -1 : 1));
      const sess = bySid.get(sid);
      const lead = leadBySid.get(sid);
      const ab = abandonedById.get(sid);
      return {
        sid,
        start: events[0].ts,
        end: events[events.length - 1].ts,
        source: sess ? { label: sess.label, emoji: sess.emoji, keyword: sess.keyword } : undefined,
        device: sess?.device,
        company: sess?.company,
        events,
        lead: lead ? { id: lead.id, name: lead.name } : undefined,
        abandoned: ab ? { name: ab.name, email: ab.email, phone: ab.phone, service: ab.service, step: ab.step, status: ab.status } : undefined,
      };
    })
    .sort((a, b) => (a.end < b.end ? 1 : -1))
    .slice(0, 60);

  return (
    <>
      <MarketingDashboard sessions={sessions} leads={mLeads} orders={mOrders} />
      <JourneysPanel items={journeys} />
    </>
  );
}
