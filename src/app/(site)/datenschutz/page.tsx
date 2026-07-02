import type { Metadata } from "next";
import { SITE } from "@/lib/sauberfit-data";
import { Breadcrumbs } from "@/components/sauberfit/Breadcrumbs";
import { publicTracking } from "@/lib/admin/app-settings";
import { readLegal, sanitizeLegal } from "@/lib/admin/legal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung der Deutsche Gebäudedienste gemäß DSGVO.",
  alternates: { canonical: `${SITE.url}/datenschutz` },
  robots: { index: false },
};

export default async function Datenschutz() {
  const [t, legal] = await Promise.all([publicTracking(), readLegal()]);
  const usesGa = Boolean(t.gaId);
  const usesAds = Boolean(t.adsId);
  const trackingOn = usesGa || usesAds;
  const tools = [usesGa && "Google Analytics 4", usesAds && "Google Ads"].filter(Boolean).join(" & ");
  return (
    <section className="sf-section">
      <div className="sf-container">
        <Breadcrumbs items={[{ name: "Start", path: "/" }, { name: "Datenschutz", path: "/datenschutz" }]} />
        <div className="sf-prose">
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)" }}>Datenschutzerklärung</h1>
          {/* Im Admin (Rechtstexte) bearbeitbarer Teil */}
          <div dangerouslySetInnerHTML={{ __html: sanitizeLegal(legal.datenschutz) }} />
          {/* Cookie-/Tracking-Abschnitt wird automatisch nach der aktiven Konfiguration ergänzt */}
          <h2>6. Cookies &amp; Einwilligung</h2>
          {trackingOn ? (
            <>
              <p>Statistik- und Marketing-Cookies setzen wir erst nach Ihrer ausdrücklichen Einwilligung über den Cookie-Banner (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TTDSG). Bis dahin werden keine Analyse- oder Werbe-Cookies gesetzt; wir nutzen den Google Consent Mode v2 (Standard: verweigert). Ihre Einwilligung können Sie jederzeit mit Wirkung für die Zukunft über den Link „Cookie-Einstellungen" im Seitenfuß widerrufen oder ändern.</p>
              <p>Eingesetzte Cookies (Auswahl): <em>dgd_consent</em> (notwendig, speichert Ihre Cookie-Entscheidung, 12 Monate); <em>dgd_attr</em> (Marketing, nur mit Einwilligung – speichert Kampagnen-Parameter wie gclid/UTM zur Zuordnung, 90 Tage){usesGa && <>; Google-Cookies <em>_ga</em> (Statistik, bis zu 24 Monate)</>}{usesAds && <> und <em>_gcl_au</em> (Marketing, bis zu 90 Tage)</>}{(usesGa || usesAds) && <>, jeweils nur nach Einwilligung</>}.</p>
            </>
          ) : (
            <p>Wir setzen ausschließlich technisch notwendige Cookies ein. Ein Analyse- oder Marketing-Tracking (z. B. Google Analytics oder Google Ads) findet derzeit nicht statt; es werden dafür keine Cookies gesetzt. Notwendig ist lediglich das Cookie <em>dgd_consent</em>, das Ihre Cookie-Entscheidung speichert.</p>
          )}
          {trackingOn && (
            <>
              <h2>7. {tools}</h2>
              <p>
                Nach Einwilligung verwenden wir {tools}
                {usesGa && " zur Reichweitenmessung"}
                {usesGa && usesAds && " sowie"}
                {usesAds && " zur Erfolgsmessung unserer Kampagnen (Conversion-Tracking, ggf. Enhanced Conversions mit gehashten Kontaktdaten)"}
                . Anbieter ist Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Dabei können Daten in Drittländer (USA) übertragen werden; Grundlage sind die EU-Standardvertragsklauseln und das EU-US Data Privacy Framework. IP-Anonymisierung ist aktiviert. Zur Kampagnen-Zuordnung speichern wir Klick-Parameter (z. B. gclid, UTM) gemeinsam mit Ihrer Anfrage.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
