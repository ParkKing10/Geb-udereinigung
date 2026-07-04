"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { X, ArrowRight, Check, Sparkles, ShieldCheck } from "lucide-react";
import { SERVICES } from "@/lib/sauberfit-data";
import type { ContactPerson } from "@/lib/site-content";
import { trackQuoteOpen, trackLead, getSid, journey } from "@/lib/analytics";
import { appendAttribution, getAttribution } from "@/lib/attribution";

type LeadCtx = { open: (service?: string) => void };
const Ctx = createContext<LeadCtx | null>(null);

export function useLead() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLead must be used within LeadProvider");
  return c;
}

type Form = { vorname: string; nachname: string; firma: string; phone: string; email: string };
const EMPTY: Form = { vorname: "", nachname: "", firma: "", phone: "", email: "" };

// Kompakte Auswahl der häufigsten Leistungen (optional). "sonstiges" ist kein Service-Slug.
const INTEREST_SLUGS = ["bueroreinigung", "unterhaltsreinigung", "glasreinigung", "treppenhausreinigung", "bauendreinigung", "praxisreinigung"];
const INTERESTS: { slug: string; name: string }[] = [
  ...INTEREST_SLUGS.map((slug) => ({ slug, name: SERVICES.find((s) => s.slug === slug)?.name ?? slug })),
  { slug: "sonstiges", name: "Sonstiges" },
];

