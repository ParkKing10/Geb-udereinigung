// Push-Benachrichtigung bei neuem Lead via Pushover (https://pushover.net/api).
// Token + User-Key werden im Admin unter Settings gepflegt (app-settings, DATA_DIR)
// oder per ENV (PUSHOVER_TOKEN / PUSHOVER_USER). Fire-and-forget: Ein Fehler hier
// darf die Lead-Annahme NIEMALS blockieren.
import { pushoverConfig } from "@/lib/admin/app-settings";

const PUSHOVER_URL = "https://api.pushover.net/1/messages.json";
const TIMEOUT_MS = 6000;

export async function sendLeadAlert(input: { name: string; phone: string }): Promise<void> {
  try {
    const { pushoverToken, pushoverUser } = await pushoverConfig();
    if (!pushoverToken || !pushoverUser) return; // nicht konfiguriert → still überspringen

    const body = new URLSearchParams({
      token: pushoverToken,
      user: pushoverUser,
      title: "New Lead Alert",
      message: `Customer: ${input.name}\nNumber: ${input.phone}\nCompany: Deutsche Gebäudedienste`,
      priority: "1", // hohe Priorität: umgeht Ruhezeiten-Standard, kein Bestätigungszwang
      sound: "cashregister",
    });

    const res = await fetch(PUSHOVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Pushover-Benachrichtigung fehlgeschlagen:", res.status, detail.slice(0, 200));
    }
  } catch (err) {
    console.error("Pushover-Benachrichtigung fehlgeschlagen:", err instanceof Error ? err.message : err);
  }
}
