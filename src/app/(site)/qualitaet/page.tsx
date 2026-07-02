import type { Metadata } from "next";
import { SITE, FEATURES } from "@/lib/sauberfit-data";
import { SubHero } from "@/components/sauberfit/SubHero";
import { CtaBand } from "@/components/sauberfit/CtaBand";
import { SeoText } from "@/components/sauberfit/SeoText";
import { Faq } from "@/components/sauberfit/Faq";
import { Icon } from "@/components/sauberfit/Icon";

export const metadata: Metadata = {
  title: "Qualität & Standards",
  description:
    "Qualität & Standards der Deutsche Gebäudedienste: geschultes Personal, dokumentierte Kontrollen, Versicherungsschutz & Zufriedenheitsgarantie – deutschlandweit.",
  alternates: { canonical: `${SITE.url}/qualitaet` },
};

const FAQ = [
  { q: "Wie sichern Sie gleichbleibende Qualität?", a: "Durch feste, geschulte Teams, klare Reinigungspläne und regelmäßige Kontrollen mit digitaler Dokumentation." },
  { q: "Sind Sie versichert?", a: "Ja, wir verfügen über eine Betriebshaftpflicht. Details nennen wir Ihnen gern im Angebot." },
  { q: "Was passiert, wenn ich nicht zufrieden bin?", a: "Wir finden umgehend eine Lösung – das ist unsere Zufriedenheitsgarantie." },
];

export default function Qualitaet() {
  return (
    <>
      <SubHero
        crumbs={[{ name: "Start", path: "/" }, { name: "Qualität & Standards", path: "/qualitaet" }]}
        eyebrow="Qualität"
        title="Qualität & Standards"
        subtitle="Sauberkeit ist messbar – und nachweisbar. Wir arbeiten nach klaren Standards, mit geschultem Personal und dokumentierten Kontrollen."
        image="/images/sf-qualitaet.jpg"
      />

      <section className="sf-section">
        <div className="sf-container">
          <div className="sf-head">
            <h2>Worauf Sie sich verlassen können</h2>
          </div>
          <div className="sf-cardgrid">
            {FEATURES.map((f) => (
              <div className="sf-linkcard" key={f.title} style={{ cursor: "default" }}>
                <Icon name={f.icon} size={24} className="ck" />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Faq items={FAQ} heading="Häufige Fragen zu Qualität & Standards" />
      <CtaBand />
      <SeoText
        title="Geprüfte Qualität in der Gebäudereinigung"
        paragraphs={[
          "Qualität entsteht nicht zufällig, sondern durch System. Die Deutsche Gebäudedienste setzt in " + SITE.area + " auf geschultes, fest angestelltes Personal, verbindliche Reinigungspläne und regelmäßige Kontrollen. So bleibt das Ergebnis dauerhaft auf hohem Niveau – nachvollziehbar dokumentiert und auf Wunsch jederzeit einsehbar.",
          "Versicherungsschutz, feste Ansprechpartner und unsere Zufriedenheitsgarantie geben Ihnen zusätzliche Sicherheit. Sollte einmal etwas nicht passen, finden wir umgehend eine Lösung. So wird aus Reinigung eine verlässliche Partnerschaft.",
        ]}
      />
    </>
  );
}