export function LeadProvider({ children, person }: { children: React.ReactNode; person?: ContactPerson }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const hasContact = /\S+@\S+\.\S+/.test(form.email) || form.phone.replace(/\D/g, "").length >= 6;

  // Live-Formular-Status fürs Admin-Dashboard melden (anonym: offen / Kontakt ja-nein).
  useEffect(() => {
    window.__dgdQuote = { open: isOpen && !done, step: 0, hasContact };
    window.__dgdPresencePing?.();
  }, [isOpen, hasContact, done]);

  // Abbruch-Erfassung: Sobald E-Mail ODER Telefon eingetippt ist (und noch nicht abgeschickt),
  // Zwischenstand debounced speichern. Beim erfolgreichen Absenden löscht /api/lead ihn per sid.
  useEffect(() => {
    if (done || !hasContact || !isOpen) return;
    const t = window.setTimeout(() => {
      const sid = getSid();
      if (!sid) return;
      const a = getAttribution();
      const p = new URLSearchParams(window.location.search);
      const attribution: Record<string, string> = {};
      if (a.gclid) attribution.gclid = a.gclid;
      if (a.gbraid) attribution.gbraid = a.gbraid;
      if (a.wbraid) attribution.wbraid = a.wbraid;
      for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term"]) {
        const v = p.get(k);
        if (v) attribution[k] = v;
      }
      if (document.referrer) attribution.referrer = document.referrer.slice(0, 300);
      const firstService = interests.find((s) => s !== "sonstiges") ?? "";
      const body = JSON.stringify({
        sid, step: 0,
        service: firstService, location: "", objektart: "",
        name: `${form.vorname} ${form.nachname}`.trim(), email: form.email, phone: form.phone, firma: form.firma,
        attribution,
      });
      try {
        if (navigator.sendBeacon) navigator.sendBeacon("/api/abandoned", new Blob([body], { type: "application/json" }));
        else fetch("/api/abandoned", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      } catch { /* darf nie stören */ }
    }, 1200);
    return () => window.clearTimeout(t);
  }, [form, interests, done, hasContact, isOpen]);

  function open(service?: string) {
    setForm(EMPTY);
    setInterests(service && SERVICES.some((s) => s.slug === service) ? [service] : []);
    setError(null);
    setDone(false);
    setIsOpen(true);
    trackQuoteOpen(service ? "service" : "cta", service);
    journey("quote_open");
  }
  function close() {
    setIsOpen(false);
  }
  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function toggleInterest(slug: string) {
    setInterests((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));
  }

  const interestNames = interests.map((s) => INTERESTS.find((i) => i.slug === s)?.name ?? s);

  async function submit() {
    setError(null);
    if (!form.vorname.trim() || !form.nachname.trim()) return setError("Bitte Vor- und Nachnamen angeben.");
    if (form.phone.replace(/\D/g, "").length < 6) return setError("Bitte eine gültige Telefonnummer angeben.");
    setLoading(true);
    try {
      const firstService = interests.find((s) => s !== "sonstiges") ?? "";
      const fd = new FormData();
      fd.append("name", `${form.vorname} ${form.nachname}`.trim());
      fd.append("firma", form.firma.trim());
      fd.append("phone", form.phone.trim());
      fd.append("email", form.email.trim());
      if (firstService) fd.append("service", firstService);
      fd.append(
        "besonderheiten",
        ["⚡ Schnellanfrage (Angebot-Modal)", interestNames.length ? `Interesse: ${interestNames.join(", ")}` : ""].filter(Boolean).join(" · "),
      );
      appendAttribution(fd);
      fd.append("sid", getSid()); // löscht nach Erfolg den evtl. vorhandenen Abbruch-Eintrag
      const res = await fetch("/api/lead", { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Senden fehlgeschlagen.");
        return;
      }
      const data = await res.json().catch(() => ({} as { id?: string }));
      trackLead({ leadId: data.id ?? "lead", service: interestNames[0], email: form.email, phone: form.phone });
      setDone(true);
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {isOpen && (
        <div className="sf-modal-overlay" onClick={close} role="dialog" aria-modal="true" aria-label="Angebot anfordern">
          <div className="sf-modal" onClick={(e) => e.stopPropagation()}>
            {done ? (
              <div className="sf-success">
                <div className="sf-success-ic"><Sparkles size={30} /></div>
                <h3>Danke, {form.vorname}!</h3>
                <p>Ihre Anfrage ist eingegangen. Wir melden uns schnellstmöglich telefonisch bei Ihnen – in der Regel innerhalb von 24 Stunden.</p>
                {person && (
                  <div className="sf-success-person">
                    <span className="sf-success-person-av">
                      {person.photo
                        ? <Image src={person.photo} alt={`${person.firstName} ${person.lastName}`} fill sizes="44px" style={{ objectFit: "cover" }} />
                        : `${person.firstName[0] ?? ""}${person.lastName[0] ?? ""}`}
                    </span>
                    <span className="sf-success-person-id">
                      <b>{person.firstName} {person.lastName}</b>
                      <span>{person.position} · {person.responseTime}</span>
                    </span>
                  </div>
                )}
                <dl className="sf-summary">
                  <div><dt>Kontakt</dt><dd>{form.phone}</dd></div>
                  {form.email && <div><dt>E-Mail</dt><dd>{form.email}</dd></div>}
                  {interestNames.length > 0 && <div><dt>Interesse</dt><dd>{interestNames.join(", ")}</dd></div>}
                </dl>
                <button className="sf-btn sf-btn-green sf-btn-lg" onClick={close}>Schließen</button>
              </div>
            ) : (
              <>
                <div className="sf-modal-top">
                  <div className="l">
                    <b>Kostenloses Angebot anfordern</b>
                    <p>In 30 Sekunden ausgefüllt · wir rufen Sie zurück.</p>
                  </div>
                  <button className="sf-modal-x" onClick={close} aria-label="Schließen"><X size={18} /></button>
                </div>

                <div className="sf-modal-body">
                  {error && <p className="sf-modal-err">{error}</p>}

                  <div className="sf-grid2">
                    <div className="sf-field">
                      <label htmlFor="lead-vorname">Vorname *</label>
                      <input id="lead-vorname" className="sf-input" placeholder="Max" autoComplete="given-name" value={form.vorname} onChange={(e) => set("vorname", e.target.value)} autoFocus />
                    </div>
                    <div className="sf-field">
                      <label htmlFor="lead-nachname">Nachname *</label>
                      <input id="lead-nachname" className="sf-input" placeholder="Mustermann" autoComplete="family-name" value={form.nachname} onChange={(e) => set("nachname", e.target.value)} />
                    </div>
                  </div>
                  <div className="sf-field">
                    <label htmlFor="lead-firma">Firma <span className="opt">(optional)</span></label>
                    <input id="lead-firma" className="sf-input" placeholder="Musterfirma GmbH" autoComplete="organization" value={form.firma} onChange={(e) => set("firma", e.target.value)} />
                  </div>
                  <div className="sf-field">
                    <label htmlFor="lead-phone">Telefon *</label>
                    <input id="lead-phone" className="sf-input" type="tel" inputMode="tel" placeholder="z. B. 0151 23456789" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  </div>
                  <div className="sf-field">
                    <label htmlFor="lead-email">E-Mail <span className="opt">(optional)</span></label>
                    <input id="lead-email" className="sf-input" type="email" placeholder="name@firma.de" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </div>
                  <div className="sf-field">
                    <label>Woran sind Sie interessiert? <span className="opt">(optional)</span></label>
                    <div className="sf-svc-choices">
                      {INTERESTS.map((i) => (
                        <button
                          key={i.slug}
                          type="button"
                          className={`sf-choice${interests.includes(i.slug) ? " sel" : ""}`}
                          onClick={() => toggleInterest(i.slug)}
                        >
                          {interests.includes(i.slug) ? <Check size={16} className="ic" /> : <span style={{ width: 16 }} />}
                          {i.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sf-modal-foot">
                  <button className="sf-btn sf-btn-outline" onClick={close}>Abbrechen</button>
                  <button className="sf-btn sf-btn-green" onClick={submit} disabled={loading}>
                    {loading ? "Wird gesendet …" : <>Jetzt Kontakt aufnehmen <ArrowRight size={16} /></>}
                  </button>
                </div>

                <div className="sf-modal-trust"><ShieldCheck size={14} /> Ihre Daten sind sicher · 100% DSGVO-konform · * Pflichtfeld</div>
              </>
            )}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
