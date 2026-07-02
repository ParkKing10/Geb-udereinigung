# Conversion-Tracking – Setup

Vollständiges, DSGVO-konformes Tracking (GA4 + Google Ads, Consent Mode v2) ist eingebaut.
Ohne IDs läuft es im **Debug-Modus** (Events landen im `window.dataLayer` + Konsole, es wird nichts an Google gesendet) – so kannst du das Feuern der Events prüfen, bevor echte IDs gesetzt sind.

## 1. IDs eintragen (`.env`)

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX            # GA4 Mess-ID
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX   # Google Ads Conversion-ID
NEXT_PUBLIC_ADS_LEAD_LABEL=xxxxxxxxxxx    # Label der Conversion "Lead-Formulare senden" (Website)
NEXT_PUBLIC_ADS_CONTACT_LABEL=xxxxxxxxxxx # Kontaktformular
NEXT_PUBLIC_ADS_CALL_LABEL=xxxxxxxxxxx    # Klick auf Telefonnummer
```

Das Label ist der Teil **nach dem `/`** im Snippet `send_to: 'AW-123456789/AbCdEf...'` (Google Ads → Tools → Conversions → Aktion öffnen → "Tag einrichten" → gtag).

## 2. Die "Website"-Conversion aus dem Screenshot verbinden (⚠ auflösen)

Die Warnung ⚠ bei **„Lead-Formulare senden → Website → 1 Aktion"** bedeutet: Google hat den Conversion-Tag auf der Seite noch nicht empfangen.
1. `NEXT_PUBLIC_GOOGLE_ADS_ID` + `NEXT_PUBLIC_ADS_LEAD_LABEL` setzen (Schritt 1).
2. Deployen.
3. Ein Test-Lead über das Formular absenden (oder Google Ads „Tag-Diagnose"/Tag Assistant nutzen).
Sobald der `generate_lead` + `conversion`-Event feuert, wechselt der Status auf „aktiv". Die Quelle **„Von Google gehostet"** betrifft Googles eigene Lead-Formular-Erweiterungen und wird direkt in Google Ads konfiguriert (nicht auf der Website).

## 3. Enhanced Conversions (empfohlen)

In Google Ads → Conversions → Einstellungen → **Enhanced Conversions** aktivieren, Methode „Google-Tag / gtag.js". Die Seite sendet bereits gehashte Nutzerdaten (E-Mail/Telefon) mit der Lead-Conversion → deutlich bessere Zuordnung.

## 4. Offline-Conversions / echter Umsatz (Park-King-Level)

Jeder Lead speichert die **Attribution** (`gclid`, `utm_*`, Referrer, Landingpage) – sichtbar im Admin unter *Leads → Lead → Herkunft/Attribution*.
Wird ein Lead später zum Kunden, kann der `gclid` samt Abschlusswert als **Offline-Conversion** nach Google Ads importiert werden (Ads → Conversions → Import). So optimiert Google auf echten Umsatz, nicht nur auf Formulare.

## Getrackte Events

| Event | Auslöser | Als Google-Ads-Conversion |
|------|----------|---------------------------|
| `page_view` | Seitenaufruf + SPA-Navigation | – |
| `quote_open` | Angebots-Modal geöffnet | – (Micro) |
| `quote_step` | Schritt 1→2→3 im Modal (Funnel) | – (Micro) |
| `generate_lead` | Lead-Formular erfolgreich, inkl. **Wert** (KI-Schätzung) | ✅ `lead` |
| `contact_form_submit` | Kontaktformular abgeschickt | ✅ `contact` |
| `click_to_call` | Klick auf `tel:`-Link (Header, Hero, Sticky, Footer, Kontakt) | ✅ `call` |
| `click_to_email` | Klick auf `mailto:`-Link | – |
| `consent_update` | Einwilligung erteilt/abgelehnt | – |

## Consent Mode v2 (DSGVO)

- Standard = **alle Marketing-/Statistik-Cookies verweigert**, bis der Nutzer im Banner zustimmt.
- Banner: „Nur notwendige" (gleichwertig) vs. „Alle akzeptieren". Wahl 1 Jahr gespeichert.
- Vor Einwilligung sendet Google nur cookielose, anonyme Pings (`url_passthrough`, `ads_data_redaction`).
- Hinweis: Wenn ihr ein CMP (Cookiebot/Usercentrics) nutzt, kann der eingebaute Banner entfernt und dessen Consent-Signale mit `updateConsent()` verbunden werden.
