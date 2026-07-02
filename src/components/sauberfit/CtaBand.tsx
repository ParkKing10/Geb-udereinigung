import { Sparkles, ArrowRight } from "lucide-react";
import { CONTACT } from "@/lib/sauberfit-data";
import { QuoteButton } from "./QuoteButton";

export function CtaBand() {
  return (
    <section className="sf-section" id="kontakt">
      <div className="sf-container">
        <div className="sf-cta">
          <div className="sf-cta-in">
            <span className="sf-cta-orb"><Sparkles size={28} /></span>
            <div>
              <h2>Bereit für makellose Sauberkeit?</h2>
              <p>Erhalten Sie jetzt Ihr individuelles und unverbindliches Angebot – schnell, einfach und kostenlos.</p>
            </div>
            <div className="sf-cta-right">
              <QuoteButton variant="green" size="lg">Jetzt Angebot berechnen <ArrowRight size={16} /></QuoteButton>
              <small>oder anrufen: {CONTACT.phone}</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
