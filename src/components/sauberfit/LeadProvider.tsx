"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { X, ArrowRight, ArrowLeft, Check, Sparkles, ShieldCheck, ImagePlus, Trash2, Plus, ChevronUp } from "lucide-react";
import { SERVICES } from "@/lib/sauberfit-data";
import type { ContactPerson } from "@/lib/site-content";
import { trackQuoteOpen, trackQuoteStep, trackLead, leadValue, getSid } from "@/lib/analytics";
import { appendAttribution, getAttribution } from "@/lib/attribution";

const STEP_NAMES = ["Leistung", "Objekt", "Kontakt"];

type LeadCtx = { open: (service?: string) => void };
const Ctx = createContext<LeadCtx | null>(null);

export function useLead() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLead must be used within LeadProvider");
  return c;
}

type Form = {
  service: string;
  location: string;
  objektart: string;
  areaSqm: string;
  verschmutzung: string;
  turnus: string;
  zeitfenster: string;
  startDate: string;
  etagen: string;
  aufzug: string;
  sanitaer: string;
  glas: string;
  moebliert: string;
  parken: string;
  aussen: string;
  besonderheiten: string;
  firma: string;
  name: string;
  phone: string;
  email: string;
};

const EMPTY: Form = {
  service: "", location: "", objektart: "", areaSqm: "", verschmutzung: "", turnus: "", zeitfenster: "", startDate: "",
  etagen: "", aufzug: "", sanitaer: "", glas: "", moebliert: "", parken: "", aussen: "", besonderheiten: "",
  firma: "", name: "", phone: "", email: "",
};
const STEP_TITLES = ["Leistung", "Objekt", "Kontakt"];

const OBJEKTARTEN = ["Bürogebäude", "Praxis / Klinik", "Hotel / Gastronomie", "Wohnhaus / Treppenhaus", "Ladenlokal / Handel", "Industrie / Halle", "Kita / Schule", "Sonstiges"];
const VERSCHMUTZUNG: [string, string][] = [["leicht", "leicht – gepflegt"], ["normal", "normal"], ["stark", "stark – Grundreinigung nötig"]];
const TURNUS_PRESETS = ["Einmalig", "Täglich", "Mehrmals pro Woche", "Wöchentlich", "2× pro Woche", "3× pro Woche", "Alle 2 Wochen", "Monatlich", "Nach Bedarf"];
const ZEITFENSTER = ["Tagsüber", "Abends", "Nachts", "Wochenende", "Flexibel"];
const JANEIN = ["Ja", "Nein"];

