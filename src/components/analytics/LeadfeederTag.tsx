"use client";

// Leadfeeder (Dealfront) – Firmen-Erkennung per IP-Datenbank. DSGVO: lädt
// AUSSCHLIESSLICH nach erteilter Cookie-Einwilligung (wie Clarity/GA).
// Ergänzt die eingebaute RDAP-Erkennung um die kommerzielle IP-Datenbank.
import { useEffect } from "react";
import { readConsent, CONSENT_EVENT } from "@/lib/analytics";

const LEADFEEDER_ID = "YEgkB8lbgNp4ep3Z";

declare global {
  interface Window {
    ldfdr?: ((...args: unknown[]) => void) & { _q?: unknown[] };
  }
}

function injectLeadfeeder(): void {
  if (document.getElementById("dgd-leadfeeder")) return; // nur einmal
  window.ldfdr =
    window.ldfdr ||
    function (...args: unknown[]) {
      (window.ldfdr!._q ||= []).push([].slice.call(args));
    };
  const s = document.createElement("script");
  s.id = "dgd-leadfeeder";
  s.async = true;
  s.src = `https://sc.lfeeder.com/lftracker_v1_${LEADFEEDER_ID}.js`;
  document.head.appendChild(s);
}

export function LeadfeederTag() {
  useEffect(() => {
    if (readConsent() === "granted") injectLeadfeeder();

    const onConsent = (e: Event) => {
      const granted = (e as CustomEvent<{ granted: boolean }>).detail?.granted;
      if (granted) injectLeadfeeder();
    };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  return null;
}
