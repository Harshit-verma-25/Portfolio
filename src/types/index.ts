export const PROJECT_CATEGORIES = ["Full Stack", "AI", "SaaS", "EdTech", "Cloud", "Open Source"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const SKILL_CATEGORIES = ["frontend", "backend", "cloud", "ai", "database", "tools"] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const LEAD_STATUSES = ["new", "contacted", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Which interactive 3D "world" renders at the top of a project case study. */
export const PROJECT_WORLDS = ["brain", "cosmos", "storybook", "workflow", "ecosystem"] as const;
export type ProjectWorld = (typeof PROJECT_WORLDS)[number];

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  leetcode?: string;
  email?: string;
}

export interface NowBuilding {
  company: string;
  role: string;
  summary: string;
  items: string[];
}

export interface Profile {
  id?: string;
  name: string;
  title: string;
  tagline: string;
  hero_text: string;
  bio: string;
  location: string;
  email: string;
  avatar_url: string;
  resume_url: string;
  available_for_work: boolean;
  socials: SocialLinks;
  now_building: NowBuilding;
}

export interface CaseStudy {
  problem: string;
  research: string;
  architecture: string;
  architecture_nodes?: { id: string; label: string; group: string }[];
  challenges: { title: string; detail: string }[];
  features: string[];
  results: string[];
  metrics: { label: string; value: string }[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  tech: string[];
  cover_image: string | null;
  images: string[];
  video_url: string | null;
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  order_index: number;
  year: number;
  accent: string;
  world: ProjectWorld | null;
  case_study: CaseStudy | null;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  employment_type: string;
  start_date: string;
  end_date: string | null;
  description: string;
  achievements: string[];
  tech: string[];
  order_index: number;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  icon: string;
  proficiency: number;
  years: number;
  order_index: number;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  credential_url: string | null;
  order_index: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar_url: string | null;
  order_index: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  metric: string | null;
  order_index: number;
}

export interface Milestone {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  kind: "education" | "work" | "project" | "community";
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  tags: string[];
  status: "draft" | "published";
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  budget: string | null;
  status: LeadStatus;
  created_at: string;
}

export interface MediaItem {
  id: string;
  name: string;
  path: string;
  url: string;
  mime_type: string;
  size: number;
  created_at: string;
}
