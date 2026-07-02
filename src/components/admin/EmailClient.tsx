"use client";

import { useMemo, useState } from "react";
import {
  Mail, Inbox, Send, AlertTriangle, PenSquare, RefreshCw, Settings2, Search, Trash2, Loader2, ArrowLeft, Dot,
} from "lucide-react";
import type { SafeAccount, Signature, MailMessage, MailFolder } from "@/lib/email/store";
import { EmailComposer } from "./EmailComposer";
import { EmailAccounts } from "./EmailAccounts";
import { EmailSignatures } from "./EmailSignatures";

const GREEN = "#5d8a34";
const INK = "#16241a";

const FOLDERS: { key: MailFolder; label: string; icon: typeof Inbox }[] = [
  { key: "inbox", label: "Posteingang", icon: Inbox },
  { key: "sent", label: "Gesendet", icon: Send },
  { key: "outbox", label: "Ausgang", icon: AlertTriangle },
];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function EmailClient({
  initialAccounts,
  initialSignatures,
  initialMessages,
}: {
  initialAccounts: SafeAccount[];
  initialSignatures: Signature[];
  initialMessages: MailMessage[];
}) {
  const [accounts, setAccounts] = useState<SafeAccount[]>(initialAccounts);
  const [signatures, setSignatures] = useState<Signature[]>(initialSignatures);
  const [messages, setMessages] = useState<MailMessage[]>(initialMessages);

  const [view, setView] = useState<"mail" | "settings">(initialAccounts.length ? "mail" : "settings");
  const [folder, setFolder] = useState<MailFolder>("inbox");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{ to: string; subject: string; original: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function refresh(kinds: ("accounts" | "signatures" | "messages")[] = ["accounts", "signatures", "messages"]) {
    const jobs: Promise<void>[] = [];
    if (kinds.includes("accounts")) jobs.push(fetch("/api/admin/email/accounts").then((r) => r.json()).then(setAccounts).catch(() => {}));
    if (kinds.includes("signatures")) jobs.push(fetch("/api/admin/email/signatures").then((r) => r.json()).then(setSignatures).catch(() => {}));
    if (kinds.includes("messages")) jobs.push(fetch("/api/admin/email/messages").then((r) => r.json()).then(setMessages).catch(() => {}));
    await Promise.all(jobs);
  }

  const counts = useMemo(() => {
    const inScope = (m: MailMessage) => accountFilter === "all" || m.accountId === accountFilter;
    return {
      inbox: messages.filter((m) => m.folder === "inbox" && inScope(m)).length,
      unread: messages.filter((m) => m.folder === "inbox" && !m.read && inScope(m)).length,
      sent: messages.filter((m) => m.folder === "sent" && inScope(m)).length,
      outbox: messages.filter((m) => m.folder === "outbox" && inScope(m)).length,
    };
  }, [messages, accountFilter]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages
      .filter((m) => m.folder === folder)
      .filter((m) => accountFilter === "all" || m.accountId === accountFilter)
      .filter((m) => !q || m.subject.toLowerCase().includes(q) || m.from.toLowerCase().includes(q) || m.to.toLowerCase().includes(q))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [messages, folder, accountFilter, query]);

  const selected = list.find((m) => m.id === selectedId) ?? null;

  async function openMessage(m: MailMessage) {
    setSelectedId(m.id);
    if (!m.read) {
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
      fetch("/api/admin/email/messages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: m.id, read: true }) }).catch(() => {});
    }
  }

  async function deleteMessage(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
    await fetch("/api/admin/email/messages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => {});
  }

  async function syncInbox() {
    const targets = accountFilter === "all" ? accounts : accounts.filter((a) => a.id === accountFilter);
    const imapReady = targets.filter((a) => a.imapHost && a.hasImapPass);
    if (!imapReady.length) {
      setBanner({ kind: "err", text: "Für den Abruf muss mindestens ein Postfach IMAP-Zugangsdaten hinterlegt haben (Einstellungen → Postfächer)." });
      return;
    }
    setSyncing(true); setBanner(null);
    try {
      let added = 0;
      for (const a of imapReady) {
        const res = await fetch("/api/admin/email/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountId: a.id }) });
        const json = await res.json();
        if (res.ok) added += json.added ?? 0;
        else setBanner({ kind: "err", text: `${a.label}: ${json.error || "Abruf fehlgeschlagen"}` });
      }
      await refresh(["messages"]);
      if (added >= 0) setBanner({ kind: "ok", text: added ? `${added} neue Nachricht(en) abgerufen.` : "Keine neuen Nachrichten." });
    } finally {
      setSyncing(false);
    }
  }

  const defaultAccountId = accounts.find((a) => a.isDefault)?.id ?? accounts[0]?.id;

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      {/* Kopfleiste */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-white px-4 py-3 sm:gap-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg" style={{ background: "#eef3e7", color: GREEN }}><Mail size={17} /></span>
          <h1 className="text-base font-bold text-neutral-900">E-Mails</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncInbox}
            disabled={syncing || !accounts.length}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:border-[color:var(--g)] disabled:opacity-50"
            style={{ ["--g" as string]: GREEN }}
          >
            {syncing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Postfach abrufen
          </button>
          <button
            onClick={() => setView(view === "settings" ? "mail" : "settings")}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${view === "settings" ? "border-[#5d8a34] text-[#5d8a34]" : "border-neutral-200 text-neutral-700 hover:border-[#5d8a34]"}`}
          >
            <Settings2 size={15} /> Einstellungen
          </button>
          <button
            onClick={() => { setReplyTo(null); setComposeOpen(true); }}
            disabled={!accounts.length}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: INK }}
          >
            <PenSquare size={15} /> Verfassen
          </button>
        </div>
      </header>

      {banner && (
        <div className={`px-5 py-2 text-sm ${banner.kind === "ok" ? "bg-[#eef3e7] text-[#3f5c22]" : "bg-rose-50 text-rose-700"}`}>{banner.text}</div>
      )}

      {view === "settings" ? (
        <div className="flex-1 overflow-y-auto bg-neutral-50 p-5">
          <div className="mx-auto max-w-4xl space-y-5">
            {accounts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-5 text-sm text-neutral-600">
                Noch kein Postfach verbunden. Lege unten dein erstes Postfach an (E-Mail-Adresse + SMTP zum Senden + IMAP zum Empfangen) – danach kannst du Mails schreiben und abrufen.
              </div>
            )}
            <EmailAccounts accounts={accounts} signatures={signatures} onChange={() => refresh(["accounts"])} />
            <EmailSignatures signatures={signatures} onChange={() => refresh(["signatures"])} />
            {accounts.length > 0 && (
              <button onClick={() => setView("mail")} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5d8a34]">
                <ArrowLeft size={15} /> Zurück zum Postfach
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[220px_340px_minmax(0,1fr)]">
          {/* Ordner + Postfächer (mobil: horizontale Ordner-Leiste) */}
          <aside className="flex gap-4 border-neutral-200 bg-neutral-50 p-3 max-lg:items-center max-lg:overflow-x-auto max-lg:border-b lg:flex-col lg:overflow-y-auto lg:border-r">
            <nav className="flex gap-1 max-lg:shrink-0 lg:flex-col lg:space-y-1">
              {FOLDERS.map((f) => {
                const active = folder === f.key;
                const n = f.key === "inbox" ? counts.unread : f.key === "sent" ? counts.sent : counts.outbox;
                return (
                  <button
                    key={f.key}
                    onClick={() => { setFolder(f.key); setSelectedId(null); }}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium max-lg:w-auto max-lg:shrink-0 max-lg:whitespace-nowrap ${active ? "bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200" : "text-neutral-600 hover:bg-white/70"}`}
                  >
                    <span className="flex items-center gap-2"><f.icon size={16} className={f.key === "outbox" && counts.outbox ? "text-rose-500" : ""} /> {f.label}</span>
                    {n > 0 && <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${f.key === "outbox" ? "bg-rose-100 text-rose-700" : "bg-[#eef3e7] text-[#3f5c22]"}`}>{n}</span>}
                  </button>
                );
              })}
            </nav>
            <div className="max-lg:hidden">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Postfächer</p>
              <div className="space-y-0.5">
                <button onClick={() => { setAccountFilter("all"); setSelectedId(null); }} className={`w-full rounded-lg px-3 py-1.5 text-left text-sm ${accountFilter === "all" ? "font-semibold text-neutral-900" : "text-neutral-600 hover:bg-white/70"}`}>Alle Postfächer</button>
                {accounts.map((a) => (
                  <button key={a.id} onClick={() => { setAccountFilter(a.id); setSelectedId(null); }} className={`flex w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-left text-sm ${accountFilter === a.id ? "font-semibold text-neutral-900" : "text-neutral-600 hover:bg-white/70"}`}>
                    <Dot size={18} className={a.isDefault ? "text-[#5d8a34]" : "text-neutral-300"} />
                    <span className="truncate">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Nachrichtenliste (mobil versteckt, sobald eine Nachricht offen ist) */}
          <section className={`flex-col overflow-hidden border-neutral-200 bg-white lg:border-r ${selectedId ? "hidden lg:flex" : "flex"}`}>
            <div className="border-b border-neutral-100 p-2.5">
              <div className="flex items-center gap-2 rounded-lg border border-neutral-200 px-2.5 py-1.5">
                <Search size={14} className="text-neutral-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Suchen …" className="w-full text-sm outline-none placeholder:text-neutral-400" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {list.length === 0 ? (
                <div className="p-6 text-center text-sm text-neutral-400">
                  {folder === "inbox" ? <>Posteingang leer. Klicke oben auf „Postfach abrufen".</> : folder === "sent" ? "Noch nichts gesendet." : "Ausgang leer."}
                </div>
              ) : (
                list.map((m) => {
                  const isSel = m.id === selectedId;
                  const who = m.direction === "in" ? (m.fromName || m.from) : m.to;
                  return (
                    <button
                      key={m.id}
                      onClick={() => openMessage(m)}
                      className={`block w-full border-b border-neutral-100 px-4 py-3 text-left ${isSel ? "bg-[#f4f8ef]" : "hover:bg-neutral-50"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`truncate text-sm ${!m.read && m.folder === "inbox" ? "font-bold text-neutral-900" : "font-medium text-neutral-700"}`}>{who || "—"}</span>
                        <span className="shrink-0 text-xs text-neutral-400">{fmtDate(m.date)}</span>
                      </div>
                      <div className={`truncate text-sm ${!m.read && m.folder === "inbox" ? "font-semibold text-neutral-800" : "text-neutral-600"}`}>{m.subject || "(kein Betreff)"}</div>
                      <div className="truncate text-xs text-neutral-400">{stripHtml(m.html || m.text).slice(0, 90)}</div>
                      {m.status === "failed" && <span className="mt-1 inline-block rounded bg-rose-100 px-1.5 py-0.5 text-[11px] font-medium text-rose-700">Fehlgeschlagen</span>}
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Lesebereich (mobil nur sichtbar, wenn eine Nachricht gewählt ist) */}
          <section className={`overflow-y-auto bg-white ${selectedId ? "block" : "hidden lg:block"}`}>
            {selected ? (
              <article className="mx-auto max-w-3xl p-4 sm:p-6">
                <button onClick={() => setSelectedId(null)} className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 lg:hidden">
                  <ArrowLeft size={16} /> Zurück zur Liste
                </button>
                <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">{selected.subject || "(kein Betreff)"}</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                      <span className="font-medium">{selected.direction === "in" ? (selected.fromName || selected.from) : selected.fromName}</span>
                      <span className="text-neutral-400"> · {selected.direction === "in" ? selected.from : selected.from} → {selected.to}</span>
                    </p>
                    <p className="text-xs text-neutral-400">{new Date(selected.date).toLocaleString("de-DE")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {selected.direction === "in" && (
                      <button
                        onClick={() => { setReplyTo({ to: selected.from, subject: `Re: ${selected.subject}`, original: stripHtml(selected.html || selected.text) }); setComposeOpen(true); }}
                        className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:border-[#5d8a34] hover:text-[#5d8a34]"
                      >
                        Antworten
                      </button>
                    )}
                    <button onClick={() => deleteMessage(selected.id)} className="grid size-8 place-items-center rounded-lg text-neutral-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Löschen"><Trash2 size={15} /></button>
                  </div>
                </div>
                {selected.status === "failed" && selected.error && (
                  <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">Versand fehlgeschlagen: {selected.error}</div>
                )}
                <div className="prose prose-sm mt-4 max-w-none text-neutral-800" dangerouslySetInnerHTML={{ __html: sanitize(selected.html || `<p>${escapeHtml(selected.text)}</p>`) }} />
              </article>
            ) : (
              <div className="grid h-full place-items-center text-sm text-neutral-400">
                <div className="text-center">
                  <Mail size={28} className="mx-auto mb-2 text-neutral-300" />
                  Nachricht auswählen
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {composeOpen && (
        <EmailComposer
          accounts={accounts}
          signatures={signatures}
          defaultAccountId={defaultAccountId}
          reply={replyTo}
          onClose={() => setComposeOpen(false)}
          onSent={async () => { await refresh(["messages"]); setComposeOpen(false); setFolder("sent"); setBanner({ kind: "ok", text: "E-Mail gesendet." }); }}
          onFailed={async (err) => { await refresh(["messages"]); setComposeOpen(false); setFolder("outbox"); setBanner({ kind: "err", text: err }); }}
        />
      )}
    </div>
  );
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
// Minimaler Sanitizer für empfangenes HTML: entfernt <script>/<style> und on*-Handler.
function sanitize(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}
