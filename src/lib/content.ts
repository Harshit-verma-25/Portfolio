import "server-only";

import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import type { Achievement, Certification, Experience, Post, Profile, Project, Skill, Testimonial } from "@/types";

/**
 * Content access layer. Every public page reads from Supabase through here (RLS: public read).
 * There is no bundled fallback content: an unconfigured or failing database yields empty
 * sections, and the error is logged.
 */

/** Minimal identity used only when the `site_profile` row doesn't exist yet. */
export const EMPTY_PROFILE: Profile = {
  name: "Harshit Verma",
  title: "Full Stack Software Developer",
  tagline: "",
  hero_text: "",
  bio: "",
  location: "",
  email: "",
  avatar_url: "/images/profile.jpeg",
  resume_url: "/resume.pdf",
  available_for_work: false,
  socials: {},
  now_building: { company: "", role: "", summary: "", items: [] },
};

type Query = ReturnType<ReturnType<NonNullable<ReturnType<typeof createPublicClient>>["from"]>["select"]>;

async function select<T>(table: string, build: (q: Query) => Query = (q) => q.order("order_index", { ascending: true })): Promise<T[]> {
  const supabase = createPublicClient();
  if (!supabase) {
    console.warn(`[content] Supabase is not configured — "${table}" is empty.`);
    return [];
  }
  const { data, error } = await build(supabase.from(table).select("*"));
  if (error) {
    console.error(`[content] failed to load "${table}":`, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

export const getProfile = cache(async (): Promise<Profile> => {
  const rows = await select<Profile>("site_profile", (q) => q.limit(1));
  return rows[0] ? { ...EMPTY_PROFILE, ...rows[0] } : EMPTY_PROFILE;
});

export const getProjects = cache(() => select<Project>("projects"));

export const getFeaturedProjects = cache(async () => (await getProjects()).filter((p) => p.featured));

export const getProjectBySlug = cache(async (slug: string) => (await getProjects()).find((p) => p.slug === slug) ?? null);

/** Work and education, newest first — the timeline reads top to bottom. */
export const getExperiences = cache(() =>
  select<Experience>("experiences", (q) => q.order("start_date", { ascending: false }).order("order_index", { ascending: true })),
);

export const getSkills = cache(() => select<Skill>("skills"));

export const getCertifications = cache(() => select<Certification>("certifications"));

export const getTestimonials = cache(() => select<Testimonial>("testimonials"));

export const getAchievements = cache(() => select<Achievement>("achievements"));

export const getPosts = cache(() => select<Post>("posts", (q) => q.eq("status", "published").order("published_at", { ascending: false })));

export const getPostBySlug = cache(async (slug: string) => (await getPosts()).find((p) => p.slug === slug) ?? null);

/** Slugs for static generation at build time. */
export async function getProjectSlugs() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function getPostSlugs() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}
