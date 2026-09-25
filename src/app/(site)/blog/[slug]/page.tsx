import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { getPostBySlug } from "@/lib/content";
import { posts as staticPosts } from "@/lib/data/content";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return staticPosts.filter((p) => p.status === "published").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.seo_title ?? post.title, description: post.seo_description ?? post.excerpt, publishedTime: post.published_at ?? undefined, tags: post.tags },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const minutes = Math.max(1, Math.round(post.content.split(/\s+/).length / 220));
  return (
    <article className="container-page max-w-3xl pb-32 pt-36">
      <JsonLd data={[articleJsonLd(post), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Writing", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }])]} />
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> All writing
      </Link>
      <header className="mt-10 border-b border-line pb-10">
        <p className="font-mono text-xs text-muted">
          <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at, { month: "long", day: "numeric", year: "numeric" })}</time> · {minutes} min read
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-gradient md:text-6xl">{post.title}</h1>
        <p className="mt-5 text-xl text-muted">{post.excerpt}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <li key={t} className="rounded-full border border-line px-3 py-1 text-xs text-zinc-400">
              {t}
            </li>
          ))}
        </ul>
      </header>
      <div className="prose-portfolio mt-10 text-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
