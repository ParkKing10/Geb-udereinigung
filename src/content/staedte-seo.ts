// Lokaler Content je Stadt-Landingpage (Stadt + Umkreis, für Google Ads).
export type StadtSeo = { metaDescription: string; intro: string; seoText: string[]; faq: { q: string; a: string }[] };

export const STAEDTE_SEO: Record<string, StadtSeo> = {
  "hamburg": {
    metaDescription: "Gebäudereinigung in Hamburg & Umland: Büros, Praxen, Treppenhäuser & Gewerbe – zuverlässig zum Festpreis. Ihr Reinigungsdienst direkt aus Hamburg. Jetzt Angebot sichern!",
    intro: "Gebäudereinigung direkt aus Hamburg – wir sind hier zu Hause. Von Altona, Eimsbüttel und der HafenCity über Winterhude und Wandsbek bis Harburg und Bergedorf reinigen wir Büros, Praxen, Treppenhäuser und Gewerbeobjekte zuverlässig und zum Festpreis – in der ganzen Stadt und im Umland.",
    seoText: [
      "Als Hamburger Gebäudereinigung mit Sitz im Nordwesten der Stadt kennen wir die Region wie kaum ein anderer Dienstleister. Wir betreuen Büros in der HafenCity und der City Nord, Arztpraxen in Eppendorf und Winterhude, Kanzleien an der Alster, Ladenflächen in der Innenstadt und in Altona sowie Logistik- und Produktionshallen in Harburg, Billbrook und Rothenburgsort. Unser Leistungsspektrum umfasst Unterhaltsreinigung, Treppenhausreinigung für Hausverwaltungen und Wohnanlagen, Glas- und Fensterreinigung, Grund- und Bauendreinigung sowie Praxis- und Hotelreinigung nach Hygienestandard.",
      "Auch im Hamburger Umland sind unsere festen Teams regelmäßig im Einsatz – von Norderstedt, Pinneberg und Schenefeld über Ahrensburg und Reinbek bis Buxtehude und Seevetal. Weil wir direkt aus Hamburg kommen, sind wir schnell vor Ort, auch bei kurzfristigem Bedarf oder Sonderreinigungen. Sie erhalten immer dieselben geschulten Ansprechpartner, einen transparenten Festpreis ohne versteckte Kosten und eine dokumentierte Qualitätskontrolle ab dem ersten Einsatz. Fordern Sie jetzt Ihr kostenloses Festpreis-Angebot für Ihre Gebäudereinigung in Hamburg an – in nur 60 Sekunden.",
    ],
    faq: [
      { q: "Seid ihr wirklich direkt aus Hamburg, oder kommt ihr von auswärts?", a: "Wir sitzen im Nordwesten Hamburgs und sind von hier aus deutschlandweit tätig. Für Objekte in Hamburg und im Umland bedeutet das kurze Wege, schnelle Termine und Teams, die die Stadt und ihre Stadtteile wirklich kennen." },
      { q: "Welche Stadtteile und Umlandgemeinden deckt ihr ab?", a: "Wir reinigen in der gesamten Stadt – von Altona, Eimsbüttel und der HafenCity über Winterhude, Wandsbek und Eppendorf bis Harburg und Bergedorf. Im Umland sind wir unter anderem in Norderstedt, Pinneberg, Ahrensburg, Reinbek, Buxtehude und Seevetal regelmäßig im Einsatz." },
      { q: "Wie kurzfristig könnt ihr in Hamburg reinigen?", a: "Da wir direkt vor Ort sitzen, sind unsere Teams auch bei kurzfristigem Bedarf oder ungeplanten Sonderreinigungen schnell einsatzbereit – ohne lange Anfahrtswege wie bei überregionalen Anbietern." },
      { q: "Was kostet die Gebäudereinigung in Hamburg?", a: "Das hängt von Fläche, Frequenz und Leistungsumfang Ihres Objekts ab. Über unser Sofort-Angebot erhalten Sie in wenigen Minuten einen transparenten Festpreis – unverbindlich und ohne versteckte Kosten." },
    ],
  },
  "hannover": {
    metaDescription: "Gebäudereinigung in Hannover: Büros, Praxen & Objekte in der City und Region professionell gereinigt. Feste Teams, Festpreis. Jetzt kostenloses Angebot sichern!",
    intro: "Professionelle Gebäudereinigung in Hannover und Umgebung – von der City über die List und Linden bis nach Langenhagen, Garbsen und Laatzen. Zuverlässige Reinigung für Büros, Praxen, Handel und Gewerbe in der ganzen Region.",
    seoText: [
      "Ob Büroetage am Aegidientorplatz, Arztpraxis in der List, Ladenlokal in Linden oder Produktionshalle im Umland – wir übernehmen die Gebäudereinigung für Unternehmen in Hannover und der gesamten Region. Unser Leistungsspektrum reicht von der regelmäßigen Unterhaltsreinigung über Glas- und Fensterreinigung bis zur Grund- und Bauendreinigung. Auch Kanzleien, Autohäuser und Pflegeeinrichtungen zwischen Garbsen, Laatzen und Langenhagen betreuen wir zuverlässig und nach Hygienestandard.",
      "Als Deutsche Gebäudedienste arbeiten wir deutschlandweit mit festen, geschulten Reinigungsteams – so kennt Ihr Objekt in Hannover immer dieselben Ansprechpartner. Sie erhalten einen transparenten Festpreis ohne versteckte Kosten, kurze Reaktionszeiten und eine feste Qualitätskontrolle. Auch bei kurzfristigem Bedarf oder Sonderreinigungen sind wir schnell vor Ort. Fordern Sie jetzt Ihr kostenloses Festpreis-Angebot für Ihre Gebäudereinigung in Hannover an.",
    ],
    faq: [
      { q: "Welche Stadtteile in Hannover deckt ihr ab?", a: "Wir sind in der ganzen Stadt im Einsatz – vom Aegidientorplatz über die List und Linden bis ins Umland nach Garbsen, Laatzen und Langenhagen. Auch außerhalb dieser Gebiete fragen Sie gern an, wir erweitern unser Einsatzgebiet laufend." },
      { q: "Reinigt ihr nur Büros oder auch Praxen und Handel in Hannover?", a: "Wir übernehmen alle Objektarten: Büroetagen, Arztpraxen, Ladenlokale, Kanzleien, Autohäuser und Pflegeeinrichtungen – jeweils mit dem passenden Hygienestandard und Reinigungsplan." },
      { q: "Gibt es in Hannover einen festen Ansprechpartner?", a: "Ja. Sie erhalten dasselbe geschulte Team und denselben Ansprechpartner bei jedem Termin – keine wechselnden Gesichter, keine Qualitätsschwankungen." },
      { q: "Wie schnell könnt ihr in Hannover starten?", a: "In der Regel innerhalb weniger Tage nach Angebotsannahme. Bei kurzfristigem Bedarf oder Sonderreinigungen sind unsere Teams vor Ort meist noch schneller einsatzbereit." },
    ],
  },
  "bremen": {
    metaDescription: "Gebäudereinigung in Bremen & Umkreis: Büros, Praxen, Treppenhäuser & Gewerbe – von den Deutschen Gebäudediensten. Jetzt kostenloses Festpreis-Angebot sichern.",
    intro: "Professionelle Gebäudereinigung in Bremen und im Umland – von der Überseestadt und Schwachhausen bis Delmenhorst, Stuhr und Achim. Wir reinigen Büros, Praxen, Treppenhäuser und Gewerbeobjekte zuverlässig und zum Festpreis.",
    seoText: [
      "In Bremen betreuen die Deutschen Gebäudedienste Büros in der Überseestadt, Arztpraxen in Schwachhausen, Einzelhandel in der Innenstadt sowie Logistik- und Produktionshallen rund um das Güterverkehrszentrum und die Airport-Stadt. Ob Unterhaltsreinigung, Treppenhausreinigung in Wohnanlagen, Glas- und Fensterreinigung oder Grundreinigung nach Umbau – wir übernehmen alle Objektarten. Auch im Umkreis, etwa in Delmenhorst, Stuhr, Weyhe und Achim, sind unsere Teams regelmäßig im Einsatz.",
      "Warum die Deutschen Gebäudedienste in Bremen? Weil feste, geschulte Reinigungsteams Ihr Objekt betreuen – dieselben Gesichter, gleichbleibende Qualität. Sie erhalten einen verbindlichen Festpreis ohne versteckte Kosten, planbare Termine und eine schnelle Reaktion bei kurzfristigem Bedarf. Als deutschlandweit tätiger Dienstleister mit klaren Standards verbinden wir überregionale Zuverlässigkeit mit echtem Einsatz vor Ort. Fordern Sie jetzt Ihr kostenloses Festpreis-Angebot für Bremen an.",
    ],
    faq: [
      { q: "Reinigt ihr auch Logistik- und Produktionshallen am Bremer GVZ?", a: "Ja, Industrie- und Logistikflächen rund um das Güterverkehrszentrum und die Airport-Stadt gehören zu unserem Alltag – inklusive großer Flächen und speziellen Sicherheitsanforderungen." },
      { q: "Welche Bereiche in Bremen und Umgebung deckt ihr ab?", a: "Wir sind in der Überseestadt, in Schwachhausen und der Innenstadt aktiv sowie im Umkreis in Delmenhorst, Stuhr, Weyhe und Achim. Liegt Ihr Objekt außerhalb dieser Liste, fragen Sie trotzdem gern an." },
      { q: "Was, wenn ich mehrere Objekte in Bremen betreue?", a: "Kein Problem – Sie erhalten einen zentralen Ansprechpartner für alle Standorte und einheitliche Qualitätsstandards über Ihr gesamtes Portfolio hinweg." },
      { q: "Ist eine Grundreinigung nach Umbau oder Renovierung möglich?", a: "Ja, auch einmalige Grund- und Bauendreinigungen nach Umbau, Renovierung oder Mieterwechsel übernehmen wir in Bremen und im gesamten Umland." },
    ],
  },
  "frankfurt": {
    metaDescription: "Gebäudereinigung in Frankfurt am Main und Umgebung: Büros, Praxen, Treppenhäuser & mehr – zuverlässig gereinigt. Jetzt Festpreis-Angebot der DGD sichern.",
    intro: "Ob Büroturm im Bankenviertel, Praxis in Sachsenhausen oder Ladenfläche an der Zeil – die DGD reinigt zuverlässig in ganz Frankfurt am Main und im Rhein-Main-Gebiet.",
    seoText: [
      "In Frankfurt am Main und im gesamten Rhein-Main-Gebiet übernimmt die Deutsche Gebäudedienste die Reinigung von Büros, Kanzleien, Arztpraxen, Kitas und Ladenlokalen. Ob Bürohochhaus im Bankenviertel, Treppenhaus in Sachsenhausen oder Verkaufsfläche an der Zeil – wir kümmern uns um Unterhaltsreinigung, Glas- und Fensterreinigung, Grundreinigung und Treppenhausreinigung. Auch im Umland von Offenbach über Bad Homburg bis Eschborn sind wir regelmäßig für Sie im Einsatz.",
      "Warum die DGD? Wir arbeiten mit festen, eingespielten Teams, die Ihr Objekt kennen und immer wiederkommen. Sie erhalten einen klaren Festpreis ohne versteckte Kosten, deutschlandweite Standards mit persönlichem Ansprechpartner vor Ort und eine schnelle Reaktion, wenn es einmal kurzfristig sein muss. Vom Sitz in Hamburg aus koordinieren wir Einsätze bundesweit – auch in Frankfurt. Fordern Sie jetzt Ihr unverbindliches Festpreis-Angebot an.",
    ],
    faq: [
      { q: "Reinigt ihr auch Bürotürme im Bankenviertel?", a: "Ja, Bürohochhäuser im Bankenviertel gehören zu unseren regelmäßigen Einsätzen in Frankfurt – inklusive Glasfassaden- und Fensterreinigung in der Höhe." },
      { q: "Welche Region um Frankfurt deckt ihr ab?", a: "Neben Frankfurt selbst sind wir im gesamten Rhein-Main-Gebiet aktiv, unter anderem in Offenbach, Bad Homburg und Eschborn." },
      { q: "Sitzt ihr in Frankfurt, oder koordiniert ihr von auswärts?", a: "Unser Firmensitz ist in Hamburg, von dort koordinieren wir deutschlandweit – die eigentliche Reinigung übernehmen aber feste, eingespielte Teams direkt vor Ort in Frankfurt und Rhein-Main." },
      { q: "Ist die Gebäudereinigung in Frankfurt teurer als anderswo?", a: "Nein. Der Festpreis richtet sich nach Fläche, Frequenz und Leistungsumfang Ihres Objekts, nicht nach der Region – unsere Kalkulation ist deutschlandweit einheitlich transparent." },
    ],
  },
};
