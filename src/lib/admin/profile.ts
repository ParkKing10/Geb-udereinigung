// Admin-Profil-Store (admin-profile.json in DATA_DIR): persönliche Daten, Passwort (scrypt),
// 2FA (TOTP nach RFC 6238) inkl. Backup-Codes, Login-Benachrichtigungen.
// Server-only (node:crypto/fs). Client-sichere Typen liegen in profile-types.ts.
import { promises as fs } from "node:fs";
import { randomBytes, scryptSync, timingSafeEqual, createHmac, createHash } from "node:crypto";
import { dataPath } from "@/lib/data-dir";
import { CONTACT } from "@/lib/sauberfit-data";
import type { AdminProfile, SafeProfile } from "./profile-types";

export type { AdminProfile, SafeProfile, TwoFactor } from "./profile-types";
export { initials } from "./profile-types";

const FILE = "admin-profile.json";
const ISSUER = "Deutsche Gebäudedienste";

function defaults(): AdminProfile {
  return {
    firstName: "Christian-Alexandru",
    lastName: "Mitrea",
    email: CONTACT.email,
    phone: CONTACT.phone,
    twoFactor: { enabled: false },
    loginAlerts: false,
  };
}

export async function readProfile(): Promise<AdminProfile> {
  try {
    const saved = JSON.parse(await fs.readFile(dataPath(FILE), "utf8")) as Partial<AdminProfile>;
    const d = defaults();
    return {
      ...d,
      ...saved,
      twoFactor: { enabled: false, ...(saved.twoFactor ?? {}) },
      loginAlerts: saved.loginAlerts ?? d.loginAlerts,
    };
  } catch {
    return defaults();
  }
}

async function writeProfile(patch: Partial<AdminProfile>): Promise<AdminProfile> {
  const next: AdminProfile = { ...(await readProfile()), ...patch, updatedAt: new Date().toISOString() };
  await fs.writeFile(dataPath(FILE), JSON.stringify(next, null, 2), "utf8");
  return next;
}

export function toSafe(p: AdminProfile): SafeProfile {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    phone: p.phone,
    avatar: p.avatar,
    twoFactorEnabled: !!p.twoFactor?.enabled,
    hasCustomPassword: !!p.passwordHash,
    loginAlerts: !!p.loginAlerts,
  };
}

export async function readSafeProfile(): Promise<SafeProfile> {
  return toSafe(await readProfile());
}

// ── Persönliche Daten + Login-Alerts ────────────────────────
export async function saveProfileData(patch: {
  firstName?: string; lastName?: string; email?: string; phone?: string; avatar?: string; loginAlerts?: boolean;
}): Promise<SafeProfile> {
  const clean: Partial<AdminProfile> = {};
  if (patch.firstName !== undefined) clean.firstName = patch.firstName.trim().slice(0, 80);
  if (patch.lastName !== undefined) clean.lastName = patch.lastName.trim().slice(0, 80);
  if (patch.email !== undefined) clean.email = patch.email.trim().slice(0, 160);
  if (patch.phone !== undefined) clean.phone = patch.phone.trim().slice(0, 60);
  if (patch.avatar !== undefined) clean.avatar = patch.avatar;
  if (patch.loginAlerts !== undefined) clean.loginAlerts = !!patch.loginAlerts;
  return toSafe(await writeProfile(clean));
}

// ── Passwort (scrypt) ───────────────────────────────────────
export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pw, salt, 32);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

