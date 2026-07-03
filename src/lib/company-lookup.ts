// Firmen-Erkennung per IP (self-built, ohne Drittanbieter-Abo):
// 1) Reverse-DNS (PTR): Firmen-Anschlüsse zeigen oft auf firmenname.de-Hosts.
// 2) RDAP (öffentliche Register von RIPE/ARIN …): Organisation/Netzname des IP-Bereichs.
// Provider-/Hosting-IPs (Telekom, Vodafone, AWS …) werden gefiltert → null.
// DSGVO: Es wird ausschließlich der abgeleitete FIRMENNAME weiterverwendet, nie die IP.
import { promises as dns } from "node:dns";

const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE = 5000;

type CacheEntry = { value: string | null; at: number };
const cache: Map<string, CacheEntry> =
  ((globalThis as Record<string, unknown>).__dgdCompanyCache as Map<string, CacheEntry>) ?? new Map();
(globalThis as Record<string, unknown>).__dgdCompanyCache = cache;

// Endkunden-Provider + Hosting/Cloud (kein Firmen-Signal).
const ISP_PATTERN =
  /telekom|t-ipconnect|dtag|deutsche telekom|vodafone|kabel|unitymedia|telefonica|o2|1u?nd1|1&1|versatel|freenet|ewe|netcologne|m-?net|pyur|tele.?columbus|drei|a1 |swisscom|sunrise|magenta|congstar|mobilcom|drillisch|plusnet|qsc|htp|osnatel|wilhelm\.tel|dns:net|deutsche glasfaser|liberty global|upc|orange|proximus|bouygues|sfr|free sas|comcast|at&t|verizon|sky |starlink|aws|amazon|google|microsoft|azure|cloudflare|akamai|fastly|ovh|hetzner|digitalocean|linode|vultr|contabo|netcup|strato|ionos|hostinger|leaseweb|scaleway|alibaba|tencent|oracle|dyn[ao]|proxy|vpn|tor[- ]?exit/i;

function isPrivateIp(ip: string): boolean {
  return (
    /^(10\.|127\.|192\.168\.|169\.254\.|::1|f[cd])/i.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip === "" || ip === "unknown"
  );
}

function looksLikeIsp(s: string): boolean {
  return ISP_PATTERN.test(s);
}

// "SAP-SE" / "SIEMENS-AG-NET" → "Sap Se" bleibt hässlich; wir putzen nur grob.
function cleanName(raw: string): string {
  return raw
    .replace(/[-_]/g, " ")
    .replace(/\b(net|network|networks|range|block|infra|ip|ips|dsl|colo|noc)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 80);
}

async function ptrLookup(ip: string): Promise<string | null> {
  try {
    const names = await Promise.race([
      dns.reverse(ip),
      new Promise<string[]>((_, rej) => setTimeout(() => rej(new Error("timeout")), 1500)),
    ]);
    const host = names?.[0];
    if (!host || looksLikeIsp(host)) return null;
    // dynamische Endkunden-Muster (p5B1234.dip0…, ip-95-91…, dyn…)
    if (/(^|\.)((ip|host|dyn|dial|pool|ppp|dsl|cust|client|rev)[-.]?\d|p[0-9a-f]{6,})/i.test(host)) return null;
    // Second-Level-Domain als Firmen-Indiz (mail.firma-xyz.de → firma-xyz.de)
    const parts = host.toLowerCase().replace(/\.$/, "").split(".");
    if (parts.length < 2) return null;
    const sld = parts.slice(-2).join(".");
    if (looksLikeIsp(sld)) return null;
    return sld;
  } catch {
    return null;
  }
}

async function rdapLookup(ip: string): Promise<string | null> {
  try {
    const res = await fetch(`https://rdap.org/ip/${encodeURIComponent(ip)}`, {
      headers: { accept: "application/rdap+json" },
      signal: AbortSignal.timeout(2500),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      name?: string;
      entities?: { vcardArray?: [string, [string, unknown, string, string][]]; roles?: string[] }[];
    };
    // Organisation aus den vCards (bevorzugt registrant/org), sonst Netzname.
    let org: string | undefined;
    for (const e of data.entities ?? []) {
      const fn = e.vcardArray?.[1]?.find((row) => row[0] === "fn")?.[3];
      if (typeof fn === "string" && fn.trim()) {
        org = fn.trim();
        if (e.roles?.some((r) => r === "registrant" || r === "org")) break;
      }
    }
    const candidate = org || data.name || "";
    if (!candidate || looksLikeIsp(candidate)) return null;
    // reine Personen-Namen/Abuse-Kontakte grob aussieben
    if (/abuse|hostmaster|admin|contact|role/i.test(candidate)) return null;
    return cleanName(candidate) || null;
  } catch {
    return null;
  }
}

/** Firmenname zur IP – oder null (Privatanschluss/Provider/Hosting/unbekannt). */
export async function lookupCompany(ip: string): Promise<string | null> {
  if (!ip || isPrivateIp(ip)) return null;
  const hit = cache.get(ip);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  // RDAP zuerst (liefert echte Org-Namen), PTR als Ergänzung/Fallback.
  const [rdap, ptr] = await Promise.all([rdapLookup(ip), ptrLookup(ip)]);
  const value = rdap ?? ptr ?? null;

  if (cache.size > MAX_CACHE) cache.clear();
  cache.set(ip, { value, at: Date.now() });
  return value;
}
