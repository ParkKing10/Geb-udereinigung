import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumb } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav className="sf-crumbs" aria-label="Brotkrumen">
      {items.map((it, i) => (
        <span key={it.path} className="sf-crumb">
          {i > 0 && <span className="sf-crumb-sep" aria-hidden>/</span>}
          {i < items.length - 1 ? (
            <a href={it.path}>{it.name}</a>
          ) : (
            <span aria-current="page">{it.name}</span>
          )}
        </span>
      ))}
      <JsonLd data={breadcrumb(items)} />
    </nav>
  );
}
