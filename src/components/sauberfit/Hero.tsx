import Image from "next/image";
import { Check, ShieldCheck, ArrowRight, Clock } from "lucide-react";
import { QuoteButton } from "./QuoteButton";
import { HeroGoogle, HeroStats, HeroLogos, HeroPerson } from "./HeroClient";
import { getSiteContent } from "@/lib/site-content";

export async function Hero() {
  const c = await getSiteContent();
  return (
    <section className="sf-hero" id="top">
      <div className="sf-hero-grid">
        <div className="sf-hero-left">
          <HeroGoogle google={c.google} />
          <h1 className="sf-h1">
            {c.h1Line1}
            <span className="g">{c.h1Line2}</span>
          </h1>
          {c.socialProof && <p className="sf-socialproof"><ShieldCheck size={15} className="ic" /> {c.socialProof}</p>}
          <p className="sf-lead">{c.subtitle}</p>

          <div className="sf-hero-cta">
            <QuoteButton variant="dark" size="lg" className="sf-btn-cta">{c.ctaPrimary} <ArrowRight size={17} /></QuoteButton>
            {c.ctaMicro && <span className="sf-cta-micro"><Clock size={14} /> {c.ctaMicro}</span>}
          </div>
          <ul className="sf-risk">
            {c.riskReducers.map((r) => (
              <li key={r}><Check size={13} /> {r}</li>
            ))}
          </ul>

          <HeroStats stats={c.stats} />
        </div>

        <div className="sf-hero-right">
          <Image
            src="/images/sf-hero.jpg"
            alt="Reinigungsteam der Deutschen Gebäudedienste im Einsatz"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 52vw"
            className="sf-hero-img"
          />
          <div className="sf-trustbox">
            {c.trustbox.map((t) => (
              <div className="sf-trustbox-item" key={t}>
                <span className="sf-trustbox-ic"><Check size={13} /></span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sf-person-band">
        <HeroPerson person={c.person} />
      </div>

      <HeroLogos logos={c.logos} />
    </section>
  );
}
