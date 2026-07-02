import Image from "next/image";
import { Phone, Mail, Globe, ShieldCheck, BadgeCheck } from "lucide-react";
import { CONTACT, BRAND, SERVICES, TARGETS, COMPANY_PAGES, LEGAL_PAGES } from "@/lib/sauberfit-data";
import { getSiteContent } from "@/lib/site-content";
import { publicTracking } from "@/lib/admin/app-settings";
import { ConsentSettingsButton } from "@/components/analytics/ConsentSettingsButton";
import { Logo } from "./Logo";

function IgIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function InIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5c0-1.2-.02-2.74-1.9-2.74-1.9 0-2.2 1.3-2.2 2.65V21H9z" />
    </svg>
  );
}

export async function Footer() {
  const [{ person }, tracking] = await Promise.all([getSiteContent(), publicTracking()]);
  const trackingOn = Boolean(tracking.gaId || tracking.adsId);
  const initials = `${person.firstName[0] ?? ""}${person.lastName[0] ?? ""}`;
  return (
    <footer className="sf-footer">
      <div className="sf-footer-in">
        <div>
          <a href="/" className="sf-logo"><Logo /></a>
          <p>Ihr professioneller Reinigungsdienst – deutschlandweit im Einsatz. Zuverlässig. Gründlich. Fair.</p>
          <div className="sf-foot-person">
            <span className="sf-foot-person-av">
              {person.photo
                ? <Image src={person.photo} alt={`${person.firstName} ${person.lastName}`} fill sizes="42px" style={{ objectFit: "cover" }} />
                : initials}
            </span>
            <span className="sf-foot-person-id">
              <small>Ihr Ansprechpartner</small>
              <b>{person.firstName} {person.lastName}</b>
              <span>{person.position}</span>
            </span>
          </div>
          <div className="sf-socials">
            <a href="#" aria-label="Instagram"><IgIcon /></a>
            <a href="#" aria-label="LinkedIn"><InIcon /></a>
          </div>
        </div>

        <div className="sf-fcol">
          <h3>Leistungen</h3>
          <ul>
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.slug}><a href={`/leistungen/${s.slug}`}>{s.name}</a></li>
            ))}
            <li><a href="/leistungen">Alle Leistungen</a></li>
            <li><a href="/standorte">Unsere Städte</a></li>
          </ul>
        </div>

        <div className="sf-fcol">
          <h3>Für wen</h3>
          <ul>
            {TARGETS.map((t) => (
              <li key={t.slug}><a href={`/fuer-wen/${t.slug}`}>{t.name}</a></li>
            ))}
          </ul>
        </div>

        <div className="sf-fcol">
          <h3>Unternehmen</h3>
          <ul>
            {COMPANY_PAGES.map((c) => (
              <li key={c.href}><a href={c.href}>{c.label}</a></li>
            ))}
          </ul>
        </div>

        <div className="sf-fcol">
          <h3>Kontakt</h3>
          <div className="sf-fcontact">
            <b>{CONTACT.address[0]}</b><br />
            {CONTACT.address[1]}<br />{CONTACT.address[2]}
            <div style={{ marginTop: ".75rem", display: "grid", gap: ".4rem" }}>
              <a href={`tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`} data-track="footer" aria-label="Jetzt anrufen" style={{ display: "inline-flex", gap: ".5rem", alignItems: "center" }}><Phone size={15} /> {CONTACT.phone}</a>
              <a href={`mailto:${CONTACT.email}`} data-track="footer" style={{ display: "inline-flex", gap: ".5rem", alignItems: "center" }}><Mail size={15} /> {CONTACT.email}</a>
              <span style={{ display: "inline-flex", gap: ".5rem", alignItems: "center" }}><Globe size={15} /> {CONTACT.web}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sf-foot-bottom">
        <div className="sf-foot-bottom-in">
          <span>© {new Date().getFullYear()} {BRAND.name}</span>
          <span className="sf-foot-legal">
            {LEGAL_PAGES.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
            <ConsentSettingsButton enabled={trackingOn} />
          </span>
          <span className="sf-foot-badges">
            <span className="sf-foot-badge"><ShieldCheck size={16} className="ic" /> <span><b>100% DSGVO-konform</b><br />Ihre Daten sind sicher</span></span>
            <span className="sf-foot-badge"><BadgeCheck size={16} className="ic" /> <span><b>Zertifizierte Qualität</b><br />Regelmäßig geprüft</span></span>
          </span>
        </div>
      </div>
    </footer>
  );
}
