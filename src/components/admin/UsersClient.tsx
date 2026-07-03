"use client";

// Benutzerverwaltung (nur Inhaber): Mitarbeiter anlegen, Menü-Rechte per Häkchen
// vergeben, deaktivieren, Passwort zurücksetzen, löschen.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Check, KeyRound, ChevronDown, ChevronUp } from "lucide-react";
import type { SafeUser } from "@/lib/admin/users";
import { ADMIN_NAV } from "@/lib/admin/nav";

// Diese Bereiche kann ein Mitarbeiter nie bekommen (Inhaber-exklusiv);
// Dashboard ist immer sichtbar.
const LOCKED = new Set(["/admin", "/admin/users", "/admin/profile"]);
const GRANTABLE = ADMIN_NAV.filter((n) => !LOCKED.has(n.href));

const field = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#5d8a34]";
const lbl = "mb-1 block text-xs font-medium text-neutral-500";

function PermGrid({ perms, onToggle }: { perms: string[]; onToggle: (href: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
      {GRANTABLE.map((n) => {
        const on = perms.includes(n.href);
        return (
          <label key={n.href} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${on ? "border-[#5d8a34]/40 bg-[#f4f8ee] text-[#16241a]" : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"}`}>
            <input type="checkbox" checked={on} onChange={() => onToggle(n.href)} className="accent-[#5d8a34]" />
            {n.label}
          </label>
        );
      })}
    </div>
  );
}

function NewUser({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [perms, setPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (href: string) => setPerms((p) => (p.includes(href) ? p.filter((x) => x !== href) : [...p, href]));

  async function submit() {
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "create", name, email, password, perms }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error ?? "Anlegen fehlgeschlagen."); return; }
      setOpen(false); setName(""); setEmail(""); setPassword(""); setPerms([]);
      onDone();
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#16241a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f1c14]">
        <Plus size={16} /> Neuer Benutzer
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-neutral-900">Neuen Benutzer anlegen</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block"><span className={lbl}>Name *</span><input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Max Mustermann" /></label>
        <label className="block"><span className={lbl}>E-Mail (Login) *</span><input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="max@dgd-facility.de" /></label>
        <label className="block"><span className={lbl}>Passwort (min. 8 Zeichen) *</span><input className={field} type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="wird dem Mitarbeiter mitgeteilt" /></label>
      </div>
      <p className="mb-2 mt-4 text-xs font-semibold text-neutral-600">Darf sehen &amp; bearbeiten (Dashboard ist immer sichtbar):</p>
      <PermGrid perms={perms} onToggle={toggle} />
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">Abbrechen</button>
        <button onClick={submit} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#5d8a34] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a7029] disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Anlegen
        </button>
      </div>
    </div>
  );
}

function UserRow({ user, onDone }: { user: SafeUser; onDone: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [perms, setPerms] = useState<string[]>(user.perms);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify([...perms].sort()) !== JSON.stringify([...user.perms].sort());

  async function update(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "update", id: user.id, ...payload }),
      });
      if (!res.ok) alert((await res.json().catch(() => ({}))).error || "Aktion fehlgeschlagen.");
      onDone();
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!window.confirm(`Benutzer "${user.name}" wirklich löschen? Der Login funktioniert danach sofort nicht mehr.`)) return;
    setBusy(true);
    try {
      await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id }) });
      onDone();
    } finally {
      setBusy(false);
    }
  }

  function resetPw() {
    const pw = window.prompt(`Neues Passwort für ${user.name} (min. 8 Zeichen):`);
    if (pw) update({ password: pw });
  }

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold ${user.active ? "bg-[#eef3e7] text-[#4a7029]" : "bg-neutral-100 text-neutral-400"}`}>
          {user.name.split(/\s+/).map((s) => s[0] ?? "").join("").slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${user.active ? "text-neutral-900" : "text-neutral-400 line-through"}`}>{user.name}</p>
          <p className="truncate text-xs text-neutral-500">{user.email} · {user.perms.length} Bereiche</p>
        </div>
        <div className="flex items-center gap-2">
          {busy ? <Loader2 size={16} className="animate-spin text-neutral-400" /> : (
            <>
              <button
                onClick={() => update({ active: !user.active })}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${user.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}
                title={user.active ? "Deaktivieren (Login sofort gesperrt)" : "Aktivieren"}
              >
                {user.active ? "Aktiv" : "Deaktiviert"}
              </button>
              <button onClick={resetPw} title="Passwort zurücksetzen" className="text-neutral-300 transition-colors hover:text-[#4a7029]"><KeyRound size={16} /></button>
              <button onClick={del} title="Löschen" className="text-neutral-300 transition-colors hover:text-rose-600"><Trash2 size={15} /></button>
              <button onClick={() => setExpanded(!expanded)} title="Rechte bearbeiten" className="text-neutral-400 hover:text-neutral-700">
                {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3">
          <PermGrid perms={perms} onToggle={(href) => setPerms((p) => (p.includes(href) ? p.filter((x) => x !== href) : [...p, href]))} />
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => update({ perms })}
              disabled={!dirty || busy}
              className="inline-flex items-center gap-2 rounded-lg bg-[#16241a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0f1c14] disabled:opacity-40"
            >
              <Check size={14} /> Rechte speichern
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export function UsersClient({ users }: { users: SafeUser[] }) {
  const router = useRouter();
  const refresh = () => router.refresh();

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><NewUser onDone={refresh} /></div>
      <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {users.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-400">
            Noch keine Benutzer. Lege Mitarbeiter-Zugänge an und bestimme pro Person, welche Bereiche sie sehen.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {users.map((u) => <UserRow key={u.id} user={u} onDone={refresh} />)}
          </ul>
        )}
      </section>
      <p className="text-xs text-neutral-400">
        Mitarbeiter melden sich unter <span className="font-mono">/login</span> über „Als Mitarbeiter anmelden" mit E-Mail + Passwort an.
        Dashboard ist immer sichtbar; Benutzerverwaltung, Profil &amp; Inhaber-Einstellungen bleiben dir vorbehalten.
        Deaktivieren sperrt den Zugang sofort.
      </p>
    </div>
  );
}
