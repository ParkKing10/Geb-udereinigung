// Rechtstexte (Impressum, Datenschutz, AGB) – im Admin bearbeitbar.
// Store hält den HTML-Body (unter der H1). Default = aktueller Seiteninhalt, damit ohne
// gespeicherte Bearbeitung nichts fehlt. Bei Datenschutz wird der dynamische Tracking-
// Abschnitt weiterhin serverseitig angehängt (siehe datenschutz/page.tsx).
import { promises as fs } from "node:fs";
import path from "node:path";
import { CONTACT } from "@/lib/sauberfit-data";
import type { LegalContent } from "./legal-meta";

export type { LegalContent, LegalKey } from "./legal-meta";
export { LEGAL_META } from "./legal-meta";

function defaults(): LegalContent {
  const a1 = CONTACT.address[1] ?? "";
  const a2 = CONTACT.address[2] ?? "";
  const phone = CONTACT.phone;
  const email = CONTACT.email;
  return {
    impressum:
      `<p><em>Hinweis: Pflichtangaben teils als Platzhalter – bitte vor Veröffentlichung durch eure echten Daten ersetzen (Rechtsform, Geschäftsführung, Register, USt-IdNr.).</em></p>` +
      `<h2>Angaben gemäß § 5 TMG</h2><p>NORDIS Gebäudeservice<br>Inhaber: Christian-Alexandru Mitrea<br>${a1}<br>${a2}</p>` +
      `<h2>Marke &amp; Auftritt</h2><p>Öffentlicher Auftritt sowie Angebote und Website erfolgen unter der Marke „Deutsche Gebäudedienste“. Betreiber ist die NORDIS Gebäudeservice, Inhaber Christian-Alexandru Mitrea.</p>` +
      `<h2>Vertreten durch</h2><p>Christian-Alexandru Mitrea</p>` +
      `<h2>Kontakt</h2><p>Telefon: ${phone}<br>E-Mail: ${email}</p>` +
      `<h2>Registereintrag</h2><p>Registergericht: [z. B. Amtsgericht Hamburg] · Registernummer: [HRB …]</p>` +
      `<h2>Umsatzsteuer-ID</h2><p>USt-IdNr. gemäß § 27 a UStG: [DE…]</p>` +
      `<h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2><p>Christian-Alexandru Mitrea, Anschrift wie oben.</p>`,
    datenschutz:
      `<p><em>Hinweis: Mustertext – bitte vor Veröffentlichung rechtlich prüfen lassen.</em></p>` +
      `<h2>1. Verantwortlicher</h2><p>Verantwortlich für die Datenverarbeitung ist die Deutsche Gebäudedienste, ${a1}, ${a2}. Kontakt: ${email}.</p>` +
      `<h2>2. Welche Daten wir verarbeiten</h2><p>Bei Anfragen über das Sofort-Angebot oder das Kontaktformular verarbeiten wir die von Ihnen angegebenen Daten (z. B. Name, E-Mail, Telefon, Objektangaben), um Ihre Anfrage zu bearbeiten.</p>` +
      `<h2>3. Zweck und Rechtsgrundlage</h2><p>Die Verarbeitung erfolgt zur Bearbeitung Ihrer Anfrage und zur Vertragsanbahnung (Art. 6 Abs. 1 lit. b DSGVO) sowie auf Basis berechtigter Interessen (lit. f).</p>` +
      `<h2>4. Ihre Rechte</h2><p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch. Wenden Sie sich dazu an ${email}.</p>` +
      `<h2>5. Speicherdauer</h2><p>Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke oder gesetzliche Aufbewahrungspflichten erforderlich ist.</p>`,
    agb:
      `<p><em>Hinweis: Mustertext – bitte vor Veröffentlichung rechtlich prüfen lassen.</em></p>` +
      `<h2>§ 1 Geltungsbereich</h2><p>Diese AGB gelten für alle Reinigungsleistungen der Deutsche Gebäudedienste gegenüber Unternehmen, Einrichtungen und Privatkund:innen.</p>` +
      `<h2>§ 2 Angebot &amp; Vertragsschluss</h2><p>Das über das Sofort-Angebot erstellte Angebot ist freibleibend. Der Vertrag kommt mit beiderseitiger Bestätigung des Leistungsumfangs zustande.</p>` +
      `<h2>§ 3 Leistungen &amp; Ausführung</h2><p>Art, Umfang und Frequenz der Reinigung ergeben sich aus dem vereinbarten Leistungsverzeichnis. Termine werden einvernehmlich abgestimmt.</p>` +
      `<h2>§ 4 Preise &amp; Zahlung</h2><p>Es gelten die im Angebot ausgewiesenen Preise. Die Abrechnung erfolgt nach Vereinbarung, in der Regel monatlich oder nach Leistung.</p>` +
      `<h2>§ 5 Mitwirkung der Kund:innen</h2><p>Kund:innen gewähren Zugang zu den zu reinigenden Flächen und stellen, soweit vereinbart, Strom und Wasser bereit.</p>` +
      `<h2>§ 6 Gewährleistung &amp; Haftung</h2><p>Es gelten die gesetzlichen Regelungen. Mängel sind unverzüglich anzuzeigen, damit wir nachbessern können.</p>`,
  };
}

const FILE = "legal-content.json";

export async function readLegal(): Promise<LegalContent> {
  const def = defaults();
  try {
    const saved = JSON.parse(await fs.readFile(path.join(process.cwd(), FILE), "utf8")) as Partial<LegalContent>;
    return {
      impressum: saved.impressum ?? def.impressum,
      datenschutz: saved.datenschutz ?? def.datenschutz,
      agb: saved.agb ?? def.agb,
    };
  } catch {
    return def;
  }
}

export async function saveLegal(patch: Partial<LegalContent>): Promise<LegalContent> {
  const next = { ...(await readLegal()), ...patch };
  await fs.writeFile(path.join(process.cwd(), FILE), JSON.stringify(next, null, 2), "utf8");
  return next;
}

// Minimaler Sanitizer für die Ausgabe des (admin-)gepflegten HTML: entfernt Skripte,
// Event-Handler und javascript:-URLs. (Editor erzeugt nur einfaches HTML.)
export function sanitizeLegal(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}