function verifyHash(pw: string, stored: string): boolean {
  const [algo, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = scryptSync(pw, Buffer.from(saltB64, "base64"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function constEq(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// Env-Passwort als dauerhafter Notfall-/Master-Zugang (verhindert Aussperren):
// funktioniert IMMER, auch wenn ein eigenes Passwort gesetzt wurde.
function envPassword(): string {
  return process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "admin" : "");
}

/** Prüft ein Passwort gegen das eigene (Hash) ODER das in Render gesetzte ADMIN_PASSWORD. */
export async function verifyAdminPassword(pw: string): Promise<boolean> {
  if (!pw) return false;
  const p = await readProfile();
  if (p.passwordHash && verifyHash(pw, p.passwordHash)) return true;
  const env = envPassword();
  return !!env && constEq(pw, env);
}

/** Ist der Admin-Login überhaupt konfiguriert (eigenes Passwort ODER Env)? */
export async function isLoginConfigured(): Promise<boolean> {
  const p = await readProfile();
  return !!p.passwordHash || !!envPassword();
}

export async function changePassword(current: string, next: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await verifyAdminPassword(current))) return { ok: false, error: "Aktuelles Passwort ist falsch." };
  if (!next || next.length < 8) return { ok: false, error: "Neues Passwort muss mindestens 8 Zeichen haben." };
  await writeProfile({ passwordHash: hashPassword(next) });
  return { ok: true };
}

// ── TOTP (RFC 6238, SHA-1, 6-stellig, 30s) ──────────────────
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = "";
  for (const byte of buf) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(s: string): Buffer {
  const clean = s.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0, value = 0; const out: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | B32.indexOf(ch); bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return Buffer.from(out);
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", secret).update(buf).digest();
  const offset = h[h.length - 1] & 0xf;
  const code = ((h[offset] & 0x7f) << 24) | ((h[offset + 1] & 0xff) << 16) | ((h[offset + 2] & 0xff) << 8) | (h[offset + 3] & 0xff);
  return (code % 1_000_000).toString().padStart(6, "0");
}

/** Verifiziert einen 6-stelligen TOTP-Code (± window Zeitfenster à 30s). */
export function verifyTotp(secretB32: string, token: string, window = 1): boolean {
  const t = (token || "").replace(/\D/g, "");
  if (t.length !== 6) return false;
  const secret = base32Decode(secretB32);
  const counter = Math.floor(Date.now() / 30000);
  for (let i = -window; i <= window; i++) {
    if (constEq(hotp(secret, counter + i), t)) return true;
  }
  return false;
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function otpauthUrl(secretB32: string, account: string): string {
  const label = encodeURIComponent(`${ISSUER}:${account}`);
  const params = new URLSearchParams({ secret: secretB32, issuer: ISSUER, algorithm: "SHA1", digits: "6", period: "30" });
  return `otpauth://totp/${label}?${params.toString()}`;
}

// ── Backup-Codes ────────────────────────────────────────────
function hashCode(code: string): string {
  return createHash("sha256").update(code.toLowerCase().replace(/[^a-z0-9]/g, "")).digest("hex");
}

function makeBackupCodes(n = 8): { plain: string[]; hashed: string[] } {
  const plain = Array.from({ length: n }, () => {
    const raw = randomBytes(5).toString("hex").slice(0, 10); // 10 hex-Zeichen
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
  return { plain, hashed: plain.map(hashCode) };
}

// ── 2FA-Ablauf ──────────────────────────────────────────────
/** Setup starten: neues (noch nicht aktives) Secret + otpauth-URL zum Scannen/Eintragen. */
export async function begin2faSetup(): Promise<{ secret: string; otpauthUrl: string; account: string }> {
  const p = await readProfile();
  const account = p.email || "admin";
  const secret = generateTotpSecret();
  return { secret, otpauthUrl: otpauthUrl(secret, account), account };
}

/** 2FA aktivieren: Secret + korrekter Code nötig. Gibt einmalig die Klartext-Backup-Codes zurück. */
export async function enable2fa(secret: string, code: string): Promise<{ ok: boolean; error?: string; backupCodes?: string[] }> {
  if (!secret || !verifyTotp(secret, code)) return { ok: false, error: "Code ungültig. Bitte erneut aus der App eingeben." };
  const { plain, hashed } = makeBackupCodes();
  await writeProfile({ twoFactor: { enabled: true, secret, backupCodes: hashed } });
  return { ok: true, backupCodes: plain };
}

/** 2FA deaktivieren: aktuelles Passwort ODER gültiger TOTP-/Backup-Code nötig. */
export async function disable2fa(proof: string): Promise<{ ok: boolean; error?: string }> {
  const p = await readProfile();
  if (!p.twoFactor.enabled) return { ok: true };
  const ok = (await verifyAdminPassword(proof)) || (!!p.twoFactor.secret && verifyTotp(p.twoFactor.secret, proof));
  if (!ok) return { ok: false, error: "Passwort oder Code ungültig." };
  await writeProfile({ twoFactor: { enabled: false } });
  return { ok: true };
}

/** Login-Schritt 2: prüft TOTP-Code oder verbraucht einen Backup-Code. */
export async function verifySecondFactor(input: string): Promise<boolean> {
  const p = await readProfile();
  if (!p.twoFactor.enabled || !p.twoFactor.secret) return true; // keine 2FA aktiv
  if (verifyTotp(p.twoFactor.secret, input)) return true;
  // Backup-Code prüfen + verbrauchen
  const h = hashCode(input);
  const codes = p.twoFactor.backupCodes ?? [];
  const idx = codes.indexOf(h);
  if (idx === -1) return false;
  const remaining = codes.slice(0, idx).concat(codes.slice(idx + 1));
  await writeProfile({ twoFactor: { ...p.twoFactor, backupCodes: remaining } });
  return true;
}

export async function is2faEnabled(): Promise<boolean> {
  return (await readProfile()).twoFactor.enabled;
}
