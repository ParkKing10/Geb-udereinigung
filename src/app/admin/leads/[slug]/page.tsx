import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, Ruler, Gauge, Sparkles, CircleCheck, ImageOff, Building2, RefreshCw } from "lucide-react";
import { getLead } from "@/lib/admin/store";
import { ownsRecord } from "@/lib/admin/scope";
import { getService } from "@/lib/sauberfit-data";
import { leadStatus } from "@/lib/admin/data";
import { formatEUR, formatDate, formatDateTime } from "@/lib/admin/format";
import { PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { OfferConfigurator } from "@/components/admin/OfferConfigurator";
import { CreateOrderFromLead } from "@/components/admin/CreateOrderFromLead";
import { leadValue } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function LeadDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lead = await getLead(slug);
  if (!lead || !(await ownsRecord(lead))) notFound(); // fremde Leads sind für andere Accounts unsichtbar

  const serviceName = getService(lead.service)?.name ?? lead.service;
  const est = lead.estimate;
  const status = lead.status ?? leadStatus(lead.id);
  const perVisit = est?.estimatedHours && est?.hourlyRateCents ? (est.estimatedHours * est.hourlyRateCents) / 100 : 0;
  const orderDefault = perVisit ? leadValue(perVisit, lead.turnus || est?.recommendedTurnus) : 0;

  return (
    <>
      <Link href="/admin/leads" className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800">
        <ArrowLeft size={16} /> Zurück zu Leads
      </Link>

      <PageHeader
        title={lead.name}
        subtitle={`${serviceName} · ${lead.location}`}
        actions={<StatusBadge status={status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Anfrage */}
          <Panel title="Anfrage">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Field icon={<Sparkles size={15} />} label="Leistung" value={serviceName} />
              <Field icon={<MapPin size={15} />} label="Standort" value={lead.location} />
              {lead.areaSqm ? <Field icon={<Ruler size={15} />} label="Fläche (Kundenangabe)" value={`${lead.areaSqm} m²`} /> : null}
              {lead.firma ? <Field icon={<Building2 size={15} />} label="Firma" value={lead.firma} /> : null}
              {lead.objektart ? <Field icon={<Building2 size={15} />} label="Objektart" value={lead.objektart} /> : null}
              {lead.verschmutzung ? <Field icon={<Gauge size={15} />} label="Verschmutzungsgrad" value={lead.verschmutzung} /> : null}
              {lead.turnus ? <Field icon={<RefreshCw size={15} />} label="Turnus (Kundenwunsch)" value={lead.turnus} /> : null}
              {lead.zeitfenster ? <Field icon={<Clock size={15} />} label="Zeitfenster" value={lead.zeitfenster} /> : null}
              <Field icon={<Phone size={15} />} label="Telefon" value={<a href={`tel:${lead.phone}`} className="text-[#4a7029] hover:underline">{lead.phone}</a>} />
              <Field icon={<Mail size={15} />} label="E-Mail" value={<a href={`mailto:${lead.email}`} className="text-[#4a7029] hover:underline">{lead.email}</a>} />
              <Field icon={<Calendar size={15} />} label="Wunschstart" value={formatDate(lead.startDate)} />
              <Field icon={<Clock size={15} />} label="Eingegangen" value={formatDateTime(lead.createdAt)} />
              {lead.details?.map((d) => (
                <Field key={d.label} icon={<CircleCheck size={15} />} label={d.label} value={d.value} />
              ))}
            </dl>
            {lead.besonderheiten && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Besonderheiten (Kundenangabe)</div>
                <p className="mt-1 text-sm text-neutral-700">{lead.besonderheiten}</p>
              </div>
            )}
            {lead.attribution && Object.keys(lead.attribution).length > 0 && (() => {
              const L: Record<string, string> = { gclid: "Google-Klick-ID (gclid)", gbraid: "gbraid", wbraid: "wbraid", utm_source: "Quelle", utm_medium: "Medium", utm_campaign: "Kampagne", utm_term: "Keyword", utm_content: "Anzeige/Content", referrer: "Referrer", landing_page: "Landingpage", first_seen: "Erstkontakt" };
              return (
                <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">Herkunft / Attribution</div>
                  <dl className="mt-1.5 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                    {Object.entries(lead.attribution!).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3">
                        <dt className="shrink-0 text-neutral-500">{L[k] ?? k}</dt>
                        <dd className="truncate font-medium text-neutral-800" title={v}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })()}
          </Panel>

          {/* Fotos */}
          <Panel title="Hochgeladene Fotos" subtitle={`${lead.images?.length ?? 0} Bild(er) vom Kunden`}>
            {lead.images && lead.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {lead.images.map((src) => (
                  <a key={src} href={src} target="_blank" rel="noreferrer" className="group relative block aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="Kundenfoto" className="size-full object-cover transition-transform group-hover:scale-105" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-neutral-400">
                <ImageOff size={26} />
                <p className="text-sm">Keine Fotos übermittelt.</p>
              </div>
            )}
          </Panel>

          {/* KI-Berechnung */}
          <Panel
            title="KI-Berechnung"
            subtitle="Automatische Aufwands- und Preisschätzung aus den Fotos"
            action={est && <span className="rounded-full bg-[#eef3e7] px-2.5 py-1 text-[11px] font-semibold text-[#4a7029]">{est.model === "heuristik" ? "Heuristik" : est.model}</span>}
          >
            {est ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MetricBox icon={<Ruler size={16} />} label="Fläche" value={`${est.areaSqmEst} m²`} />
                  <MetricBox icon={<Gauge size={16} />} label="Zustand" value={est.condition} />
                  <MetricBox icon={<Clock size={16} />} label="Aufwand" value={`${est.estimatedHours} Std.`} />
                  <MetricBox icon={<Calendar size={16} />} label="Turnus" value={est.recommendedTurnus} />
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5">
                  <div className="text-xs text-neutral-500">Geschätzte Preisspanne (pro Einsatz)</div>
                  <div className="text-2xl font-bold tracking-tight text-neutral-900">{formatEUR(est.priceLowCents)} – {formatEUR(est.priceHighCents)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                      <div className="h-full rounded-full bg-[#5d8a34]" style={{ width: `${Math.round(est.confidence * 100)}%` }} />
                    </div>
                    <span className="text-xs text-neutral-500">{Math.round(est.confidence * 100)}% Konfidenz</span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-neutral-600">{est.summary}</p>

                {est.findings.length > 0 && (
                  <ul className="space-y-2">
                    {est.findings.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                        <CircleCheck size={16} className="mt-0.5 shrink-0 text-[#5d8a34]" /> {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-neutral-400">Keine KI-Schätzung vorhanden (keine Fotos übermittelt).</p>
            )}
          </Panel>
        </div>

        {/* Konfigurator + Auftrag */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <OfferConfigurator lead={lead} />
          <Panel title="Auftrag erstellen" subtitle="Kunde bucht? Direkt hier eintragen – wird als Umsatz & Wiederbesteller erfasst.">
            <CreateOrderFromLead
              lead={{ id: lead.id, name: lead.name, email: lead.email, phone: lead.phone, service: serviceName, location: lead.location, turnus: lead.turnus }}
              defaultAmount={orderDefault}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">{icon} {label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

function MetricBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-3">
      <span className="text-[#4a7029]">{icon}</span>
      <div className="mt-1.5 text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="text-sm font-semibold capitalize text-neutral-900">{value}</div>
    </div>
  );
}
