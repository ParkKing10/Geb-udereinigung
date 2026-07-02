import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE, CONTACT } from "@/lib/sauberfit-data";
import { Breadcrumbs } from "@/components/sauberfit/Breadcrumbs";
import { CtaBand } from "@/components/sauberfit/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPage } from "@/lib/seo";
import { getPost } from "@/lib/blog/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return { title: "Artikel nicht gefunden" };
  return {
    title: p.title,
    description: p.metaDescription,
    keywords: p.keyword,
    alternates: { canonical: `${SITE.url}/ratgeber/${p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.metaDescription, publishedTime: p.publishDate },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) notFound();

  const url = `${SITE.url}/ratgeber/${p.slug}`;
  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.metaDescription,
    datePublished: p.publishDate,
    dateModified: p.createdAt,
    keywords: p.keyword,
    author: { "@type": "Organization", name: "Deutsche Gebäudedienste" },
    publisher: { "@type": "Organization", name: "Deutsche Gebäudedienste", url: SITE.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: `${SITE.url}/images/sf-hero.jpg`,
  };

  return (
    <>
      <JsonLd data={article} />
      {p.faq.length > 0 && <JsonLd data={faqPage(p.faq)} />}

      <section className="sf-section">
        <div className="sf-container">
          <Breadcrumbs items={[{ name: "Start", path: "/" }, { name: "Ratgeber", path: "/ratgeber" }, { name: p.title, path: `/ratgeber/${p.slug}` }]} />
          <article className="sf-prose" style={{ marginTop: "1rem" }}>
            <h1 style={{ fontSize: "clamp(1.8rem, 1rem + 3vw, 2.6rem)", fontWeight: 800, color: "var(--ink)", lineHeight: 1.1 }}>{p.title}</h1>
            <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: "0.5rem" }}>
              {new Date(p.publishDate).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })} · {p.author}
            </p>
            <div dangerouslySetInnerHTML={{ __html: p.contentHtml }} />
            <p style={{ marginTop: "2rem" }}>
              Fragen zu Ihrem Objekt? <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} data-track="ratgeber">{CONTACT.phone}</a> anrufen oder direkt Ihr <a href="/#top">kostenloses Festpreis-Angebot</a> berechnen.
            </p>
          </article>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
