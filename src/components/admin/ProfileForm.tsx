"use client";

import { useRef, useState } from "react";
import { Camera, User, Lock, Shield, Check, ShieldCheck, KeyRound, Loader2, AlertTriangle } from "lucide-react";
import { Panel, btn } from "./ui";
import { initials, type SafeProfile } from "@/lib/admin/profile-types";

// ── Wiederverwendbares Textfeld ─────────────────────────────
function Field({
  label, value, onChange, type = "text", placeholder, autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-neutral-600">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-[#5d8a34] focus:bg-white"
      />
    </label>
  );
}

// ── Toggle-Schalter ─────────────────────────────────────────
function Toggle({
  label, description, checked, onChange, busy,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  busy?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50/60 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={busy}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${checked ? "bg-[#5d8a34]" : "bg-neutral-300"}`}
      >
        <span className={`inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

type Setup = { secret: string; otpauthUrl: string; account: string };

export function ProfileForm({ initial }: { initial: SafeProfile }) {
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [avatar, setAvatar] = useState(initial.avatar ?? "");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [loginAlerts, setLoginAlerts] = useState(initial.loginAlerts);

  // 2FA
  const [twoFaEnabled, setTwoFaEnabled] = useState(initial.twoFactorEnabled);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [disarm, setDisarm] = useState(false);
  const [disarmProof, setDisarmProof] = useState("");
  const [twoFaBusy, setTwoFaBusy] = useState(false);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const name = `${firstName} ${lastName}`.trim() || "Administrator";

  // ── Avatar-Upload ─────────────────────────────────────────
  async function uploadAvatar(file: File) {
    setError(null);
    const fd = new FormData();
    fd.append("avatar", file);
    const res = await fetch("/api/admin/profile/avatar", { method: "POST", body: fd });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setError(d.error ?? "Foto-Upload fehlgeschlagen."); return; }
    setAvatar(d.path);
  }

  // ── Speichern (Daten + Passwort + Login-Alerts) ───────────
  async function handleSave() {
    setSaving(true); setError(null); setSaved(false);
    try {
      if (newPw && newPw !== confirmPw) { setError("Die neuen Passwörter stimmen nicht überein."); return; }
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName, lastName, email, phone, loginAlerts,
          currentPassword: currentPw || undefined,
          newPassword: newPw || undefined,
          confirmPassword: confirmPw || undefined,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error ?? "Speichern fehlgeschlagen."); return; }
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  // ── 2FA aktivieren/deaktivieren ───────────────────────────
  async function startSetup() {
    setTwoFaBusy(true); setTwoFaError(null); setBackupCodes(null);
    try {
      const res = await fetch("/api/admin/profile/2fa", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "setup" }),
      });
      const d = await res.json();
      if (!res.ok) { setTwoFaError(d.error ?? "Fehler beim Einrichten."); return; }
      setSetup(d); setTwoFaCode("");
    } finally { setTwoFaBusy(false); }
  }

  async function confirmEnable() {
    if (!setup) return;
    setTwoFaBusy(true); setTwoFaError(null);
    try {
      const res = await fetch("/api/admin/profile/2fa", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "enable", secret: setup.secret, code: twoFaCode }),
      });
      const d = await res.json();
      if (!res.ok) { setTwoFaError(d.error ?? "Code ungültig."); return; }
      setTwoFaEnabled(true); setSetup(null); setTwoFaCode(""); setBackupCodes(d.backupCodes ?? []);
    } finally { setTwoFaBusy(false); }
  }

  async function confirmDisable() {
    setTwoFaBusy(true); setTwoFaError(null);
    try {
      const res = await fetch("/api/admin/profile/2fa", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "disable", proof: disarmProof }),
      });
      const d = await res.json();
      if (!res.ok) { setTwoFaError(d.error ?? "Konnte nicht deaktiviert werden."); return; }
      setTwoFaEnabled(false); setDisarm(false); setDisarmProof(""); setBackupCodes(null);
    } finally { setTwoFaBusy(false); }
  }

  function toggle2fa(v: boolean) {
    setTwoFaError(null);
    if (v && !twoFaEnabled) startSetup();
    else if (!v && twoFaEnabled) { setDisarm(true); setSetup(null); }
    else { setSetup(null); setDisarm(false); }
  }

  return (
    <div className="space-y-6">
      {/* Profil-Karte */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} className="size-20 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="grid size-20 shrink-0 place-items-center rounded-full bg-[#16241a] text-2xl font-bold tracking-wide text-white">
              {initials(firstName, lastName)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">{name}</h2>
            <p className="text-sm font-medium text-[#4a7029]">Administrator</p>
            <p className="mt-0.5 truncate text-sm text-neutral-500">{email}</p>
          </div>
          <button type="button" className={btn("outline")} onClick={() => fileRef.current?.click()}>
            <Camera size={16} /> Foto ändern
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ""; }}
          />
        </div>
      </section>

      {/* Persönliche Daten */}
      <Panel title="Persönliche Daten" subtitle="Ihre Kontaktdaten für das Team und Benachrichtigungen" action={<User size={18} className="text-neutral-400" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vorname" value={firstName} onChange={setFirstName} autoComplete="given-name" />
          <Field label="Nachname" value={lastName} onChange={setLastName} autoComplete="family-name" />
          <Field label="E-Mail" value={email} onChange={setEmail} type="email" autoComplete="email" />
          <Field label="Telefon" value={phone} onChange={setPhone} type="tel" autoComplete="tel" />
        </div>
      </Panel>

      {/* Passwort ändern */}
      <Panel title="Passwort ändern" subtitle="Verwenden Sie ein starkes, einzigartiges Passwort (min. 8 Zeichen)" action={<Lock size={18} className="text-neutral-400" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Aktuelles Passwort" value={currentPw} onChange={setCurrentPw} type="password" placeholder="••••••••" autoComplete="current-password" />
          </div>
          <Field label="Neues Passwort" value={newPw} onChange={setNewPw} type="password" placeholder="••••••••" autoComplete="new-password" />
          <Field label="Passwort bestätigen" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="••••••••" autoComplete="new-password" />
        </div>
        <p className="mt-3 text-xs text-neutral-400">Das in Render gesetzte <code>ADMIN_PASSWORD</code> funktioniert weiterhin als Notfall-Zugang.</p>
      </Panel>

      {/* Sicherheit */}
      <Panel title="Sicherheit" subtitle="Zusätzliche Schutzmaßnahmen für Ihr Konto" action={<Shield size={18} className="text-neutral-400" />}>
        <div className="space-y-3">
          <Toggle
            label="Zwei-Faktor-Authentifizierung"
            description="Zusätzlicher 6-stelliger Code aus einer Authenticator-App (z. B. Google Authenticator, Authy) bei jeder Anmeldung."
            checked={twoFaEnabled}
            onChange={toggle2fa}
            busy={twoFaBusy}
          />

          {twoFaError && (
            <p className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-inset ring-rose-200">
              <AlertTriangle size={13} /> {twoFaError}
            </p>
          )}

          {/* Setup-Ablauf */}
          {setup && (
            <div className="rounded-xl border border-[#5d8a34]/30 bg-[#f4f8ee] p-4">
              <p className="text-sm font-semibold text-[#16241a]">2FA einrichten</p>
              <ol className="mt-2 space-y-2 text-xs text-neutral-600">
                <li>1. Öffne deine Authenticator-App und füge einen Eintrag hinzu (Schlüssel manuell eingeben):</li>
              </ol>
              <code className="mt-1.5 block break-all rounded-lg border border-neutral-200 bg-white px-3 py-2 font-mono text-sm tracking-wider text-[#16241a]">{setup.secret}</code>
              <p className="mt-2 text-xs text-neutral-500">2. Gib den angezeigten 6-stelligen Code ein:</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <input
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value)}
                  inputMode="numeric"
                  placeholder="123456"
                  className="w-32 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm tracking-widest outline-none focus:border-[#5d8a34]"
                />
                <button type="button" disabled={twoFaBusy} onClick={confirmEnable} className={btn("primary")}>
                  {twoFaBusy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Aktivieren
                </button>
                <button type="button" onClick={() => { setSetup(null); setTwoFaError(null); }} className={btn("ghost")}>Abbrechen</button>
              </div>
            </div>
          )}

          {/* Backup-Codes (einmalig) */}
          {backupCodes && (
            <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-900"><KeyRound size={15} /> Backup-Codes – jetzt sicher speichern!</p>
              <p className="mt-1 text-xs text-amber-800">Jeder Code funktioniert einmal, falls du keinen Zugriff auf die App hast. Sie werden nur dieses eine Mal angezeigt.</p>
              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {backupCodes.map((c) => (
                  <code key={c} className="rounded-md border border-amber-200 bg-white px-2 py-1.5 text-center font-mono text-sm text-amber-900">{c}</code>
                ))}
              </div>
              <button type="button" onClick={() => setBackupCodes(null)} className={`${btn("outline")} mt-3`}>Habe ich gespeichert</button>
            </div>
          )}

          {/* Deaktivieren */}
          {disarm && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-900">2FA deaktivieren</p>
              <p className="mt-1 text-xs text-neutral-500">Zur Bestätigung dein Passwort oder einen aktuellen Code eingeben.</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="password"
                  value={disarmProof}
                  onChange={(e) => setDisarmProof(e.target.value)}
                  placeholder="Passwort oder Code"
                  className="w-48 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5d8a34]"
                />
                <button type="button" disabled={twoFaBusy} onClick={confirmDisable} className={btn("primary")}>
                  {twoFaBusy ? <Loader2 size={16} className="animate-spin" /> : null} Deaktivieren
                </button>
                <button type="button" onClick={() => { setDisarm(false); setTwoFaError(null); }} className={btn("ghost")}>Abbrechen</button>
              </div>
            </div>
          )}

          <Toggle
            label="Login-Benachrichtigungen"
            description="E-Mail-Hinweis bei jeder Anmeldung – nutzt dein Standard-Postfach aus dem Menü E-Mails."
            checked={loginAlerts}
            onChange={setLoginAlerts}
          />
        </div>
      </Panel>

      {/* Speichern */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        {error && <span className="text-sm font-medium text-rose-600">{error}</span>}
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4a7029]">
            <Check size={16} /> Änderungen gespeichert
          </span>
        )}
        <button type="button" onClick={handleSave} disabled={saving} className={btn("primary")}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null} Speichern
        </button>
      </div>
    </div>
  );
}
