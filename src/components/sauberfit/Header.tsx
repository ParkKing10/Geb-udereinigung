import { Phone } from "lucide-react";
import { CONTACT, SERVICES, TARGETS } from "@/lib/sauberfit-data";
import { QuoteButton } from "./QuoteButton";
import { MobileMenu } from "./MobileMenu";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sf-header">
      <div className="sf-header-in">
        <a href="/" className="sf-logo"><Logo /></a>

        <nav className="sf-nav" aria-label="Hauptnavigation">
          <div className="sf-navitem">
            <a href="/leistungen" className="sf-navlink">Leistungen <span className="sf-caret">▾</span></a>
            <div className="sf-dd">
              {SERVICES.map((s) => (
                <a key={s.slug} href={`/leistungen/${s.slug}`}>{s.name}</a>
              ))}
            </div>
          </div>

          <div className="sf-navitem">
            <a href="/fuer-wen" className="sf-navlink">Für wen <span className="sf-caret">▾</span></a>
            <div className="sf-dd">
              {TARGETS.map((t) => (
                <a key={t.slug} href={`/fuer-wen/${t.slug}`}>{t.name}</a>
              ))}
            </div>
          </div>

          <a href="/ueber-uns" className="sf-navlink">Über uns</a>
          <a href="/standorte" className="sf-navlink">Standorte</a>
          <a href="/preise" className="sf-navlink">Preise</a>
          <a href="/kontakt" className="sf-navlink">Kontakt</a>
        </nav>

        <div className="sf-header-right">
          <a href={`tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`} data-track="header" aria-label="Jetzt anrufen" className="sf-phone">
            <Phone size={18} className="ic" />
            <span>
              <b>{CONTACT.phone}</b>
              <span>{CONTACT.hours}</span>
            </span>
          </a>
          <QuoteButton variant="dark" className="sf-header-cta">Angebot berechnen</QuoteButton>
          <MobileMenu
            services={SERVICES.map((s) => ({ slug: s.slug, name: s.name }))}
            targets={TARGETS.map((t) => ({ slug: t.slug, name: t.name }))}
            phone={CONTACT.phone}
            hours={CONTACT.hours}
          />
        </div>
      </div>
    </header>
  );
}
