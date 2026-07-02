// Schema.org-Builder (JSON-LD) für DGD. Echte Firmendaten aus CONTACT.
import { BRAND, CONTACT, SITE } from "./sauberfit-data";

const ORG_ID = `${SITE.url}/#organization`;

// google: die im Admin (Website-Editor) gepflegte Bewertung, z. B. { rating: "4,9", count: "124" }.
// Optional, weil localBusiness() auch ohne Angabe (Fallback-Aufrufe) funktionieren soll.
export function localBusiness(google?: { rating: string; count: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CleaningService",
    "@id": ORG_ID,
    name: BRAND.name,
    alternateName: "DGD",
    description:
      "Professionelle Gebäudereinigung deutschlandweit – Büro-, Hotel-, Praxis-, Industrie- und Glasreinigung.",
    url: SITE.url,
    image: `${SITE.url}/images/sf-hero.jpg`,
    email: CONTACT.email,
    telephone: CONTACT.phone,
    priceRange: "€€",
    areaServed: { "@type": "Country", name: "Deutschland" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rellinger Weg 24",
      postalCode: "22457",
      addressLocality: "Hamburg",
      addressCountry: "DE",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    ...(google && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: google.rating.replace(",", "."),
        reviewCount: google.count,
        bestRating: "5",
      },
    }),
  };
}

export function reviewSchema(reviews: { author: string; text: string }[]) {
  return reviews.map((r) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@id": ORG_ID },
    author: { "@type": "Organization", name: r.author },
    reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    reviewBody: r.text,
  }));
}

export function serviceSchema(args: { name: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: args.name,
    name: args.name,
    description: args.description,
    url: args.url,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "Deutschland" },
  };
}

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.path}`,
    })),
  };
}

export function faqPage(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}
