"use client";

import { analyticsEnabled } from "@/lib/analytics";
import { OPEN_CONSENT_EVENT } from "./ConsentBanner";

// Persistenter Widerruf-/Änderungs-Trigger (DSGVO Art. 7 Abs. 3). Öffnet den Consent-Banner erneut.
// `enabled` kommt aus dem (Server-)Footer (Runtime-Config); Fallback = ENV-basiertes analyticsEnabled().
export function ConsentSettingsButton({ enabled }: { enabled?: boolean }) {
  if (!(enabled ?? analyticsEnabled())) return null;
  return (
    <button type="button" className="sf-consent-reopen" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
      Cookie-Einstellungen
    </button>
  );
}
