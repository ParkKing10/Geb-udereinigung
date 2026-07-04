// Mandanten-Trennung: Jeder Account (Inhaber oder Mitarbeiter-Account) sieht nur die
// von IHM angelegten Datensätze. Datensätze ohne ownerId gelten als dem Inhaber gehörig
// (Bestandsdaten aus der Zeit vor der Trennung + alle Website-Zuläufe).
import { currentAccountKey } from "./actor";

export const OWNER_KEY = "owner";

type Owned = { ownerId?: string | null };

/** Besitzer eines Datensatzes – fehlt die Kennung, gehört er dem Inhaber. */
export function recOwner(rec: Owned): string {
  return rec.ownerId || OWNER_KEY;
}

/** Auf den aktuellen Account filtern. Ohne gültige Session → leer (kein Leak). */
export async function scopeToAccount<T extends Owned>(recs: T[]): Promise<T[]> {
  const key = await currentAccountKey();
  if (!key) return [];
  return recs.filter((r) => recOwner(r) === key);
}

/** Gehört dieser Datensatz dem aktuellen Account? Für Detail-/Änderungs-/Lösch-Wächter. */
export async function ownsRecord(rec: Owned | null | undefined): Promise<boolean> {
  if (!rec) return false;
  const key = await currentAccountKey();
  return !!key && recOwner(rec) === key;
}

/** Ist der aktuelle Account der Inhaber? Für reine Website-Daten (Nachrichten, Sessions). */
export async function isOwnerAccount(): Promise<boolean> {
  return (await currentAccountKey()) === OWNER_KEY;
}
