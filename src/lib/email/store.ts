// Datei-basierter Store fürs E-Mail-Modul: Postfächer (SMTP/IMAP), Signaturen, Nachrichten.
// Passwörter liegen (wie die übrigen JSON-Stores) lokal auf der Platte – werden aber NIE
// ans Frontend zurückgegeben (siehe redactAccount). Für Produktion: Datei schützen und
// idealerweise App-spezifische Passwörter des Postfach-Anbieters verwenden.
import { promises as fs } from "node:fs";
import { dataPath } from "@/lib/data-dir";
import { randomUUID } from "node:crypto";

export type Signature = {
  id: string;
  name: string; // interner Name, z. B. "Kundensupport"
  displayName: string; // angezeigter Absendername, z. B. "Nina Reiter"
  role: string; // z. B. "Kundenbetreuung · Deutsche Gebäudedienste"
  photo?: string; // /uploads/email/...
  html: string; // Signatur-Text (einfaches HTML)
};

export type MailAccount = {
  id: string;
  label: string; // interner Name, z. B. "Info-Postfach"
  fromName: string; // Anzeigename im Absender
  address: string; // E-Mail-Adresse
  // Senden (SMTP)
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean; // true = SSL (465), false = STARTTLS (587)
  smtpUser: string;
  smtpPass: string;
  // Empfangen (IMAP)
  imapHost: string;
  imapPort: number;
  imapSecure: boolean; // true = SSL (993)
  imapUser: string;
  imapPass: string;
  signatureId?: string; // Standard-Signatur
  isDefault?: boolean;
  createdAt: string;
};

// Account ohne Geheimnisse – so geht er ans Frontend.
export type SafeAccount = Omit<MailAccount, "smtpPass" | "imapPass"> & {
  hasSmtpPass: boolean;
  hasImapPass: boolean;
};

export type MailFolder = "inbox" | "sent" | "outbox";
export type MailStatus = "queued" | "sent" | "failed";

export type MailMessage = {
  id: string;
  accountId: string;
  folder: MailFolder;
  direction: "in" | "out";
  fromName?: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  date: string; // ISO
  read: boolean;
  status?: MailStatus;
  error?: string;
  uid?: number; // IMAP-UID zur Deduplizierung
};

const ACCOUNTS = "email-accounts.json";
const SIGNATURES = "email-signatures.json";
const MESSAGES = "email-messages.json";

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(dataPath(file), "utf8")) as T;
  } catch {
    return fallback;
  }
}
async function writeJson(file: string, data: unknown): Promise<void> {
  await fs.writeFile(dataPath(file), JSON.stringify(data, null, 2), "utf8");
}

// ── Accounts ────────────────────────────────────────────────
export async function readAccounts(): Promise<MailAccount[]> {
  const a = await readJson<MailAccount[]>(ACCOUNTS, []);
  return Array.isArray(a) ? a : [];
}
export function redactAccount(a: MailAccount): SafeAccount {
  const { smtpPass, imapPass, ...rest } = a;
  return { ...rest, hasSmtpPass: Boolean(smtpPass), hasImapPass: Boolean(imapPass) };
}
export async function readSafeAccounts(): Promise<SafeAccount[]> {
  return (await readAccounts()).map(redactAccount);
}
export async function getAccount(id: string): Promise<MailAccount | undefined> {
  return (await readAccounts()).find((a) => a.id === id);
}

type AccountInput = Partial<MailAccount> & { label: string; address: string };

export async function createAccount(input: AccountInput): Promise<SafeAccount> {
  const list = await readAccounts();
  const account: MailAccount = {
    id: randomUUID(),
    label: input.label,
    fromName: input.fromName ?? input.label,
    address: input.address,
    smtpHost: input.smtpHost ?? "",
    smtpPort: input.smtpPort ?? 587,
    smtpSecure: input.smtpSecure ?? false,
    smtpUser: input.smtpUser ?? input.address,
    smtpPass: input.smtpPass ?? "",
    imapHost: input.imapHost ?? "",
    imapPort: input.imapPort ?? 993,
    imapSecure: input.imapSecure ?? true,
    imapUser: input.imapUser ?? input.address,
    imapPass: input.imapPass ?? "",
    signatureId: input.signatureId,
    isDefault: list.length === 0 ? true : Boolean(input.isDefault),
    createdAt: new Date().toISOString(),
  };
  const next = input.isDefault ? list.map((a) => ({ ...a, isDefault: false })) : list;
  await writeJson(ACCOUNTS, [...next, account]);
  return redactAccount(account);
}

