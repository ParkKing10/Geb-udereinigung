import type { Metadata } from "next";
import { SITE } from "@/lib/sauberfit-data";
import { Breadcrumbs } from "@/components/sauberfit/Breadcrumbs";
import { readLegal, sanitizeLegal } from "@/lib/admin/legal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung: NORDIS Gebäudeservice (Auftritt unter der Marke „Deutsche Gebäudedienste“), Hamburg.",
  alternates: { canonical: `${SITE.url}/impressum` },
  robots: { index: false },
};

export default async function Impressum() {
  const legal = await readLegal();
  return (
    <section className="sf-section">
      <div className="sf-container">
        <Breadcrumbs items={[{ name: "Start", path: "/" }, { name: "Impressum", path: "/impressum" }]} />
        <div className="sf-prose">
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)" }}>Impressum</h1>
          <div dangerouslySetInnerHTML={{ __html: sanitizeLegal(legal.impressum) }} />
        </div>
      </div>
    </section>
  );
}
