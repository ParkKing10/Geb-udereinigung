import type { Metadata } from "next";
import { SERVICES, SITE } from "@/lib/sauberfit-data";
import { SubHero } from "@/components/sauberfit/SubHero";
import { SeoText } from "@/components/sauberfit/SeoText";
import { Faq } from "@/components/sauberfit/Faq";
import { CtaBand } from "@/components/sauberfit/CtaBand";

const FAQ = [
  { q: "Welche Leistung passt zu meinem Objekt?", a: "Wählen Sie unten Ihren Bereich – jede Leistung zeigt eigenen Umfang, Ablauf und Festpreis. Im Zweifel klären wir die passende Wahl gemeinsam beim Angebot." },
  { q: "Kann ich mehrere Leistungen kombinieren?", a: "Ja, zum Beispiel Unterhaltsreinigung und Glasreinigung im selben Vertrag – Sie erhalten dafür einen gemeinsamen Ansprechpartner und einen kombinierten Festpreis." },
  { q: "Sind alle Leistungen deutschlandweit verfügbar?", a: "Ja. Für jede Leistung stehen feste, geschulte Teams in ganz Deutschland bereit – mit denselben Qualitätsstandards, egal wo Ihr Objekt liegt." },
];

export const metadata: Metadata = {
  title: "Reinigungsleistungen – Übersicht",
  description:
    "Alle Reinigungsleistungen der Deutsche Gebäudedienste deutschlandweit: Büro-, Hotel-, Praxis-, Glas-, Industrie- & Unterhaltsreinigung. Jetzt Festpreis-Angebot.",
  alternates: { canonical: `${SITE.url}/leistungen` },
  openGraph: {
    type: "website",
    url: `${SITE.url}/leistungen`,
    title: "Reinigungsleistungen – Übersicht",
    images: ["/images/sf-buero.jpg"],
  },
};

export default function LeistungenHub() {
  return (
    <>
      <SubHero
        crumbs={[
          { name: "Start", path: "/" },
          { name: "Leistungen", path: "/leistungen" },
        ]}
        eyebrow="Leistungen"
        title="Unsere Reinigungsleistungen deutschlandweit"
        subtitle="Von Büro- und Hotelreinigung bis Glas-, Industrie- und Bauendreinigung – professionell, zuverlässig und zum transparenten Festpreis."
        image="/images/sf-buero.jpg"
      />

      <section className="sf-section">
        <div className="sf-container">
          <div className="sf-head">
            <h2>Alle Reinigungsleistungen im Überblick</h2>
            <p>Wählen Sie Ihre Leistung – jede mit eigenem Leistungsumfang, Ablauf und Festpreis.</p>
          </div>
          <div className="sf-cardgrid">
            {SERVICES.map((s) => (
              <a key={s.slug} href={`/leistungen/${s.slug}`} className="sf-linkcard">
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
                <span className="arrow">Mehr erfahren →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Faq items={FAQ} heading="Häufige Fragen zu unseren Leistungen" />
      <CtaBand />
      <SeoText
        title="Gebäudereinigung deutschlandweit – jede Leistung aus einer Hand"
        paragraphs={[
          "Die Deutsche Gebäudedienste bündelt das gesamte Spektrum der Gebäudereinigung deutschlandweit: von der regelmäßigen Unterhalts- und Büroreinigung über die diskrete Hotel- und hygienische Praxisreinigung bis hin zu Glas-, Industrie- und Bauendreinigung. So haben Sie für alle Objekte einen festen Ansprechpartner und einheitliche Qualitätsstandards.",
          "Jede Leistung erhalten Sie zum transparenten Festpreis – ohne Stundenlohn-Risiko. Wählen Sie oben Ihren Bereich für Details und fordern Sie in zwei Minuten Ihr unverbindliches Angebot an.",
        ]}
      />
    </>
  );
}
