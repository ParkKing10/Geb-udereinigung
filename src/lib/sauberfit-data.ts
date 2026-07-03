// SauberFit — Inhalte (Leistungen, Stats, Footer) als Single Source.
export type Service = {
  slug: string;
  name: string;
  desc: string;
  image: string;
  icon: string; // lucide-Name
};

export const SERVICES: Service[] = [
  { slug: "hotelreinigung", name: "Hotelreinigung", desc: "Saubere Zimmer, glückliche Gäste. Zuverlässig, diskret und gründlich.", image: "/images/sf-hotel.jpg", icon: "BedDouble" },
  { slug: "bueroreinigung", name: "Büroreinigung", desc: "Für ein sauberes Arbeitsumfeld und mehr Produktivität.", image: "/images/sf-buero.jpg", icon: "Building2" },
  { slug: "treppenhausreinigung", name: "Treppenhausreinigung", desc: "Gepflegte Eingangsbereiche hinterlassen den richtigen Eindruck.", image: "/images/sf-treppenhaus.jpg", icon: "DoorOpen" },
  { slug: "praxisreinigung", name: "Praxisreinigung", desc: "Hygienisch sauber für Patienten und Personal – jeden Tag.", image: "/images/sf-praxis.jpg", icon: "Stethoscope" },
  { slug: "industriereinigung", name: "Industriereinigung", desc: "Leistungsstark auch bei großen Flächen und speziellen Anforderungen.", image: "/images/sf-industrie.jpg", icon: "Factory" },
  { slug: "glasreinigung", name: "Glasreinigung", desc: "Streifenfrei sauber – für den perfekten Durchblick.", image: "/images/sf-glas.jpg", icon: "AppWindow" },
  { slug: "bauendreinigung", name: "Bauendreinigung", desc: "Wir hinterlassen Ihre Baustelle bezugsfertig und sauber.", image: "/images/sf-bauend.jpg", icon: "HardHat" },
  { slug: "unterhaltsreinigung", name: "Unterhaltsreinigung", desc: "Regelmäßige Reinigung für Eigentümer, Mieter & Besucher.", image: "/images/sf-unterhalts.jpg", icon: "RefreshCw" },
  { slug: "kita-schulen", name: "Kita & Schulen", desc: "Saubere und sichere Umgebungen für Kinder und Jugendliche.", image: "/images/sf-kita.jpg", icon: "GraduationCap" },
  { slug: "pv-solar", name: "PV & Solaranlagenreinigung", desc: "Mehr Leistung durch saubere Solaranlagen – nachhaltig und sicher.", image: "/images/sf-solar.jpg", icon: "SunMedium" },
];

export const FEATURES = [
  { icon: "GraduationCap", title: "Geschultes Personal", desc: "Alle Mitarbeiter sind geprüft, geschult und fest angestellt." },
  { icon: "ShieldCheck", title: "Versichert & abgesichert", desc: "10 Mio. € Betriebshaftpflicht für Ihre Sicherheit." },
  { icon: "BadgeCheck", title: "Konstante Qualität", desc: "Regelmäßige Kontrollen und digitale Qualitätschecks." },
  { icon: "UserCheck", title: "Fester Ansprechpartner", desc: "Ein Ansprechpartner für alle Anliegen – immer erreichbar." },
  { icon: "FileText", title: "Transparente Abläufe", desc: "Klare Prozesse, digitale Einsatzpläne & Berichte." },
  { icon: "HeartHandshake", title: "Zufriedenheitsgarantie", desc: "Nicht zufrieden? Wir finden sofort eine Lösung." },
];

export const STATS = [
  { icon: "Clock", value: "12+", label: "Jahre Erfahrung" },
  { icon: "Users", value: "1.200+", label: "Kunden vertrauen uns" },
  { icon: "Ruler", value: "2.500.000+", label: "m² gereinigte Fläche" },
  { icon: "Smile", value: "98%", label: "Zufriedene Kunden" },
];

// Trust-Siegel (verifizierbare Qualitäts- & Sicherheitsmerkmale statt fremder Kundenlogos).
export type TrustSeal = { icon: string; label: string };
export const TRUST_SEALS: TrustSeal[] = [
  { icon: "Award", label: "Innungsbetrieb" },
  { icon: "ShieldCheck", label: "10 Mio € Haftpflicht" },
  { icon: "BadgeCheck", label: "Geprüfte Qualität" },
  { icon: "Leaf", label: "Öko-zertifiziert" },
  { icon: "UserCheck", label: "Festes Fachpersonal" },
];

// Zentrale Marke – Name & Untertitel an EINER Stelle ändern.
export const BRAND = {
  name: "Deutsche Gebäudedienste",
  subtitle: "Professionelle Reinigung",
};

export const CONTACT = {
  phone: "+49 152 07306840",
  hours: "Mo – Fr: 8:00 – 18:00 Uhr",
  email: "info@dgd-facility.de",
  web: "dgd-facility.de",
  address: ["Deutsche Gebäudedienste", "Rellinger Weg 24", "22457 Hamburg"],
};

