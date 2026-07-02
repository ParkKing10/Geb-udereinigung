import type { Metadata } from "next";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { SITE, CONTACT } from "@/lib/sauberfit-data";
import { getSiteContent } from "@/lib/site-content";
import { Breadcrumbs } from "@/components/sauberfit/Breadcrumbs";
import { ContactForm } from "@/components/sauberfit/ContactForm";
import { SeoText } from "@/components/sauberfit/SeoText";
import { Faq } from "@/components/sauberfit/Faq";

export const metadata: Metadata = {
  title: "Kontakt – Jetzt Angebot anfragen",
  description:
    "Kontakt zur Deutsche Gebäudedienste, Rellinger Weg 24, 22457 Hamburg: Rufen Sie an oder schreiben Sie uns – Gebäudereinigung deutschlandweit.",
  alternates: { canonical: `${SITE.url}/kontakt` },
};

const FAQ = [
  { q: "Wie schnell bekomme ich eine Antwort auf meine Anfrage?", a: "Sie haben einen persönlichen Ansprechpartner, der sich zeitnah meldet. Für eine sofortige Einschätzung nutzen Sie am schnellsten unser Online-Sofort-Angebot." },
  { q: "Kann ich auch anrufen, statt das Formular zu nutzen?", a: "Ja, gern. Rufen Sie uns Montag bis Freitag von 8 bis 18 Uhr direkt an – die Nummer finden Sie oben auf dieser Seite." },
  { q: "Muss ich schon genaue Angaben zu meinem Objekt haben?", a: "Nein, grobe Angaben reichen für den ersten Kontakt. Details zu Fläche, Frequenz und Leistungsumfang klären wir gemeinsam, bei Bedarf auch bei einer kurzen Besichtigung." },
  { q: "Bekomme ich sofort einen verbindlichen Festpreis?", a: "Für Standardfälle ja – über unser Sofort-Angebot in wenigen Minuten. Bei größeren oder komplexeren Objekten stimmen wir den Festpreis nach kurzer Rücksprache final ab." },
];

export default async function Kontakt() {
  const { person } = await getSiteContent();
  const initials = `${person.firstName[0] ?? ""}${person.lastName[0] ?? ""}`;
  return (
    <>
      <section className="sf-section">
        <div className="sf-container">
          <Breadcrumbs items={[{ name: "Start", path: "/" }, { name: "Kontakt", path: "/kontakt" }]} />
          <div className="sf-split2" style={{ marginTop: "1rem", alignItems: "start" }}>
            <div>
              <span className="sf-badge">Kontakt</span>
              <h1 className="sf-h1 sub-h1" style={{ marginTop: ".75rem" }}>Wir sind für Sie da</h1>
              <p className="sf-lead">Fragen zur Reinigung, ein konkretes Anliegen oder ein Angebot? Rufen Sie an oder schreiben Sie uns – wir melden uns schnell.</p>
              <ul className="sf-flist" style={{ marginTop: "1.5rem" }}>
                <li><MapPin size={18} className="ck" /> {CONTACT.address.join(", ")}</li>
                <li><Phone size={18} className="ck" /> <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} data-track="kontakt" style={{ color: "var(--ink-2)" }}>{CONTACT.phone}</a></li>
                <li><Mail size={18} className="ck" /> <a href={`mailto:${CONTACT.email}`} data-track="kontakt" style={{ color: "var(--ink-2)" }}>{CONTACT.email}</a></li>
                <li><Clock size={18} className="ck" /> {CONTACT.hours}</li>
              </ul>

              <div className="sf-foot-person" style={{ marginTop: "1.75rem", maxWidth: "none" }}>
                <span className="sf-foot-person-av">
                  {person.photo
                    ? <Image src={person.photo} alt={`${person.firstName} ${person.lastName}`} fill sizes="42px" style={{ objectFit: "cover" }} />
                    : initials}
                </span>
                <span className="sf-foot-person-id">
                  <small>Ihr persönlicher Ansprechpartner</small>
                  <b>{person.firstName} {person.lastName}</b>
                  <span>{person.position} · {person.responseTime}</span>
                </span>
              </div>
              <p style={{ fontStyle: "italic", color: "var(--ink-2)", fontSize: ".92rem", marginTop: ".8rem", maxWidth: "46ch" }}>„{person.quote}"</p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      <Faq items={FAQ} heading="Häufige Fragen zur Kontaktaufnahme" />
      <SeoText
        title="Gebäudereinigung deutschlandweit – sprechen Sie uns an"
        paragraphs={[
          "Deutsche Gebäudedienste hat ihren Sitz im Rellinger Weg 24 in 22457 Hamburg und betreut Kund:innen in ganz " + SITE.area + ". Ob regelmäßige Unterhaltsreinigung, Hotel-, Büro- oder Industriereinigung: Schildern Sie uns kurz Ihr Anliegen, und wir erstellen Ihnen ein passendes, transparentes Angebot.",
          "Am schnellsten geht es telefonisch unter " + CONTACT.phone + " oder über unser Sofort-Angebot, mit dem Sie in zwei Minuten einen Festpreis erhalten. Selbstverständlich können Sie uns auch über das Formular erreichen – wir antworten zeitnah.",
        ]}
      />
    </>
  );
}
