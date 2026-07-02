import type { Metadata } from "next";
import { SITE, BRAND } from "@/lib/sauberfit-data";
import { SubHero } from "@/components/sauberfit/SubHero";
import { WhyTeam } from "@/components/sauberfit/WhyTeam";
import { CtaBand } from "@/components/sauberfit/CtaBand";
import { SeoText } from "@/components/sauberfit/SeoText";
import { Faq } from "@/components/sauberfit/Faq";

export const metadata: Metadata = {
  title: "Über uns – Ihr Reinigungspartner",
  description:
    "Die Deutsche Gebäudedienste aus Hamburg: Ihr zuverlässiger Partner für professionelle Gebäudereinigung deutschlandweit.",
  alternates: { canonical: `${SITE.url}/ueber-uns` },
};

const FAQ = [
  { q: "Seit wann gibt es die Deutsche Gebäudedienste?", a: "Wir bringen mehr als 12 Jahre Erfahrung in der Gebäudereinigung mit und haben in dieser Zeit ein deutschlandweites Netzwerk fester Teams aufgebaut." },
  { q: "Seid ihr ein eigener Betrieb oder ein Vermittler von Subunternehmen?", a: "Ein eigener Betrieb mit festangestelltem, geschultem Personal. Wir vermitteln keine Aufträge an wechselnde Subunternehmer." },
  { q: "Arbeitet ihr nur regional oder deutschlandweit?", a: "Deutschlandweit. Unser Sitz ist in Hamburg, von dort koordinieren wir feste Teams in ganz Deutschland – mit eigenen Standort-Seiten für einzelne Städte und Regionen." },
  { q: "Wie stellt ihr gleichbleibende Qualität über mehrere Standorte hinweg sicher?", a: "Durch einheitliche Reinigungspläne, geschultes Personal und dokumentierte Qualitätskontrollen – unabhängig davon, wo in Deutschland Ihr Objekt liegt." },
];

export default function UeberUns() {
  return (
    <>
      <SubHero
        crumbs={[{ name: "Start", path: "/" }, { name: "Über uns", path: "/ueber-uns" }]}
        eyebrow="Unternehmen"
        title="Über die Deutsche Gebäudedienste"
        subtitle="Wir verbinden die Verlässlichkeit eines lokalen Fachbetriebs mit klaren Standards und fairen Preisen – für Sauberkeit, auf die sich Unternehmen in der Region verlassen."
        image="/images/sf-team.jpg"
      />

      <section className="sf-section">
        <div className="sf-prose">
          <h2>Wer wir sind</h2>
          <p>
            Die {BRAND.name} mit Sitz in Hamburg ist Ihr Partner für
            professionelle Gebäudereinigung in {SITE.area}. Vom Büro über das Hotel bis zur
            Produktionshalle übernehmen wir die komplette Unterhalts- und Sonderreinigung – mit
            geschultem, fest angestelltem Personal und festen Ansprechpartnern.
          </p>
          <h2>Wofür wir stehen</h2>
          <p>
            Transparenz statt Überraschungen: Sie erhalten einen klaren Festpreis, planbare Einsätze
            und dokumentierte Qualität. Jeder Auftrag wird sorgfältig geprüft, bevor er ausgeführt
            wird – damit das Ergebnis stimmt und Sie sich auf Ihr Kerngeschäft konzentrieren können.
          </p>
        </div>
      </section>

      <WhyTeam />
      <Faq items={FAQ} heading="Häufige Fragen zu unserem Unternehmen" />
      <CtaBand />
      <SeoText
        title="Gebäudereinigung aus Hamburg – deutschlandweit im Einsatz"
        paragraphs={[
          "Als bundesweit tätiger Reinigungsdienstleister kennt die Deutsche Gebäudedienste die Anforderungen von Unternehmen, Einrichtungen und Eigentümern in ganz Deutschland. Unser Anspruch: gleichbleibend hohe Qualität, faire Konditionen und ein Ansprechpartner, der erreichbar ist und mitdenkt.",
          "Ob regelmäßige Unterhaltsreinigung oder einmalige Sonderreinigung – wir stellen das passende Team zusammen, halten klare Standards ein und dokumentieren unsere Arbeit nachvollziehbar. So entsteht eine Zusammenarbeit, die langfristig trägt.",
        ]}
      />
    </>
  );
}
