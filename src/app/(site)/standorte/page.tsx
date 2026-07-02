import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { STAEDTE, SITE } from "@/lib/sauberfit-data";
import { SubHero } from "@/components/sauberfit/SubHero";
import { SeoText } from "@/components/sauberfit/SeoText";
import { Faq } from "@/components/sauberfit/Faq";
import { CtaBand } from "@/components/sauberfit/CtaBand";

const FAQ = [
  { q: "Reinigt ihr auch, wenn meine Stadt hier nicht gelistet ist?", a: "Ja, wir sind deutschlandweit tätig. Fragen Sie gern für Ihre Stadt an, auch wenn noch keine eigene Standort-Seite existiert." },
  { q: "Was ist der Unterschied zwischen einer Standort-Seite und der Hauptseite?", a: "Auf den Standort-Seiten finden Sie konkrete Angaben zu Stadtteilen, Umland und lokalen Besonderheiten – zusätzlich zu unseren deutschlandweiten Standards." },
  { q: "Wie schnell seid ihr vor Ort, wenn ich kurzfristig Bedarf habe?", a: "Da wir mit festen regionalen Teams arbeiten, reagieren wir auch bei kurzfristigem Bedarf oder Sonderreinigungen in der Regel zügig." },
];

export const metadata: Metadata = {
  title: "Standorte – Gebäudereinigung deutschlandweit",
  description:
    "Gebäudereinigung deutschlandweit: eigene Standort-Seiten für Ihre Stadt und den Umkreis – u. a. Hannover, Bremen und Frankfurt. Jetzt Festpreis-Angebot sichern.",
  alternates: { canonical: `${SITE.url}/standorte` },
  openGraph: {
    type: "website",
    url: `${SITE.url}/standorte`,
    title: "Standorte – Gebäudereinigung deutschlandweit",
    images: ["/images/sf-hero.jpg"],
  },
};

export default function StandorteHub() {
  return (
    <>
      <SubHero
        crumbs={[
          { name: "Start", path: "/" },
          { name: "Standorte", path: "/standorte" },
        ]}
        eyebrow="Standorte"
        title="Gebäudereinigung in ganz Deutschland"
        subtitle="Wir sind bundesweit für Sie im Einsatz – mit festen Teams, einheitlicher Qualität und einer eigenen Seite für Ihre Stadt und den Umkreis."
        image="/images/sf-hero.jpg"
      />

      <section className="sf-section">
        <div className="sf-container">
          <div className="sf-head">
            <h2>Ihre Stadt wählen</h2>
            <p>Wählen Sie Ihren Standort – wir zeigen Ihnen, wie wir vor Ort und im Umkreis reinigen.</p>
          </div>
          <div className="sf-stadtteile">
            {STAEDTE.map((s) => (
              <a key={s.slug} href={`/standorte/${s.slug}`} className="sf-stadtteil">
                <MapPin size={14} /> {s.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <Faq items={FAQ} heading="Häufige Fragen zu unseren Standorten" />
      <CtaBand />
      <SeoText
        title="Gebäudereinigung deutschlandweit – lokal für Sie da"
        paragraphs={[
          "Die Deutsche Gebäudedienste ist bundesweit tätig und betreut Objekte in ganz Deutschland – vom einzelnen Büro über Praxen und Hotels bis zu Industrie- und Gewerbeflächen. Für jede Region kennen wir die typischen Anforderungen und stellen Reinigungsplan, Frequenz und Team genau darauf ein. So erhalten Sie überall dieselbe verlässliche Qualität mit festen Ansprechpartnern.",
          "Für Ihre Stadt und den Umkreis haben wir eigene Standort-Seiten – ideal, um schnell die passende Leistung zu finden und ein transparentes Festpreis-Angebot anzufordern. Wählen Sie oben Ihre Stadt oder fordern Sie direkt Ihr unverbindliches Angebot an.",
        ]}
      />
    </>
  );
}
