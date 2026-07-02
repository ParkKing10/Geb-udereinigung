"use client";

import { useEffect, useState } from "react";
import { updateConsent, track, analyticsEnabled, readConsent, CONSENT_COOKIE } from "@/lib/analytics";
import { persistAttributionOnConsent, clearAttribution } from "@/lib/attribution";

export const OPEN_CONSENT_EVENT = "dgd:open-consent";

function writeConsent(v: "granted" | "denied") {
  const maxAge = 365 * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE}=${v}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

// DSGVO-konformer Consent-Banner + Consent Mode v2. Erscheint beim ersten Besuch und
// jederzeit erneut über den Footer-Link „Cookie-Einstellungen" (Widerruf so einfach wie Erteilung).
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled()) return; // ohne Tracking kein Banner nötig
    const prior = readConsent();
    if (prior) updateConsent(prior === "granted"); // Entscheidung bei Wiederkehr erneut anwenden
    else setVisible(true);

    const onOpen = () => setVisible(true);
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, onOpen);
  }, []);

  function decide(granted: boolean) {
    writeConsent(granted ? "granted" : "denied");
    updateConsent(granted);
    if (granted) persistAttributionOnConsent();
    else clearAttribution();
    track("consent_update", { consent: granted ? "granted" : "denied" });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="sf-consent" role="dialog" aria-label="Datenschutz-Einstellungen" aria-live="polite">
      <div className="sf-consent-in">
        <p className="sf-consent-txt">
          Wir nutzen Cookies für anonyme Statistik und Marketing, um unser Angebot zu verbessern. Sie können frei
          entscheiden und Ihre Wahl jederzeit ändern. Mehr in unserer <a href="/datenschutz">Datenschutzerklärung</a>.
        </p>
        <div className="sf-consent-actions">
          <button className="sf-btn sf-btn-light" onClick={() => decide(false)}>Nur notwendige</button>
          <button className="sf-btn sf-btn-green" onClick={() => decide(true)}>Alle akzeptieren</button>
        </div>
      </div>
    </div>
  );
}
