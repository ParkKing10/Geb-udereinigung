import Image from "next/image";
import { ShieldCheck, ArrowRight, Phone } from "lucide-react";
import { QuoteButton } from "./QuoteButton";
import { Breadcrumbs } from "./Breadcrumbs";
import { CONTACT } from "@/lib/sauberfit-data";

export function SubHero({
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
  return (
    <section className="sf-hero sub">
      <div className="sf-container">
        <Breadcrumbs items={crumbs} />
      </div>
      <div className="sf-hero-grid">
        <div className="sf-hero-left">
          {eyebrow && (
            <span className="sf-badge"><ShieldCheck size={14} /> {eyebrow}</span>
          )}
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