export function LeadProvider({ children, person }: { children: React.ReactNode; person?: ContactPerson }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showMore, setShowMore] = useState(false);

  function resetImages() {
    setPreviews((p) => { p.forEach((u) => URL.revokeObjectURL(u)); return []; });
    setFiles([]);
  }

  const hasContact = /\S+@\S+\.\S+/.test(form.email) || form.phone.replace(/\D/g, "").length >= 6;

  // Live-Formular-Status fürs Admin-Dashboard melden (anonym: offen/Schritt/Kontakt-ja-nein).
  useEffect(() => {
    window.__dgdQuote = { open: isOpen && !done, step, hasContact };
    window.__dgdPresencePing?.();
  }, [isOpen, step, hasContact, done]);

  // Abbruch-Erfassung: Sobald E-Mail ODER Handynummer eingetippt ist (und noch nicht
  // abgeschickt wurde), Zwischenstand debounced speichern. Beim erfolgreichen Absenden
  // löscht /api/lead den Eintrag serverseitig wieder (per sid).
  useEffect(() => {
    if (done || !hasContact) return;
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
      const body = JSON.stringify({
        sid, step,
        service: form.service, location: form.location, objektart: form.objektart,
        areaSqm: form.areaSqm, turnus: form.turnus, firma: form.firma,
        name: form.name, email: form.email, phone: form.phone,
        attribution,
      });
      try {
        if (navigator.sendBeacon) navigator.sendBeacon("/api/abandoned", new Blob([body], { type: "application/json" }));
        else fetch("/api/abandoned", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      } catch { /* darf nie stören */ }
    }, 1200);
    return () => window.clearTimeout(t);
  }, [form, step, done, hasContact]);

  function open(service?: string) {
    setForm({ ...EMPTY, service: service ?? "" });
    resetImages();
    setStep(0);
    setShowMore(false);
    setError(null);
    setDone(false);
    setIsOpen(true);
    trackQuoteOpen(service ? "service" : "cta", service);
  }
  function close() {
    setIsOpen(false);
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => {
      const merged = [...prev, ...imgs].slice(0, 8);
      setPreviews((old) => {
        old.forEach((u) => URL.revokeObjectURL(u));
        return merged.map((f) => URL.createObjectURL(f));
      });
      return merged;
    });
    setError(null);
  }
  function removeFile(idx: number) {
    setFiles((prev) => {
      const merged = prev.filter((_, i) => i !== idx);
      setPreviews((old) => { old.forEach((u) => URL.revokeObjectURL(u)); return merged.map((f) => URL.createObjectURL(f)); });
      return merged;
    });
  }
  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function next() {
    setError(null);
    if (step === 0 && !form.service) return setError("Bitte wählen Sie eine Leistung.");
    if (step === 1 && !form.location.trim()) return setError("Bitte geben Sie den Ort an.");
    if (step === 1 && !form.objektart) return setError("Bitte wählen Sie die Objektart.");
    const target = Math.min(step + 1, 2);
    trackQuoteStep(target, STEP_NAMES[target]);
    setStep(target);
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    setError(null);
    if (!form.name.trim()) return setError("Bitte geben Sie Ihren Namen an.");
    if (!form.phone.trim()) return setError("Bitte geben Sie Ihre Handynummer an.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Bitte geben Sie eine gültige E-Mail an.");
    setLoading(true);
    try {
      const fd = new FormData();
      (Object.keys(form) as (keyof Form)[]).forEach((k) => fd.append(k, form[k]));
      files.forEach((f) => fd.append("images", f));
      appendAttribution(fd);
      fd.append("sid", getSid()); // löscht nach Erfolg den evtl. vorhandenen Abbruch-Eintrag
      const res = await fetch("/api/lead", { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Senden fehlgeschlagen.");
        return;
      }
      const data = await res.json().catch(() => ({} as { id?: string; estimate?: { estimatedHours?: number; hourlyRateCents?: number; recommendedTurnus?: string } }));
      const est = data.estimate;
      const perVisit = est?.estimatedHours && est?.hourlyRateCents ? (est.estimatedHours * est.hourlyRateCents) / 100 : 0;
      const value = perVisit ? leadValue(perVisit, form.turnus || est?.recommendedTurnus) : undefined;
      // Ort auf PLZ bzw. Stadtnamen gröben – keine volle Adresse an Analytics.
      const region = (form.location.match(/\b\d{5}\b/) || form.location.match(/^[^\d,]+/))?.[0]?.trim() || undefined;
      trackLead({ leadId: data.id ?? "lead", service: serviceName, region, value, email: form.email, phone: form.phone });
      setDone(true);
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  const serviceName = SERVICES.find((s) => s.slug === form.service)?.name ?? form.service;

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {isOpen && (
        <div className="sf-modal-overlay" onClick={close} role="dialog" aria-modal="true" aria-label="Angebot anfordern">
          <div className="sf-modal" onClick={(e) => e.stopPropagation()}>
            {done ? (
              <div className="sf-success">
                <div className="sf-success-ic"><Sparkles size={30} /></div>
                <h3>Danke, {form.name}!</h3>
                <p>Ihre Anfrage ist eingegangen. Wir melden uns schnellstmöglich mit Ihrem unverbindlichen Angebot.</p>
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
                  <div><dt>Leistung</dt><dd>{serviceName}</dd></div>
                  <div><dt>Ort</dt><dd>{form.location}</dd></div>
                  <div><dt>Kontakt</dt><dd>{form.phone}</dd></div>
                  {form.startDate && <div><dt>Wunschstart</dt><dd>{form.startDate}</dd></div>}
                  {form.areaSqm && <div><dt>Fläche</dt><dd>{form.areaSqm} m²</dd></div>}
                  {form.objektart && <div><dt>Objektart</dt><dd>{form.objektart}</dd></div>}
                  {form.turnus && <div><dt>Turnus</dt><dd>{form.turnus}</dd></div>}
                  {files.length > 0 && <div><dt>Fotos</dt><dd>{files.length} übermittelt</dd></div>}
                </dl>
                <button className="sf-btn sf-btn-green sf-btn-lg" onClick={close}>Schließen</button>
              </div>
            ) : (
              <>
                <div className="sf-modal-top">
                  <div className="l">
                    <b>Angebot berechnen</b>
                    <p>Kostenlos & unverbindlich · Schritt {step + 1} von 3 · {STEP_TITLES[step]}</p>
                  </div>
                  <button className="sf-modal-x" onClick={close} aria-label="Schließen"><X size={18} /></button>
                </div>

                <div className="sf-modal-steps">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`sf-step-dot${i <= step ? " on" : ""}`} />
                  ))}
                </div>

                <div className="sf-modal-body">
                  {error && <p className="sf-modal-err">{error}</p>}

                  {step === 0 && (
                    <>
                      <h3>Was möchten Sie reinigen lassen?</h3>
                      <div className="sf-svc-choices">
                        {SERVICES.map((s) => (
                          <button
                            key={s.slug}
                            className={`sf-choice${form.service === s.slug ? " sel" : ""}`}
                            onClick={() => { set("service", s.slug); setError(null); }}
                          >
                            {form.service === s.slug ? <Check size={16} className="ic" /> : <span style={{ width: 16 }} />}
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <h3>Wo & was soll gereinigt werden?</h3>
                      <div className="sf-field">
                        <label htmlFor="lead-loc">Ort / PLZ / Adresse</label>
                        <input
                          id="lead-loc"
                          className="sf-input"
                          placeholder="z. B. Frankfurt oder 60311"
                          value={form.location}
                          onChange={(e) => set("location", e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="sf-grid2">
                        <div className="sf-field">
                          <label htmlFor="lead-objekt">Objektart</label>
                          <select id="lead-objekt" className="sf-input" value={form.objektart} onChange={(e) => { set("objektart", e.target.value); setError(null); }}>
                            <option value="">— bitte wählen —</option>
                            {OBJEKTARTEN.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                        <div className="sf-field">
                          <label htmlFor="lead-area">Fläche <span className="opt">(ca. m², optional)</span></label>
                          <input id="lead-area" className="sf-input" type="number" min="0" inputMode="numeric" placeholder="z. B. 120" value={form.areaSqm} onChange={(e) => set("areaSqm", e.target.value)} />
                        </div>
                        <div className="sf-field">
                          <label htmlFor="lead-dirt">Verschmutzungsgrad <span className="opt">(optional)</span></label>
                          <select id="lead-dirt" className="sf-input" value={form.verschmutzung} onChange={(e) => set("verschmutzung", e.target.value)}>
                            <option value="">— bitte wählen —</option>
                            {VERSCHMUTZUNG.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                        <div className="sf-field">
                          <label htmlFor="lead-turnus">Turnus <span className="opt">(optional, frei wählbar)</span></label>
                          <input id="lead-turnus" className="sf-input" list="turnus-presets" placeholder="z. B. Wöchentlich oder alle 3 Tage" value={form.turnus} onChange={(e) => set("turnus", e.target.value)} />
                          <datalist id="turnus-presets">{TURNUS_PRESETS.map((t) => <option key={t} value={t} />)}</datalist>
                        </div>
                        <div className="sf-field">
                          <label htmlFor="lead-zeit">Zeitfenster <span className="opt">(optional)</span></label>
                          <select id="lead-zeit" className="sf-input" value={form.zeitfenster} onChange={(e) => set("zeitfenster", e.target.value)}>
                            <option value="">— bitte wählen —</option>
                            {ZEITFENSTER.map((z) => <option key={z} value={z}>{z}</option>)}
                          </select>
                        </div>
                      </div>

                      <button type="button" className="sf-more-btn" onClick={() => setShowMore((v) => !v)}>
                        {showMore ? <ChevronUp size={15} /> : <Plus size={15} />} {showMore ? "Weitere Angaben ausblenden" : "Weitere Angaben (optional)"}
                      </button>
                      {showMore && (
                        <div className="sf-more-fields">
                          <p className="sf-more-hint">Alles freiwillig – je mehr Sie angeben, desto genauer das Angebot. Fehlt etwas, klären wir es am Telefon.</p>
                          <div className="sf-grid2">
                            <div className="sf-field">
                              <label htmlFor="lead-date">Reinigungsbeginn <span className="opt">(optional)</span></label>
                              <input id="lead-date" className="sf-input" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                            </div>
                            <div className="sf-field">
                              <label htmlFor="lead-etagen">Anzahl Etagen <span className="opt">(optional)</span></label>
                              <input id="lead-etagen" className="sf-input" type="number" min="0" placeholder="z. B. 3" value={form.etagen} onChange={(e) => set("etagen", e.target.value)} />
                            </div>
                            <div className="sf-field">
                              <label htmlFor="lead-sanitaer">Anzahl Sanitärbereiche <span className="opt">(optional)</span></label>
                              <input id="lead-sanitaer" className="sf-input" type="number" min="0" placeholder="z. B. 2" value={form.sanitaer} onChange={(e) => set("sanitaer", e.target.value)} />
                            </div>
                            <div className="sf-field">
                              <label htmlFor="lead-aufzug">Aufzug vorhanden? <span className="opt">(optional)</span></label>
                              <select id="lead-aufzug" className="sf-input" value={form.aufzug} onChange={(e) => set("aufzug", e.target.value)}>
                                <option value="">—</option>{JANEIN.map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                            <div className="sf-field">
                              <label htmlFor="lead-glas">Viel Glas / viele Fenster? <span className="opt">(optional)</span></label>
                              <select id="lead-glas" className="sf-input" value={form.glas} onChange={(e) => set("glas", e.target.value)}>
                                <option value="">—</option>{JANEIN.map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                            <div className="sf-field">
                              <label htmlFor="lead-moeb">Möbliert? <span className="opt">(optional)</span></label>
                              <select id="lead-moeb" className="sf-input" value={form.moebliert} onChange={(e) => set("moebliert", e.target.value)}>
                                <option value="">—</option>{JANEIN.map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                            <div className="sf-field">
                              <label htmlFor="lead-park">Parkmöglichkeiten? <span className="opt">(optional)</span></label>
                              <select id="lead-park" className="sf-input" value={form.parken} onChange={(e) => set("parken", e.target.value)}>
                                <option value="">—</option>{JANEIN.map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                            <div className="sf-field">
                              <label htmlFor="lead-aussen">Außenflächen reinigen? <span className="opt">(optional)</span></label>
                              <select id="lead-aussen" className="sf-input" value={form.aussen} onChange={(e) => set("aussen", e.target.value)}>
                                <option value="">—</option>{JANEIN.map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="sf-field">
                            <label htmlFor="lead-bes">Besonderheiten <span className="opt">(optional)</span></label>
                            <textarea id="lead-bes" className="sf-input" rows={3} placeholder="z. B. starke Kalkablagerungen, Bauendreinigung, viele Glasflächen, empfindliche Böden…" value={form.besonderheiten} onChange={(e) => set("besonderheiten", e.target.value)} />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h3>Wie erreichen wir Sie?</h3>
                      <div className="sf-field">
                        <label htmlFor="lead-firma">Firma / Unternehmen <span className="opt">(optional)</span></label>
                        <input id="lead-firma" className="sf-input" placeholder="z. B. Muster GmbH" value={form.firma} onChange={(e) => set("firma", e.target.value)} autoFocus />
                      </div>
                      <div className="sf-field">
                        <label htmlFor="lead-name">Name</label>
                        <input id="lead-name" className="sf-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
                      </div>
                      <div className="sf-field">
                        <label htmlFor="lead-phone">Handynummer</label>
                        <input id="lead-phone" className="sf-input" type="tel" placeholder="z. B. 0151 23456789" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                      </div>
                      <div className="sf-field">
                        <label htmlFor="lead-email">E-Mail</label>
                        <input id="lead-email" className="sf-input" type="email" placeholder="name@firma.de" value={form.email} onChange={(e) => set("email", e.target.value)} />
                      </div>
                      <div className="sf-field">
                        <label>Fotos hochladen <span className="opt">(optional) – für ein schnelleres, genaueres Angebot</span></label>
                        <label className="sf-upload">
                          <input type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                          <ImagePlus size={18} />
                          <span>Fotos der Räume/Flächen hinzufügen</span>
                          <small>JPG, PNG oder WebP · bis zu 8 Bilder</small>
                        </label>
                        {previews.length > 0 && (
                          <div className="sf-thumbs">
                            {previews.map((src, i) => (
                              <div key={src} className="sf-thumb">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt={`Bild ${i + 1}`} />
                                <button type="button" onClick={() => removeFile(i)} aria-label="Bild entfernen"><Trash2 size={14} /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="sf-modal-foot">
                  {step > 0 ? (
                    <button className="sf-btn sf-btn-outline" onClick={back}><ArrowLeft size={16} /> Zurück</button>
                  ) : (
                    <button className="sf-btn sf-btn-outline" onClick={close}>Abbrechen</button>
                  )}
                  {step < 2 ? (
                    <button className="sf-btn sf-btn-dark" onClick={next}>Weiter <ArrowRight size={16} /></button>
                  ) : (
                    <button className="sf-btn sf-btn-green" onClick={submit} disabled={loading}>
                      {loading ? "Wird gesendet …" : "Angebot anfordern"}
                    </button>
                  )}
                </div>

                <div className="sf-modal-trust"><ShieldCheck size={14} /> Ihre Daten sind sicher · 100% DSGVO-konform</div>
              </>
            )}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
