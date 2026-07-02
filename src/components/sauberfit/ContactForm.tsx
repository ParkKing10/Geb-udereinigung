"use client";

import { useState } from "react";
import { trackContact } from "@/lib/analytics";

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          message: fd.get("message"),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Senden fehlgeschlagen.");
        return;
      }
      trackContact({ email: String(fd.get("email") || ""), phone: String(fd.get("phone") || "") });
      setDone(true);
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem" }}>✅</div>
        <h3 style={{ margin: ".5rem 0", color: "var(--ink)" }}>Danke für Ihre Nachricht!</h3>
        <p style={{ color: "var(--muted)" }}>Wir melden uns schnellstmöglich bei Ihnen.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="sf-field">
        <label className="label" htmlFor="c-name">Name *</label>
        <input id="c-name" name="name" className="sf-input" required />
      </div>
      <div className="sf-field">
        <label className="label" htmlFor="c-email">E-Mail *</label>
        <input id="c-email" name="email" type="email" className="sf-input" required />
      </div>
      <div className="sf-field">
        <label className="label" htmlFor="c-phone">Telefon</label>
        <input id="c-phone" name="phone" className="sf-input" />
      </div>
      <div className="sf-field">
        <label className="label" htmlFor="c-msg">Nachricht *</label>
        <textarea id="c-msg" name="message" className="sf-input" rows={5} required />
      </div>
      {error && <p style={{ color: "#c0392b", fontSize: ".85rem", margin: 0 }}>{error}</p>}
      <button className="sf-btn sf-btn-green sf-btn-lg" disabled={loading}>
        {loading ? "Wird gesendet …" : "Nachricht senden"}
      </button>
    </form>
  );
}