// Basis-URL für canonical, sitemap, robots, OpenGraph & JSON-LD.
// Fail-fast: In Produktion MUSS NEXT_PUBLIC_APP_URL gesetzt sein, sonst würden
// alle URLs auf localhost zeigen (= faktische Nichtindexierung).
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
if (process.env.NODE_ENV === "production" && !APP_URL) {
  throw new Error(
    "NEXT_PUBLIC_APP_URL fehlt. Setze die Produktions-Domain (ohne Trailing-Slash), " +
      "z. B. NEXT_PUBLIC_APP_URL=https://www.deutsche-gebaeudedienste.de – sonst zeigen " +
      "canonical-URLs, sitemap.xml, robots.txt und JSON-LD auf localhost.",
  );
}

export const SITE = {
  url: (APP_URL || "http://localhost:3000").replace(/\/$/, ""),
  area: "ganz Deutschland",
};

// Zielgruppen-Seiten ("Für wen"). image = wiederverwendetes Hero-Bild.
export type Target = {
  slug: string;
  name: string;
  short: string;
  image: string;
  services: string[]; // passende Leistungs-Slugs
};

export const TARGETS: Target[] = [
  { slug: "hotels-gastronomie", name: "Hotels & Gastronomie", short: "Diskrete, gründliche Reinigung für Zimmer, Lobby & Gastraum.", image: "/images/sf-hotel.jpg", services: ["hotelreinigung", "glasreinigung", "unterhaltsreinigung"] },
  { slug: "buero-verwaltung", name: "Büro & Verwaltung", short: "Sauberes Arbeitsumfeld für mehr Produktivität.", image: "/images/sf-buero.jpg", services: ["bueroreinigung", "glasreinigung", "unterhaltsreinigung"] },
  { slug: "praxen-gesundheit", name: "Praxen & Gesundheit", short: "Hygienisch sauber für Patienten und Personal.", image: "/images/sf-praxis.jpg", services: ["praxisreinigung", "unterhaltsreinigung", "glasreinigung"] },
  { slug: "immobilien-hausverwaltung", name: "Immobilien & Hausverwaltung", short: "Gepflegte Objekte – von Treppenhaus bis Bauendreinigung.", image: "/images/sf-treppenhaus.jpg", services: ["treppenhausreinigung", "unterhaltsreinigung", "bauendreinigung"] },
  { slug: "industrie-gewerbe", name: "Industrie & Gewerbe", short: "Leistungsstark auf großen Flächen und Sonderanforderungen.", image: "/images/sf-industrie.jpg", services: ["industriereinigung", "bauendreinigung", "pv-solar"] },
];

export function getTarget(slug: string): Target | undefined {
  return TARGETS.find((t) => t.slug === slug);
}

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

// Unternehmens-Seiten für Footer/Sitemap.
export const COMPANY_PAGES = [
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/ratgeber", label: "Ratgeber" },
  { href: "/referenzen", label: "Referenzen" },
  { href: "/qualitaet", label: "Qualität & Standards" },
  { href: "/karriere", label: "Karriere" },
  { href: "/kontakt", label: "Kontakt" },
];

export const LEGAL_PAGES = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
];

// Konkrete Leistungsversprechen (USP-Zeile).
export const USPS = [
  { icon: "Clock", title: "Angebot in 5 Min.", desc: "Festpreis statt Warteschleife" },
  { icon: "RefreshCw", title: "Keine Mindestlaufzeit", desc: "Monatlich kündbar" },
  { icon: "Sparkles", title: "Material inklusive", desc: "Mittel & Geräte im Preis" },
  { icon: "Users", title: "Feste Teams", desc: "Festangestellt, keine Subunternehmer" },
];

// Problem → Lösung.
export const PAINS = [
  "Ständig wechselndes Personal – niemand kennt Ihr Objekt",
  "Schwankende Qualität ohne nachvollziehbare Kontrollen",
  "Kein fester Ansprechpartner, wenn mal etwas ist",
  "Versteckte Kosten und undurchsichtige Abrechnung",
];
export const SOLUTIONS = [
  "Feste, geschulte Teams mit persönlichem Ansprechpartner",
  "Dokumentierte Qualitätskontrollen nach klarer Checkliste",
  "Transparenter Festpreis – ohne Stundenlohn-Risiko",
  "Schnelle Erreichbarkeit und Reaktion bei Sonderwünschen",
];

// Ablauf in 3 Schritten.
export const STEPS = [
  { n: "1", icon: "Phone", title: "Anfrage & Festpreis", desc: "Sie schildern Ihr Objekt – in nur 5 Minuten erhalten Sie ein transparentes Festpreis-Angebot." },
  { n: "2", icon: "UserCheck", title: "Besichtigung & Plan", desc: "Vor-Ort-Termin, fester Ansprechpartner und ein Reinigungsplan, der zu Ihrem Betrieb passt." },
  { n: "3", icon: "BadgeCheck", title: "Start & Kontrolle", desc: "Ihr festes Team legt los – mit dokumentierter Qualitätskontrolle ab dem ersten Einsatz." },
];

// Städte-Landingpages (lokale SEO / Google Ads pro Stadt + Umkreis). name = Anzeige, slug = URL.
export type Stadt = { slug: string; name: string };
export const STAEDTE: Stadt[] = [
  { slug: "hamburg", name: "Hamburg" },
  { slug: "hannover", name: "Hannover" },
  { slug: "bremen", name: "Bremen" },
  { slug: "frankfurt", name: "Frankfurt am Main" },
];

export function getStadt(slug: string): Stadt | undefined {
  return STAEDTE.find((s) => s.slug === slug);
}
