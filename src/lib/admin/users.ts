// Mitarbeiter-Benutzer fürs Admin (users.json in DATA_DIR).
// Jeder Benutzer hat eine Menü-Rechteliste (perms = erlaubte Nav-Hrefs).
// Passwörter als scrypt-Hash (gleiche Helfer wie das Admin-Profil).
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import { dataPath } from "@/lib/data-dir";
import { hashPassword, verifyPasswordHash } from "./profile";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  perms: string[]; // erlaubte Nav-Hrefs, z. B. ["/admin/leads", "/admin/auftraege"]
  active: boolean;
  createdAt: string;
};

// Ansicht fürs Frontend – ohne Hash.
export type SafeUser = Omit<AdminUser, "passwordHash">;

const FILE = "users.json";

async function readAll(): Promise<AdminUser[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(dataPath(FILE), "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
async function writeAll(list: AdminUser[]): Promise<void> {
  await fs.writeFile(dataPath(FILE), JSON.stringify(list, null, 2), "utf8");
}

export function toSafeUser(u: AdminUser): SafeUser {
  const { passwordHash: _hash, ...safe } = u;
  return safe;
}

export async function listUsers(): Promise<SafeUser[]> {
  return (await readAll()).map(toSafeUser);
}

export async function getUser(id: string): Promise<AdminUser | null> {
  return (await readAll()).find((u) => u.id === id) ?? null;
}

export async function createUser(input: { name: string; email: string; password: string; perms: string[] }): Promise<{ ok: boolean; error?: string; user?: SafeUser }> {
  const name = input.name.trim().slice(0, 80);
  const email = input.email.trim().toLowerCase().slice(0, 160);
  if (!name || !/\S+@\S+\.\S+/.test(email)) return { ok: false, error: "Name und gültige E-Mail sind erforderlich." };
  if (!input.password || input.password.length < 8) return { ok: false, error: "Passwort braucht mindestens 8 Zeichen." };
  const list = await readAll();
  if (list.some((u) => u.email === email)) return { ok: false, error: "Für diese E-Mail existiert bereits ein Benutzer." };
  const user: AdminUser = {
    id: randomUUID(),
    name,
    email,
    passwordHash: hashPassword(input.password),
    perms: sanitizePerms(input.perms),
    active: true,
    createdAt: new Date().toISOString(),
  };
  list.push(user);
  await writeAll(list);
  return { ok: true, user: toSafeUser(user) };
}

export async function updateUser(
  id: string,
  patch: { name?: string; perms?: string[]; active?: boolean; password?: string },
): Promise<{ ok: boolean; error?: string; user?: SafeUser }> {
  const list = await readAll();
  const idx = list.findIndex((u) => u.id === id);
  if (idx === -1) return { ok: false, error: "Benutzer nicht gefunden." };
  const u = { ...list[idx] };
  if (patch.name !== undefined) u.name = patch.name.trim().slice(0, 80) || u.name;
  if (patch.perms !== undefined) u.perms = sanitizePerms(patch.perms);
  if (patch.active !== undefined) u.active = !!patch.active;
  if (patch.password) {
    if (patch.password.length < 8) return { ok: false, error: "Passwort braucht mindestens 8 Zeichen." };
    u.passwordHash = hashPassword(patch.password);
  }
  list[idx] = u;
  await writeAll(list);
  return { ok: true, user: toSafeUser(u) };
}

export async function deleteUser(id: string): Promise<boolean> {
  const list = await readAll();
  const next = list.filter((u) => u.id !== id);
  if (next.length === list.length) return false;
  await writeAll(next);
  return true;
}

export async function verifyUser(email: string, password: string): Promise<AdminUser | null> {
  const u = (await readAll()).find((x) => x.email === email.trim().toLowerCase());
  if (!u || !u.active) return null;
  return verifyPasswordHash(password, u.passwordHash) ? u : null;
}

// Nur echte Admin-Pfade zulassen; Inhaber-exklusive Bereiche nie vergeben.
const OWNER_ONLY = new Set(["/admin/users", "/admin/profile"]);
function sanitizePerms(perms: string[]): string[] {
  return Array.from(new Set(perms))
    .filter((p) => typeof p === "string" && /^\/admin\/[a-z-]+$/.test(p) && !OWNER_ONLY.has(p))
    .slice(0, 30);
}
