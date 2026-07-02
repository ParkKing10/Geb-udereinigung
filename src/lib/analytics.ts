// Zentraler Event-Layer für GA4 + Google Ads (gtag) mit Consent Mode v2.
// Client-seitig. Ohne konfigurierte IDs läuft alles im Debug-Modus (dataLayer + console),
// sodass Events verifizierbar sind, bevor echte IDs hinterlegt werden.

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// IDs formal validieren (Defense-in-Depth: kein Breakout aus dem Inline-gtag-Script, keine kaputte Loader-URL).
export type AdsLabelKey = "lead" | "contact" | "call";
type TrackingCfg = { gaId: string; adsId: string; adsLeadLabel: string; adsContactLabel: string; adsCallLabel: string };

function envTracking(): TrackingCfg {
  const rawGa = process.env.NEXT_PUBLIC_GA_ID?.trim() || "";
  const rawAds = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "";
  return {
    gaId: /^G-[A-Z0-9]+$/i.test(rawGa) ? rawGa : "",
    adsId: /^AW-\d+$/.test(rawAds) ? rawAds : "",
    adsLeadLabel: process.env.NEXT_PUBLIC_ADS_LEAD_LABEL?.trim() || "",
    adsContactLabel: process.env.NEXT_PUBLIC_ADS_CONTACT_LABEL?.trim() || "",
    adsCallLabel: process.env.NEXT_PUBLIC_ADS_CALL_LABEL?.trim() || "",
  };
}

// Laufzeit-Konfiguration: ENV als Default, im Admin gesetzte Werte überschreiben sie
// (das (Server-)Layout ruft setRuntimeTracking über <Analytics tracking={…}> auf).
// Config ist global identisch pro Request → kein Cross-Request-Problem beim SSR.
let RT: TrackingCfg = envTracking();

export function setRuntimeTracking(cfg: Partial<TrackingCfg> | null | undefined): void {
  if (!cfg) return;
  RT = {
    gaId: /^G-[A-Z0-9]+$/i.test(cfg.gaId || "") ? cfg.gaId!.trim() : RT.gaId,
    adsId: /^AW-\d+$/.test(cfg.adsId || "") ? cfg.adsId!.trim() : RT.adsId,
    adsLeadLabel: cfg.adsLeadLabel ?? RT.adsLeadLabel,
    adsContactLabel: cfg.adsContactLabel ?? RT.adsContactLabel,
    adsCallLabel: cfg.adsCallLabel ?? RT.adsCallLabel,
  };
}

export function gaId(): string { return RT.gaId; }
export function adsId(): string { return RT.adsId; }
export function adsLabel(key: AdsLabelKey): string {
  return key === "lead" ? RT.adsLeadLabel : key === "contact" ? RT.adsContactLabel : RT.adsCallLabel;
}
export function analyticsEnabled(): boolean { return Boolean(RT.gaId || RT.adsId); }

export const CONSENT_COOKIE = "dgd_consent";

// Einzige Quelle der Wahrheit für die gespeicherte Einwilligung.
export function readConsent(): "granted" | "denied" | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  return m ? (m[1] as "granted" | "denied") : null;
}

type Params = Record<string, unknown>;

// GA4-/Custom-Event senden. Spiegelung in den dataLayer bewusst NICHT unter dem GTM-Trigger-Key "event"
// (verhindert Doppelzählung, falls später ein GTM-Container ergänzt wird).
export function track(event: string, params: Params = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ _dgdEvent: event, ...params, _src: "dgd" });
  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  } else if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[analytics] event (no gtag)", event, params);
  }
}

// E-Mail/Telefon für Enhanced Conversions normalisieren (Google hasht clientseitig).
function normalizeUserData(email?: string, phone?: string): Params | undefined {
  const data: Params = {};
  if (email && /\S+@\S+\.\S+/.test(email)) data.email = email.trim().toLowerCase();
  if (phone) {
    const digits = phone.replace(/[^\d+]/g, "");
    if (digits.length >= 6) data.phone_number = digits.startsWith("+") ? digits : `+49${digits.replace(/^0/, "")}`;
  }
  return Object.keys(data).length ? data : undefined;
}

