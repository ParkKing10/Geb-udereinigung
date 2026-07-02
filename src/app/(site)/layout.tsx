import { LeadProvider } from "@/components/sauberfit/LeadProvider";
import { Header } from "@/components/sauberfit/Header";
import { Footer } from "@/components/sauberfit/Footer";
import { MobileStickyCta } from "@/components/sauberfit/MobileStickyCta";
import { Analytics } from "@/components/analytics/Analytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusiness } from "@/lib/seo";
import { getSiteContent } from "@/lib/site-content";
import { publicTracking } from "@/lib/admin/app-settings";

// Dynamisch rendern, damit im Admin gespeicherte Inhalte (Hero, Ansprechpartner,
// Footer) sofort auf allen Seiten sichtbar sind – ohne Rebuild.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ person, google }, tracking] = await Promise.all([getSiteContent(), publicTracking()]);
  return (
    <LeadProvider person={person}>
      <JsonLd data={localBusiness(google)} />
      <Header />
      <main className="sf-main">{children}</main>
      <Footer />
      <MobileStickyCta />
      <Analytics tracking={tracking} />
    </LeadProvider>
  );
}
