import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/sauberfit-data";
import { SubHero } from "@/components/sauberfit/SubHero";
import { CtaBand } from "@/components/sauberfit/CtaBand";
import { Faq } from "@/components/sauberfit/Faq";
import { publishedPosts } from "@/lib/blog/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ratgeber Gebäudereinigung",
  description: "Tipps, Kosten & Wissen rund um professionelle Gebäudereinigung – vom Team der Deutschen Gebäudedienste.",
  alternates: { canonical: `${SITE.url}/ratgeber` },
};

const FAQ = [
  { q: "Wie oft veröffentlicht ihr neue Ratgeber-Artikel?", a: "Regelmäßig – mit Themen rund um Kosten, Abläufe und Qualität in der Gebäudereinigung, die für Unternehmen und Eigentümer wirklich relevant sind." },
  { q: "Kann ich ein Thema für einen Artikel vorschlagen?", a: "Gern. Schreiben Sie uns über das Kontaktformular oder per E-Mail, welches Thema Sie interessiert – wir nehmen es in unsere Planung auf." },
];

export default async function RatgeberPage() {
  const posts = await publishedPosts();
  return (
    <>
      <SubHero
        crumbs={[{ name: "Start", path: "/" }, { name: "Ratgeber", path: "/ratgeber" }]}
        eyebrow="Ratgeber"
        title="Wissen & Tipps zur Gebäudereinigung"
        subtitle="Praxisnahe Ratgeber zu Kosten, Abläufen und Qualität – damit Sie die richtige Entscheidung für Ihr Objekt treffen."
        image="/images/sf-hero.jpg"
      />

      <section className="sf-section">
        <div className="sf-container">
          {posts.length === 0 ? (
            <p className="text-center text-neutral-500">Die ersten Artikel erscheinen in Kürze.</p>
          ) : (
            <div className="sf-cardgrid">
              {posts.map((p) => (
                <Link key={p.id} href={`/ratgeber/${p.slug}`} className="sf-linkcard">
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <span className="arrow">Weiterlesen <ArrowRight size={14} style={{ display: "inline", verticalAlign: "-2px" }} /></span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Faq items={FAQ} heading="Häufige Fragen zum Ratgeber" />
      <CtaBand />
    </>
  );
}
