import type { ComponentType, ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type IconType = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

// ── Panel: Karten-Container mit optionalem Titel + Action ────
export function Panel({
  title, subtitle, action, children, className = "", bodyClassName = "",
}: {
  title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string;
}) {
  return (
    <section className={`rounded-2xl border border-neutral-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={`px-5 py-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

// ── StatCard: KPI mit Delta ─────────────────────────────────
export function StatCard({
  label, value, delta, trend = "up", icon: Icon, hint,
}: {
  label: string; value: string; delta?: string; trend?: "up" | "down"; icon: IconType; hint?: string;
}) {
  const up = trend === "up";
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
        <span className="grid size-9 place-items-center rounded-xl bg-[#eef3e7] text-[#4a7029]">
          <Icon size={18} strokeWidth={2} />
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">{value}</div>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs">
        {delta && (
          <span className={`inline-flex items-center gap-0.5 font-semibold ${up ? "text-emerald-600" : "text-rose-600"}`}>
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{delta}
          </span>
        )}
        {hint && <span className="text-neutral-400">{hint}</span>}
      </div>
    </div>
  );
}

// ── StatusBadge: farbige Status-Pille ───────────────────────
const SUCCESS = new Set(["Bezahlt", "Abgeschlossen", "Gewonnen", "Veröffentlicht", "Bestätigt", "Aktiv"]);
const WARNING = new Set(["Offen", "Angefragt", "Neu", "Entwurf", "Geplant", "Kontaktiert", "Angebot", "In Arbeit"]);
const DANGER = new Set(["Überfällig", "Storniert", "Verloren", "Inaktiv"]);

export function StatusBadge({ status }: { status: string }) {
  let cls = "bg-neutral-100 text-neutral-600 ring-neutral-200";
  if (SUCCESS.has(status)) cls = "bg-emerald-50 text-emerald-700 ring-emerald-200";
  else if (WARNING.has(status)) cls = "bg-amber-50 text-amber-700 ring-amber-200";
  else if (DANGER.has(status)) cls = "bg-rose-50 text-rose-700 ring-rose-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

// ── PageHeader: Titel + Untertitel + Actions ────────────────
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── Button-Utility (nur Optik, für Links/Buttons) ───────────
export function btn(variant: "primary" | "ghost" | "outline" = "primary"): string {
  const base = "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors";
  if (variant === "primary") return `${base} bg-[#5d8a34] text-white hover:bg-[#4a7029]`;
  if (variant === "outline") return `${base} border border-neutral-300 text-neutral-700 hover:bg-neutral-50`;
  return `${base} text-neutral-600 hover:bg-neutral-100`;
}

// ── Table-Utilities: konsistente Klassen ────────────────────
export const table = {
  wrap: "overflow-x-auto",
  table: "w-full text-left text-sm",
  th: "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500",
  td: "whitespace-nowrap px-4 py-3.5 text-neutral-700",
  tr: "border-t border-neutral-100 hover:bg-neutral-50/60",
};
