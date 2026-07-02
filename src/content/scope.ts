// Leistungsumfang je Seite – ersetzt das frühere Doppelbild im Vorteile-Split.
// Pro Seite einzigartige, konkrete Inhalte (gut für SEO & Differenzierung).
export type Scope = { title: string; items: string[] };

export const SERVICE_SCOPE: Record<string, Scope> = {
  hotelreinigung: {
    title: "Leistungsumfang",
    items: [
      "Tägliche Zimmer- und Bettenreinigung",
      "Bad- und Sanitärdesinfektion im Gästezimmer",
      "Lobby, Rezeption und Aufzugskabinen",
      "Frühstücksraum und öffentliche Gästetoiletten",
      "Wellnessbereich, Sauna und Poolumgang",
      "Handtuch- und Bettwäschewechsel",
    ],
  },
  bueroreinigung: {
    title: "Leistungsumfang",
    items: [
      "Schreibtische und Arbeitsflächen abwischen",
      "Alle Bodenbeläge saugen und wischen",
      "Papierkörbe leeren und neu auskleiden",
      "Sanitär reinigen und Verbrauchsmittel auffüllen",
      "Teeküchen und Pausenbereiche reinigen",
      "Türgriffe und Lichtschalter desinfizieren",
    ],
  },
  treppenhausreinigung: {
    title: "Leistungsumfang",
    items: [
      "Treppenstufen feucht und nass wischen",
      "Handläufe und Geländer abwischen",
      "Hauseingangstüren und Briefkastenanlage säubern",
      "Fensterbänke und Etagenflächen wischen",
      "Spinnweben in Ecken entfernen",
      "Aufzugskabine und Bedienelemente reinigen",
    ],
  },
  praxisreinigung: {
    title: "Leistungsumfang",
    items: [
      "Flächendesinfektion in Behandlungs- und Eingriffsräumen",
      "Hygienereinigung von Wartezimmer und Empfang",
      "Aufbereitung der Sanitär- und Patienten-WCs",
      "Türgriffe und Kontaktflächen desinfizieren",
      "Reinigung nach RKI-Vorgaben dokumentiert",
      "Entsorgung medizinischer Abfälle nach Vorschrift",
    ],
  },
  industriereinigung: {
    title: "Leistungsumfang",
    items: [
      "Maschinen- und Anlagenreinigung im Produktionsbetrieb",
      "Industrieböden entölen und entfetten",
      "Hallen- und Lagerflächen großflächig reinigen",
      "Stahlträger und Rohrleitungen entstauben",
      "Produktionsrückstände fachgerecht entfernen",
      "Hochdruck- und Trockeneisstrahlreinigung",
    ],
  },
  glasreinigung: {
    title: "Leistungsumfang",
    items: [
      "Fensterscheiben innen und außen reinigen",
      "Rahmen, Falze und Fensterbänke säubern",
      "Glastüren, Schaufenster und Eingangsbereiche",
      "Glasfassaden und Wintergärten in der Höhe",
      "Reinigung per Hebebühne oder Osmose-Teleskop",
      "Kalk-, Zement- und Klebeschleier entfernen",
    ],
  },
  bauendreinigung: {
    title: "Leistungsumfang",
    items: [
      "Bauschmutz und Mörtelreste entfernen",
      "Fenster, Rahmen und Glasflächen schlierenfrei",
      "Estrich, Fliesen und Bodenbeläge grundreinigen",
      "Sanitär, Armaturen und Heizkörper entstauben",
      "Farb-, Kleber- und Silikonreste ablösen",
      "Besenreine Übergabe mit Endkontrolle",
    ],
  },
  unterhaltsreinigung: {
    title: "Leistungsumfang",
    items: [
      "Böden saugen, wischen und pflegen",
      "Geländer, Handläufe und Briefkastenanlagen abwischen",
      "Glasflächen an Türen und Eingängen",
      "Sanitär- und Gemeinschaftsräume reinigen",
      "Papierkörbe leeren und Müllraum pflegen",
      "Tonnen bereitstellen und zurückräumen",
    ],
  },
  "kita-schulen": {
    title: "Leistungsumfang",
    items: [
      "Hygienische Reinigung von Wasch- und Sanitärräumen",
      "Türklinken und Kontaktflächen desinfizieren",
      "Gruppenräume und Klassenzimmer reinigen",
      "Teppich- und Bodenpflege in Aulen",
      "Mensa, Küche und Spielbereiche säubern",
      "Fensterreinigung in Reichweite der Kinder",
    ],
  },
  "pv-solar": {
    title: "Leistungsumfang",
    items: [
      "Schonende Modulreinigung mit entmineralisiertem Wasser",
      "Moos, Flechten und Vogelkot entfernen",
      "Aufdach- und Indach-Anlagen reinigen",
      "Solarthermie- und Warmwasserkollektoren säubern",
      "Sichtkontrolle auf Verschmutzung und Belag",
      "Dach- und Freiflächenanlagen vor Ort",
    ],
  },
};

export const TARGET_SCOPE: Record<string, Scope> = {
  "hotels-gastronomie": {
    title: "Das übernehmen wir für Sie",
    items: [
      "Zimmerreinigung nach jedem Gästewechsel",
      "Gastraum, Tische und Bestuhlung reinigen",
      "Bar-, Theken- und Servicebereiche pflegen",
      "Sanitär- und Wellnessbereiche hygienisch aufbereiten",
      "Spiegel, Glasflächen und Eingänge polieren",
      "Diskrete Reinigung außerhalb der Gästezeiten",
    ],
  },
  "buero-verwaltung": {
    title: "Das übernehmen wir für Sie",
    items: [
      "Arbeitsplätze, Tastaturen und Bildschirme abwischen",
      "Teeküchen und Sozialräume hygienisch reinigen",
      "Böden saugen, wischen und Teppiche pflegen",
      "Sanitäranlagen reinigen und Spender befüllen",
      "Aktenschränke und Ablageflächen entstauben",
      "Konferenz- und Empfangsräume aufbereiten",
    ],
  },
  "praxen-gesundheit": {
    title: "Das übernehmen wir für Sie",
    items: [
      "Flächendesinfektion in Sprech- und Behandlungszimmern",
      "Hygienische Reinigung von Wartebereich und Empfang",
      "Wasch- und Sanitärräume mit Spenderbefüllung",
      "Kontaktflächen, Tresen und Türgriffe desinfizieren",
      "Bodenpflege auf desinfektionsfähigen Belägen",
      "Sachgerechte Entsorgung medizinischer Abfälle",
    ],
  },
  "immobilien-hausverwaltung": {
    title: "Das übernehmen wir für Sie",
    items: [
      "Treppenhausreinigung nach festem Turnus",
      "Aufzüge und Eingangsbereiche pflegen",
      "Winterdienst und Außenanlagen-Reinigung",
      "Mülltonnenplätze säubern und desinfizieren",
      "Gemeinschaftsräume und Kellerflure reinigen",
      "Glas- und Fensterreinigung im Gemeinschaftsbereich",
    ],
  },
  "industrie-gewerbe": {
    title: "Das übernehmen wir für Sie",
    items: [
      "Produktions- und Lagerhallen großflächig reinigen",
      "Maschinen und Anlagen im laufenden Betrieb",
      "Industrieböden maschinell scheuersaugen und beschichten",
      "Hallendächer, Lichtbänder und Oberlichter reinigen",
      "Sozial-, Sanitär- und Pausenräume pflegen",
      "Bauend- und Sonderreinigung nach Umbauten",
    ],
  },
};
