import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { SITE, CONTACT } from "@/lib/sauberfit-data";
import { SubHero } from "@/components/sauberfit/SubHero";
import { SeoText } from "@/components/sauberfit/SeoText";
import { Faq } from "@/components/sauberfit/Faq";

export const metadata: Metadata = {
  title: "Karriere & Jobs",
  description:
    "Jobs in der Gebäudereinigung deutschlandweit: Reinigungskraft, Objektleitung, Sonderreinigung – faire Bezahlung, feste Anstellung. Jetzt bewerben.",
  alternates: { canonical: `${SITE.url}/karriere` },
};

const FAQ = [
  { q: "Brauche ich Erfahrung in der Gebäudereinigung?", a: "Nein, Quereinsteiger:innen sind bei uns willkommen. Du erhältst eine geregelte Einarbeitung und Schulungen für deine Aufgabe." },
  { q: "Sind die Stellen in Teilzeit oder Vollzeit möglich?", a: "Beides – je nach Position und deinen Wünschen. Die Einsatzzeiten stimmen wir planbar mit dir ab." },
  { q: "Wie läuft die Bewerbung ab?", a: "Ganz unkompliziert: Sende uns eine kurze Bewerbung per E-Mail über den Button auf dieser Seite. Wir melden uns zeitnah zurück." },
  { q: "In welchen Regionen sucht ihr Personal?", a: "Deutschlandweit. Die Einsätze sind planbar und in der Regel in der Nähe deines Wohnorts." },
];

const VORTEILE = [
  "Feste Anstellung mit fairer, pünktlicher Bezahlung",
  "Planbare Einsatzzeiten in deiner Region",
  "Geregelte Einarbeitung und Schulungen",
  "Wertschätzendes Team und feste Ansprechpartner",
];
const JOBS = [
  { t: "Reinigungskraft (m/w/d)", d: "Unterhalts- & Büroreinigung deutschlandweit – Teilzeit oder Vollzeit." },
  { t: "Objektleiter:in (m/w/d)", d: "Koordination von Teams und Objekten, Ansprechpartner für Kunden." },
  { t: "Glas- & Sonderreiniger:in (m/w/d)", d: "Glasfassaden, Höhenarbeiten und Sonderreinigung." },
];

export default function Karriere() {
  return (
    <>
      <SubHero
        crumbs={[{ name: "Start", path: "/" }, { name: "Karriere", path: "/karriere" }]}
        eyebrow="Karriere"
        title="Werde Teil unseres Teams"
        subtitle="Wir suchen zuverlässige Menschen, die mit anpacken. Faire Bezahlung, feste Anstellung und planbare Zeiten in deiner Region."
        image="/images/sf-karriere.jpg"
      />

      <section className="sf-section">
        <div className="sf-container sf-split2">
          <div>
            <span className="sf-split2-h2">
              Deine Vorteile
            </span>
            <ul className="sf-flist">
              {VORTEILE.map((v) => <li key={v}><Check size={18} className="ck" /> {v}</li>)}
            </ul>
            <a className="sf-btn sf-btn-green sf-btn-lg" style={{ marginTop: "1.5rem" }} href={`mailto:${CONTACT.email}?subject=Bewerbung`} data-track="karriere">
              Jetzt bewerben
            </a>
          </div>
          <div className="sf-split2-media">
            <Image
              src="/images/sf-team.jpg"
              alt="Team der Deutsche Gebäudedienste – Karriere"
              fill
              sizes="(max-width: 820px) 100vw, 45vw"
              className="sf-split2-imgel"
            />
          </div>
        </div>
      </section>

      <section className="sf-section alt">
        <div className="sf-container">
          <div className="sf-head"><h2>Offene Stellen</h2></div>
          <div className="sf-cardgrid">
            {JOBS.map((j) => (
              <a key={j.t} href={`mailto:${CONTACT.email}?subject=Bewerbung: ${encodeURIComponent(j.t)}`} data-track="karriere" className="sf-linkcard">
                <h3>{j.t}</h3>
                <p>{j.d}</p>
                <span className="arrow">Bewerben →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Faq items={FAQ} heading="Häufige Fragen zur Bewerbung" />
      <SeoText
        title="Jobs in der Gebäudereinigung deutschlandweit"
        paragraphs={[
          "Die Deutsche Gebäudedienste wächst – und sucht zuverlässige Reinigungskräfte, Objektleiter:innen und Spezialist:innen für Glas- und Sonderreinigung in ganz Deutschland. Bei uns erwartet dich eine feste Anstellung, faire und pünktliche Bezahlung sowie planbare Einsatzzeiten in deiner Nähe.",
          "Wir legen Wert auf Wertschätzung, geregelte Einarbeitung und ein Team, in dem man sich aufeinander verlassen kann. Quereinsteiger:innen sind willkommen. Sende uns einfach eine kurze Bewerbung – wir melden uns zeitnah.",
        ]}
      />
    </>
  );
}
