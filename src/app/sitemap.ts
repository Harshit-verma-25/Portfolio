import type { MetadataRoute } from "next";
import { getPosts, getProjects } from "@/lib/content";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const now = new Date();
  const staticRoutes = ["/", "/about", "/projects", "/experience", "/blog", "/contact"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));
  return [
    ...staticRoutes,
    ...projects.map((p) => ({ url: absoluteUrl(`/projects/${p.slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: p.featured ? 0.9 : 0.7 })),
    ...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.published_at ? new Date(p.published_at) : now, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
