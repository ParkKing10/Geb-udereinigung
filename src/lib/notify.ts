// Lead-Benachrichtigung per E-Mail an die Pushover-Gateway-Adresse (…@pomail.net):
// Pushover stellt eingehende Mails als Push zu (Betreff = Titel, Text = Nachricht).
// Versand über das Standard-Postfach aus dem E-Mails-Modul. Fire-and-forget:
// Ein Fehler hier darf die Lead-Annahme NIEMALS blockieren.
import { leadNotifyEmail } from "@/lib/admin/app-settings";
import { readAccounts } from "@/lib/email/store";
import { sendMail } from "@/lib/email/send";

export async function sendLeadAlert(input: { name: string; phone: string }): Promise<void> {
  try {
    // Mehrere Empfänger möglich (Komma-getrennt im Settings-Feld) – ein Versand an alle.
    const recipients = (await leadNotifyEmail())
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => /\S+@\S+\.\S+/.test(s));
    if (recipients.length === 0) return; // nicht konfiguriert → still überspringen

    const accounts = await readAccounts();
    const acc = accounts.find((a) => a.isDefault) ?? accounts[0];
    if (!acc?.smtpHost) {
      console.error("Lead-Benachrichtigung: kein SMTP-Postfach konfiguriert (Admin → E-Mails).");
      return;
    }

    // Pushover nutzt den Text-Teil; buildBody in sendMail wandelt <br> in Zeilenumbrüche.
    await sendMail(acc, {
      to: recipients.join(", "),
      subject: "New Lead Alert",
      html: `Customer: ${input.name}<br>Number: ${input.phone}<br>Company: Deutsche Gebäudedienste`,
    });
  } catch (err) {
    console.error("Lead-Benachrichtigung fehlgeschlagen:", err instanceof Error ? err.message : err);
  }
}