// Google-Ads-Conversion feuern (Wert + Dedup + Enhanced Conversions).
// Harte Einwilligungs-Sperre: ohne "granted" gelangt KEINE (Roh-)PII in die gtag/dataLayer-Queue.
export function trackAdsConversion(
  label: AdsLabelKey,
  opts: { value?: number; currency?: string; transactionId?: string; email?: string; phone?: string } = {},
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (readConsent() !== "granted") return;
  if (!adsId() || !adsLabel(label)) return;
  const userData = normalizeUserData(opts.email, opts.phone);
  if (userData) window.gtag("set", "user_data", userData);
  window.gtag("event", "conversion", {
    send_to: `${adsId()}/${adsLabel(label)}`,
    value: opts.value,
    currency: opts.currency || "EUR",
    transaction_id: opts.transactionId,
  });
}

// Consent Mode v2 aktualisieren (nach Nutzerentscheidung).
export function updateConsent(granted: boolean): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const v = granted ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: v,
    ad_user_data: v,
    ad_personalization: v,
    analytics_storage: v,
  });
}

// ── Lead-Wert (turnus-basiert) für wertbasiertes Bidding ──
const CONTRACT_MONTHS = 6; // konservative Vertragsannahme für wiederkehrende Reinigung
export function visitsPerMonth(turnus?: string | null): number {
  const t = (turnus || "").toLowerCase();
  if (!t) return 4.33; // Default ~wöchentlich
  const alleN = t.match(/alle\s+(\d+)\s*tage?/); // "alle 3 Tage"
  if (alleN) return 30 / Math.max(1, parseInt(alleN[1], 10));
  const proWoche = t.match(/(\d+)\s*[x×]\s*(pro\s*woche|\/\s*woche)/); // "2× pro Woche"
  if (proWoche) return parseInt(proWoche[1], 10) * 4.33;
  if (t.includes("täglich") || t.includes("taeglich")) return 22;
  if (t.includes("mehrmals")) return 8;
  if (t.includes("wöchentlich") || t.includes("woechentlich")) return 4.33;
  if (t.includes("2 wochen") || t.includes("14")) return 2.17;
  if (t.includes("monatlich")) return 1;
  return 4.33;
}
// Lead-Wert = Preis/Einsatz × Einsätze/Monat × Vertragsmonate (Einmalig = ein Einsatz).
export function leadValue(perVisitEuro: number, turnus?: string | null): number {
  if (!perVisitEuro || perVisitEuro <= 0) return 0;
  const once = /einmalig|bauend/i.test(turnus || "");
  return once ? Math.round(perVisitEuro) : Math.round(perVisitEuro * visitsPerMonth(turnus) * CONTRACT_MONTHS);
}

// ── Semantische High-Level-Events ──

export function trackQuoteOpen(source: string, service?: string): void {
  track("quote_open", { source, service: service || undefined });
}

export function trackQuoteStep(step: number, stepName: string): void {
  track("quote_step", { step, step_name: stepName });
}

// Haupt-Conversion: Lead-Formular abgeschickt (Wert = geschätzter Lead-/Vertragswert).
export function trackLead(data: {
  leadId: string;
  service?: string;
  region?: string; // gröber Ort (PLZ/Stadt), keine volle Adresse
  value?: number;
  email?: string;
  phone?: string;
}): void {
  track("generate_lead", {
    lead_id: data.leadId,
    service: data.service,
    region: data.region,
    value: data.value,
    currency: "EUR",
  });
  trackAdsConversion("lead", {
    value: data.value,
    transactionId: data.leadId,
    email: data.email,
    phone: data.phone,
  });
}

export function trackContact(data: { email?: string; phone?: string }): void {
  track("contact_form_submit", {});
  trackAdsConversion("contact", { email: data.email, phone: data.phone });
}

export function trackCall(source: string, phone?: string): void {
  track("click_to_call", { source });
  trackAdsConversion("call", { phone });
}

export function trackEmailClick(source: string): void {
  track("click_to_email", { source });
}
