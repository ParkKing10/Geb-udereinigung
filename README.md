# Deutsche Gebäudedienste – Website & Admin-CMS

Marketing-Website mit KI-Sofort-Angebot und integriertem Admin-/CRM-Bereich für die
**Deutsche Gebäudedienste** (Gebäudereinigung deutschlandweit).

Gebaut mit **Next.js 16** (App Router, React 19, TypeScript). Datenhaltung dateibasiert
(JSON) – ohne externe Datenbank.

---

## Funktionsumfang

**Öffentliche Website**
- Startseite mit Hero, Trust-Elementen, Ansprechpartner und KI-Sofort-Angebot
- Leistungen (`/leistungen`), Zielgruppen (`/fuer-wen`), Standorte (`/standorte`)
- Ratgeber/Blog (`/ratgeber`), Referenzen, Preise, Qualität, Karriere, Über uns, Kontakt
- Rechtstexte: Impressum, Datenschutz, AGB
- Technisches SEO: Metadaten, JSON-LD, `sitemap.xml`, `robots.txt`, individuelle FAQ je Seite
- Vollständig mobile-responsive
- Conversion-Tracking: GA4 + Google Ads mit Consent Mode v2 (DSGVO-konform)

**KI-Sofort-Angebot**
- Lead-Formular mit optionalem Foto-Upload
- Kostenschätzung per Anthropic-Vision (Fallback-Heuristik ohne API-Key)

**Admin-Bereich** (`/admin`, passwortgeschützt)
- Dashboard mit Kennzahlen
- Leads & CRM-Pipeline (Status-Workflow), Aufträge, Rechnungen, Finanzen, Betriebskosten-Rechner
- E-Mail-Client (SMTP/IMAP, mehrere Postfächer, KI-Textentwurf, Signaturen)
- Blog-Automatik (KI-generierte SEO-Artikel nach Zeitplan)
- Website-Editor (Hero-/Trust-Content, Logo-/Foto-Upload)
- Rechtstexte-Editor (Impressum/Datenschutz/AGB im WYSIWYG)
- Marketing-/Attribution-Dashboard, Einstellungen (Tracking, Rechnungsdaten, API-Key)

---

## Lokale Entwicklung

Voraussetzung: **Node.js ≥ 24**

```bash
npm install
cp .env.example .env        # Werte eintragen (siehe unten)
npm run dev                 # http://localhost:3000
```

Weitere Skripte:

```bash
npm run build       # Produktions-Build
npm start           # Produktions-Server
npm run typecheck   # TypeScript prüfen
npm run lint        # ESLint
```

### Umgebungsvariablen

Siehe [`.env.example`](.env.example). Wichtigste:

| Variable | Pflicht | Zweck |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | ✅ | Öffentliche Basis-URL (canonical, sitemap, OpenGraph). Build bricht ohne ab. |
| `ADMIN_PASSWORD` | ✅ | Passwort für `/admin` |
| `AUTH_SECRET` | ✅ | Signiert die Admin-Session-Cookies |
| `ANTHROPIC_API_KEY` | optional | KI-Kostenschätzung & E-Mail-KI (ohne Key: Heuristik) |
| `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, … | optional | Conversion-Tracking |

---

## Deployment (Render)

Deploy via **Render** (Node-Runtime). Enthaltene [`render.yaml`](render.yaml) als Blueprint,
oder manuell als Web Service:

- **Build:** `npm install && npm run build`
- **Start:** `npm start`
- **Node:** 24 (via [`.node-version`](.node-version))
- Umgebungsvariablen im Render-Dashboard setzen (mind. `NEXT_PUBLIC_APP_URL`, `ADMIN_PASSWORD`, `AUTH_SECRET`).

> ⚠️ **Datenpersistenz:** Alle Betriebsdaten (Leads, Aufträge, Rechnungen, Postfächer,
> Uploads, Content) liegen in Dateien im Projektordner. Ohne angehängte **Render-Disk**
> ist das Dateisystem flüchtig – bei jedem Deploy/Neustart gehen diese Daten verloren.
> Für den Echtbetrieb eine persistente Disk anhängen und die Datenpfade darauf legen.

---

## Datenhaltung

Zustandsdaten werden als JSON-Dateien im Projekt-Root gespeichert (`leads.json`,
`orders.json`, `invoices.json`, `email-accounts.json`, `public/uploads/` …). Diese
Dateien enthalten Kundendaten und Geheimnisse und sind daher per
[`.gitignore`](.gitignore) vom Repository ausgeschlossen. Versioniert wird nur
unbedenklicher Seed-Content (`site-content.json`, `blog-posts.json`).

---

## Lizenz

Proprietär – alle Rechte vorbehalten. Siehe [LICENSE](LICENSE).
