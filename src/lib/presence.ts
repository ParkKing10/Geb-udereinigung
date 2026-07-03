// Live-Präsenz der Website-Besucher (In-Memory, kein Persistenz-Bedarf).
// Besucher senden alle ~15 s einen Beacon (/api/presence); Einträge älter als
// STALE_MS gelten als offline. globalThis-Anker überlebt HMR im Dev-Modus.

export type QuoteState = { open: boolean; step: number; hasContact: boolean };
export type PresenceEntry = {
  sid: string;
  path: string;
  firstSeen: number;
  lastSeen: number;
  quote: QuoteState | null;
  // Herkunft (server-seitig aus Referrer/UTM abgeleitet, anonym)
  label?: string;
  emoji?: string;
  keyword?: string;
  // Technik-Infos – nur im flüchtigen Speicher, wird NIE persistiert (DSGVO)
  ip?: string;
  country?: string; // ISO-Code aus Cloudflare-Header (cf-ipcountry)
  device?: "mobile" | "desktop";
};

const STALE_MS = 45_000;

const store: Map<string, PresenceEntry> =
  ((globalThis as Record<string, unknown>).__dgdPresence as Map<string, PresenceEntry>) ??
  new Map<string, PresenceEntry>();
(globalThis as Record<string, unknown>).__dgdPresence = store;

function prune(): void {
  const cut = Date.now() - STALE_MS;
  for (const [k, v] of store) if (v.lastSeen < cut) store.delete(k);
}

export function updatePresence(
  sid: string,
  path: string,
  quote: QuoteState | null,
  src?: { label: string; emoji: string; keyword?: string },
  tech?: { ip?: string; country?: string; device?: "mobile" | "desktop" },
): void {
  prune();
  const now = Date.now();
  const prev = store.get(sid);
  store.set(sid, {
    sid,
    path,
    firstSeen: prev?.firstSeen ?? now,
    lastSeen: now,
    quote,
    label: src?.label ?? prev?.label,
    emoji: src?.emoji ?? prev?.emoji,
    keyword: src?.keyword ?? prev?.keyword,
    ip: tech?.ip ?? prev?.ip,
    country: tech?.country ?? prev?.country,
    device: tech?.device ?? prev?.device,
  });
}

export function presenceSnapshot(): PresenceEntry[] {
  prune();
  return Array.from(store.values()).sort((a, b) => b.lastSeen - a.lastSeen);
}
