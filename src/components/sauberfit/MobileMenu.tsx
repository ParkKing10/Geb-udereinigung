"use client";

import { useEffect, useState } from "react";
import { Menu, X, Phone, ChevronDown, ArrowRight } from "lucide-react";
import { useLead } from "./LeadProvider";

type Item = { slug: string; name: string };

// Mobile-Navigation (Hamburger + Drawer). Erscheint ≤1080px, wo die Desktop-Nav ausgeblendet ist.
export function MobileMenu({
  services,
  targets,
  phone,
  hours,
}: {
  services: Item[];
  targets: Item[];
  phone: string;
  hours: string;
}) {
  const { open: openLead } = useLead();
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<null | "leistungen" | "fuer-wen">(null);

  // Body-Scroll sperren, solange das Menü offen ist.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Mit Escape schließen.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => { setOpen(false); setSub(null); };
  const tel = `tel:${phone.replace(/[^\d+]/g, "")}`;

  return (
    <>
      <button
        type="button"
        className="sf-burger"
        aria-label="Menü öffnen"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu size={24} />
      </button>

      {open && <div className="sf-drawer-overlay" onClick={close} aria-hidden />}

      <aside className={`sf-drawer ${open ? "in" : ""}`} aria-hidden={!open}>
        <button type="button" className="sf-drawer-close" aria-label="Menü schließen" onClick={close}><X size={22} /></button>
        <nav className="sf-drawer-nav" aria-label="Mobile Navigation">
          <MobileGroup
            label="Leistungen"
            href="/leistungen"
            items={services}
            base="/leistungen"
            expanded={sub === "leistungen"}
            onToggle={() => setSub((s) => (s === "leistungen" ? null : "leistungen"))}
            onNavigate={close}
          />
          <MobileGroup
            label="Für wen"
            href="/fuer-wen"
            items={targets}
            base="/fuer-wen"
            expanded={sub === "fuer-wen"}
            onToggle={() => setSub((s) => (s === "fuer-wen" ? null : "fuer-wen"))}
            onNavigate={close}
          />
          <a href="/ueber-uns" className="sf-drawer-link" onClick={close}>Über uns</a>
          <a href="/standorte" className="sf-drawer-link" onClick={close}>Standorte</a>
          <a href="/preise" className="sf-drawer-link" onClick={close}>Preise</a>
          <a href="/kontakt" className="sf-drawer-link" onClick={close}>Kontakt</a>
        </nav>

        <div className="sf-drawer-foot">
          <button
            type="button"
            className="sf-btn sf-btn-dark sf-btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => { close(); openLead(); }}
          >
            Angebot berechnen <ArrowRight size={17} />
          </button>
          <a href={tel} data-track="mobile-menu" className="sf-drawer-phone" onClick={close}>
            <Phone size={17} className="ic" />
            <span><b>{phone}</b><small>{hours}</small></span>
          </a>
        </div>
      </aside>
    </>
  );
}

function MobileGroup({
  label, href, items, base, expanded, onToggle, onNavigate,
}: {
  label: string; href: string; items: Item[]; base: string;
  expanded: boolean; onToggle: () => void; onNavigate: () => void;
}) {
  return (
    <div className="sf-drawer-group">
      <div className="sf-drawer-grouprow">
        <a href={href} className="sf-drawer-link" onClick={onNavigate}>{label}</a>
        <button type="button" className={`sf-drawer-expand ${expanded ? "open" : ""}`} aria-label={`${label} Untermenü`} aria-expanded={expanded} onClick={onToggle}>
          <ChevronDown size={18} />
        </button>
      </div>
      {expanded && (
        <div className="sf-drawer-sub">
          {items.map((it) => (
            <a key={it.slug} href={`${base}/${it.slug}`} className="sf-drawer-sublink" onClick={onNavigate}>{it.name}</a>
          ))}
        </div>
      )}
    </div>
  );
}
