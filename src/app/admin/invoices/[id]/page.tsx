import { notFound } from "next/navigation";
import { getInvoice, readInvoiceSettings, taxCents, grossCents, effectiveStatus } from "@/lib/admin/invoices";
import { InvoicePrintActions } from "@/components/admin/InvoicePrintActions";
import { StatusBadge } from "@/components/admin/ui";
import { formatEUR, formatDate } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, s] = await Promise.all([getInvoice(id), readInvoiceSettings()]);
  if (!invoice) notFound();

  const eff = effectiveStatus(invoice);
  const net = invoice.netCents;
  const tax = taxCents(invoice);
  const gross = grossCents(invoice);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Nur auf dem Bildschirm sichtbar: die Rechnung selbst wird sauber gedruckt. */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .invoice-print, .invoice-print * { visibility: visible !important; }
          .invoice-print { position: absolute; inset: 0; margin: 0; width: 100%; box-shadow: none !important; border: 0 !important; }
          @page { margin: 18mm; }
        }
      `}</style>

      <InvoicePrintActions invoice={invoice} effStatus={eff} />

      <article className="invoice-print rounded-2xl border border-neutral-200 bg-white p-8 text-[13px] leading-relaxed text-neutral-800 shadow-sm sm:p-12">
        {/* Kopf: Absender + Titel */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-base font-bold text-neutral-900">{s.companyName}</p>
            {s.addressLines.filter(Boolean).map((l, i) => <p key={i} className="text-neutral-600">{l}</p>)}
            <p className="mt-1 text-neutral-600">{s.phone} · {s.email}</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Rechnung</h1>
            <p className="mt-1 font-mono text-neutral-700">{invoice.number}</p>
            <div className="mt-2 print:hidden"><StatusBadge status={eff} /></div>
          </div>
        </div>

        {/* Empfänger */}
        <div className="mt-10 grid grid-cols-2 gap-6">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Rechnung an</p>
            <p className="font-semibold text-neutral-900">{invoice.customerName}</p>
            {(invoice.customerAddress || "").split("\n").filter(Boolean).map((l, i) => <p key={i} className="text-neutral-600">{l}</p>)}
            {invoice.customerEmail && <p className="text-neutral-500">{invoice.customerEmail}</p>}
          </div>
          <div className="text-right text-neutral-600">
            <div className="flex justify-between gap-4"><span className="text-neutral-400">Rechnungsdatum</span><span className="font-medium text-neutral-800">{formatDate(invoice.issuedAt)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-neutral-400">Fällig am</span><span className="font-medium text-neutral-800">{formatDate(invoice.dueAt)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-neutral-400">Rechnungsnr.</span><span className="font-mono font-medium text-neutral-800">{invoice.number}</span></div>
          </div>
        </div>

        {/* Positionen */}
        <table className="mt-8 w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-neutral-200 text-[11px] uppercase tracking-wide text-neutral-400">
              <th className="py-2 font-semibold">Beschreibung</th>
              <th className="py-2 text-right font-semibold">USt</th>
              <th className="py-2 text-right font-semibold">Netto</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-100">
              <td className="py-3 align-top">
                <p className="font-medium text-neutral-900">{invoice.service}</p>
                {invoice.description && <p className="text-neutral-500">{invoice.description}</p>}
              </td>
              <td className="py-3 text-right align-top text-neutral-600">{invoice.taxRate}%</td>
              <td className="py-3 text-right align-top font-medium tabular-nums text-neutral-900">{formatEUR(net)}</td>
            </tr>
          </tbody>
        </table>

        {/* Summen */}
        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-[260px] space-y-1.5">
            <div className="flex justify-between text-neutral-600"><span>Zwischensumme (netto)</span><span className="tabular-nums">{formatEUR(net)}</span></div>
            {!s.smallBusiness && invoice.taxRate > 0 && (
              <div className="flex justify-between text-neutral-600"><span>zzgl. {invoice.taxRate}% USt</span><span className="tabular-nums">{formatEUR(tax)}</span></div>
            )}
            <div className="flex justify-between border-t-2 border-neutral-200 pt-1.5 text-base font-bold text-neutral-900"><span>Gesamtbetrag</span><span className="tabular-nums">{formatEUR(gross)}</span></div>
          </div>
        </div>

        {s.smallBusiness && (
          <p className="mt-6 text-neutral-500">Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</p>
        )}

        {/* Zahlungshinweis */}
        <div className="mt-10 rounded-xl bg-neutral-50 p-4 text-neutral-700 print:bg-transparent print:p-0">
          <p className="font-medium text-neutral-900">Zahlungshinweis</p>
          <p className="mt-1">
            {s.footerNote || `Bitte überweisen Sie den Gesamtbetrag bis zum ${formatDate(invoice.dueAt)} unter Angabe der Rechnungsnummer ${invoice.number}.`}
          </p>
          {(s.bankName || s.iban) && (
            <p className="mt-2 text-neutral-600">
              {s.bankName && <>Bank: {s.bankName} · </>}{s.iban && <>IBAN: {s.iban}</>}{s.bic && <> · BIC: {s.bic}</>}
            </p>
          )}
        </div>

        {/* Fuß: Steuerdaten */}
        <div className="mt-8 border-t border-neutral-100 pt-4 text-[11px] text-neutral-400">
          {s.companyName}
          {s.taxId && <> · Steuernr.: {s.taxId}</>}
          {s.vatId && <> · USt-IdNr.: {s.vatId}</>}
          {s.web && <> · {s.web}</>}
        </div>
      </article>
    </div>
  );
}
