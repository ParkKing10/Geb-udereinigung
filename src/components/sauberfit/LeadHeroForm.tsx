"use client";

import { useState } from "react";
import { ShieldCheck, ArrowRight, Check, Phone } from "lucide-react";
import { SERVICES } from "@/lib/sauberfit-data";
import { trackLead, getSid } from "@/lib/analytics";
import { appendAttribution } from "@/lib/attribution";
import { useLead } from "./LeadProvider";

// Kurzes, prominentes Kontakt-Formular im Hero ("Kontakt zuerst"). Erzeugt sofort
// einen Lead über /api/lead – nur Name + Telefon sind Pflicht, den Rest klären wir
// telefonisch. Ziel: maximale Abschlussrate statt langem Formular.

// Kompakte Auswahl der häufigsten Leistungen (optional). "sonstiges" ist kein Service-Slug.
const INTEREST_SLUGS = ["bueroreinigung", "unterhaltsreinigung", "glasreinigung", "treppenhausreinigung", "bauendreinigung", "praxisreinigung"];
const INTERESTS: { slug: string; name: string }[] = [
  ...INTEREST_SLUGS.map((slug) => ({ slug, name: SERVICES.find((s) => s.slug === slug)?.name ?? slug })),
  { slug: "sonstiges", name: "Sonstiges" },
];

export function LeadHeroForm() {
  const { open } = useLead();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(slug: string) {
    setSelected((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const vorname = String(fd.get("vorname") ?? "").trim();
    const nachname = String(fd.get("nachname") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    if (!vorname || !nachname) return setError("Bitte Vor- und Nachnamen angeben.");
    if (phone.replace(/\D/g, "").length < 6) return setError("Bitte eine gültige Telefonnummer angeben.");

    const interestNames = selected.map((s) => INTERESTS.find((i) => i.slug === s)?.name ?? s);
    const firstService = selected.find((s) => s !== "sonstiges") ?? "";

    setLoading(true);
    try {
      const body = new FormData();
      body.append("name", `${vorname} ${nachname}`.trim());
      body.append("firma", String(fd.get("firma") ?? "").trim());
      body.append("phone", phone);
      body.append("email", String(fd.get("email") ?? "").trim());
      if (firstService) body.append("service", firstService);
      body.append(
        "besonderheiten",
        ["⚡ Schnellanfrage (Kontaktformular)", interestNames.length ? `Interesse: ${interestNames.join(", ")}` : ""].filter(Boolean).join(" · "),
      );
      appendAttribution(body);
      body.append("sid", getSid());

      const res = await fetch("/api/lead", { method: "POST", body });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Senden fehlgeschlagen. Bitte erneut versuchen.");
        return;
      }
      const data = await res.json().catch(() => ({} as { id?: string }));
      trackLead({ leadId: data.id ?? "lead", service: interestNames[0], phone, email: String(fd.get("email") ?? "") });
      setDone(true);
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="sf-heroform sf-heroform-done">
        <div className="sf-heroform-check"><Check size={30} /></div>
        <h2>Danke! Ihre Anfrage ist da.</h2>
        <p>Wir melden uns schnellstmöglich telefonisch bei Ihnen – in der Regel innerhalb von 24 Stunden.</p>
      </div>
    );
  }

  return (
    <form className="sf-heroform" onSubmit={onSubmit} noValidate>
      <div className="sf-heroform-head">
        <b>Kostenloses Angebot anfordern</b>
        <span>In 30 Sekunden ausgefüllt – wir rufen Sie zurück.</span>
      </div>

      <div className="sf-hf-row">
        <div className="sf-field">
          <label htmlFor="hf-vorname">Vorname *</label>
          <input id="hf-vorname" name="vorname" className="sf-input" placeholder="Max" autoComplete="given-name" required />
        </div>
        <div className="sf-field">
          <label htmlFor="hf-nachname">Nachname *</label>
          <input id="hf-nachname" name="nachname" className="sf-input" placeholder="Mustermann" autoComplete="family-name" required />
        </div>
      </div>

      <div className="sf-field">
        <label htmlFor="hf-firma">Firma <span className="opt">(optional)</span></label>
        <input id="hf-firma" name="firma" className="sf-input" placeholder="Musterfirma GmbH" autoComplete="organization" />
      </div>

      <div className="sf-field">
        <label htmlFor="hf-phone">Telefon *</label>
        <input id="hf-phone" name="phone" className="sf-input" type="tel" inputMode="tel" placeholder="z. B. 0151 23456789" autoComplete="tel" required />
      </div>

      <div className="sf-field">
        <label htmlFor="hf-email">E-Mail <span className="opt">(optional)</span></label>
        <input id="hf-email" name="email" className="sf-input" type="email" placeholder="name@firma.de" autoComplete="email" />
      </div>

      <fieldset className="sf-hf-interests">
        <legend>Woran sind Sie interessiert? <span className="opt">(optional)</span></legend>
        <div className="sf-hf-checks">
          {INTERESTS.map((i) => (
            <label key={i.slug} className={`sf-hf-check${selected.includes(i.slug) ? " on" : ""}`}>
              <input type="checkbox" checked={selected.includes(i.slug)} onChange={() => toggle(i.slug)} />
              <span className="sf-hf-box">{selected.includes(i.slug) && <Check size={13} />}</span>
              {i.name}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="sf-modal-err">{error}</p>}

      <button className="sf-btn sf-btn-green sf-btn-lg sf-hf-submit" disabled={loading}>
        {loading ? "Wird gesendet …" : <>Jetzt Kontakt aufnehmen <ArrowRight size={17} /></>}
      </button>
      <span className="sf-hf-sub">100% kostenlos & unverbindlich</span>

      <button type="button" className="sf-hf-alt" onClick={() => open()}>
        <Phone size={13} /> Lieber sofort einen Festpreis? Angebot berechnen →
      </button>

      <div className="sf-hf-trust"><ShieldCheck size={13} /> Ihre Daten sind sicher · DSGVO-konform · * Pflichtfeld</div>
    </form>
  );
}
