import { Inbox, Sparkles, Trophy, MessageSquare, KanbanSquare } from "lucide-react";
import Link from "next/link";
import { PageHeader, StatCard, Panel, btn } from "@/components/admin/ui";
import { LeadsList } from "@/components/admin/LeadsList";
import { readLeads, readMessages } from "@/lib/admin/store";
import { relativeTime, initials } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const [leads, messages] = await Promise.all([readLeads(), readMessages()]);
  const now = Date.now();
  const neu = leads.filter((l) => (l.status ?? "Neu") === "Neu").length;
  const gewonnen = leads.filter((l) => l.status === "Gewonnen").length;

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="Alle Anfragen als Liste – Datum, Quelle und Kontakt auf einen Blick"
        actions={<Link href="/admin/crm" className={btn("primary")}><KanbanSquare size={16} /> Zum CRM-Board</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Leads gesamt" value={String(leads.length)} icon={Inbox} hint="alle Anfragen" />
        <StatCard label="Neu / unbearbeitet" value={String(neu)} icon={Sparkles} hint="warten auf Kontakt" />
        <StatCard label="Gewonnen" value={String(gewonnen)} delta="konvertiert" trend="up" icon={Trophy} />
        <StatCard label="Kontaktanfragen" value={String(messages.length)} icon={MessageSquare} hint="über /kontakt" />
      </div>

      <div className="mt-6">
        <LeadsList leads={leads} />
      </div>

      <div className="mt-6">
        <Panel title="Kontaktanfragen" subtitle={`${messages.length} Nachrichten über das Kontaktformular`} bodyClassName="!p-0">
          {messages.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-400">Noch keine Nachrichten.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {messages.map((m) => (
                <li key={m.id} className="flex gap-3 px-5 py-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600">{initials(m.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-neutral-900">{m.name}</p>
                      <span className="shrink-0 text-[11px] text-neutral-400">{relativeTime(m.createdAt, now)}</span>
                    </div>
                    <p className="text-xs text-neutral-500">{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
                    <p className="mt-1.5 line-clamp-2 text-sm text-neutral-600">{m.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
