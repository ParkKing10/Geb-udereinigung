import { UserX, Hourglass, PhoneCall } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { AbandonedClient } from "@/components/admin/AbandonedClient";
import { listAbandoned } from "@/lib/admin/abandoned";
import { isOwnerAccount } from "@/lib/admin/scope";

export const dynamic = "force-dynamic";

export default async function AbgebrochenPage() {
  // Abgebrochene Formulare stammen von der Website → nur der Inhaber sieht sie.
  const items = (await isOwnerAccount()) ? await listAbandoned() : [];
  const offen = items.filter((a) => a.status === "offen");
  const mitTelefon = offen.filter((a) => a.phone).length;

  return (
    <>
      <PageHeader
        title="Abgebrochene Anfragen"
        subtitle="Besucher, die E-Mail oder Handynummer eingetippt, aber nicht abgeschickt haben – anrufen lohnt sich."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Offen" value={String(offen.length)} icon={Hourglass} hint="zum Nachfassen" />
        <StatCard label="Mit Telefonnummer" value={String(mitTelefon)} icon={PhoneCall} hint="direkt anrufbar" />
        <StatCard label="Gesamt erfasst" value={String(items.length)} icon={UserX} hint="inkl. erledigte" />
      </div>

      <div className="mt-6">
        <AbandonedClient items={items} />
      </div>
    </>
  );
}
