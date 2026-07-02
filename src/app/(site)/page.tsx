import type { Metadata } from "next";
import { SITE } from "@/lib/sauberfit-data";
import { Hero } from "@/components/sauberfit/Hero";
import { UspBar } from "@/components/sauberfit/UspBar";
import { TrustLogos } from "@/components/sauberfit/TrustLogos";
import { ProblemSolution } from "@/components/sauberfit/ProblemSolution";
import { Services } from "@/components/sauberfit/Services";
import { Ablauf } from "@/components/sauberfit/Ablauf";
import { WhyTeam } from "@/components/sauberfit/WhyTeam";
import { Staedte } from "@/components/sauberfit/Staedte";
import { Faq } from "@/components/sauberfit/Faq";
import { CtaBand } from "@/components/sauberfit/CtaBand";

// Dynamisch rendern, damit im Admin gespeicherte Inhalte (Hero, Tracking-IDs) sofort
// auf der Startseite greifen – die statische Optimierung würde sie sonst „einfrieren".
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: SITE.url },
  openGraph: { url: SITE.url },
};

const FAQ = [
  { q: "In welchen Regionen ist die Deutsche Gebäudedienste tätig?", a: "Wir reinigen deutschlandweit – mit festen, geschulten Teams vor Ort und eigenen Standort-Seiten für einzelne Städte und deren Umland." },
  { q: "Wie schnell erhalte ich ein Angebot?", a: "Über unser Sofort-Angebot erhalten Sie in wenigen Minuten einen transparenten Festpreis – unverbindlich, ohne Anmeldung und ohne versteckte Kosten." },
  { q: "Gibt es eine Mindestvertragslaufzeit?", a: "Nein. Unsere Verträge sind monatlich kündbar – Sie binden sich nicht langfristig, sondern bleiben aus Überzeugung bei uns." },
  { q: "Wer reinigt bei mir vor Ort – eigene Mitarbeiter oder wechselnde Subunternehmer?", a: "Feste, festangestellte und geschulte Teams. Sie haben immer denselben Ansprechpartner und dieselben Gesichter vor Ort – keine wechselnden Subunternehmer." },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustLogos />
      <UspBar />
      <ProblemSolution />
      <Services />
      <Ablauf />
      <WhyTeam />
      <Staedte />
      <Faq items={FAQ} heading="Häufig gestellte Fragen" />
      <CtaBand />
    </>
  );
}
