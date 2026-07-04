"use client";

import { Phone, ArrowRight } from "lucide-react";
import { useLead } from "./LeadProvider";
import { CONTACT } from "@/lib/sauberfit-data";

// Sticky CTA am unteren Rand – nur mobil. Maximiert Lead-Generierung auf dem Smartphone.
export function MobileStickyCta() {
  const { open } = useLead();
  const tel = `tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`;
  // Auf Seiten mit Hero-Formular (#anfrage) dorthin scrollen, sonst den Wizard öffnen.
  function onCta() {
    const el = typeof document !== "undefined" ? document.getElementById("anfrage") : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else open();
  }
  return (
    <div className="sf-sticky-cta">
      <a href={tel} data-track="sticky" className="sf-sticky-call" aria-label="Jetzt anrufen">
        <Phone size={18} />
      </a>
      <button className="sf-sticky-main" onClick={onCta}>
        Jetzt Kontakt aufnehmen <ArrowRight size={16} />
      </button>
    </div>
  );
}
