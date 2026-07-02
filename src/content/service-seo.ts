// Eindeutige SEO-Inhalte je Leistungs-Unterseite (deutschlandweit).
export type ServiceSeo = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroSub: string;
  benefits: string[];
  suitableFor: string[];
  faq: { q: string; a: string }[];
  seoTitle: string;
  seoText: string[];
};

export const SERVICE_SEO: Record<string, ServiceSeo> = {
  "hotelreinigung": {
    metaTitle: "Hotelreinigung vom Profi",
    metaDescription: "Professionelle Hotelreinigung deutschlandweit: Zimmer, Lobby & Sanitär diskret und gründlich gereinigt. Jetzt unverbindlich Angebot anfragen.",
    h1: "Professionelle Hotelreinigung",
    heroSub: "Saubere Zimmer, glückliche Gäste: Wir reinigen Ihr Hotel deutschlandweit diskret, gründlich und zuverlässig – vom Gästezimmer bis zur Lobby.",
    benefits: [
      "Diskretes, geschultes Reinigungspersonal, das den laufenden Hotelbetrieb nicht stört",
      "Feste Ansprechpartner und geregelte Turnusse – auch für Früh-, Spät- und Wochenendschichten",
      "Gründliche Zimmer- und Sanitärreinigung nach Hygienestandards für Top-Gästebewertungen",
      "Deutschlandweiter Einsatz mit einheitlicher Qualität für Einzelhäuser und Hotelketten",
    ],
    suitableFor: [
      "Stadt-, Business- und Tagungshotels mit hoher Zimmerauslastung",
      "Ferien- und Wellnesshotels sowie Resorts mit saisonalen Spitzen",
      "Aparthotels, Boardinghäuser und Hotelketten mit mehreren Standorten",
    ],
    faq: [
      { q: "Stört die Reinigung den laufenden Hotelbetrieb?", a: "Nein. Unser Personal arbeitet diskret und flexibel – etwa während der Check-out-Zeiten oder in Randzeiten. Turnusse und Schichten stimmen wir individuell auf Ihre Auslastung und Ihren Ablaufplan ab, damit Gäste und Rezeption ungestört bleiben." },
      { q: "Welche Bereiche umfasst die Hotelreinigung?", a: "Wir übernehmen die komplette Reinigung: Gästezimmer und Betten, Bäder und Sanitäranlagen, Lobby, Flure, Frühstücks- und Tagungsräume sowie Personal- und Nebenbereiche. Umfang und Frequenz legen wir gemeinsam fest und dokumentieren sie transparent." },
      { q: "Sind Sie auch für Hotelketten an mehreren Standorten tätig?", a: "Ja. Wir arbeiten deutschlandweit und betreuen Einzelhäuser genauso wie Ketten mit mehreren Standorten – mit einheitlichen Qualitätsstandards, klaren Ansprechpartnern und nachvollziehbarer Leistungsdokumentation je Objekt." },
    ],
    seoTitle: "Hotelreinigung, die Gäste überzeugt",
    seoText: [
      "Ein sauberes Hotel entscheidet über den ersten Eindruck und die nächste Bewertung. Deutsche Gebäudedienste übernimmt die professionelle Hotelreinigung deutschlandweit – vom frisch aufbereiteten Gästezimmer über glänzende Sanitäranlagen bis zur einladenden Lobby. Unser geschultes Personal arbeitet diskret im Hintergrund, hält vereinbarte Hygienestandards ein und sorgt dafür, dass sich Ihre Gäste rundum wohlfühlen. So bleibt Ihr Team am Empfang entlastet und kann sich auf den Service konzentrieren.",
      "Ob Business-, Ferien- oder Tagungshotel, Aparthotel oder Kette mit mehreren Häusern: Wir passen Turnusse, Schichten und Leistungsumfang genau an Ihren Betrieb und Ihre Auslastung an. Feste Ansprechpartner, verlässliche Abläufe und eine transparente Dokumentation gehören für uns zum Standard. Als bundesweit tätiger Gebäudedienstleister sichern wir an jedem Standort in ganz Deutschland gleichbleibende Qualität – gründlich, planbar und ohne Störung des laufenden Hotelbetriebs.",
    ],
  },
  "bueroreinigung": {
    metaTitle: "Büroreinigung – bundesweit & zuverlässig",
    metaDescription: "Professionelle Büroreinigung deutschlandweit: geschulte Reinigungskräfte, feste Ansprechpartner und planbare Qualität. Jetzt unverbindlich Angebot anfordern.",
    h1: "Professionelle Büroreinigung",
    heroSub: "Ein sauberes Büro steigert Wohlbefinden und Produktivität. Deutsche Gebäudedienste reinigt Ihre Arbeitsräume deutschlandweit – gründlich, diskret und zu planbaren Konditionen.",
    benefits: [
      "Geschulte Reinigungskräfte mit festem Ansprechpartner für gleichbleibende Qualität",
      "Flexible Reinigungsintervalle – von einmal wöchentlich bis täglich, ganz nach Bedarf",
      "Diskrete Reinigung außerhalb Ihrer Kernarbeitszeiten, ohne Betriebsablauf zu stören",
      "Umweltschonende Reinigungsmittel und dokumentierte, nachvollziehbare Qualitätskontrolle",
    ],
    suitableFor: [
      "Büros, Kanzleien und Agenturen mit regelmäßigem Publikumsverkehr",
      "Coworking-Spaces und Großraumbüros mit hoher Mitarbeiterdichte",
      "Verwaltungsgebäude, Arztpraxen und Filialen mit erhöhten Hygieneanforderungen",
    ],
    faq: [
      { q: "Wann wird mein Büro gereinigt – während oder nach der Arbeitszeit?", a: "Ganz nach Ihrem Wunsch. Viele Kunden bevorzugen die Reinigung in den frühen Morgen- oder Abendstunden, damit der Betriebsablauf ungestört bleibt. Wir stimmen die Zeiten individuell mit Ihnen ab und arbeiten deutschlandweit auch außerhalb Ihrer Kernarbeitszeiten." },
      { q: "Wie oft sollte ein Büro professionell gereinigt werden?", a: "Das hängt von Mitarbeiterzahl, Publikumsverkehr und Branche ab. Reine Schreibtischbüros kommen oft mit ein bis zwei Terminen pro Woche aus, stark frequentierte Flächen sowie Sanitär- und Küchenbereiche sollten täglich gereinigt werden. Wir empfehlen Ihnen die passende Frequenz und passen sie jederzeit an." },
      { q: "Sind Reinigungsmittel und Verbrauchsmaterialien inklusive?", a: "In der Regel ja. Reinigungsmittel und Ausrüstung bringen unsere Teams mit; auf Wunsch übernehmen wir auch die Auffüllung von Verbrauchsmaterialien wie Seife, Papierhandtüchern und Toilettenpapier. Den genauen Leistungsumfang halten wir transparent in Ihrem Angebot fest." },
    ],
    seoTitle: "Büroreinigung, die sich im Arbeitsalltag auszahlt",
    seoText: [
      "Ein gepflegtes Arbeitsumfeld ist mehr als eine Frage der Optik: Saubere Schreibtische, hygienische Sanitärbereiche und frische Luft senken den Krankenstand, hinterlassen bei Kunden einen professionellen Eindruck und wirken sich messbar auf die Produktivität aus. Deutsche Gebäudedienste übernimmt die regelmäßige Unterhaltsreinigung Ihrer Büroflächen bundesweit – von der Reinigung der Arbeitsplätze und Böden über Küchen und Teeküchen bis zu Sanitäranlagen, Glasflächen und Empfangsbereichen. Geschulte Reinigungskräfte arbeiten nach klar definierten Reinigungsplänen, damit die Qualität an jedem Standort gleich zuverlässig bleibt.",
      "Wir richten unsere Leistung an Ihrem Betriebsalltag aus, nicht umgekehrt. Sie erhalten einen festen Ansprechpartner, flexibel wählbare Intervalle und eine Reinigung, die diskret im Hintergrund abläuft. Durch dokumentierte Qualitätskontrollen und den Einsatz umweltschonender Mittel behalten Sie jederzeit den Überblick über Umfang und Ergebnis. Ob einzelnes Büro, mehrere Etagen oder verteilte Standorte in ganz Deutschland – wir skalieren unsere Teams passgenau und sorgen dafür, dass Ihre Mitarbeitenden jeden Morgen in ein einladendes, sauberes Umfeld starten. Fordern Sie jetzt unverbindlich Ihr Angebot an.",
    ],
  },
  "treppenhausreinigung": {
    metaTitle: "Treppenhausreinigung deutschlandweit",
    metaDescription: "Regelmäßige Treppenhausreinigung für gepflegte Eingangsbereiche – bundesweit im Einsatz, feste Reinigungspläne, geschulte Teams. Jetzt Angebot anfordern.",
    h1: "Professionelle Treppenhausreinigung",
    heroSub: "Saubere Treppenhäuser und einladende Eingangsbereiche – zuverlässig, nach festem Plan und deutschlandweit von den Deutschen Gebäudediensten übernommen.",
    benefits: [
      "Feste Reinigungsintervalle mit dokumentierten Nachweisen – Sie sehen jederzeit, wann welche Etage gereinigt wurde",
      "Geschulte Reinigungsteams mit eigenen Maschinen und Materialien für Treppen, Handläufe, Geländer und Aufzüge",
      "Ein zentraler Ansprechpartner statt vieler Einzelabsprachen – bundesweit einheitliche Qualitätsstandards",
      "Flexible Frequenz von wöchentlich bis mehrmals täglich, abgestimmt auf Nutzung und Personenaufkommen im Objekt",
    ],
    suitableFor: [
      "Wohnanlagen und Mehrfamilienhäuser mit gemeinschaftlich genutzten Treppenhäusern",
      "Hausverwaltungen und Wohnungsbaugesellschaften mit größeren Immobilienbeständen",
      "Büro- und Geschäftshäuser mit stark frequentierten Eingangs- und Treppenbereichen",
    ],
    faq: [
      { q: "Wie oft sollte ein Treppenhaus gereinigt werden?", a: "Das hängt von der Nutzung ab. In Wohnanlagen mit wenigen Parteien genügt oft eine wöchentliche Reinigung, während stark frequentierte Geschäftshäuser mehrere Termine pro Woche oder eine tägliche Reinigung benötigen. Wir stimmen die Frequenz individuell auf Ihr Objekt und das Personenaufkommen ab und halten sie im Reinigungsplan verbindlich fest." },
      { q: "Was gehört alles zur Treppenhausreinigung?", a: "Standardmäßig reinigen wir Treppenstufen, Podeste, Handläufe und Geländer, wischen Eingangsbereiche und entfernen Spinnweben. Auf Wunsch kommen Fensterbänke, Aufzugkabinen, Briefkastenanlagen, Kellerabgänge sowie das Reinigen von Glasflächen und Türen hinzu. Der genaue Leistungsumfang wird vorab schriftlich festgelegt." },
      { q: "Sind die Deutschen Gebäudedienste bundesweit verfügbar?", a: "Ja. Wir sind deutschlandweit im Einsatz und betreuen Objekte in ganz Deutschland – von der einzelnen Wohnanlage bis zum verteilten Immobilienbestand. Dank einheitlicher Qualitätsstandards und zentraler Koordination erhalten Sie an jedem Standort dieselbe verlässliche Reinigungsqualität mit einem festen Ansprechpartner." },
    ],
    seoTitle: "Treppenhausreinigung mit System – für dauerhaft gepflegte Eingangsbereiche",
    seoText: [
      "Das Treppenhaus ist die Visitenkarte jeder Immobilie: Es ist der erste Bereich, den Bewohner, Mieter und Besucher betreten, und prägt den Gesamteindruck eines Gebäudes maßgeblich. Die Deutschen Gebäudedienste sorgen deutschlandweit für saubere Stufen, streifenfreie Böden, gepflegte Handläufe und einladende Eingangsbereiche. Nach einem festen Reinigungsplan arbeiten unsere geschulten Teams zuverlässig und gründlich – mit abgestimmten Reinigungsmitteln für jeden Bodenbelag, von Naturstein über Fliesen bis zu Kunststoffbelägen.",
      "Ob wöchentliche Unterhaltsreinigung oder mehrmals täglicher Einsatz in stark genutzten Objekten – wir passen Frequenz und Leistungsumfang an Ihre Anforderungen an. Bundesweit einheitliche Qualitätsstandards, dokumentierte Reinigungsnachweise und ein zentraler Ansprechpartner nehmen Hausverwaltungen und Eigentümern den Koordinationsaufwand vollständig ab. So bleibt Ihr Treppenhaus dauerhaft hygienisch und repräsentativ – ohne dass Sie sich um Personal, Material oder Vertretung bei Ausfällen kümmern müssen. Fordern Sie jetzt Ihr individuelles Angebot an.",
    ],
  },
  "praxisreinigung": {
    metaTitle: "Praxisreinigung mit Festpreis",
    metaDescription: "Hygienische Praxisreinigung deutschlandweit: geschultes Personal, dokumentierte Flächendesinfektion, Termine außerhalb der Sprechzeiten. Jetzt Angebot sichern.",
    h1: "Professionelle Praxisreinigung",
    heroSub: "Wir reinigen Arzt-, Zahnarzt- und Therapiepraxen bundesweit nach strengen Hygienevorgaben – gründlich, dokumentiert und außerhalb Ihrer Sprechzeiten.",
    benefits: [
      "Reinigung und Flächendesinfektion nach Hygieneplan (RKI-orientiert)",
      "Termine außerhalb der Sprechzeiten – kein Ausfall im Praxisbetrieb",
      "Geschultes Personal mit farbcodiertem Wisch-System gegen Keimverschleppung",
      "Fester Monatspreis mit dokumentierter Leistung – prüfsicher bei Begehungen",
    ],
    suitableFor: [
      "Arzt- und Facharztpraxen sowie MVZ",
      "Zahnarztpraxen und Dentallabore",
      "Physiotherapie-, Heilpraktiker- und Therapiepraxen",
    ],
    faq: [
      { q: "Reinigen Sie auch die Behandlungsräume und Wartebereiche getrennt?", a: "Ja. Wir arbeiten mit einem farbcodierten Reinigungssystem, das Behandlungsräume, Sanitärbereiche und Wartezonen strikt trennt. So verhindern wir Keimverschleppung zwischen den Zonen. Kontaktflächen wie Türgriffe, Behandlungsstühle und Ablagen werden gezielt desinfiziert." },
      { q: "Können Sie außerhalb unserer Sprechzeiten reinigen?", a: "Ja, das ist bei Praxen die Regel. Wir kommen am frühen Morgen, am Abend oder am Wochenende, damit Ihr Praxisbetrieb nicht unterbrochen wird und die Räume zu Sprechbeginn einsatzbereit und hygienisch sauber sind. Die Zeiten stimmen wir individuell mit Ihnen ab." },
      { q: "Halten Sie die Vorgaben für die Hygienedokumentation ein?", a: "Ja. Wir reinigen nach einem abgestimmten Hygiene- und Desinfektionsplan und dokumentieren die erbrachten Leistungen nachvollziehbar. Das gibt Ihnen Sicherheit bei Praxisbegehungen und Kontrollen durch das Gesundheitsamt. Auf Wunsch erhalten Sie regelmäßige Reinigungsnachweise." },
    ],
    seoTitle: "Praxisreinigung für hygienische Sicherheit in Ihrer Praxis",
    seoText: [
      "In medizinischen und therapeutischen Praxen entscheidet Sauberkeit über Vertrauen und Sicherheit. Unsere Praxisreinigung geht deshalb weit über eine normale Unterhaltsreinigung hinaus: Wir arbeiten nach einem abgestimmten Hygieneplan, desinfizieren Kontakt- und Behandlungsflächen gezielt und trennen Reinigungszonen mit einem farbcodierten Wisch-System. So schützen wir Patienten und Personal gleichermaßen vor der Übertragung von Keimen. Bundesweit übernehmen geschulte Reinigungskräfte diese Aufgabe zuverlässig und mit dem nötigen Fachwissen für sensible Praxisumgebungen.",
      "Damit Ihr Praxisbetrieb nicht ausfällt, reinigen wir außerhalb Ihrer Sprechzeiten – am frühen Morgen, am Abend oder am Wochenende. Sie erhalten einen festen Monatspreis ohne versteckte Kosten und eine nachvollziehbare Dokumentation der erbrachten Leistungen, die Ihnen bei Begehungen durch das Gesundheitsamt Sicherheit gibt. Ob Arztpraxis, Zahnarztpraxis oder Therapiezentrum: Wir sind deutschlandweit im Einsatz und stimmen Frequenz, Leistungsumfang und Termine individuell auf Ihre Praxis ab. Fordern Sie jetzt Ihr unverbindliches Festpreis-Angebot an.",
    ],
  },
  "industriereinigung": {
    metaTitle: "Industriereinigung deutschlandweit",
    metaDescription: "Industriereinigung bundesweit: Hallen, Maschinen und Produktionsflächen professionell gereinigt. Jetzt kostenloses Angebot anfordern.",
    h1: "Professionelle Industriereinigung",
    heroSub: "Wir reinigen Produktionshallen, Maschinen und großflächige Industrieanlagen zuverlässig und normgerecht – deutschlandweit, auch bei anspruchsvollen Sonderanforderungen.",
    benefits: [
      "Leistungsstark auf großen Flächen – von der Lagerhalle bis zur kompletten Produktionsanlage",
      "Spezialverfahren für Maschinen, Anlagen und schwer zugängliche Bereiche",
      "Reinigung im laufenden Betrieb, in Schichten oder zu produktionsfreien Zeiten",
      "Geschultes Personal mit Erfahrung bei Öl, Fetten, Stäuben und Sonderanforderungen",
    ],
    suitableFor: [
      "Produktions- und Fertigungsbetriebe mit großen Hallenflächen",
      "Logistik-, Lager- und Distributionszentren",
      "Anlagenbetreiber in Metall-, Chemie- und Lebensmittelindustrie",
    ],
    faq: [
      { q: "Reinigen Sie auch während des laufenden Betriebs?", a: "Ja. Wir passen unsere Einsätze an Ihre Produktionsabläufe an und arbeiten bei Bedarf in Schichten, nachts oder an Wochenenden. So bleiben Ausfallzeiten minimal und Ihr Betrieb läuft ohne Unterbrechung weiter." },
      { q: "Welche Flächen und Objekte werden bei der Industriereinigung gereinigt?", a: "Wir übernehmen Hallenböden, Produktionsanlagen, Maschinen, Fördertechnik, Rohrleitungen, Hallendecken, Regalsysteme und Außenbereiche. Auch stark verschmutzte Flächen mit Öl, Fett, Staub oder Produktionsrückständen reinigen wir gründlich und fachgerecht." },
      { q: "Sind Sie auch bei Sonderanforderungen und großen Objekten einsatzfähig?", a: "Ja. Wir sind auf große Flächen und komplexe Sonderreinigungen spezialisiert und deutschlandweit im Einsatz. Für außergewöhnliche Anforderungen setzen wir Spezialtechnik, Höhenzugangslösungen und geschultes Fachpersonal ein." },
    ],
    seoTitle: "Industriereinigung für große Flächen und Sonderanforderungen",
    seoText: [
      "Die Industriereinigung stellt hohe Anforderungen an Technik, Personal und Organisation. Produktionshallen, Maschinen und Anlagen müssen sauber, sicher und normgerecht sein, ohne dass der Betrieb stillsteht. Genau hier sind wir stark: Wir reinigen großflächige Industrieobjekte deutschlandweit und bewältigen auch hartnäckige Verschmutzungen durch Öl, Fette, Stäube und Produktionsrückstände. Mit erfahrenem Fachpersonal und leistungsfähiger Maschinentechnik sorgen wir für Ergebnisse, die höchsten Ansprüchen an Hygiene, Arbeitssicherheit und Werterhalt gerecht werden.",
      "Ob regelmäßige Unterhaltsreinigung oder anspruchsvolle Sonderreinigung – wir entwickeln für jedes Objekt ein passendes Konzept und stimmen die Einsätze exakt auf Ihre Produktionsabläufe ab. Reinigung im laufenden Betrieb, in Schichten oder zu produktionsfreien Zeiten ist für uns Standard. Als bundesweit tätiger Dienstleister sind wir flexibel dort einsatzbereit, wo Sie uns brauchen, und liefern auch bei komplexen Sonderanforderungen zuverlässige, dokumentierte Ergebnisse. Fordern Sie jetzt unverbindlich Ihr Angebot für eine professionelle Industriereinigung an.",
    ],
  },
  "glasreinigung": {
    metaTitle: "Glasreinigung – streifenfrei sauber",
    metaDescription: "Professionelle Glasreinigung deutschlandweit: Fenster, Glastüren und Fassaden streifenfrei sauber – auch in der Höhe. Jetzt unverbindlich anfragen.",
    h1: "Professionelle Glasreinigung",
    heroSub: "Streifenfrei saubere Fenster, Glastüren und Fassaden – bundesweit im Einsatz, auch in schwindelerregender Höhe. Klare Sicht, die überzeugt.",
    benefits: [
      "Streifenfreies Ergebnis durch entmineralisiertes Reinstwasser und professionelle Abzieher – keine Schlieren, kein Kalkfilm.",
      "Auch in der Höhe: von der Teleskopstange bis zur Hubarbeitsbühne reinigen wir Fassaden und schwer erreichbare Glasflächen sicher.",
      "Geschulte Reinigungskräfte mit eigener Ausrüstung – wir bringen alles mit, Sie müssen nichts stellen.",
      "Deutschlandweit einsatzbereit: ein Ansprechpartner, einheitliche Qualität an jedem Standort – vom Einzelobjekt bis zur Filialkette.",
    ],
    suitableFor: [
      "Büro- und Verwaltungsgebäude mit großen Glasfronten und Fensterbändern",
      "Ladengeschäfte, Autohäuser und Showrooms mit repräsentativen Schaufenstern",
      "Objekte mit Glasfassaden, Wintergärten oder Glasdächern, die Höhenreinigung erfordern",
    ],
    faq: [
      { q: "Wie werden Fenster streifenfrei sauber?", a: "Wir arbeiten mit entmineralisiertem Reinstwasser und professionellen Abziehern statt mit Haushaltsmitteln. Dadurch bleiben nach dem Trocknen keine Kalk- oder Schlierenränder zurück – das Glas trocknet von selbst klar und streifenfrei auf." },
      { q: "Reinigen Sie auch Fenster und Fassaden in großer Höhe?", a: "Ja. Je nach Objekt setzen wir Teleskopstangen mit Reinstwassertechnik, Hubarbeitsbühnen oder – wo nötig – gesicherte Höhenzugangstechnik ein. So reinigen wir auch obere Etagen und Glasfassaden sicher und ohne Gerüst." },
      { q: "Wie oft sollte eine Glasreinigung erfolgen?", a: "Das hängt von Lage und Anspruch ab. Repräsentative Schaufenster reinigen wir oft wöchentlich oder monatlich, Büro- und Verwaltungsglas meist quartalsweise. Gern stimmen wir einen festen Turnus deutschlandweit auf Ihre Objekte ab." },
    ],
    seoTitle: "Glasreinigung vom Profi – klare Sicht auf jeder Fläche",
    seoText: [
      "Saubere Fenster sind die Visitenkarte jedes Gebäudes. Streifen, Kalkränder und Fingerabdrücke fallen sofort auf – bei Kunden ebenso wie bei Mitarbeitern und Besuchern. Deshalb reinigen wir Fenster, Glastüren, Trennwände und Fassaden mit professioneller Technik und entmineralisiertem Reinstwasser, das restlos abtrocknet. Das Ergebnis ist eine streifenfrei klare Fläche, die deutlich länger sauber bleibt als nach einer Reinigung mit herkömmlichen Mitteln. Als Gebäudereiniger sind wir bundesweit im Einsatz und liefern an jedem Standort dieselbe verlässliche Qualität.",
      "Ob großflächige Glasfassade, verwinkelter Wintergarten oder das Fensterband im obersten Stockwerk – kein Glas ist zu hoch oder zu schwer erreichbar. Mit Teleskopstangen, Hubarbeitsbühnen und gesicherter Höhenzugangstechnik erreichen wir auch Flächen, an die normale Reinigung nicht herankommt, und arbeiten dabei nach allen Sicherheitsvorgaben. Auf Wunsch richten wir einen festen Reinigungsturnus ein, damit Ihre Glasflächen deutschlandweit dauerhaft gepflegt bleiben. Fordern Sie unverbindlich Ihr Angebot an – wir sind in ganz Deutschland für Sie da.",
    ],
  },
  "bauendreinigung": {
    metaTitle: "Bauendreinigung zum Festpreis",
    metaDescription: "Bauendreinigung deutschlandweit: bezugsfertig sauber nach Bau oder Renovierung. Feinreinigung, Fensterputz, Bauschutt raus. Festpreis-Angebot in 2 Minuten berechnen.",
    h1: "Professionelle Bauendreinigung",
    heroSub: "Nach Neubau, Umbau oder Renovierung machen wir Ihr Objekt bezugsfertig und blitzsauber. Bundesweit, gründlich und mit verbindlichem Festpreis-Angebot in unter zwei Minuten.",
    benefits: [
      "Bezugsfertiges Ergebnis: Feinreinigung aller Oberflächen, Böden, Sanitär und Fenster in einem Durchgang",
      "Zuverlässige Entfernung von Bauschmutz, Zement-, Farb-, Silikon- und Kleberresten ohne Beschädigung der Oberflächen",
      "Geprüfte Reinigungsbetriebe mit Bau-Erfahrung und passendem Equipment, deutschlandweit im Einsatz",
      "Verbindlicher Festpreis nach Fläche und Verschmutzungsgrad statt unkalkulierbarer Stundenabrechnung",
    ],
    suitableFor: [
      "Bauträger, Handwerksbetriebe und Generalunternehmer nach Neubau- oder Sanierungsprojekten",
      "Vermieter, Hausverwaltungen und Eigentümer vor der Übergabe von Wohnungen und Gewerbeflächen",
      "Büro-, Praxis- und Ladenobjekte, die nach Umbau oder Renovierung bezugsfertig werden sollen",
    ],
    faq: [
      { q: "Was umfasst eine Bauendreinigung genau?", a: "Die Bauendreinigung ist die letzte, feine Reinigung nach Abschluss aller Bauarbeiten. Dazu gehören das Entfernen von Bau- und Feinstaub, das Ablösen von Zement-, Farb-, Kleber- und Silikonresten, die Reinigung von Fenstern samt Rahmen und Falzen, Böden, Sanitärobjekten, Türen, Heizkörpern und Schaltern – bis das Objekt bezugsfertig ist." },
      { q: "Worin unterscheidet sich Bauendreinigung von der Baugrobreinigung?", a: "Die Baugrobreinigung räumt während oder direkt nach der Bauphase groben Schmutz und Bauschutt weg und schafft die Grundlage für die letzten Gewerke. Die Bauendreinigung ist der abschließende Feinschliff: Sie sorgt für ein makelloses, übergabe- und einzugsfertiges Ergebnis auf allen Oberflächen." },
      { q: "Wie wird der Preis für die Bauendreinigung berechnet?", a: "Maßgeblich sind die Fläche in Quadratmetern, der Verschmutzungsgrad und Sonderleistungen wie Fensterflächen oder hartnäckige Bauschmutz-Rückstände. Über unser Sofort-Angebot geben Sie diese Eckdaten ein und erhalten deutschlandweit in unter zwei Minuten einen transparenten Festpreis – ohne Rückruf-Warterei." },
    ],
    seoTitle: "Bauendreinigung: bezugsfertig sauber nach Bau und Renovierung",
    seoText: [
      "Nach dem letzten Handwerker kommt der Feinschliff: Die Bauendreinigung verwandelt eine frisch fertiggestellte Baustelle in ein bezugsfertiges Objekt. Feiner Baustaub setzt sich in jede Ecke, auf Fensterbänken, Heizkörpern und Türrahmen; Zement-, Farb-, Silikon- und Kleberreste haften auf Glas, Fliesen und Böden. Genau hier setzen wir an – mit geschulten Reinigungskräften, die Oberflächen materialgerecht behandeln und nichts beschädigen. So übergeben Sie Neubau, Umbau oder renovierte Räume in einem Zustand, der überzeugt.",
      "Über unser Sofort-Angebot kalkulieren Sie die Bauendreinigung deutschlandweit in unter zwei Minuten: Fläche und Verschmutzungsgrad eingeben, verbindlichen Festpreis erhalten, Termin wählen und direkt buchen. Jeden Auftrag prüfen wir vor der Vergabe und übergeben ihn an einen geprüften Fachbetrieb mit Bau-Erfahrung in Ihrer Nähe. Statt vager Kostenvoranschläge und Stundenabrechnung bekommen Sie einen klaren Preis – und ein Objekt, das ohne Nacharbeit bezugsfertig ist. Sollten wir einen Auftrag nicht annehmen, erstatten wir den vollen Betrag automatisch.",
    ],
  },
  "unterhaltsreinigung": {
    metaTitle: "Unterhaltsreinigung deutschlandweit",
    metaDescription: "Regelmäßige Unterhaltsreinigung für Gebäude aller Art – bundesweit, planbar und zum festen Preis. Jetzt Angebot anfordern und dauerhaft saubere Räume sichern.",
    h1: "Professionelle Unterhaltsreinigung",
    heroSub: "Regelmäßige, planbare Reinigung für Eigentümer, Mieter und Besucher – bundesweit im Einsatz, mit festem Reinigungsintervall und gleichbleibend hoher Qualität.",
    benefits: [
      "Feste Intervalle nach Ihrem Bedarf – täglich, mehrmals pro Woche oder wöchentlich",
      "Gleichbleibendes, eingespieltes Reinigungsteam statt wechselnder Kräfte",
      "Kalkulierbare Fixkosten ohne versteckte Aufschläge oder Nachträge",
      "Deutschlandweite Betreuung mit einem zentralen Ansprechpartner",
    ],
    suitableFor: [
      "Büro- und Verwaltungsgebäude sowie Coworking-Flächen",
      "Praxen, Kanzleien und Objekte mit erhöhten Hygieneanforderungen",
      "Handels-, Gewerbe- und Wohnimmobilien mit Publikumsverkehr",
    ],
    faq: [
      { q: "Was umfasst die Unterhaltsreinigung genau?", a: "Die Unterhaltsreinigung ist die regelmäßige Grundpflege Ihrer Räume: Böden saugen und wischen, Sanitärbereiche reinigen und desinfizieren, Papierkörbe leeren, Oberflächen entstauben sowie Küchen- und Gemeinschaftsbereiche pflegen. Der genaue Leistungsumfang wird in einem Reinigungsplan festgehalten und exakt auf Ihr Objekt abgestimmt." },
      { q: "In welchem Intervall wird gereinigt?", a: "Das Intervall richtet sich nach Nutzung und Publikumsverkehr. Stark frequentierte Flächen und Sanitärbereiche werden meist täglich betreut, ruhigere Büros oft ein- bis dreimal pro Woche. Wir stimmen den Rhythmus so ab, dass Sauberkeit und Kosten im Gleichgewicht bleiben – anpassbar, wenn sich Ihr Bedarf ändert." },
      { q: "Sind Sie auch außerhalb einer Region tätig?", a: "Ja. Wir sind deutschlandweit im Einsatz und betreuen Einzelobjekte ebenso wie über mehrere Standorte verteilte Liegenschaften. Sie erhalten dabei einen festen Ansprechpartner, der die Qualität an allen Standorten einheitlich sicherstellt." },
    ],
    seoTitle: "Unterhaltsreinigung, die sich um alles Regelmäßige kümmert",
    seoText: [
      "Unterhaltsreinigung ist die Basis eines gepflegten Gebäudes: Sie sorgt dafür, dass Büros, Flure, Sanitärbereiche und Gemeinschaftsflächen dauerhaft sauber und einladend bleiben. Statt auf punktuelle Aktionen setzt sie auf feste Intervalle und einen klar definierten Reinigungsplan. So profitieren Eigentümer, Mieter und Besucher gleichermaßen von einem Umfeld, das Werterhalt, Hygiene und einen professionellen Eindruck verbindet – bundesweit und nach einheitlichem Standard.",
      "Als Deutsche Gebäudedienste planen wir Ihre Unterhaltsreinigung so, dass sie zuverlässig im Hintergrund läuft und Ihren Betrieb nicht stört. Geschulte Reinigungskräfte, abgestimmte Materialien und ein fester Ansprechpartner sichern gleichbleibende Qualität an jedem Standort. Ob einzelnes Objekt oder deutschlandweit verteilte Liegenschaften – wir liefern planbare Ergebnisse zu kalkulierbaren Fixkosten und passen den Umfang flexibel an, wenn sich Ihre Anforderungen verändern.",
    ],
  },
  "kita-schulen": {
    metaTitle: "Reinigung für Kitas & Schulen",
    metaDescription: "Professionelle Reinigung für Kitas & Schulen – deutschlandweit, hygienisch und kindgerecht. Geschultes Personal, geprüfte Mittel. Jetzt Angebot anfordern.",
    h1: "Reinigung für Kitas und Schulen",
    heroSub: "Saubere, sichere Lernräume für Kinder und Jugendliche – bundesweit von geschultem Fachpersonal. Wir sorgen für Hygiene, die den besonderen Anforderungen von Bildungseinrichtungen gerecht wird.",
    benefits: [
      "Kindgerechte, wohngesundheitlich unbedenkliche Reinigungsmittel",
      "Hygienekonzepte nach Infektionsschutzgesetz und RKI-Empfehlungen",
      "Reinigung außerhalb der Betreuungs- und Unterrichtszeiten",
      "Geschultes, zuverlässiges und geprüftes Reinigungspersonal",
    ],
    suitableFor: [
      "Kindertagesstätten, Krippen und Kindergärten",
      "Grund-, Haupt- und weiterführende Schulen",
      "Horte, Ganztagsbetreuung und Bildungszentren",
    ],
    faq: [
      { q: "Werden kindgerechte und unbedenkliche Reinigungsmittel eingesetzt?", a: "Ja. In Kitas und Schulen verwenden wir ausschließlich geprüfte, schadstoffarme Reinigungsmittel, die für den Kontakt mit Kindern unbedenklich sind. Auf aggressive Chemie in Spiel- und Aufenthaltsbereichen wird bewusst verzichtet." },
      { q: "Wann findet die Reinigung statt, ohne den Betrieb zu stören?", a: "Wir reinigen flexibel außerhalb der Betreuungs- und Unterrichtszeiten – am frühen Morgen, am Nachmittag oder Abend. So sind Gruppenräume, Klassenzimmer und Sanitäranlagen pünktlich sauber, ohne den laufenden Betrieb zu beeinträchtigen." },
      { q: "Erfüllen Sie die Hygienevorgaben für Bildungseinrichtungen?", a: "Ja. Unsere Reinigungs- und Desinfektionskonzepte orientieren sich am Infektionsschutzgesetz sowie an den Empfehlungen des RKI. Sanitärbereiche, Kontaktflächen und Handkontaktpunkte werden nach dokumentiertem Hygieneplan gereinigt." },
    ],
    seoTitle: "Hygienische Reinigung für Bildungseinrichtungen – bundesweit",
    seoText: [
      "Kinder und Jugendliche verbringen einen großen Teil ihres Tages in Kitas und Schulen – umso wichtiger ist eine gründliche, verlässliche Reinigung. Als bundesweit tätiger Gebäudedienstleister sorgen wir dafür, dass Gruppenräume, Klassenzimmer, Mensen und Sanitäranlagen jederzeit hygienisch einwandfrei sind. Unser geschultes Personal arbeitet mit kindgerechten, schadstoffarmen Reinigungsmitteln und nach klar dokumentierten Hygieneplänen, die den besonderen Anforderungen von Bildungseinrichtungen gerecht werden.",
      "Ob einzelne Kindertagesstätte oder Schule mit mehreren Gebäuden – in ganz Deutschland bieten wir passgenaue Reinigungskonzepte mit festen Ansprechpartnern und planbaren Abläufen. Die Reinigung erfolgt zuverlässig außerhalb der Betreuungs- und Unterrichtszeiten, damit der Alltag der Einrichtung ungestört bleibt. So schaffen wir saubere, sichere Lernumgebungen, in denen sich Kinder, Jugendliche und pädagogisches Personal rundum wohlfühlen.",
    ],
  },
  "pv-solar": {
    metaTitle: "PV- & Solaranlagenreinigung",
    metaDescription: "Professionelle PV- & Solaranlagenreinigung deutschlandweit: mehr Ertrag durch saubere Module, schonende Verfahren, faire Festpreise. Jetzt Angebot anfordern.",
    h1: "Professionelle PV- & Solaranlagenreinigung",
    heroSub: "Schmutz, Staub und Moos kosten bares Geld. Wir reinigen Ihre Photovoltaik- und Solaranlage schonend und gründlich – deutschlandweit, für spürbar mehr Ertrag.",
    benefits: [
      "Höhere Erträge: Saubere Module wandeln Sonnenlicht wieder mit voller Leistung um",
      "Schonende Reinigung mit entmineralisiertem Reinstwasser – ohne Kratzer, ohne Chemie",
      "Entfernt Staub, Pollen, Vogelkot, Laub, Flechten und Moosbewuchs zuverlässig",
      "Werterhalt und längere Lebensdauer durch regelmäßige, fachgerechte Pflege",
    ],
    suitableFor: [
      "Private Aufdach- und Dachanlagen von Ein- und Mehrfamilienhäusern",
      "Gewerbe- und Industriedächer sowie Logistik- und Lagerhallen",
      "Solarparks, Freiflächenanlagen und landwirtschaftliche Betriebe",
    ],
    faq: [
      { q: "Wie oft sollte eine PV-Anlage gereinigt werden?", a: "Meist genügt eine Reinigung ein- bis zweimal pro Jahr. Der genaue Rhythmus hängt von Dachneigung, Standort und Umgebung ab: In der Nähe von Feldern, Wäldern, Industrie oder mit vielen Bäumen verschmutzen Module schneller. Flach geneigte Anlagen unter 15 Grad profitieren besonders, weil Regen den Schmutz kaum abspült." },
      { q: "Wie viel Mehrertrag bringt eine Reinigung?", a: "Je nach Verschmutzungsgrad gehen ohne Reinigung schnell 5 bis 20 Prozent Ertrag verloren, bei starkem Moos- oder Flechtenbewuchs auch mehr. Eine fachgerechte Reinigung stellt die volle Leistung wieder her – die Kosten amortisieren sich häufig schon über den zusätzlichen Stromertrag einer Saison." },
      { q: "Beschädigt die Reinigung die Module oder die Beschichtung?", a: "Nein. Wir arbeiten mit weichen Bürsten, Teleskoptechnik und entmineralisiertem Reinstwasser, das rückstandsfrei abtrocknet. Ohne aggressive Chemie und ohne Hochdruck bleiben Glasoberfläche, Beschichtung und Herstellergarantie unangetastet." },
    ],
    seoTitle: "Mehr Ertrag durch saubere Solar- und Photovoltaikanlagen",
    seoText: [
      "Eine Photovoltaikanlage arbeitet nur dann wirtschaftlich, wenn die Module das Sonnenlicht ungehindert aufnehmen. Staub, Pollen, Vogelkot, Laub und im Laufe der Zeit auch Moos und Flechten legen sich als Schmutzschicht über das Glas und mindern den Ertrag oft unbemerkt. Regen allein reicht selten aus, um Anlagen wirklich sauber zu halten – besonders bei flach geneigten Dächern bleiben Rückstände zurück. Deutsche Gebäudedienste reinigt Ihre Solar- und PV-Anlage deutschlandweit fachgerecht und schonend, damit jedes Modul wieder die volle Leistung liefert.",
      "Für die Reinigung setzen wir auf schonende Verfahren mit weichen Bürsten, Teleskop- und Osmosetechnik sowie entmineralisiertem Reinstwasser. So lösen wir selbst hartnäckige Verschmutzungen streifenfrei und ganz ohne aggressive Chemie – die empfindliche Glasoberfläche und die Herstellergarantie bleiben geschützt. Ob einzelne Aufdachanlage, großes Gewerbedach oder weitläufiger Solarpark: Unsere geschulten Teams sind bundesweit im Einsatz, arbeiten sicher und termintreu und dokumentieren das Ergebnis auf Wunsch. Fordern Sie jetzt Ihr unverbindliches Angebot an und sichern Sie sich dauerhaft mehr Ertrag.",
    ],
  },
};
