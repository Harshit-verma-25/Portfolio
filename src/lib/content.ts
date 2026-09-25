import "server-only";

import { cache } from "react";
import * as fallback from "@/lib/data/content";
import { createPublicClient } from "@/lib/supabase/server";
import type {
  Achievement,
  Certification,
  Experience,
  Post,
  Profile,
  Project,
  Skill,
  Testimonial,
} from "@/types";

/**
 * Content access layer. Reads from Supabase (RLS: public read) and silently falls back
 * to the bundled static content so the site renders without a database.
 */
async function select<T>(table: string, fallbackRows: T[], build?: (q: any) => any): Promise<T[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const supabase = createPublicClient();
  if (!supabase) return fallbackRows;
  try {
    let query = supabase.from(table).select("*");
    query = build ? build(query) : query.order("order_index", { ascending: true });
    const { data, error } = await query;
    if (error || !data) throw error;
    return data.length ? (data as T[]) : fallbackRows;
  } catch (err) {
    console.warn(`[content] falling back to static ${table}:`, (err as Error)?.message ?? err);
    return fallbackRows;
  }
}

export const getProfile = cache(async (): Promise<Profile> => {
  const rows = await select<Profile>("profile", [fallback.profile], (q) => q.limit(1));
  return { ...fallback.profile, ...rows[0] };
});

export const getProjects = cache(() => select<Project>("projects", fallback.projects));

export const getFeaturedProjects = cache(async () => (await getProjects()).filter((p) => p.featured));

export const getProjectBySlug = cache(async (slug: string) => (await getProjects()).find((p) => p.slug === slug) ?? null);

export const getExperiences = cache(() => select<Experience>("experiences", fallback.experiences));

export const getSkills = cache(() => select<Skill>("skills", fallback.skills));

export const getCertifications = cache(() => select<Certification>("certifications", fallback.certifications));

export const getTestimonials = cache(() => select<Testimonial>("testimonials", fallback.testimonials));

export const getAchievements = cache(() => select<Achievement>("achievements", fallback.achievements));

export const getPosts = cache(() =>
  select<Post>("posts", fallback.posts.filter((p) => p.status === "published"), (q) =>
    q.eq("status", "published").order("published_at", { ascending: false }),
  ),
);

export const getPostBySlug = cache(async (slug: string) => (await getPosts()).find((p) => p.slug === slug) ?? null);

export const getMilestones = () => fallback.milestones;
export const getTechStack = () => fallback.techStack;
