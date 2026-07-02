import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { TARGETS, getTarget, getService, SITE } from "@/lib/sauberfit-data";
import { TARGET_SEO } from "@/content/target-seo";
import { TARGET_SCOPE } from "@/content/scope";
import { SubHero } from "@/components/sauberfit/SubHero";
import { Faq } from "@/components/sauberfit/Faq";
import { SeoText } from "@/components/sauberfit/SeoText";
import { WhyTeam } from "@/components/sauberfit/WhyTeam";
import { CtaBand } from "@/components/sauberfit/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { serviceSchema } from "@/lib/seo";

export function generateStaticParams() {
  return TARGETS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seo = TARGET_SEO[slug];
  const t = getTarget(slug);
  if (!seo || !t) return { title: "Reinigung nach Branche deutschlandweit" };
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: `${SITE.url}/fuer-wen/${slug}` },
    openGraph: {
      type: "website",
      url: `${SITE.url}/fuer-wen/${slug}`,
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: [t.image],
    },
  };
}

export default async function TargetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = getTarget(slug);
  const seo = TARGET_SEO[slug];
  if (!t || !seo) notFound();

  const services = t.services.map(getService).filter(Boolean) as NonNullable<ReturnType<typeof getService>>[];
  const scope = TARGET_SCOPE[slug];

  return (
    <>
      <JsonLd data={serviceSchema({ name: t.name, description: seo.heroSub, url: `${SITE.url}/fuer-wen/${slug}` })} />

      <SubHero
        crumbs={[
          { name: "Start", path: "/" },
          { name: "Für wen", path: "/fuer-wen" },
          { name: t.name, path: `/fuer-wen/${slug}` },
        ]}
        eyebrow="Für wen"
        title={seo.h1}
        subtitle={seo.heroSub}
        image={t.image}
      />

      <section className="sf-section">
        <div className="sf-container sf-split2">
          <div>
            <h2 className="sf-head" style={{ textAlign: "left", margin: 0 }}>
              <span className="sf-split2-h2">
                Ihre Vorteile
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

      <section className="sf-section alt">
        <div className="sf-container">
          <div className="sf-head">
            <h2>Passende Leistungen für {t.name}</h2>
            <p>Die wichtigsten Reinigungsleistungen für Ihren Bereich – alles aus einer Hand.</p>
          </div>
          <div className="sf-cardgrid">
            {services.map((s) => (
              <a key={s.slug} href={`/leistungen/${s.slug}`} className="sf-linkcard">
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
                <span className="arrow">Mehr erfahren →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <WhyTeam />
      <Faq items={seo.faq} heading={`Häufige Fragen – ${t.name}`} />
      <CtaBand />
      <SeoText title={seo.seoTitle} paragraphs={seo.seoText} />
    </>
  );
}
