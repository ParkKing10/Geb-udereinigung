"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, LogIn, ShieldCheck } from "lucide-react";

export function LoginForm() {
  const params = useSearchParams();
  const from = params.get("from") || "/admin";
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"password" | "2fa">("password");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, code: stage === "2fa" ? code : undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        // Passwort korrekt, aber zweiter Faktor nötig → Code-Schritt anzeigen.
        if (d.need2fa) {
          setStage("2fa");
          setError(stage === "2fa" ? (d.error ?? "Code ungültig.") : null);
          return;
        }
        setError(d.error ?? "Anmeldung fehlgeschlagen.");
        return;
      }
      // Vollständige Navigation, damit die Middleware das neue Cookie sieht.
      window.location.href = from.startsWith("/admin") ? from : "/admin";
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-[#5d8a34] text-base font-black text-white">DGD</span>
          <h1 className="mt-3 text-lg font-bold text-neutral-900">Admin-Anmeldung</h1>
          <p className="mt-1 text-sm text-neutral-500">Deutsche Gebäudedienste · Interner Bereich</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">{error}</p>}
          {stage === "password" ? (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-neutral-500">Passwort</span>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#5d8a34] focus:bg-white"
                />
              </div>
            </label>
          ) : (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-neutral-500">Bestätigungscode</span>
              <div className="relative">
                <ShieldCheck size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-stelliger Code"
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-sm tracking-widest outline-none focus:border-[#5d8a34] focus:bg-white"
                />
              </div>
              <span className="mt-1.5 block text-xs text-neutral-400">Code aus deiner Authenticator-App – oder ein Backup-Code.</span>
            </label>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5d8a34] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4a7029] disabled:opacity-60"
          >
            {stage === "2fa" ? <ShieldCheck size={16} /> : <LogIn size={16} />}
            {loading ? "Anmelden …" : stage === "2fa" ? "Bestätigen" : "Anmelden"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-neutral-400">Geschützter Bereich · Zugriff nur für Mitarbeitende</p>
      </div>
    </div>
  );
}
