// Eindeutige SEO-Inhalte je "Für wen"-Zielgruppenseite (deutschlandweit).
export type TargetSeo = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroSub: string;
  benefits: string[];
  faq: { q: string; a: string }[];
  seoTitle: string;
  seoText: string[];
};

export const TARGET_SEO: Record<string, TargetSeo> = {
  "hotels-gastronomie": {
    metaTitle: "Hotel- & Gastronomiereinigung",
    metaDescription: "Diskrete, gründliche Reinigung für Hotels und Gastronomie – deutschlandweit. Zimmer, Lobby und Gastraum in Gästehand-Qualität. Jetzt Angebot anfordern.",
    h1: "Professionelle Reinigung für Hotels & Gastronomie",
    heroSub: "Diskrete, gründliche Reinigung für Zimmer, Lobby und Gastraum. Bundesweit im Einsatz für Hotels, Restaurants und Beherbergungsbetriebe – mit geschultem Personal und verlässlichen Standards.",
    benefits: [
      "Diskretes, geschultes Personal, das während des laufenden Gästebetriebs unauffällig und rücksichtsvoll arbeitet",
      "Reinigung nach hygienischen Standards für Küche, Gastraum und Sanitärbereiche – dokumentiert und nachvollziehbar",
      "Flexible Einsatzzeiten früh morgens, spät abends oder nachts, abgestimmt auf Check-in, Check-out und Öffnungszeiten",
      "Feste Ansprechperson und gleichbleibendes Team für konstante Qualität in Zimmern, Lobby und Restaurant",
    ],
    faq: [
      { q: "Reinigen Sie auch während des laufenden Gästebetriebs?", a: "Ja. Unser Personal ist auf diskretes Arbeiten im Hintergrund geschult und passt sich dem Gästeaufkommen an. Zimmer werden nach dem Check-out gereinigt, öffentliche Bereiche und Sanitäranlagen bei Bedarf mehrfach täglich – ohne Gäste zu stören." },
      { q: "Sind Sie deutschlandweit für Hotels und Gastronomie im Einsatz?", a: "Ja, wir arbeiten bundesweit. Ob einzelnes Haus oder Standorte in mehreren Städten – wir organisieren die Reinigung mit einheitlichen Standards und einer zentralen Ansprechperson für ganz Deutschland." },
      { q: "Können die Reinigungszeiten an unsere Öffnungs- und Belegungszeiten angepasst werden?", a: "Ja. Einsatzzeiten stimmen wir individuell auf Check-in, Check-out, Öffnungszeiten und Stoßzeiten ab – auch früh morgens, spät abends oder nachts. So wird gereinigt, wenn es den Betrieb am wenigsten stört." },
    ],
    seoTitle: "Hotel- und Gastronomiereinigung mit System",
    seoText: [
      "In der Hotellerie und Gastronomie entscheidet Sauberkeit über den ersten und letzten Eindruck. Deshalb übernehmen wir deutschlandweit die diskrete und gründliche Reinigung von Zimmern, Lobby und Gastraum – abgestimmt auf Ihren laufenden Betrieb. Unser geschultes Personal kennt die besonderen Anforderungen der Branche: hohe Frequenz, wechselnde Auslastung und Gäste, die von der Reinigung nichts mitbekommen sollen. So bleibt Ihr Haus jederzeit in einem Zustand, der Gäste überzeugt und wiederkommen lässt.",
      "Von der Zimmerreinigung über die Küche bis zu Sanitäranlagen und öffentlichen Bereichen arbeiten wir nach klaren Hygienestandards und nachvollziehbaren Abläufen. Als bundesweit tätiger Dienstleister betreuen wir einzelne Betriebe ebenso wie Hotelgruppen mit mehreren Standorten – mit einheitlicher Qualität, festen Teams und einer zentralen Ansprechperson. Fordern Sie ein unverbindliches Angebot an und erhalten Sie ein Reinigungskonzept, das genau zu Ihren Öffnungszeiten, Ihrer Belegung und Ihren Ansprüchen passt.",
    ],
  },
  "buero-verwaltung": {
    metaTitle: "Büroreinigung für Verwaltungen",
    metaDescription: "Büroreinigung deutschlandweit: gepflegte Arbeitsplätze, gesundes Raumklima und mehr Produktivität. Feste Teams, planbare Termine. Jetzt bundesweit anfragen.",
    h1: "Büroreinigung für Büro und Verwaltung",
    heroSub: "Ein sauberes Arbeitsumfeld steigert Konzentration, Gesundheit und Produktivität. Deutsche Gebäudedienste reinigt Büros und Verwaltungsgebäude deutschlandweit – zuverlässig, diskret und nach Ihrem Rhythmus.",
    benefits: [
      "Feste Reinigungsteams, die Ihre Räume und Abläufe kennen – für gleichbleibende Qualität an jedem Standort",
      "Flexible Zeitfenster vor Arbeitsbeginn, in Randzeiten oder abends, damit der laufende Betrieb ungestört bleibt",
      "Hygienisch gepflegte Sanitär-, Küchen- und Sozialräume für ein gesundes Arbeitsklima und weniger Krankheitsausfälle",
      "Transparente Leistungsverzeichnisse und ein fester Ansprechpartner – bundesweit koordiniert, ohne Anfahrtsgrenzen",
    ],
    faq: [
      { q: "Wird während oder außerhalb der Arbeitszeit gereinigt?", a: "Ganz nach Ihrem Wunsch. In der Regel reinigen wir vor Arbeitsbeginn, in Randzeiten oder am Abend, damit der Bürobetrieb nicht gestört wird. Bundesweit stimmen wir die Zeitfenster individuell mit Ihnen ab – auch für mehrere Standorte in einheitlichem Standard." },
      { q: "Welche Bereiche umfasst die Büroreinigung?", a: "Zur Unterhaltsreinigung gehören Arbeitsplätze, Böden, Flure und Treppenhäuser, Sanitär-, Küchen- und Sozialräume sowie Besprechungs- und Empfangsbereiche. Papierkörbe werden geleert, Kontaktflächen desinfiziert. Fensterreinigung und Grundreinigungen lassen sich bei Bedarf ergänzen." },
      { q: "Sind Reinigungsmittel und Verbrauchsmaterial inklusive?", a: "In der Regel bringen unsere Teams professionelle Reinigungsmittel und Geräte mit. Auf Wunsch übernehmen wir deutschlandweit auch die Nachfüllung von Seife, Papierhandtüchern und Toilettenpapier, sodass Sie sich um nichts kümmern müssen." },
    ],
    seoTitle: "Sauberes Arbeitsumfeld für mehr Produktivität",
    seoText: [
      "Ein gepflegtes Büro ist weit mehr als eine Frage der Optik: Saubere Arbeitsplätze, hygienische Sanitärräume und ein frisches Raumklima senken das Infektionsrisiko, reduzieren Krankheitstage und helfen Ihren Mitarbeitenden, konzentriert zu bleiben. Die Deutschen Gebäudedienste sorgen deutschlandweit dafür, dass Ihre Verwaltung jeden Morgen einladend wirkt – für Beschäftigte ebenso wie für Besucher, Kunden und Geschäftspartner, die sich vom ersten Eindruck an gut aufgehoben fühlen.",
      "Wir arbeiten mit festen, geschulten Teams, die Ihre Räume, Sicherheitsvorgaben und Abläufe kennen. So entsteht gleichbleibende Qualität statt wechselnder Aushilfen – ob einzelnes Büro oder Verwaltung mit mehreren Standorten in ganz Deutschland. Frequenz, Zeitfenster und Leistungsumfang legen wir gemeinsam fest und passen sie an, wenn Ihr Bedarf wächst. Ein fester Ansprechpartner koordiniert alles bundesweit, damit Sie sich auf Ihr Kerngeschäft konzentrieren können.",
    ],
  },
  "praxen-gesundheit": {
    metaTitle: "Praxisreinigung für Praxen & Gesundheit",
    metaDescription: "Hygienische Praxisreinigung deutschlandweit: Arzt- und Zahnarztpraxen, Kliniken und Therapiezentren normgerecht gereinigt. Jetzt unverbindlich Angebot anfordern.",
    h1: "Professionelle Praxisreinigung für Praxen & Gesundheit",
    heroSub: "Wir reinigen Arztpraxen, Zahnarztpraxen, Kliniken und Therapiezentren deutschlandweit nach strengen Hygienestandards – für den sicheren Schutz von Patienten und Personal.",
    benefits: [
      "Reinigung nach RKI-Empfehlungen und Hygieneplan – dokumentiert und nachvollziehbar",
      "Flächen- und Wischdesinfektion in Wartezimmern, Behandlungsräumen und Sanitärbereichen",
      "Geschultes Personal mit Erfahrung im sensiblen Gesundheitsumfeld und klarer Verschwiegenheit",
      "Reinigung außerhalb der Sprechzeiten – planbar, zuverlässig und ohne Störung des Praxisbetriebs",
    ],
    faq: [
      { q: "Reinigen Sie nach den geltenden Hygienevorgaben für Praxen?", a: "Ja. Wir arbeiten nach den Empfehlungen des Robert Koch-Instituts und richten uns nach Ihrem praxisindividuellen Hygieneplan. Flächendesinfektion, Trennung von reinen und unreinen Bereichen sowie farblich getrennte Wischsysteme gehören zum Standard. Auf Wunsch dokumentieren wir jede Reinigung nachvollziehbar." },
      { q: "Findet die Reinigung während oder außerhalb der Sprechzeiten statt?", a: "In der Regel reinigen wir außerhalb Ihrer Sprechzeiten – also früh morgens, abends oder am Wochenende. So bleibt der Praxisbetrieb ungestört und die Räume sind pünktlich zur ersten Behandlung einsatzbereit. Die Termine stimmen wir individuell mit Ihnen ab." },
      { q: "Sind Sie deutschlandweit für Gesundheitseinrichtungen im Einsatz?", a: "Ja, wir betreuen Praxen und Gesundheitseinrichtungen bundesweit. Ob Einzelpraxis oder Standort mit mehreren Einrichtungen – wir organisieren die Reinigung deutschlandweit mit einheitlichem Qualitätsstandard und festen Ansprechpartnern." },
    ],
    seoTitle: "Hygienische Reinigung für Praxen und Gesundheitseinrichtungen",
    seoText: [
      "In Praxen und Gesundheitseinrichtungen ist Sauberkeit kein Komfort, sondern eine Frage der Sicherheit. Wo täglich Menschen mit unterschiedlichem Gesundheitszustand aufeinandertreffen, entscheidet konsequente Hygiene über den Schutz von Patienten und Personal. Deutsche Gebäudedienste reinigt Arztpraxen, Zahnarztpraxen, Kliniken und Therapiezentren deutschlandweit nach strengen Standards. Vom Wartezimmer über die Behandlungsräume bis zu den Sanitärbereichen setzen wir auf abgestimmte Desinfektionsverfahren, geschultes Personal und ein System, das reine und unreine Bereiche sauber voneinander trennt.",
      "Unsere Reinigungskräfte kennen die besonderen Anforderungen im Gesundheitswesen und arbeiten diskret, zuverlässig und nach Ihrem Hygieneplan. Wir stimmen die Reinigungszeiten so ab, dass Ihr Praxisbetrieb ungestört bleibt und die Räume rechtzeitig einsatzbereit sind. Auf Wunsch dokumentieren wir jeden Einsatz für Ihre Qualitätssicherung. Als bundesweit tätiger Dienstleister betreuen wir einzelne Praxen ebenso wie Einrichtungen mit mehreren Standorten – überall in Deutschland mit gleichbleibendem Qualitätsniveau und festen Ansprechpartnern. Fordern Sie jetzt unverbindlich Ihr individuelles Angebot an.",
    ],
  },
  "immobilien-hausverwaltung": {
    metaTitle: "Gebäudereinigung für Hausverwaltungen",
    metaDescription: "Zuverlässige Gebäudereinigung für Immobilien und Hausverwaltungen – deutschlandweit. Von Treppenhaus bis Bauendreinigung, feste Ansprechpartner, transparente Preise. Jetzt anfragen.",
    h1: "Gebäudereinigung für Immobilien und Hausverwaltungen",
    heroSub: "Gepflegte Objekte ohne Aufwand für Sie: Wir übernehmen die komplette Reinigung Ihrer Wohn- und Gewerbeimmobilien – bundesweit, in verlässlicher Qualität und mit einem festen Ansprechpartner.",
    benefits: [
      "Ein fester Objektbetreuer als Ansprechpartner für alle Standorte – bundesweit koordiniert statt mit vielen Einzeldienstleistern",
      "Dokumentierte Reinigungspläne und lückenlose Leistungsnachweise, die Sie direkt an Eigentümer und Beiräte weitergeben können",
      "Kurzfristige Einsätze bei Mieterwechsel, Wasserschäden oder Sonderreinigungen – ohne langes Warten auf Termine",
      "Transparente Objektpauschalen ohne versteckte Kosten, sauber abrechenbar über die Nebenkostenabrechnung",
    ],
    faq: [
      { q: "Welche Reinigungsleistungen übernehmen Sie für Hausverwaltungen?", a: "Wir decken das gesamte Spektrum ab: regelmäßige Treppenhaus- und Unterhaltsreinigung, Glas- und Rahmenreinigung, Pflege von Außenanlagen und Tiefgaragen, Winterdienst sowie Sonder- und Bauendreinigung. Sie erhalten alle Leistungen aus einer Hand und deutschlandweit nach einheitlichem Standard." },
      { q: "Betreuen Sie auch Objekte an mehreren Standorten in ganz Deutschland?", a: "Ja. Wir sind bundesweit im Einsatz und koordinieren Portfolios über mehrere Städte und Regionen hinweg zentral. Sie haben trotz verteilter Objekte einen festen Ansprechpartner und einheitliche Qualitätsstandards an jedem Standort." },
      { q: "Wie läuft die Abrechnung mit der Hausverwaltung ab?", a: "Sie erhalten transparente Objektpauschalen mit klar aufgeschlüsselten Leistungen, die sich sauber auf die Nebenkostenabrechnung umlegen lassen. Auf Wunsch rechnen wir pro Objekt oder gebündelt für das gesamte Portfolio ab – mit nachvollziehbaren Leistungsnachweisen zu jeder Rechnung." },
    ],
    seoTitle: "Ihr Partner für gepflegte Immobilien – deutschlandweit",
    seoText: [
      "Als Hausverwaltung oder Immobiliengesellschaft tragen Sie Verantwortung für den Werterhalt und den Eindruck Ihrer Objekte – oft an vielen Standorten gleichzeitig. Genau hier setzt die Deutsche Gebäudedienste an: Wir übernehmen die komplette Gebäudereinigung Ihrer Wohn- und Gewerbeimmobilien deutschlandweit, vom täglich frequentierten Treppenhaus bis zur Bauendreinigung vor der Übergabe. Statt einzelne Dienstleister je Region zu steuern, koordinieren Sie alles über einen festen Ansprechpartner, der Ihre Objekte kennt und für gleichbleibende Qualität sorgt.",
      "Ein sauberes Treppenhaus, gepflegte Außenanlagen und ein zuverlässiger Winterdienst sind für Mieter und Eigentümer sichtbare Zeichen guter Verwaltung – und reduzieren Beschwerden spürbar. Wir arbeiten mit dokumentierten Reinigungsplänen, festen Frequenzen und nachvollziehbaren Leistungsnachweisen, die Sie direkt an Beiräte und Eigentümer weitergeben können. Bei Mieterwechsel, Wasserschäden oder kurzfristigem Sonderbedarf sind wir schnell vor Ort. So halten Sie Ihre Objekte in ganz Deutschland dauerhaft in einem gepflegten Zustand – planbar, transparent abgerechnet und ohne organisatorischen Mehraufwand für Ihr Team.",
    ],
  },
  "industrie-gewerbe": {
    metaTitle: "Industrie- & Gewerbereinigung",
    metaDescription: "Industrie- und Gewerbereinigung deutschlandweit: große Flächen, Produktionshallen und Sonderanforderungen zuverlässig gereinigt. Jetzt Angebot anfordern.",
    h1: "Professionelle Industrie- und Gewerbereinigung",
    heroSub: "Leistungsstark auf großen Flächen und bei Sonderanforderungen: Wir reinigen Produktionshallen, Lager und Gewerbeobjekte bundesweit – abgestimmt auf Ihren laufenden Betrieb.",
    benefits: [
      "Skalierbar für große Flächen: von der einzelnen Halle bis zum kompletten Werksgelände an mehreren Standorten deutschlandweit",
      "Reinigung im laufenden Betrieb – Nacht-, Wochenend- und Schichteinsätze ohne Produktionsunterbrechung",
      "Erfüllung von Sonderanforderungen: Hygieneprotokolle, Arbeitssicherheit und dokumentierte Reinigungsnachweise",
      "Fester Ansprechpartner, klares Leistungsverzeichnis und regelmäßige Qualitätskontrollen für gleichbleibende Ergebnisse",
    ],
    faq: [
      { q: "Reinigen Sie auch im laufenden Produktionsbetrieb?", a: "Ja. Wir stimmen die Reinigung auf Ihre Schicht- und Produktionspläne ab und arbeiten bei Bedarf nachts, an Wochenenden oder in Betriebspausen. So bleiben Ihre Prozesse ununterbrochen und Ihre Flächen trotzdem dauerhaft sauber und sicher." },
      { q: "Sind Sie deutschlandweit für Standorte mit mehreren Objekten einsetzbar?", a: "Ja. Wir betreuen Unternehmen mit mehreren Niederlassungen in ganz Deutschland aus einer Hand – mit einheitlichem Leistungsverzeichnis, festen Ansprechpartnern und bundesweit gleichbleibendem Qualitätsniveau, egal an welchem Standort." },
      { q: "Können Sie besondere Hygiene- und Sicherheitsanforderungen erfüllen?", a: "Ja. Wir arbeiten nach dokumentierten Reinigungs- und Hygieneprotokollen, schulen unser Personal auf Arbeitssicherheit und richten uns nach Ihren branchenspezifischen Vorgaben – inklusive Nachweisen und regelmäßigen Qualitätskontrollen." },
    ],
    seoTitle: "Gebäudereinigung für Industrie und Gewerbe",
    seoText: [
      "In Produktion, Logistik und Gewerbe zählt jeder Quadratmeter. Als deutschlandweit tätiger Gebäudedienstleister übernehmen wir die Reinigung großer Flächen, Hallen und Außenanlagen – abgestimmt auf laufenden Betrieb, Schichtpläne und Sicherheitsvorgaben. Ob Maschinenumfeld, Hochregallager oder sensible Fertigungsbereiche: Wir bringen die passende Technik, geschultes Personal und ein durchdachtes Reinigungskonzept mit. So bleiben Ihre Anlagen sauber, sicher und einsatzbereit – ohne dass Ihr Kerngeschäft ins Stocken gerät.",
      "Sonderanforderungen sind für uns Standard. Wir arbeiten mit Nacht- und Wochenendschichten, Hygieneprotokollen und dokumentierten Abläufen, wie sie Industrie und Gewerbe verlangen. Für Standorte in ganz Deutschland koordinieren wir feste Ansprechpartner, klare Leistungsverzeichnisse und regelmäßige Qualitätskontrollen. Vom einmaligen Großauftrag bis zur dauerhaften Unterhaltsreinigung erhalten Sie ein Reinigungskonzept aus einer Hand – transparent kalkuliert, termintreu umgesetzt und bundesweit auf gleichbleibend hohem Niveau.",
    ],
  },
};
