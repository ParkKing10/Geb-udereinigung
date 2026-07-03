// Zentrale, im Admin editierbare App-Einstellungen (app-settings.json).
// Tracking-IDs + KI-Key können hier gesetzt werden und überschreiben die ENV-Defaults.
// So muss der Betreiber nichts in .env-Dateien anfassen.
import { promises as fs } from "node:fs";
import { dataPath } from "@/lib/data-dir";

export type TrackingSettings = {
  gaId: string; // G-XXXXXXX
  adsId: string; // AW-XXXXXXXXXX
  adsLeadLabel: string;
  adsContactLabel: string;
  adsCallLabel: string;
};

export type AiSettings = {
  anthropicKey: string; // Geheimnis – wird NIE ans Frontend zurückgegeben
  model: string;
};

// Lead-Benachrichtigung: E-Mail an die Pushover-Gateway-Adresse (…@pomail.net),
// Pushover stellt sie als Push zu. Versand über das Standard-Postfach (E-Mails-Modul).
export type NotifySettings = {
  notifyEmail: string; // Empfänger, z. B. xxxxxx@pomail.net (nicht öffentlich machen → Spam-Schutz)
};

export type AppSettings = {
  tracking: TrackingSettings;
  ai: AiSettings;
  notify: NotifySettings;
};

// Client-sichere Variante (Keys redigiert; die Benachrichtigungs-Adresse ist
// nur im Admin sichtbar – das ist okay).
export type SafeAppSettings = {
  tracking: TrackingSettings;
  ai: { hasKey: boolean; model: string };
  notify: NotifySettings;
};

const FILE = "app-settings.json";

function envDefaults(): AppSettings {
  return {
    tracking: {
      gaId: process.env.NEXT_PUBLIC_GA_ID?.trim() || "",
      adsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "",
      adsLeadLabel: process.env.NEXT_PUBLIC_ADS_LEAD_LABEL?.trim() || "",
      adsContactLabel: process.env.NEXT_PUBLIC_ADS_CONTACT_LABEL?.trim() || "",
      adsCallLabel: process.env.NEXT_PUBLIC_ADS_CALL_LABEL?.trim() || "",
    },
    ai: {
      anthropicKey: process.env.ANTHROPIC_API_KEY?.trim() || "",
      model: process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6",
    },
    notify: {
      notifyEmail: process.env.LEAD_NOTIFY_EMAIL?.trim() || "",
    },
  };
}

async function readRaw(): Promise<Partial<AppSettings>> {
  try {
    return JSON.parse(await fs.readFile(dataPath(FILE), "utf8")) as Partial<AppSettings>;
  } catch {
    return {};
  }
}

// Gemergt: gespeicherte Werte gewinnen; wo leer, greift der ENV-Default.
export async function readAppSettings(): Promise<AppSettings> {
  const env = envDefaults();
  const saved = await readRaw();
  return {
    tracking: {
      gaId: saved.tracking?.gaId || env.tracking.gaId,
      adsId: saved.tracking?.adsId || env.tracking.adsId,
      adsLeadLabel: saved.tracking?.adsLeadLabel || env.tracking.adsLeadLabel,
      adsContactLabel: saved.tracking?.adsContactLabel || env.tracking.adsContactLabel,
      adsCallLabel: saved.tracking?.adsCallLabel || env.tracking.adsCallLabel,
    },
    ai: {
      anthropicKey: saved.ai?.anthropicKey || env.ai.anthropicKey,
      model: saved.ai?.model || env.ai.model,
    },
    notify: {
      notifyEmail: saved.notify?.notifyEmail ?? env.notify.notifyEmail,
    },
  };
}

export async function readSafeAppSettings(): Promise<SafeAppSettings> {
  const s = await readAppSettings();
  return {
    tracking: s.tracking,
    ai: { hasKey: Boolean(s.ai.anthropicKey), model: s.ai.model },
    notify: s.notify,
  };
}

// Nur validierte Tracking-IDs ausliefern (verhindert kaputte gtag-Ladeaufrufe).
export function validTracking(t: TrackingSettings): TrackingSettings {
  return {
    gaId: /^G-[A-Z0-9]+$/i.test(t.gaId) ? t.gaId : "",
    adsId: /^AW-\d+$/.test(t.adsId) ? t.adsId : "",
    adsLeadLabel: t.adsLeadLabel || "",
    adsContactLabel: t.adsContactLabel || "",
    adsCallLabel: t.adsCallLabel || "",
  };
}

export async function publicTracking(): Promise<TrackingSettings> {
  return validTracking((await readAppSettings()).tracking);
}

// Server-seitig für die KI-Generatoren (Blog, E-Mail, Kostenschätzung).
export async function anthropicConfig(): Promise<{ key: string; model: string }> {
  const s = await readAppSettings();
  return { key: s.ai.anthropicKey, model: s.ai.model };
}

// Server-seitig für Lead-Benachrichtigungen (siehe lib/notify.ts).
export async function leadNotifyEmail(): Promise<string> {
  return (await readAppSettings()).notify.notifyEmail;
}

type SavePatch = {
  tracking?: Partial<TrackingSettings>;
  ai?: Partial<AiSettings>; // anthropicKey nur überschreiben, wenn nicht-leer (leer = behalten)
  notify?: Partial<NotifySettings>; // notifyEmail darf auch geleert werden (= Benachrichtigung aus)
};

export async function saveAppSettings(patch: SavePatch): Promise<SafeAppSettings> {
  const cur = await readAppSettings();
  const next: AppSettings = {
    tracking: { ...cur.tracking, ...(patch.tracking ?? {}) },
    ai: {
      model: patch.ai?.model ?? cur.ai.model,
      // Leeres Key-Feld = unverändert lassen (Nutzer muss den Key nicht neu eintippen).
      anthropicKey: patch.ai?.anthropicKey ? patch.ai.anthropicKey : cur.ai.anthropicKey,
    },
    notify: {
      notifyEmail: patch.notify?.notifyEmail !== undefined ? patch.notify.notifyEmail.trim() : cur.notify.notifyEmail,
    },
  };
  await fs.writeFile(dataPath(FILE), JSON.stringify(next, null, 2), "utf8");
  return {
    tracking: next.tracking,
    ai: { hasKey: Boolean(next.ai.anthropicKey), model: next.ai.model },
    notify: next.notify,
  };
}
