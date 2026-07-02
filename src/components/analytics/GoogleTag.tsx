"use client";

import Script from "next/script";
import { gaId, adsId, analyticsEnabled } from "@/lib/analytics";

// Lädt gtag.js für GA4 + Google Ads und setzt Consent Mode v2 (Default = denied),
// BEVOR Tags feuern. Ohne konfigurierte IDs wird nichts geladen (Debug-Modus im Event-Layer).
export function GoogleTag() {
  if (!analyticsEnabled()) return null;
  const GA_ID = gaId();
  const ADS_ID = adsId();
  const loaderId = GA_ID || ADS_ID;

  return (
    <>
      <Script id="gtag-consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent','default',{
            ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied',
            analytics_storage:'denied', functionality_storage:'granted', security_storage:'granted',
            wait_for_update:500
          });
          gtag('set','url_passthrough', true);
          gtag('set','ads_data_redaction', true);
          gtag('js', new Date());
          ${GA_ID ? `gtag('config','${GA_ID}', { anonymize_ip:true });` : ""}
          ${ADS_ID ? `gtag('config','${ADS_ID}', { allow_enhanced_conversions:true });` : ""}
        `}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(loaderId)}`} strategy="afterInteractive" />
    </>
  );
}
