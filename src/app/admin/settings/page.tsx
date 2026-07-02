import { PageHeader } from "@/components/admin/ui";
import { SettingsHub } from "@/components/admin/SettingsHub";
import { InvoiceSettingsForm } from "@/components/admin/InvoiceSettingsForm";
import { readSafeAppSettings } from "@/lib/admin/app-settings";
import { readInvoiceSettings } from "@/lib/admin/invoices";

export const dynamic = "force-dynamic";
export const metadata = { title: "Einstellungen – Deutsche Gebäudedienste" };

export default async function SettingsPage() {
  const [app, invoice] = await Promise.all([readSafeAppSettings(), readInvoiceSettings()]);
  return (
    <>
      <PageHeader title="Einstellungen" subtitle="Alles an einem Ort: Tracking, KI, Rechnungsdaten, E-Mail & Rechtstexte." />
      <SettingsHub initial={app} />
      <div className="mt-5">
        <InvoiceSettingsForm initial={invoice} />
      </div>
    </>
  );
}
