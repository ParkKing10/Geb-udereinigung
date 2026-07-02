import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STAEDTE, getStadt, SERVICES, SITE } from "@/lib/sauberfit-data";
import { STAEDTE_SEO } from "@/content/staedte-seo";
import { SubHero } from "@/components/sauberfit/SubHero";
import { SeoText } from "@/components/sauberfit/SeoText";
import { WhyTeam } from "@/components/sauberfit/WhyTeam";
import { Faq } from "@/components/sauberfit/Faq";
import { CtaBand } from "@/components/sauberfit/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { serviceSchema } from "@/lib/seo";

export function generateStaticParams() {
  return STAEDTE.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const st = getStadt(slug);
  const seo = STAEDTE_SEO[slug];
  if (!st || !seo) return { title: "Gebäudereinigung deutschlandweit" };
  return {
    title: `Gebäudereinigung in ${st.name}`,
    description: seo.metaDescription,
    alternates: { canonical: `${SITE.url}/standorte/${slug}` },
    openGraph: {
      type: "website",
      url: `${SITE.url}/standorte/${slug}`,
      title: `Gebäudereinigung in ${st.name}`,
      description: seo.metaDescription,
      images: ["/images/sf-hero.jpg"],
    },
  };
}

export default async function StadtPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const st = getStadt(slug);
  const seo = STAEDTE_SEO[slug];
  if (!st || !seo) notFound();

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: `Gebäudereinigung ${st.name}`,
          description: seo.intro,
          url: `${SITE.url}/standorte/${slug}`,
        })}
      />

      <SubHero
        crumbs={[
          { name: "Start", path: "/" },
          { name: "Standorte", path: "/standorte" },
          { name: st.name, path: `/standorte/${slug}` },
        ]}
        eyebrow="Standort"
        title={`Gebäudereinigung in ${st.name}`}
        subtitle={seo.intro}
        image="/images/sf-hero.jpg"
      />

      <section className="sf-section">
        <div className="sf-container">
          <div className="sf-head">
            <h2>Unsere Reinigungsleistungen in {st.name}</h2>
            <p>Alles aus einer Hand – vom Büro bis zur Glasfassade, zuverlässig und zum Festpreis.</p>
          </div>
          <div className="sf-cardgrid">
            {SERVICES.map((s) => (
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
      <Faq items={seo.faq} heading={`Häufige Fragen zur Gebäudereinigung in ${st.name}`} />
      <CtaBand />
      <SeoText title={`Gebäudereinigung in ${st.name} & Umkreis`} paragraphs={seo.seoText} />
    </>
  );
}
