"use client";

// Microsoft Clarity (Session-Aufnahmen/Heatmaps) – DSGVO: lädt AUSSCHLIESSLICH
// nach erteilter Cookie-Einwilligung. Bei "Nur notwendige" wird nichts geladen;
// bei nachträglichem Widerruf stoppt eine laufende Aufnahme.
import { useEffect } from "react";
import { readConsent, CONSENT_EVENT } from "@/lib/analytics";

const CLARITY_ID = "xgphh277do";

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

function injectClarity(): void {
  if (document.getElementById("dgd-clarity")) return; // nur einmal
  window.clarity =
    window.clarity ||
    function (...args: unknown[]) {
      ((window.clarity as unknown as { q?: unknown[] }).q ||= []).push(args);
    };
  const s = document.createElement("script");
  s.id = "dgd-clarity";
  s.async = true;
  s.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
  document.head.appendChild(s);
  // Consent-Signal an Clarity (Cookies erlaubt).
  window.clarity("consent");
}

export function ClarityTag() {
  useEffect(() => {
    if (readConsent() === "granted") injectClarity();

    const onConsent = (e: Event) => {
      const granted = (e as CustomEvent<{ granted: boolean }>).detail?.granted;
      if (granted) injectClarity();
      else window.clarity?.("stop");
    };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  return null;
}
