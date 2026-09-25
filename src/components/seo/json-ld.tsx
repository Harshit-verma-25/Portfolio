import { absoluteUrl, siteUrl } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import type { Post, Profile, Project } from "@/types";

export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const personJsonLd = (profile: Profile) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  description: profile.bio,
  url: siteUrl,
  image: absoluteUrl(profile.avatar_url),
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: profile.location },
  sameAs: Object.values(profile.socials).filter(Boolean),
  worksFor: { "@type": "Organization", name: profile.now_building.company },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Vivekanand Institute of Professional Studies" },
  knowsAbout: ["Full Stack Development", "Next.js", "React", "Node.js", "Supabase", "Three.js", "Artificial Intelligence"],
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteUrl,
  description: siteConfig.description,
});

export const projectJsonLd = (p: Project) => ({
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: p.title,
  headline: p.tagline,
  description: p.description,
  url: absoluteUrl(`/projects/${p.slug}`),
  dateCreated: String(p.year),
  keywords: p.tech.join(", "),
  author: { "@type": "Person", name: siteConfig.name, url: siteUrl },
  ...(p.github_url ? { codeRepository: p.github_url } : {}),
});

export const articleJsonLd = (post: Post) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.seo_title ?? post.title,
  description: post.seo_description ?? post.excerpt,
  datePublished: post.published_at,
  url: absoluteUrl(`/blog/${post.slug}`),
  author: { "@type": "Person", name: siteConfig.name, url: siteUrl },
  keywords: post.tags.join(", "),
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
});
