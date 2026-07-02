import type { Metadata } from "next";
import { SITE } from "@/lib/sauberfit-data";
import { Breadcrumbs } from "@/components/sauberfit/Breadcrumbs";
import { readLegal, sanitizeLegal } from "@/lib/admin/legal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen der Deutsche Gebäudedienste.",
  alternates: { canonical: `${SITE.url}/agb` },
  robots: { index: false },
};

export default async function AGB() {
  const legal = await readLegal();
  return (
    <section className="sf-section">
      <div className="sf-container">
        <Breadcrumbs items={[{ name: "Start", path: "/" }, { name: "AGB", path: "/agb" }]} />
        <div className="sf-prose">
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)" }}>Allgemeine Geschäftsbedingungen</h1>
          <div dangerouslySetInnerHTML={{ __html: sanitizeLegal(legal.agb) }} />
        </div>
      </div>
    </section>
  );
}
