"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Phone, Mail } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import type { Stat, Logo, ContactPerson } from "@/lib/site-content";

function GoogleG({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden focusable="false">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

// Zählt eine Zahl-Wertangabe (z. B. "2.800+") beim Erscheinen von 0 hoch.
function CountUp({ value, run }: { value: string; run: boolean }) {
  const m = value.match(/^(\D*)([\d.]+)(.*)$/);
  const target = m ? parseInt(m[2].replace(/\./g, ""), 10) : NaN;
  const prefix = m?.[1] ?? "";
  const suffix = m?.[3] ?? "";
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!run || Number.isNaN(target)) return;
    let raf = 0;
    const dur = 1300;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setN(Math.round(easeOutExpo(p) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target]);

  if (Number.isNaN(target)) return <>{value}</>;
  return <>{prefix}{n.toLocaleString("de-DE")}{suffix}</>;
}

// Google-Bewertung (steht ganz oben, wo vorher das Badge war).
export function HeroGoogle({ google, showCount = false }: { google: { rating: string; count: string }; showCount?: boolean }) {
  return (
    <div className="sf-grating sf-grating-top">
      <span className="g"><GoogleG size={24} /></span>
      <span className="t">
        <b>{google.rating} <span className="sf-stars">★★★★★</span></b>
      </span>
      {showCount && google.count && <span className="sf-grating-count">aus {google.count} Bewertungen</span>}
    </div>
  );
}

export function HeroStats({ stats }: { stats: Stat[] }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`sf-hero-trust ${inView ? "in" : ""}`}>
      <div className="sf-statbar">
        {stats.map((s, i) => (
          <div className="sf-statcell" key={s.label} style={{ transitionDelay: `${i * 80}ms` }}>
            <b><CountUp value={s.value} run={inView} /></b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroLogos({ logos }: { logos: Logo[] }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  if (!logos.length) return null;
  return (
    <div ref={ref} className="sf-logos" aria-label="Kunden, die uns vertrauen">
      <span className="sf-logos-label">Vertraut von Unternehmen in ganz Deutschland</span>
      <div className="sf-logos-row">
        {logos.map((l, i) => (
          <div key={l.name + i} className={`sf-logo-item ${inView ? "in" : ""}`} style={{ transitionDelay: `${i * 90}ms` }}>
            {l.src ? (
              <Image src={l.src} alt={l.name} width={120} height={36} className="sf-logo-img" />
            ) : (
              <span className="sf-logo-word">{l.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroPerson({ person }: { person: ContactPerson }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const tel = `tel:${person.phone.replace(/[^\d+]/g, "")}`;
  return (
    <div ref={ref} className={`sf-person-wide ${inView ? "in" : ""}`}>
      <div className="sf-pw-id">
        <div className="sf-person-avatar lg">
          {person.photo ? (
            <Image src={person.photo} alt={`${person.firstName} ${person.lastName}`} fill sizes="72px" className="sf-person-img" />
          ) : (
            <span>{(person.firstName[0] ?? "") + (person.lastName[0] ?? "")}</span>
          )}
          {person.available && <span className="sf-person-dot" aria-hidden />}
        </div>
        <div className="sf-pw-info">
          <span className="sf-person-eyebrow">Ihr persönlicher Ansprechpartner</span>
          <b className="sf-pw-name">{person.firstName} {person.lastName}</b>
          <span className="sf-pw-title">{person.position}</span>
          {person.available && <em className="sf-person-status"><span className="sf-person-dot sm" aria-hidden /> {person.statusLabel}</em>}
          <span className="sf-pw-time">{person.responseTime}</span>
        </div>
      </div>
      <div className="sf-pw-contact">
        <a href={tel} data-track="hero" className="sf-pw-link"><Phone size={16} /> {person.phone}</a>
        <a href={`mailto:${person.email}`} data-track="hero" className="sf-pw-link"><Mail size={16} /> {person.email}</a>
      </div>
    </div>
  );
}
