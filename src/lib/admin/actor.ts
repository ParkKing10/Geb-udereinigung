// Wer ist eingeloggt (Inhaber oder Mitarbeiter) und was darf er sehen?
// Server-only (liest users.json). Frische Rechte pro Request – Deaktivierung
// oder Rechteänderung greift sofort, nicht erst beim nächsten Login.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE, readSession } from "./auth";
import { getUser } from "./users";

export type Actor =
  | { kind: "owner" }
  | { kind: "user"; id: string; name: string; email: string; perms: string[] };

// Bereiche, die IMMER dem Inhaber vorbehalten sind.
export const OWNER_ONLY = ["/admin/users", "/admin/profile"];

export async function getActor(): Promise<Actor | null> {
  const store = await cookies();
  const session = await readSession(store.get(AUTH_COOKIE)?.value);
  if (!session) return null;
  if (session.sub === "admin") return { kind: "owner" };
  if (session.sub.startsWith("user:")) {
    const u = await getUser(session.sub.slice(5));
    if (!u || !u.active) return null; // gelöscht/deaktiviert → Session wertlos
    return { kind: "user", id: u.id, name: u.name, email: u.email, perms: u.perms };
  }
  return null;
}

// Eindeutiger Konto-Schlüssel für die Mandanten-Trennung (jeder Account = eigener
// Datenbereich). Inhaber → "owner"; Mitarbeiter-Account → "user:<id>".
export function accountKeyOf(actor: Actor): string {
  return actor.kind === "owner" ? "owner" : `user:${actor.id}`;
}

export async function currentAccountKey(): Promise<string | null> {
  const actor = await getActor();
  return actor ? accountKeyOf(actor) : null;
}

/** Darf der Actor diesen Nav-Bereich (Href) sehen? Dashboard ist immer erlaubt. */
export function can(actor: Actor, navHref: string): boolean {
  if (actor.kind === "owner") return true;
  if (OWNER_ONLY.includes(navHref)) return false;
  if (navHref === "/admin") return true;
  return actor.perms.includes(navHref);
}

/** Admin-Pfad → zuständiger Nav-Bereich (Sonderfälle wie Rechtstexte → Settings). */
export function navKeyForPath(path: string): string {
  if (path === "/admin" || path === "/admin/") return "/admin";
  if (path.startsWith("/admin/rechtstexte")) return "/admin/settings";
  if (path.startsWith("/admin/abgebrochen")) return "/admin/abgebrochen";
  const seg = path.split("/")[2] ?? "";
  return seg ? `/admin/${seg}` : "/admin";
}

/** Boolean-Variante für bestehende requireAdmin()-Helfer in den API-Routen. */
export async function hasNavAccess(navHref: string | "owner"): Promise<boolean> {
  const actor = await getActor();
  if (!actor) return false;
  if (navHref === "owner") return actor.kind === "owner";
  return can(actor, navHref);
}

/**
 * API-Wächter: null = erlaubt, sonst fertige Fehler-Response.
 * navHref = zuständiger Menüpunkt; "owner" = nur Inhaber.
 */
export async function guardNav(navHref: string | "owner"): Promise<NextResponse | null> {
  const actor = await getActor();
  if (!actor) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  if (navHref === "owner") {
    return actor.kind === "owner" ? null : NextResponse.json({ error: "Nur für den Inhaber." }, { status: 403 });
  }
  return can(actor, navHref) ? null : NextResponse.json({ error: "Keine Berechtigung für diesen Bereich." }, { status: 403 });
}
