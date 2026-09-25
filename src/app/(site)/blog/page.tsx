import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";
import { Aurora } from "@/components/layout/aurora";
import { getPosts } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on engineering, performance, design and building products by Harshit Verma.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-40">
        <Aurora intensity={0.5} />
        <div className="container-page relative">
          <Reveal>
            <p className="eyebrow mb-4">Writing</p>
          </Reveal>
          <TextReveal as="h1" immediate text="Notes from the build." className="text-5xl font-semibold tracking-tight md:text-7xl" wordClassName="text-gradient" />
        </div>
      </section>
      <section className="container-page pb-32">
        <ul className="divide-y divide-line border-y border-line">
          {posts.map((post, i) => (
            <Reveal as="li" key={post.id} delay={i * 0.05}>
              <Link href={`/blog/${post.slug}`} className="group grid gap-3 py-8 md:grid-cols-[160px_1fr_auto] md:items-center md:gap-10">
                <time dateTime={post.published_at ?? undefined} className="font-mono text-xs text-muted">
                  {formatDate(post.published_at, { month: "short", day: "numeric", year: "numeric" })}
                </time>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight transition group-hover:text-accent">{post.title}</h2>
                  <p className="mt-2 text-muted">{post.excerpt}</p>
                </div>
                <ArrowUpRight className="hidden size-5 text-muted transition group-hover:rotate-45 group-hover:text-fg md:block" aria-hidden />
              </Link>
            </Reveal>
          ))}
          {posts.length === 0 && <li className="py-16 text-center text-muted">First posts are on the way.</li>}
        </ul>
      </section>
    </>
  );
}
