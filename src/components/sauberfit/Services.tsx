import Image from "next/image";
import { SERVICES } from "@/lib/sauberfit-data";
import { Icon } from "./Icon";
import { QuoteButton } from "./QuoteButton";

export function Services() {
  return (
    <section className="sf-section" id="leistungen">
      <div className="sf-container">
        <div className="sf-head">
          <h2>Unsere Reinigungsdienste</h2>
          <p>Professionelle Reinigungslösungen für jede Anforderung</p>
        </div>

        <div className="sf-services">
          {SERVICES.map((s) => (
            <article key={s.slug} className="sf-svc">
              <div className="sf-svc-img">
                <Image
                  src={s.image}
                  alt={`${s.name} – Deutsche Gebäudedienste`}
                  fill
                  sizes="(max-width: 460px) 100vw, (max-width: 720px) 50vw, (max-width: 1080px) 33vw, 20vw"
                  className="sf-svc-imgel"
                />
                <span className="sf-svc-icon"><Icon name={s.icon} size={22} strokeWidth={2} /></span>
              </div>
              <h3><a href={`/leistungen/${s.slug}`}>{s.name}</a></h3>
              <p>{s.desc}</p>
              <a className="more" href={`/leistungen/${s.slug}`}>Mehr erfahren →</a>
            </article>
          ))}
        </div>

        <div className="sf-services-foot">
          <QuoteButton variant="outline" size="lg">Alle Leistungen ansehen</QuoteButton>
        </div>
      </div>
    </section>
  );
}
