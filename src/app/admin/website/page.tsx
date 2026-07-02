import { getSiteContent } from "@/lib/site-content";
import { WebsiteContentForm } from "@/components/admin/WebsiteContentForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Website – Deutsche Gebäudedienste" };

export default async function WebsiteAdminPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Website &amp; Hero</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Alle Vertrauens- und Hero-Elemente der Startseite – Änderungen sind nach dem Speichern sofort live.
        </p>
      </div>
      <WebsiteContentForm initial={content} />
    </div>
  );
}
