import { Check, ShieldCheck } from "lucide-react";
import { HeroGoogle, HeroStats, HeroLogos, HeroPerson } from "./HeroClient";
import { LeadHeroForm } from "./LeadHeroForm";
import { getSiteContent } from "@/lib/site-content";

export async function Hero() {
  const c = await getSiteContent();
  return (
    <section className="sf-hero sf-hero-form" id="top">
      <div className="sf-hero-grid">
        <div className="sf-hero-left">
          <HeroGoogle google={c.google} />
          <h1 className="sf-h1">
            {c.h1Line1}
            <span className="g">{c.h1Line2}</span>
          </h1>
          {c.socialProof && <p className="sf-socialproof"><ShieldCheck size={15} className="ic" /> {c.socialProof}</p>}
          <p className="sf-lead">{c.subtitle}</p>

          <ul className="sf-risk">
            {c.riskReducers.map((r) => (
              <li key={r}><Check size={13} /> {r}</li>
            ))}
          </ul>

          <HeroStats stats={c.stats} />
        </div>

        <div className="sf-hero-right" id="anfrage">
          <LeadHeroForm />
        </div>
      </div>

      <div className="sf-person-band">
        <HeroPerson person={c.person} />
      </div>

      <HeroLogos logos={c.logos} />
    </section>
  );
}
