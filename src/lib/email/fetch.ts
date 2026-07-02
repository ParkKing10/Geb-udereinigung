// E-Mail-Empfang: holt die letzten Nachrichten aus dem IMAP-Postfach und parst sie.
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import type { MailAccount } from "./store";

export type FetchedMail = {
  uid: number;
  fromName?: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  date: string;
};

export async function fetchInbox(account: MailAccount, limit = 30): Promise<FetchedMail[]> {
  if (!account.imapHost || !account.imapUser) {
    throw new Error("Kein IMAP für dieses Postfach konfiguriert. Bitte in den Postfach-Einstellungen IMAP-Server, Benutzer und Passwort hinterlegen.");
  }
  const client = new ImapFlow({
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapSecure,
    auth: { user: account.imapUser, pass: account.imapPass },
    logger: false,
  });

  const out: FetchedMail[] = [];
  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const box = client.mailbox;
      const total = typeof box === "object" && box ? box.exists : 0;
      if (!total) return [];
      const start = Math.max(1, total - limit + 1);
      for await (const msg of client.fetch(`${start}:*`, { uid: true, source: true, envelope: true })) {
        if (!msg.source) continue;
        const parsed = await simpleParser(msg.source);
        const fromAddr = parsed.from?.value?.[0];
        out.push({
          uid: msg.uid,
          fromName: fromAddr?.name || undefined,
          from: fromAddr?.address || "",
          to: Array.isArray(parsed.to) ? parsed.to.map((t) => t.text).join(", ") : parsed.to?.text || account.address,
          subject: parsed.subject || "(kein Betreff)",
          text: parsed.text || "",
          html: typeof parsed.html === "string" ? parsed.html : undefined,
          date: (parsed.date || new Date()).toISOString(),
        });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
  // Neueste zuerst.
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}
