import { PageHeader } from "@/components/admin/ui";
import { LegalEditor } from "@/components/admin/LegalEditor";
import { readLegal } from "@/lib/admin/legal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rechtstexte – Deutsche Gebäudedienste" };

export default async function RechtstextePage() {
  const legal = await readLegal();
  return (
    <>
      <PageHeader title="Rechtstexte" subtitle="Impressum, Datenschutz & AGB direkt bearbeiten – Änderungen sind sofort auf der Website live." />
      <LegalEditor initial={legal} />
    </>
  );
}
