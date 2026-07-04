import Image from "next/image";
import { Check, ArrowRight, Phone, ShieldCheck, Clock, BadgeEuro, Users } from "lucide-react";
import { QuoteButton } from "./QuoteButton";
import { Breadcrumbs } from "./Breadcrumbs";
import { HeroGoogle, HeroLogos } from "./HeroClient";
import { CONTACT } from "@/lib/sauberfit-data";
import { getSiteContent } from "@/lib/site-content";

// Feste Marken-Versprechen als Icon-Zeile im Landingpage-Hero.
const LP_FEATURES = [
  { Icon: ShieldCheck, text: "Kostenlos & unverbindlich" },
  { Icon: Clock, text: "Angebot in unter 60 Sek." },
  { Icon: BadgeEuro, text: "Festpreis – keine versteckten Kosten" },
];

// Akzentuiert einen Titel-Teil grün: expliziter Akzent, sonst automatisch das Wort
// nach „ in " (z. B. „Gebäudereinigung in Hamburg" → „Hamburg" grün).
function renderTitle(title: string, accent?: string) {
  if (accent && title.includes(accent)) {
    const i = title.indexOf(accent);
    return (<>{title.slice(0, i)}<span className="g">{accent}</span>{title.slice(i + accent.length)}</>);
  }
  const m = title.match(/^(.* in )(.+)$/);
  if (m) return (<>{m[1]}<span className="g">{m[2]}</span></>);
  return title;
}

// Landingpage-Hero (Service-/Stadt-/Zielgruppen-Seiten): identischer Conversion-Cluster
// wie die Startseite – Google-Bewertung inkl. Anzahl, 60-Sek-Versprechen, Angebot- +
// Telefon-CTA, Social Proof, Vorteils-Karte aufs Bild und untere Trust-Leiste mit Logos.
// Wichtig, weil Google-Ads-Klicks direkt hier landen. Werte aus dem Admin (site-content).
export async function SubHero({
  crumbs,
  eyebrow,
  title,
  subtitle,
  image,
  ctaService,
  titleAccent,
}: {
  crumbs: { name: string; path: string }[];
  eyebrow?: string;
  title: string;
  subtitle: string;
  image: string;
  ctaService?: string;
  titleAccent?: string;
}) {
  void eyebrow; // ersetzt durch die stärkere Google-Bewertung (Prop bleibt für Kompatibilität)
  const c = await getSiteContent();
  const tel = `tel:${CONTACT.phone.replace(/\s/g, "")}`;
  return (
    <section className="sf-hero sub sf-hero-lp">
      <div className="sf-container">
        <Breadcrumbs items={crumbs} />
      </div>
      <div className="sf-hero-grid">
        <div className="sf-hero-left">
          <HeroGoogle google={c.google} showCount />
          <h1 className="sf-h1 sub-h1">{renderTitle(title, titleAccent)}</h1>
          <p className="sf-lead">{subtitle}</p>

          <div className="sf-lp-features">
            {LP_FEATURES.map(({ Icon, text }) => (
              <div className="sf-lp-feat" key={text}>
                <span className="sf-lp-feat-ic"><Icon size={18} /></span>
                <span className="sf-lp-feat-tx">{text}</span>
              </div>
            ))}
          </div>

          <div className="sf-hero-cta">
            <QuoteButton variant="dark" size="lg" service={ctaService}>
              Kostenloses Angebot anfordern <ArrowRight size={16} />
            </QuoteButton>
            <a data-track="subhero" className="sf-btn sf-btn-outline sf-btn-lg" href={tel}>
              <Phone size={16} /> {CONTACT.phone}
            </a>
          </div>

          {c.socialProof && (
            <p className="sf-socialproof sf-lp-social"><Users size={16} className="ic" /> {c.socialProof}</p>
          )}
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
          {c.trustbox.length > 0 && (
            <div className="sf-trustbox sf-trustbox-titled">
              <b className="sf-trustbox-title"><ShieldCheck size={15} /> Ihre Vorteile mit DGD</b>
              {c.trustbox.map((t) => (
                <div className="sf-trustbox-item" key={t}>
                  <span className="sf-trustbox-ic"><Check size={13} /></span>{t}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sf-lp-trustbar">
        <div className="sf-lp-trustbar-in">
          <div className="sf-lp-stats">
            {c.stats.map((s) => (
              <div className="sf-statcell" key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <HeroLogos logos={c.logos} />
        </div>
      </div>
    </section>
  );
}
