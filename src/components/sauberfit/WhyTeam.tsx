import Image from "next/image";
import { FEATURES, STATS, BRAND } from "@/lib/sauberfit-data";
import { Icon } from "./Icon";

export function WhyTeam() {
  return (
    <section className="sf-section" id="ueber-uns">
      <div className="sf-container sf-why-grid">
        {/* Warum SauberFit */}
        <div className="sf-why">
          <h2>Warum {BRAND.name}?</h2>
          <p>Darauf können Sie sich verlassen.</p>

          <div className="sf-feats">
            {FEATURES.map((f) => (
              <div className="sf-feat" key={f.title}>
                <Icon name={f.icon} size={24} className="ic" />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="sf-stats">
            {STATS.map((s) => (
              <div className="sf-stat" key={s.label}>
                <Icon name={s.icon} size={20} className="ic" />
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team / Bewertungen */}
        <div className="sf-team">
          <h2>Sauberkeit, die überzeugt.<br />Kunden, die bleiben.</h2>
          <div className="sf-team-media">
            <Image
              src="/images/sf-team.jpg"
              alt="Team der Deutschen Gebäudedienste"
              fill
              sizes="(max-width: 940px) 100vw, 40vw"
              className="sf-team-imgel"
            />
            <div className="sf-team-card">
              <div className="l">
                <div className="sf-stars">★★★★★</div>
                <b>4,9/5 aus 124 Bewertungen</b>
              </div>
              <a className="sf-gbtn" href="/referenzen">
                <span style={{ fontWeight: 800, color: "#4285F4" }}>G</span> Bewertungen ansehen
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
