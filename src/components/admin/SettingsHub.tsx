"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, Check, Loader2, BarChart3, Sparkles, Mail, ScrollText, ArrowRight, ShieldCheck, BellRing } from "lucide-react";
import type { SafeAppSettings } from "@/lib/admin/app-settings";

const field = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5d8a34] focus:ring-2 focus:ring-[#5d8a34]/15";
const lbl = "mb-1 block text-xs font-medium text-neutral-500";

function Card({ icon: Icon, title, hint, children }: { icon: typeof BarChart3; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#eef3e7] text-[#5d8a34]"><Icon size={18} /></span>
        <div>
          <h2 className="text-sm font-bold text-neutral-900">{title}</h2>
          <p className="text-xs text-neutral-400">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function LinkCard({ icon: Icon, title, hint, href, cta }: { icon: typeof Mail; title: string; hint: string; href: string; cta: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-[#5d8a34]">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#eef3e7] text-[#5d8a34]"><Icon size={18} /></span>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-bold text-neutral-900">{title}</h2>
        <p className="text-xs text-neutral-400">{hint}</p>
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5d8a34]">{cta} <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></span>
    </Link>
  );
}

export function SettingsHub({ initial }: { initial: SafeAppSettings }) {
  const [gaId, setGaId] = useState(initial.tracking.gaId);
  const [adsId, setAdsId] = useState(initial.tracking.adsId);
  const [leadLabel, setLeadLabel] = useState(initial.tracking.adsLeadLabel);
  const [contactLabel, setContactLabel] = useState(initial.tracking.adsContactLabel);
  const [callLabel, setCallLabel] = useState(initial.tracking.adsCallLabel);
  const [tSaving, setTSaving] = useState(false); const [tSaved, setTSaved] = useState(false);

  const [key, setKey] = useState("");
  const [model, setModel] = useState(initial.ai.model);
  const [hasKey, setHasKey] = useState(initial.ai.hasKey);
  const [aiSaving, setAiSaving] = useState(false); const [aiSaved, setAiSaved] = useState(false);

  const [poToken, setPoToken] = useState("");
  const [poUser, setPoUser] = useState("");
  const [hasPushover, setHasPushover] = useState(initial.notify.hasPushover);
  const [poSaving, setPoSaving] = useState(false); const [poSaved, setPoSaved] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function saveTracking() {
    setTSaving(true); setTSaved(false); setError(null);
    try {
      const res = await fetch("/api/admin/app-settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking: { gaId, adsId, adsLeadLabel: leadLabel, adsContactLabel: contactLabel, adsCallLabel: callLabel } }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Fehler");
      setTSaved(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Fehler"); } finally { setTSaving(false); }
  }

  async function saveAi() {
    setAiSaving(true); setAiSaved(false); setError(null);
    try {
      const res = await fetch("/api/admin/app-settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai: { model, ...(key ? { anthropicKey: key } : {}) } }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Fehler");
      setHasKey(j.ai?.hasKey ?? hasKey);
      setKey("");
      setAiSaved(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Fehler"); } finally { setAiSaving(false); }
  }

  async function savePushover() {
    setPoSaving(true); setPoSaved(false); setError(null);
    try {
      const res = await fetch("/api/admin/app-settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notify: { ...(poToken ? { pushoverToken: poToken } : {}), ...(poUser ? { pushoverUser: poUser } : {}) } }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Fehler");
      setHasPushover(j.notify?.hasPushover ?? hasPushover);
      setPoToken(""); setPoUser("");
      setPoSaved(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Fehler"); } finally { setPoSaving(false); }
  }

  const trackingOn = Boolean(gaId || adsId);

  return (
    <div className="space-y-5">
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Tracking & Datenschutz */}
        <Card icon={BarChart3} title="Tracking & Datenschutz" hint="GA4 & Google Ads. Ohne IDs läuft alles im Debug-Modus (nichts wird gesendet).">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className={lbl}>GA4-Mess-ID</span><input className={field} value={gaId} onChange={(e) => setGaId(e.target.value)} placeholder="G-XXXXXXX" /></label>
              <label className="block"><span className={lbl}>Google-Ads-ID</span><input className={field} value={adsId} onChange={(e) => setAdsId(e.target.value)} placeholder="AW-XXXXXXXXXX" /></label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label className="block"><span className={lbl}>Label: Lead</span><input className={field} value={leadLabel} onChange={(e) => setLeadLabel(e.target.value)} placeholder="AbCdEf…" /></label>
              <label className="block"><span className={lbl}>Label: Kontakt</span><input className={field} value={contactLabel} onChange={(e) => setContactLabel(e.target.value)} /></label>
              <label className="block"><span className={lbl}>Label: Anruf</span><input className={field} value={callLabel} onChange={(e) => setCallLabel(e.target.value)} /></label>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-neutral-400"><ShieldCheck size={13} className="text-[#5d8a34]" /> {trackingOn ? "Tracking aktiv – Consent-Banner & Datenschutz-Hinweis erscheinen automatisch." : "Kein Tracking aktiv – die Datenschutzerklärung zeigt keinen Tracking-Abschnitt."}</p>
            <div className="flex justify-end">
              <button onClick={saveTracking} disabled={tSaving} className="inline-flex items-center gap-2 rounded-lg bg-[#16241a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f1c14] disabled:opacity-60">
                {tSaving ? <Loader2 size={15} className="animate-spin" /> : tSaved ? <Check size={15} /> : <Save size={15} />} {tSaved ? "Gespeichert" : "Speichern"}
              </button>
            </div>
          </div>
        </Card>

        {/* KI */}
        <Card icon={Sparkles} title="KI (Anthropic)" hint="Treibt KI-Blog, KI-E-Mail-Texte & die Foto-Kostenschätzung. Ohne Key läuft eine Heuristik.">
          <div className="space-y-3">
            <label className="block">
              <span className={lbl}>API-Key {hasKey && <span className="text-[#5d8a34]">· hinterlegt</span>}</span>
              <input type="password" className={field} value={key} onChange={(e) => setKey(e.target.value)} placeholder={hasKey ? "•••••••• (unverändert lassen)" : "sk-ant-…"} />
            </label>
            <label className="block"><span className={lbl}>Modell</span><input className={field} value={model} onChange={(e) => setModel(e.target.value)} placeholder="claude-sonnet-4-6" /></label>
            <p className="text-xs text-neutral-400">Der Key wird sicher gespeichert und nie im Klartext zurückgegeben.</p>
            <div className="flex justify-end">
              <button onClick={saveAi} disabled={aiSaving} className="inline-flex items-center gap-2 rounded-lg bg-[#16241a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f1c14] disabled:opacity-60">
                {aiSaving ? <Loader2 size={15} className="animate-spin" /> : aiSaved ? <Check size={15} /> : <Save size={15} />} {aiSaved ? "Gespeichert" : "Speichern"}
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Lead-Push via Pushover */}
        <Card icon={BellRing} title="Lead-Benachrichtigung (Pushover)" hint="Bei jedem neuen Lead sofort ein Push aufs Handy: „New Lead Alert“ mit Name & Nummer.">
          <div className="space-y-3">
            <label className="block">
              <span className={lbl}>API-Token {hasPushover && <span className="text-[#5d8a34]">· eingerichtet</span>}</span>
              <input type="password" className={field} value={poToken} onChange={(e) => setPoToken(e.target.value)} placeholder={hasPushover ? "•••••••• (unverändert lassen)" : "Pushover App-Token"} />
            </label>
            <label className="block">
              <span className={lbl}>User-Key</span>
              <input type="password" className={field} value={poUser} onChange={(e) => setPoUser(e.target.value)} placeholder={hasPushover ? "•••••••• (unverändert lassen)" : "steht auf pushover.net oben („Your User Key“)"} />
            </label>
            <p className="text-xs text-neutral-400">Beide Werte werden sicher gespeichert und nie im Klartext zurückgegeben. Push kommt mit hoher Priorität + Kassenklingel-Ton. 💰</p>
            <div className="flex justify-end">
              <button onClick={savePushover} disabled={poSaving} className="inline-flex items-center gap-2 rounded-lg bg-[#16241a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f1c14] disabled:opacity-60">
                {poSaving ? <Loader2 size={15} className="animate-spin" /> : poSaved ? <Check size={15} /> : <Save size={15} />} {poSaved ? "Gespeichert" : "Speichern"}
              </button>
            </div>
          </div>
        </Card>
        <LinkCard icon={Mail} title="E-Mail-Postfach" hint="SMTP/IMAP verbinden, Signaturen & Absender – im E-Mail-Bereich." href="/admin/email" cta="Öffnen" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <LinkCard icon={ScrollText} title="Rechtstexte" hint="Impressum, Datenschutz & AGB direkt bearbeiten." href="/admin/rechtstexte" cta="Bearbeiten" />
      </div>
    </div>
  );
}
