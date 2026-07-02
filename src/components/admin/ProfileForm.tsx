"use client";

import { useState } from "react";
import { Camera, User, Lock, Shield, Check } from "lucide-react";
import { Panel, btn } from "./ui";

const AVATAR = "SA";
const NAME = "Sara Ahmadi";
const ROLE = "Administratorin";
const EMAIL = "sara.ahmadi@deutschegebäudedienste.de";

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

// ── Toggle-Schalter (nur UI) ────────────────────────────────
function Toggle({
  label, description, checked, onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
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
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-[#5d8a34]" : "bg-neutral-300"
        }`}
      >
        <span
          className={`inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function ProfileForm() {
  const [firstName, setFirstName] = useState("Sara");
  const [lastName, setLastName] = useState("Ahmadi");
  const [email, setEmail] = useState(EMAIL);
  const [phone, setPhone] = useState("+49 152 07306840");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(false);

  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      {/* Profil-Karte */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          <span className="grid size-20 shrink-0 place-items-center rounded-full bg-[#16241a] text-2xl font-bold tracking-wide text-white">
            {AVATAR}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">{NAME}</h2>
            <p className="text-sm font-medium text-[#4a7029]">{ROLE}</p>
            <p className="mt-0.5 truncate text-sm text-neutral-500">{EMAIL}</p>
          </div>
          <button type="button" className={btn("outline")}>
            <Camera size={16} /> Foto ändern
          </button>
        </div>
      </section>

      {/* Persönliche Daten */}
      <Panel
        title="Persönliche Daten"
        subtitle="Ihre Kontaktdaten für das Team und Benachrichtigungen"
        action={<User size={18} className="text-neutral-400" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vorname" value={firstName} onChange={setFirstName} autoComplete="given-name" />
          <Field label="Nachname" value={lastName} onChange={setLastName} autoComplete="family-name" />
          <Field label="E-Mail" value={email} onChange={setEmail} type="email" autoComplete="email" />
          <Field label="Telefon" value={phone} onChange={setPhone} type="tel" autoComplete="tel" />
        </div>
      </Panel>

      {/* Passwort ändern */}
      <Panel
        title="Passwort ändern"
        subtitle="Verwenden Sie ein starkes, einzigartiges Passwort"
        action={<Lock size={18} className="text-neutral-400" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Aktuelles Passwort"
              value={currentPw}
              onChange={setCurrentPw}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <Field
            label="Neues Passwort"
            value={newPw}
            onChange={setNewPw}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <Field
            label="Passwort bestätigen"
            value={confirmPw}
            onChange={setConfirmPw}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
      </Panel>

      {/* Sicherheit */}
      <Panel
        title="Sicherheit"
        subtitle="Zusätzliche Schutzmaßnahmen für Ihr Konto"
        action={<Shield size={18} className="text-neutral-400" />}
      >
        <div className="space-y-3">
          <Toggle
            label="Zwei-Faktor-Authentifizierung"
            description="Zusätzliche Sicherheit über einen Code aus Ihrer Authenticator-App."
            checked={twoFactor}
            onChange={setTwoFactor}
          />
          <Toggle
            label="Login-Benachrichtigungen"
            description="E-Mail-Hinweis bei Anmeldungen von neuen Geräten oder Standorten."
            checked={loginAlerts}
            onChange={setLoginAlerts}
          />
        </div>
      </Panel>

      {/* Speichern */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4a7029]">
            <Check size={16} /> Änderungen gespeichert
          </span>
        )}
        <button type="button" onClick={handleSave} className={btn("primary")}>
          Speichern
        </button>
      </div>
    </div>
  );
}
