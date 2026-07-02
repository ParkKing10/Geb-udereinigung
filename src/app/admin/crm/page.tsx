import Link from "next/link";
import { List, Sparkles, Handshake, Trophy } from "lucide-react";
import { PageHeader, StatCard, btn } from "@/components/admin/ui";
import { LeadsPipeline } from "@/components/admin/LeadsPipeline";
import { readLeads } from "@/lib/admin/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "CRM – Deutsche Gebäudedienste" };

export default async function CrmPage() {
  const leads = await readLeads();
  const offen = leads.filter((l) => ["Neu", "Kontaktiert", "Angebot"].includes((l.status as string) ?? "Neu")).length;
  const inArbeit = leads.filter((l) => ["Kontaktiert", "Angebot"].includes((l.status as string) ?? "")).length;
  const gewonnen = leads.filter((l) => l.status === "Gewonnen").length;

  return (
    <>
      <PageHeader
        title="CRM"
        subtitle="Pipeline: Leads von Neu bis Gewonnen abarbeiten – Status per Karte ändern"
        actions={<Link href="/admin/leads" className={btn("outline")}><List size={16} /> Zur Leads-Liste</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Offen in Pipeline" value={String(offen)} icon={Sparkles} hint="Neu + Kontaktiert + Angebot" />
        <StatCard label="In Bearbeitung" value={String(inArbeit)} icon={Handshake} hint="Kontaktiert + Angebot" />
        <StatCard label="Gewonnen" value={String(gewonnen)} delta="konvertiert" trend="up" icon={Trophy} />
      </div>

      <div className="mt-6">
        <LeadsPipeline leads={leads} />
      </div>
    </>
  );
}
