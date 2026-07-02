import { readPosts, readConfig } from "@/lib/blog/store";
import { BlogCalendar } from "@/components/admin/BlogCalendar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Content Calendar – Deutsche Gebäudedienste" };

export default async function BlogAdminPage() {
  const [posts, config] = await Promise.all([readPosts(), readConfig()]);
  return <BlogCalendar initialPosts={posts} initialConfig={config} />;
}