// Update. Passwortfelder werden nur überschrieben, wenn ein nicht-leerer Wert kommt
// (leeres Feld = "Passwort behalten"). So muss der Nutzer das PW nicht neu eintippen.
export async function updateAccount(id: string, patch: Partial<MailAccount>): Promise<SafeAccount | null> {
  const list = await readAccounts();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const cur = list[idx];
  const merged: MailAccount = {
    ...cur,
    ...patch,
    id: cur.id,
    createdAt: cur.createdAt,
    smtpPass: patch.smtpPass ? patch.smtpPass : cur.smtpPass,
    imapPass: patch.imapPass ? patch.imapPass : cur.imapPass,
  };
  let next = list.map((a, i) => (i === idx ? merged : a));
  if (patch.isDefault) next = next.map((a) => (a.id === id ? a : { ...a, isDefault: false }));
  await writeJson(ACCOUNTS, next);
  return redactAccount(merged);
}

export async function deleteAccount(id: string): Promise<void> {
  const list = await readAccounts();
  let next = list.filter((a) => a.id !== id);
  // Falls das Standard-Postfach gelöscht wurde: erstes verbleibendes wird Standard.
  if (next.length && !next.some((a) => a.isDefault)) next = next.map((a, i) => ({ ...a, isDefault: i === 0 }));
  await writeJson(ACCOUNTS, next);
}

// ── Signaturen ──────────────────────────────────────────────
export async function readSignatures(): Promise<Signature[]> {
  const s = await readJson<Signature[]>(SIGNATURES, []);
  return Array.isArray(s) ? s : [];
}
export async function getSignature(id: string): Promise<Signature | undefined> {
  return (await readSignatures()).find((s) => s.id === id);
}
export async function saveSignature(sig: Partial<Signature> & { name: string }): Promise<Signature> {
  const list = await readSignatures();
  if (sig.id) {
    const idx = list.findIndex((s) => s.id === sig.id);
    if (idx !== -1) {
      const merged = { ...list[idx], ...sig } as Signature;
      await writeJson(SIGNATURES, list.map((s, i) => (i === idx ? merged : s)));
      return merged;
    }
  }
  const created: Signature = {
    id: randomUUID(),
    name: sig.name,
    displayName: sig.displayName ?? "",
    role: sig.role ?? "",
    photo: sig.photo,
    html: sig.html ?? "",
  };
  await writeJson(SIGNATURES, [...list, created]);
  return created;
}
export async function deleteSignature(id: string): Promise<void> {
  const list = await readSignatures();
  await writeJson(SIGNATURES, list.filter((s) => s.id !== id));
}

// ── Nachrichten ─────────────────────────────────────────────
export async function readMessages(): Promise<MailMessage[]> {
  const m = await readJson<MailMessage[]>(MESSAGES, []);
  return Array.isArray(m) ? m : [];
}
export async function addMessage(msg: Omit<MailMessage, "id">): Promise<MailMessage> {
  const list = await readMessages();
  const created: MailMessage = { ...msg, id: randomUUID() };
  await writeJson(MESSAGES, [created, ...list]);
  return created;
}
// Fügt IMAP-Nachrichten hinzu, überspringt bereits vorhandene (accountId + uid).
export async function addInboundBatch(accountId: string, items: Omit<MailMessage, "id" | "accountId" | "folder" | "direction" | "read">[]): Promise<number> {
  const list = await readMessages();
  const seen = new Set(list.filter((m) => m.accountId === accountId && m.uid != null).map((m) => `${m.uid}`));
  const fresh = items
    .filter((it) => it.uid == null || !seen.has(`${it.uid}`))
    .map((it) => ({ ...it, id: randomUUID(), accountId, folder: "inbox" as const, direction: "in" as const, read: false }));
  if (fresh.length) await writeJson(MESSAGES, [...fresh, ...list]);
  return fresh.length;
}
export async function patchMessage(id: string, patch: Partial<MailMessage>): Promise<MailMessage | null> {
  const list = await readMessages();
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  const merged = { ...list[idx], ...patch, id };
  await writeJson(MESSAGES, list.map((m, i) => (i === idx ? merged : m)));
  return merged;
}
export async function deleteMessage(id: string): Promise<void> {
  const list = await readMessages();
  await writeJson(MESSAGES, list.filter((m) => m.id !== id));
}
