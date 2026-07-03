// Attribution-Erfassung: Klick-IDs (gclid/gbraid/wbraid) + UTM + Referrer.
// DSGVO: Diese Werte sind Marketing-Daten und werden erst NACH Einwilligung persistiert
// (Cookie + Weitergabe an den Lead). Vor der Einwilligung nur im Speicher gehalten.
import { readConsent } from "./analytics";

const COOKIE = "dgd_attr";
const MAX_AGE_DAYS = 90;
const MAX_VAL = 200;
const MAX_COOKIE = 2048;

export type Attribution = {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  first_seen?: string;
};

const CLICK_KEYS = ["gclid", "gbraid", "wbraid"] as const;
const KEYS = [...CLICK_KEYS, "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

// Nur im Speicher (Session) – überlebt Navigation via Modul-Scope, aber nicht ohne Einwilligung persistiert.
let session: Attribution = {};

function readCookie(): Attribution | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1])) as Attribution;
  } catch {
    return null;
  }
}

function writeCookie(a: Attribution): void {
  if (typeof document === "undefined") return;
  const val = encodeURIComponent(JSON.stringify(a));
  if (val.length > MAX_COOKIE) return; // Cookie-Bloat verhindern
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE}=${val}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

// Beim Seitenaufruf: Attribution im Speicher aufbauen (First-Touch, frischer Klick ersetzt Klick-IDs).
// Persistiert wird nur bei erteilter Einwilligung.
export function captureAttribution(nowIso: string): Attribution {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const incoming: Attribution = {};
  for (const k of KEYS) {
    const v = params.get(k);
    if (v) incoming[k] = v.slice(0, MAX_VAL);
  }
  const existing = { ...(readCookie() || {}), ...session };
  const hasFreshClick = CLICK_KEYS.some((k) => incoming[k]);

  // Frischer Klick: alte Klick-IDs verwerfen, damit keine veraltete gclid/gbraid mitgesendet wird.
  const base: Attribution = { ...existing };
  if (hasFreshClick) for (const k of CLICK_KEYS) delete base[k];
  const merged: Attribution = { ...base, ...incoming };

  if (!merged.first_seen) merged.first_seen = nowIso;
  if (!merged.referrer && document.referrer && !document.referrer.includes(window.location.host)) {
    try {
      const r = new URL(document.referrer);
      merged.referrer = (r.origin + r.pathname).slice(0, MAX_VAL); // ohne Query (Fremd-PII vermeiden)
    } catch {
      /* ignore */
    }
  }
  if (!merged.landing_page) merged.landing_page = (window.location.pathname + window.location.search).slice(0, MAX_VAL);

  session = merged;
  if (readConsent() === "granted" && Object.keys(merged).length) writeCookie(merged);
  return merged;
}

// Bei erteilter Einwilligung: bisher nur im Speicher gehaltene Attribution jetzt persistieren.
export function persistAttributionOnConsent(): void {
  if (Object.keys(session).length) writeCookie(session);
}

// Bei "Nur notwendige": vorhandenes Marketing-Cookie entfernen.
export function clearAttribution(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAttribution(): Attribution {
  return readCookie() || {};
}

// First-Touch-Infos für anonyme First-Party-Statistik (Presence/Session):
// Referrer + UTM aus dem Speicher – KEINE Klick-IDs (die bleiben consent-gated).
// "paid" meldet nur die PRÄSENZ eines Google-Ads-Klicks (keine ID), damit
// Ads-Besucher im Live-Dashboard nicht als Organic Google erscheinen.
export function getTouch(): { referrer?: string; utm_source?: string; utm_medium?: string; utm_term?: string; paid?: "google" } {
  return {
    referrer: session.referrer,
    utm_source: session.utm_source,
    utm_medium: session.utm_medium,
    utm_term: session.utm_term,
    paid: session.gclid || session.gbraid || session.wbraid ? "google" : undefined,
  };
}

// attr_*-Felder an FormData hängen – NUR mit Einwilligung (sonst keine Klick-IDs am Lead).
export function appendAttribution(fd: FormData): void {
  if (readConsent() !== "granted") return;
  const a = getAttribution();
  for (const [k, v] of Object.entries(a)) {
    if (v) fd.append(`attr_${k}`, String(v));
  }
}
