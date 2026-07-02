import type { Metadata } from "next";
import { SITE, TRUST_SEALS, STATS } from "@/lib/sauberfit-data";
import { SubHero } from "@/components/sauberfit/SubHero";
import { CtaBand } from "@/components/sauberfit/CtaBand";
import { SeoText } from "@/components/sauberfit/SeoText";
import { Icon } from "@/components/sauberfit/Icon";
import { Faq } from "@/components/sauberfit/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { reviewSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Referenzen & Bewertungen",
  description:
    "Referenzen der Deutsche Gebäudedienste: 4,9/5 aus 124 Bewertungen. Was Kund:innen aus ganz Deutschland über unsere Gebäudereinigung sagen.",
  alternates: { canonical: `${SITE.url}/referenzen` },
};

const FAQ = [
  { q: "Wie sammelt ihr eure Bewertungen?", a: "Unsere Bewertungen stammen von echten Kund:innen über Google – wir kaufen oder fälschen keine Rezensionen." },
  { q: "Kann ich Referenzen aus meiner Branche einsehen?", a: "Gern auf Anfrage. Aus Rücksicht auf unsere Kund:innen nennen wir Referenzen grundsätzlich nur mit deren ausdrücklicher Erlaubnis." },
  { q: "Was passiert, wenn ich mit der Reinigung nicht zufrieden bin?", a: "Dann greift unsere Zufriedenheitsgarantie: Wir hören uns Ihr Anliegen an und finden umgehend eine Lösung." },
];

const REVIEWS = [
  { t: "Zuverlässig, gründlich und immer ansprechbar. Unser Büro war noch nie so konstant sauber.", n: "Agentur, Hannover" },
  { t: "Diskret und pünktlich – die Zimmerreinigung läuft wie am Schnürchen, auch am Wochenende.", n: "Hotel, Innenstadt" },
  { t: "Endlich eine Hausverwaltung-taugliche Lösung: feste Termine, klare Abrechnung, gepflegte Treppenhäuser.", n: "Hausverwaltung, Hamburg" },
  { t: "Praxis hygienisch sauber, Reinigung nach Feierabend. Genau so muss es sein.", n: "Zahnarztpraxis, Stuttgart" },
  { t: "Große Halle, kurze Reinigungsfenster – trotzdem top Ergebnis und sicher gearbeitet.", n: "Logistik, Bremen" },
  { t: "Bauendreinigung termingerecht und bezugsfertig übergeben. Sehr empfehlenswert.", n: "Bauträger, Frankfurt" },
];

export default function Referenzen() {
  return (
    <>
      <JsonLd data={reviewSchema(REVIEWS.map((r) => ({ author: r.n, text: r.t })))} />
      <SubHero
        crumbs={[{ name: "Start", path: "/" }, { name: "Referenzen", path: "/referenzen" }]}
        eyebrow="Referenzen"
        title="Was Kund:innen über uns sagen"
        subtitle="4,9 von 5 Sternen aus 124 Bewertungen – aus Büros, Hotels, Praxen und Verwaltungen in ganz Deutschland."
        image="/images/sf-referenzen.jpg"
      />

      <section className="sf-section">
        <div className="sf-container">
          <div className="sf-stats" style={{ maxWidth: 900, margin: "0 auto 2.5rem" }}>
            {STATS.map((s) => (
              <div className="sf-stat" key={s.label}>
                <Icon name={s.icon} size={20} className="ic" />
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="sf-cardgrid">
            {REVIEWS.map((r) => (
              <div className="sf-linkcard" key={r.n} style={{ cursor: "default" }}>
                <div style={{ color: "var(--star)", letterSpacing: ".1em" }}>★★★★★</div>
                <p style={{ fontSize: ".95rem", color: "var(--ink-2)", lineHeight: 1.55 }}>„{r.t}"</p>
                <span style={{ fontSize: ".82rem", color: "var(--muted)", fontWeight: 600, marginTop: "auto" }}>{r.n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sf-section alt tight">
        <div className="sf-container">
          <p className="sf-trust-label" style={{ textAlign: "center", maxWidth: "none", marginBottom: "1.5rem" }}>
            Geprüft, versichert &amp; zertifiziert
          </p>
          <div className="sf-seals" style={{ justifyContent: "center", gap: "1.75rem 2.25rem" }}>
            {TRUST_SEALS.map((s) => (
              <div className="sf-seal" key={s.label}>
                <span className="sf-seal-ic"><Icon name={s.icon} size={20} /></span>
                <span className="sf-seal-t">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Faq items={FAQ} heading="Häufige Fragen zu Referenzen & Bewertungen" />
      <CtaBand />
      <SeoText
        title="Referenzen aus der Gebäudereinigung deutschlandweit"
        paragraphs={[
          "Vertrauen entsteht durch Verlässlichkeit. Die Deutsche Gebäudedienste arbeitet für Unternehmen, Einrichtungen und Eigentümer in ganz Deutschland – vom kleinen Büro bis zur großen Industriehalle. Die durchweg positiven Bewertungen spiegeln, worauf es uns ankommt: gleichbleibende Qualität, feste Ansprechpartner und faire, transparente Konditionen.",
          "Gern stellen wir bei Interesse passende Referenzen aus Ihrer Branche bereit. Überzeugen Sie sich selbst – fordern Sie Ihr unverbindliches Festpreis-Angebot an und erleben Sie Sauberkeit, die Kund:innen langfristig bindet.",
        ]}
      />
    </>
  );
}
