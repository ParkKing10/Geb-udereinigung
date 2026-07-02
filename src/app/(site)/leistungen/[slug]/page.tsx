import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { SERVICES, getService, SITE } from "@/lib/sauberfit-data";
import { SERVICE_SEO } from "@/content/service-seo";
import { SERVICE_SCOPE } from "@/content/scope";
import { SubHero } from "@/components/sauberfit/SubHero";
import { Faq } from "@/components/sauberfit/Faq";
import { SeoText } from "@/components/sauberfit/SeoText";
import { WhyTeam } from "@/components/sauberfit/WhyTeam";
import { CtaBand } from "@/components/sauberfit/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { serviceSchema } from "@/lib/seo";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seo = SERVICE_SEO[slug];
  const svc = getService(slug);
  if (!seo || !svc) return { title: "Reinigungsleistung deutschlandweit" };
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: `${SITE.url}/leistungen/${slug}` },
    openGraph: {
      type: "website",
      url: `${SITE.url}/leistungen/${slug}`,
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: [svc.image],
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const svc = getService(slug);
  const seo = SERVICE_SEO[slug];
  if (!svc || !seo) notFound();

  // Rotiert den Startpunkt je nach aktueller Leistung, damit über alle Service-Seiten
  // hinweg unterschiedliche "Weitere Leistungen" verlinkt werden (statt immer derselben 4).
  const currentIndex = SERVICES.findIndex((s) => s.slug === slug);
  const others = SERVICES.filter((s) => s.slug !== slug);
  const related = Array.from({ length: 4 }, (_, i) => others[(currentIndex + i) % others.length]);
  const scope = SERVICE_SCOPE[slug];

  return (
    <>
      <JsonLd
        data={[
          serviceSchema({ name: svc.name, description: seo.heroSub, url: `${SITE.url}/leistungen/${slug}` }),
        ]}
      />

      <SubHero
        crumbs={[
          { name: "Start", path: "/" },
          { name: "Leistungen", path: "/leistungen" },
          { name: svc.name, path: `/leistungen/${slug}` },
        ]}
        eyebrow="Leistung"
        title={seo.h1}
        subtitle={seo.heroSub}
        image={svc.image}
        ctaService={slug}
      />

      {/* Vorteile + Bild */}
      <section className="sf-section">
        <div className="sf-container sf-split2">
          <div>
            <h2 className="sf-head" style={{ textAlign: "left", margin: 0 }}>
              <span className="sf-split2-h2">
                Ihre Vorteile bei der {svc.name}
              </span>
            </h2>
            <ul className="sf-flist">
              {seo.benefits.map((b) => (
                <li key={b}><Check size={18} className="ck" /> {b}</li>
              ))}
            </ul>
          </div>
          {scope && (
            <aside className="sf-scopecard">
              <span className="ey"><ShieldCheck size={14} /> Leistungen im Überblick</span>
              <h3>{scope.title}</h3>
              <ul className="sf-scopelist">
                {scope.items.map((it) => (
                  <li key={it}><span className="ck"><Check size={13} /></span> {it}</li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </section>

      {/* Geeignet für + verwandte Leistungen */}
      <section className="sf-section alt">
        <div className="sf-container">
          <div className="sf-head">
            <h2>Für wen die {svc.name} geeignet ist</h2>
            <p>Wir reinigen für Unternehmen, Einrichtungen und Eigentümer in {SITE.area}.</p>
          </div>
          <ul className="sf-flist" style={{ maxWidth: 620, margin: "0 auto 2.5rem", alignItems: "flex-start" }}>
            {seo.suitableFor.map((s) => (
              <li key={s}><Check size={18} className="ck" /> {s}</li>
            ))}
          </ul>
          <h3 style={{ textAlign: "center", fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", marginBottom: "1.25rem" }}>
            Weitere Leistungen
          </h3>
          <div className="sf-cardgrid">
            {related.map((r) => (
              <a key={r.slug} href={`/leistungen/${r.slug}`} className="sf-linkcard">
                <h3>{r.name}</h3>
                <p>{r.desc}</p>
                <span className="arrow">Mehr erfahren →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <WhyTeam />
      <Faq items={seo.faq} heading={`Häufige Fragen zur ${svc.name}`} />
      <CtaBand />
      <SeoText title={seo.seoTitle} paragraphs={seo.seoText} />
    </>
  );
}
