import type { Metadata } from "next";
import { TARGETS, SITE } from "@/lib/sauberfit-data";
import { SubHero } from "@/components/sauberfit/SubHero";
import { SeoText } from "@/components/sauberfit/SeoText";
import { Faq } from "@/components/sauberfit/Faq";
import { CtaBand } from "@/components/sauberfit/CtaBand";

const FAQ = [
  { q: "Was, wenn meine Branche hier nicht aufgeführt ist?", a: "Fragen Sie trotzdem gern an. Wir erstellen für jede Branche ein individuelles Reinigungskonzept, auch wenn sie nicht in unserer Übersicht steht." },
  { q: "Unterscheiden sich die Preise je nach Branche?", a: "Der Festpreis richtet sich vor allem nach Fläche, Frequenz und Leistungsumfang. Branchentypische Anforderungen wie Hygienestandards fließen in die Kalkulation mit ein." },
  { q: "Arbeitet ihr auch mit Hausverwaltungen für mehrere Objekte zusammen?", a: "Ja. Sie erhalten einen zentralen Ansprechpartner für Ihr gesamtes Portfolio und einheitliche Qualitätsstandards über alle Objekte hinweg." },
];

export const metadata: Metadata = {
  title: "Reinigung nach Branche – für wen wir reinigen",
  description:
    "Gebäudereinigung für Hotels, Büros, Praxen, Hausverwaltungen sowie Industrie & Gewerbe – deutschlandweit. Branchengerecht, zuverlässig und zum Festpreis.",
  alternates: { canonical: `${SITE.url}/fuer-wen` },
  openGraph: {
    type: "website",
    url: `${SITE.url}/fuer-wen`,
    title: "Reinigung nach Branche",
    images: ["/images/sf-team.jpg"],
  },
};

export default function FuerWenHub() {
  return (
    <>
      <SubHero
        crumbs={[
          { name: "Start", path: "/" },
          { name: "Für wen", path: "/fuer-wen" },
        ]}
        eyebrow="Für wen"
        title="Reinigung für Ihre Branche"
        subtitle="Ob Hotel, Büro, Praxis, Hausverwaltung oder Industrie – wir kennen die Anforderungen Ihrer Branche und reinigen genau darauf abgestimmt."
        image="/images/sf-team.jpg"
      />

      <section className="sf-section">
        <div className="sf-container">
          <div className="sf-head">
            <h2>Branchenlösungen im Überblick</h2>
            <p>Für jede Branche das passende Reinigungskonzept – mit festen Ansprechpartnern und planbaren Einsätzen.</p>
          </div>
          <div className="sf-cardgrid">
            {TARGETS.map((t) => (
              <a key={t.slug} href={`/fuer-wen/${t.slug}`} className="sf-linkcard">
                <h3>{t.name}</h3>
                <p>{t.short}</p>
                <span className="arrow">Mehr erfahren →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Faq items={FAQ} heading="Häufige Fragen zu Branchenlösungen" />
      <CtaBand />
      <SeoText
        title="Branchengerechte Gebäudereinigung deutschlandweit"
        paragraphs={[
          "Jede Branche stellt eigene Anforderungen an Sauberkeit und Hygiene. Die Deutsche Gebäudedienste stimmt Reinigungsumfang, Frequenz und Zeitfenster gezielt auf Ihren Betrieb ab – diskret im Hotel, hygienisch in der Praxis, leistungsstark in der Industrie und zuverlässig im Büro- und Immobilienbereich.",
          "So erhalten Sie ein Reinigungskonzept, das zu Ihrem Alltag passt – mit festem Ansprechpartner, dokumentierter Qualität und transparentem Festpreis. Wählen Sie oben Ihre Branche und fordern Sie Ihr Angebot an.",
        ]}
      />
    </>
  );
}
