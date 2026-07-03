"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GoogleTag } from "./GoogleTag";
import { ConsentBanner } from "./ConsentBanner";
import { track, trackCall, trackEmailClick, gaId, setRuntimeTracking, getSid } from "@/lib/analytics";
import type { TrackingSettings } from "@/lib/admin/app-settings";
import { captureAttribution, getAttribution } from "@/lib/attribution";

// First-Party-Session-Ping (einmal pro Session) für das interne Marketing-Dashboard.
// Aggregat/cookielos; gclid nur bei erteilter Einwilligung (getAttribution ist consent-gated).
function sendSessionPing() {
  try {
    if (sessionStorage.getItem("dgd_spv")) return;
    sessionStorage.setItem("dgd_spv", "1");
  } catch {
    return;
  }
  const p = new URLSearchParams(window.location.search);
  const a = getAttribution();
  const body = JSON.stringify({
    landing: window.location.pathname + window.location.search,
    referrer: document.referrer || "",
    device: window.matchMedia("(max-width: 768px)").matches ? "mobile" : "desktop",
    utm_source: p.get("utm_source") || undefined,
    utm_medium: p.get("utm_medium") || undefined,
    utm_campaign: p.get("utm_campaign") || undefined,
    utm_term: p.get("utm_term") || undefined,
    utm_content: p.get("utm_content") || undefined,
    msclkid: p.get("msclkid") || undefined,
    gclid: a.gclid,
    gbraid: a.gbraid,
    wbraid: a.wbraid,
  });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    else fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch {
    /* Tracking darf nie stören */
  }
}

// SPA-Page-Views bei Routenwechsel. gtag('config') aktualisiert page_location/page_referrer im Config-Scope
// und sendet einen korrekten page_view (den ersten sendet die Initial-Config → ersten überspringen).
function PageViews() {
  const pathname = usePathname();
  const search = useSearchParams();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const url = pathname + (search?.toString() ? `?${search.toString()}` : "");
    const page_location = window.location.origin + url;
    if (typeof window.gtag === "function" && gaId()) {
      window.gtag("config", gaId(), { page_location, page_title: document.title });
    } else {
      track("page_view", { page_location, page_title: document.title });
    }
  }, [pathname, search]);
  return null;
}

// Live-Präsenz-Beacon: meldet alle 15 s (und bei Routen-/Formularwechsel) anonym
// "bin da + auf welcher Seite + Formular-Schritt" ans Admin-Dashboard.
function PresenceBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    const send = () => {
      const sid = getSid();
      if (!sid) return;
      const body = JSON.stringify({ sid, path: window.location.pathname, quote: window.__dgdQuote ?? null });
      try {
        if (navigator.sendBeacon) navigator.sendBeacon("/api/presence", new Blob([body], { type: "application/json" }));
        else fetch("/api/presence", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      } catch {
        /* Presence darf nie stören */
      }
    };
    window.__dgdPresencePing = send;
    send();
    const iv = window.setInterval(send, 15_000);
    const onVis = () => { if (document.visibilityState === "visible") send(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
      if (window.__dgdPresencePing === send) delete window.__dgdPresencePing;
    };
  }, [pathname]);
  return null;
}

// Delegiertes Klick-Tracking für Telefon-/E-Mail-/WhatsApp-Links (überall, auch in Server-Komponenten gerendert).
function useLinkTracking() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (!href) return;
      const source = a?.dataset.track || a?.closest("[data-section]")?.getAttribute("data-section") || "link";
      if (href.startsWith("tel:")) trackCall(source, href.replace("tel:", ""));
      else if (href.startsWith("mailto:")) trackEmailClick(source);
      else if (href.includes("wa.me") || href.includes("api.whatsapp.com")) track("click_to_whatsapp", { source });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
}

export function Analytics({ tracking }: { tracking?: TrackingSettings }) {
  // Vom Server-Layout gesetzte Tracking-IDs zur Laufzeit übernehmen (überschreibt ENV),
  // bevor GoogleTag/ConsentBanner (Kinder) sie lesen. Deterministisch → SSR-sicher.
  setRuntimeTracking(tracking);
  useLinkTracking();
  useEffect(() => {
    captureAttribution(new Date().toISOString());
    sendSessionPing();
  }, []);

  return (
    <>
      <GoogleTag />
      <ConsentBanner />
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
      <Suspense fallback={null}>
        <PresenceBeacon />
      </Suspense>
    </>
  );
}
