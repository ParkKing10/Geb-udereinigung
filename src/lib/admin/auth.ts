// Session-Handling fürs Admin (Edge-kompatibel via Web Crypto – läuft in Middleware & Route Handlern).
export const AUTH_COOKIE = "dgd_admin";
// In Produktion MUSS AUTH_SECRET gesetzt sein – sonst könnte jeder mit Quellcode-Zugriff
// über den bekannten Fallback-Schlüssel gültige Session-Tokens fälschen (Auth-Bypass).
// Nur im Dev-Modus greift der unsichere Default, damit der lokale Server ohne .env läuft.
const SECRET = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET fehlt. Setze in Produktion einen langen, zufälligen Wert (z. B. `openssl rand -base64 32`) – sonst sind Admin-Sessions fälschbar.");
}
const DAY_MS = 24 * 60 * 60 * 1000;

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function strToB64url(s: string): string {
  return bytesToB64url(new TextEncoder().encode(s));
}
function b64urlToStr(s: string): string {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return bytesToB64url(new Uint8Array(sig));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // Sekunden

export async function createSession(days = 7): Promise<string> {
  const payload = strToB64url(JSON.stringify({ sub: "admin", exp: Date.now() + days * DAY_MS }));
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifySession(token?: string | null): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await hmac(payload);
  if (!safeEqual(sig, expected)) return false;
  try {
    const { exp } = JSON.parse(b64urlToStr(payload));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}
