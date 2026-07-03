import Image from "next/image";
import { Check, ArrowRight, Phone, Clock } from "lucide-react";
import { QuoteButton } from "./QuoteButton";
import { Breadcrumbs } from "./Breadcrumbs";
import { HeroGoogle } from "./HeroClient";
import { CONTACT } from "@/lib/sauberfit-data";
import { getSiteContent } from "@/lib/site-content";

// Unterseiten-Hero mit demselben Conversion-Cluster wie die Startseite:
// Google-Bewertung, 60-Sekunden-Versprechen und Risk-Reducer – wichtig, weil
// Anzeigen direkt hier landen. Werte kommen aus dem Admin (site-content).
export async function SubHero({
  crumbs,
  eyebrow,
  title,
  subtitle,
  image,
  ctaService,
}: {
  crumbs: { name: string; path: string }[];
  eyebrow?: string;
  title: string;
  subtitle: string;
  image: string;
  ctaService?: string;
}) {
  void eyebrow; // ersetzt durch die stärkere Google-Bewertung (Prop bleibt für Kompatibilität)
  const c = await getSiteContent();
  return (
    <section className="sf-hero sub">
      <div className="sf-container">
        <Breadcrumbs items={crumbs} />
      </div>
      <div className="sf-hero-grid">
        <div className="sf-hero-left">
          <HeroGoogle google={c.google} />
          <h1 className="sf-h1 sub-h1">{title}</h1>
          <p className="sf-lead">{subtitle}</p>
          <div className="sf-hero-cta">
            <QuoteButton variant="dark" size="lg" service={ctaService}>
              Jetzt Angebot berechnen <ArrowRight size={16} />
            </QuoteButton>
            <a data-track="subhero" className="sf-btn sf-btn-outline sf-btn-lg" href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>
              <Phone size={16} /> {CONTACT.phone}
            </a>
          </div>
          {c.ctaMicro && <span className="sf-cta-micro"><Clock size={14} /> {c.ctaMicro}</span>}
          <ul className="sf-risk">
            {c.riskReducers.map((r) => (
              <li key={r}><Check size={13} /> {r}</li>
            ))}
          </ul>
        </div>
        <div className="sf-hero-right">
          <Image
            src={image}
            alt={title}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 52vw"
            className="sf-hero-img"
          />
        </div>
      </div>
    </section>
  );
}
