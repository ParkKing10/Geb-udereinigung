import type { Metadata } from "next";
import { SITE } from "@/lib/sauberfit-data";
import { SubHero } from "@/components/sauberfit/SubHero";
import { Faq } from "@/components/sauberfit/Faq";
import { CtaBand } from "@/components/sauberfit/CtaBand";
import { SeoText } from "@/components/sauberfit/SeoText";

export const metadata: Metadata = {
  title: "Preise & Festpreis-Angebot",
  description:
    "Was kostet die Gebäudereinigung? Transparente Festpreise statt Stundenlohn-Risiko. In 2 Minuten zum unverbindlichen Angebot – deutschlandweit.",
  alternates: { canonical: `${SITE.url}/preise` },
};

const FAKTOREN = [
  { t: "Fläche & Objekt", d: "Quadratmeter, Raumzahl und Art des Objekts bestimmen den Aufwand." },
  { t: "Frequenz", d: "Einmalig, wöchentlich oder täglich – die Häufigkeit fließt direkt ein." },
  { t: "Leistungsumfang", d: "Unterhalts-, Glas-, Sonder- oder Bauendreinigung – einzeln oder kombiniert." },
];
const FAQ = [
  { q: "Bekomme ich einen Festpreis?", a: "Ja. Bei klar umrissenen Leistungen erhalten Sie einen Festpreis, bei aufwändigen Projekten eine transparente Spanne, die wir nach Besichtigung fixieren." },
  { q: "Wie schnell habe ich ein Angebot?", a: "Über unser Sofort-Angebot in unter 2 Minuten – ohne Anmeldung und unverbindlich." },
  { q: "Gibt es versteckte Kosten?", a: "Nein. Was im Angebot steht, gilt. Zusatzleistungen werden vorab transparent ausgewiesen." },
];

export default function Preise() {
  return (
    <>
      <SubHero
        crumbs={[{ name: "Start", path: "/" }, { name: "Preise", path: "/preise" }]}
        eyebrow="Preise"
        title="Transparente Preise, fair kalkuliert"
        subtitle="Festpreis statt Stundenlohn-Risiko: Sie wissen vorab, was die Reinigung kostet. In 2 Minuten zum unverbindlichen Angebot."
        image="/images/sf-preise.jpg"
      />

      <section className="sf-section">
        <div className="sf-container">
          <div className="sf-head">
            <h2>Wie sich der Preis zusammensetzt</h2>
            <p>Drei Faktoren bestimmen Ihren transparenten Festpreis.</p>
          </div>
          <div className="sf-cardgrid">
            {FAKTOREN.map((f) => (
              <div className="sf-linkcard" key={f.t} style={{ cursor: "default" }}>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Faq items={FAQ} heading="Häufige Fragen zu Preisen" />
      <CtaBand />
      <SeoText
        title="Was kostet die Gebäudereinigung?"
        paragraphs={[
          "Eine pauschale Antwort auf die Preisfrage gibt es nicht – und das ist gut so. Der faire Preis hängt von Fläche, Frequenz und Leistungsumfang ab. Die Deutsche Gebäudedienste setzt deshalb auf transparente Festpreise statt undurchsichtiger Stundenabrechnung: Sie wissen vorab genau, was die Reinigung in " + SITE.area + " kostet.",
          "Über unser Sofort-Angebot geben Sie wenige Eckdaten ein und erhalten in unter zwei Minuten eine nachvollziehbare Kalkulation – unverbindlich und ohne Anmeldung. Bei größeren Projekten fixieren wir den Preis nach einer kurzen Besichtigung. So bleibt Ihr Budget planbar.",
        ]}
      />
    </>
  );
}
