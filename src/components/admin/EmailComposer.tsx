"use client";

import { useState } from "react";
import { X, Sparkles, Send, Loader2, Wand2 } from "lucide-react";
import type { SafeAccount, Signature } from "@/lib/email/store";

const GREEN = "#5d8a34";
const INK = "#16241a";
const field = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#5d8a34] focus:ring-2 focus:ring-[#5d8a34]/15";

const TONES = ["freundlich & professionell", "förmlich", "locker", "kurz & knapp", "herzlich"];

function looksLikeHtml(s: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(s);
}
function textToHtml(s: string): string {
  return s
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("");
}

export function EmailComposer({
  accounts,
  signatures,
  defaultAccountId,
  reply,
  onClose,
  onSent,
  onFailed,
}: {
  accounts: SafeAccount[];
  signatures: Signature[];
  defaultAccountId?: string;
  reply: { to: string; subject: string; original: string } | null;
  onClose: () => void;
  onSent: () => void | Promise<void>;
  onFailed: (err: string) => void | Promise<void>;
}) {
  const initialAccount = accounts.find((a) => a.id === defaultAccountId) ?? accounts[0];
  const [accountId, setAccountId] = useState<string>(initialAccount?.id ?? "");
  const [signatureId, setSignatureId] = useState<string>(initialAccount?.signatureId ?? "");
  const [to, setTo] = useState(reply?.to ?? "");
  const [subject, setSubject] = useState(reply?.subject ?? "");
  const [body, setBody] = useState("");

  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState(TONES[0]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true); setAiNote(null); setError(null);
    try {
      const res = await fetch("/api/admin/email/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, tone: aiTone, mode: reply ? "reply" : "new", recipient: to || undefined, original: reply?.original }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "KI-Generierung fehlgeschlagen");
      if (!subject.trim() && json.draft?.subject) setSubject(json.draft.subject);
      setBody(json.draft?.bodyHtml ?? "");
      setAiNote(json.source === "ai" ? "Von KI verfasst – bei Bedarf anpassen." : "Entwurf erstellt (ohne KI-Key – Heuristik). Text gern anpassen.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "KI-Generierung fehlgeschlagen");
    } finally {
      setAiLoading(false);
    }
  }

  async function send() {
    if (!accountId) { setError("Bitte Absender wählen."); return; }
    if (!to.trim()) { setError("Bitte Empfänger angeben."); return; }
    if (!subject.trim()) { setError("Bitte Betreff angeben."); return; }
    setSending(true); setError(null);
    const html = looksLikeHtml(body) ? body : textToHtml(body);
    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, to, subject, html, signatureId: signatureId || null }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        await onSent();
      } else {
        await onFailed(json.error || "Versand fehlgeschlagen. Die E-Mail liegt im Ausgang.");
      }
    } catch (e) {
      await onFailed(e instanceof Error ? e.message : "Versand fehlgeschlagen");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
          <h2 className="text-sm font-bold text-neutral-900">{reply ? "Antworten" : "Neue E-Mail"}</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X size={17} /></button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {accounts.length > 1 || true ? (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-neutral-500">Absender</span>
              <select
                className={field}
                value={accountId}
                onChange={(e) => { const a = accounts.find((x) => x.id === e.target.value); setAccountId(e.target.value); if (a?.signatureId) setSignatureId(a.signatureId); }}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.fromName ? `${a.fromName} · ` : ""}{a.address}</option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">An</span>
            <input className={field} value={to} onChange={(e) => setTo(e.target.value)} placeholder="empfaenger@example.de" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">Betreff</span>
            <input className={field} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Betreff" />
          </label>

          {/* KI-Verfassen */}
          <div className="rounded-xl border border-[#dbe7cc] bg-[#f6faf1]">
            <button type="button" onClick={() => setAiOpen((v) => !v)} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm font-semibold" style={{ color: GREEN }}>
              <Sparkles size={15} /> Mit KI schreiben {aiOpen ? "▲" : "▼"}
            </button>
            {aiOpen && (
              <div className="space-y-2 border-t border-[#dbe7cc] p-3.5">
                <textarea
                  className={`${field} min-h-[70px] resize-y`}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Stichpunkte, was in die Mail soll – z. B.: Angebot Büroreinigung 320 m², wöchentlich, Termin nächste Woche vorschlagen, freundlich"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <select className={`${field} max-w-[220px]`} value={aiTone} onChange={(e) => setAiTone(e.target.value)}>
                    {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={generate}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: GREEN }}
                  >
                    {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} Text erzeugen
                  </button>
                </div>
                {aiNote && <p className="text-xs text-[#3f5c22]">{aiNote}</p>}
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">Nachricht</span>
            <textarea
              className={`${field} min-h-[180px] resize-y font-[inherit]`}
              value={looksLikeHtml(body) ? htmlToText(body) : body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={'Schreibe deine Nachricht … oder nutze oben „Mit KI schreiben".'}
            />
            <span className="mt-1 block text-xs text-neutral-400">Die gewählte Signatur wird beim Senden automatisch angehängt.</span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500">Signatur</span>
            <select className={field} value={signatureId} onChange={(e) => setSignatureId(e.target.value)}>
              <option value="">Keine Signatur</option>
              {signatures.map((s) => <option key={s.id} value={s.id}>{s.name}{s.displayName ? ` – ${s.displayName}` : ""}</option>)}
            </select>
          </label>

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-neutral-100 px-5 py-3">
          <button onClick={onClose} className="text-sm font-medium text-neutral-500 hover:text-neutral-800">Abbrechen</button>
          <button
            onClick={send}
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: INK }}
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Senden
          </button>
        </footer>
      </div>
    </div>
  );
}

// Zeigt HTML-KI-Text im Textfeld wieder lesbar an (grobe Rückwandlung).
function htmlToText(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
