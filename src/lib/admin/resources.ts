import { PROJECT_CATEGORIES, SKILL_CATEGORIES, type Role } from "@/types";

export type FieldType = "text" | "textarea" | "markdown" | "number" | "date" | "switch" | "tags" | "lines" | "select" | "url" | "image" | "images" | "json" | "color";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly string[];
  help?: string;
  placeholder?: string;
  /** Span both grid columns in the editor. */
  wide?: boolean;
}

export interface ResourceConfig {
  key: string;
  table: string;
  title: string;
  singular: string;
  description: string;
  fields: Field[];
  columns: { name: string; label: string }[];
  orderBy: { column: string; ascending: boolean };
  /** Field used to generate the slug automatically. */
  slugFrom?: string;
  /** Minimum role allowed to create, edit and delete (mirrors the RLS policies). */
  minRole: Role;
}

const caseStudyTemplate = JSON.stringify(
  { problem: "", research: "", architecture: "", challenges: [{ title: "", detail: "" }], features: [], results: [], metrics: [{ label: "", value: "" }] },
  null,
  2,
);

export const resources: Record<string, ResourceConfig> = {
  projects: {
    key: "projects",
    minRole: "admin",
    table: "projects",
    title: "Projects",
    singular: "Project",
    description: "Case studies shown on /projects. Featured projects appear on the home page.",
    slugFrom: "title",
    orderBy: { column: "order_index", ascending: true },
    columns: [
      { name: "title", label: "Title" },
      { name: "category", label: "Category" },
      { name: "featured", label: "Featured" },
      { name: "order_index", label: "Order" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", help: "Leave empty to generate from the title." },
      { name: "tagline", label: "Tagline", type: "text", required: true, wide: true },
      { name: "description", label: "Description", type: "textarea", required: true, wide: true },
      { name: "category", label: "Category", type: "select", options: PROJECT_CATEGORIES, required: true },
      { name: "year", label: "Year", type: "number", required: true },
      { name: "tags", label: "Tags", type: "tags", help: "Extra categories for filtering (comma separated)." },
      { name: "tech", label: "Tech stack", type: "tags" },
      { name: "cover_image", label: "Cover image", type: "image" },
      { name: "images", label: "Screenshots", type: "images", wide: true },
      { name: "video_url", label: "Video URL", type: "url" },
      { name: "github_url", label: "GitHub URL", type: "url" },
      { name: "live_url", label: "Live URL", type: "url" },
      { name: "accent", label: "Accent colour", type: "color" },
      { name: "featured", label: "Featured", type: "switch" },
      { name: "order_index", label: "Order", type: "number" },
      {
        name: "case_study",
        label: "Case study (JSON)",
        type: "json",
        wide: true,
        placeholder: caseStudyTemplate,
        help: "problem, research, architecture, architecture_nodes?, challenges[], features[], results[], metrics[]",
      },
    ],
  },
  experiences: {
    key: "experiences",
    minRole: "admin",
    table: "experiences",
    title: "Experience",
    singular: "Role",
    description: "Roles and education — shown newest first on the timeline.",
    orderBy: { column: "start_date", ascending: false },
    columns: [
      { name: "position", label: "Position" },
      { name: "company", label: "Company" },
      { name: "start_date", label: "Start" },
      { name: "end_date", label: "End" },
    ],
    fields: [
      { name: "company", label: "Company", type: "text", required: true },
      { name: "position", label: "Position", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "employment_type", label: "Type", type: "select", required: true, options: ["Full-time", "Part-time", "Internship", "Contract", "Freelance", "Education"] },
      { name: "start_date", label: "Start date", type: "date", required: true },
      { name: "end_date", label: "End date", type: "date", help: "Leave empty for current role." },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "achievements", label: "Achievements", type: "lines", wide: true, help: "One per line." },
      { name: "tech", label: "Tech", type: "tags" },
      { name: "order_index", label: "Order", type: "number" },
    ],
  },
  skills: {
    key: "skills",
    minRole: "admin",
    table: "skills",
    title: "Skills",
    singular: "Skill",
    description: "Grouped by category in the skills grid, with proficiency bars.",
    orderBy: { column: "category", ascending: true },
    columns: [
      { name: "name", label: "Skill" },
      { name: "category", label: "Planet" },
      { name: "proficiency", label: "Proficiency" },
      { name: "years", label: "Years" },
    ],
    fields: [
      { name: "name", label: "Skill name", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: SKILL_CATEGORIES, required: true },
      { name: "icon", label: "Icon key", type: "text", help: "Optional identifier, e.g. nextjs" },
      { name: "proficiency", label: "Proficiency (0–100)", type: "number", required: true },
      { name: "years", label: "Years of experience", type: "number", required: true },
      { name: "order_index", label: "Order", type: "number" },
    ],
  },
  certifications: {
    key: "certifications",
    minRole: "editor",
    table: "certifications",
    title: "Certifications",
    singular: "Certification",
    description: "Courses and credentials.",
    orderBy: { column: "order_index", ascending: true },
    columns: [
      { name: "title", label: "Title" },
      { name: "issuer", label: "Issuer" },
      { name: "issue_date", label: "Issued" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "issuer", label: "Issuer", type: "text", required: true },
      { name: "issue_date", label: "Issue date", type: "date", required: true },
      { name: "credential_url", label: "Credential URL", type: "url" },
      { name: "order_index", label: "Order", type: "number" },
    ],
  },
  testimonials: {
    key: "testimonials",
    minRole: "editor",
    table: "testimonials",
    title: "Testimonials",
    singular: "Testimonial",
    description: "Quotes from colleagues and clients.",
    orderBy: { column: "order_index", ascending: true },
    columns: [
      { name: "name", label: "Name" },
      { name: "company", label: "Company" },
      { name: "order_index", label: "Order" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "company", label: "Company", type: "text", required: true },
      { name: "quote", label: "Quote", type: "textarea", required: true, wide: true },
      { name: "avatar_url", label: "Avatar", type: "image" },
      { name: "order_index", label: "Order", type: "number" },
    ],
  },
  achievements: {
    key: "achievements",
    minRole: "editor",
    table: "achievements",
    title: "Achievements",
    singular: "Achievement",
    description: "Awards, milestones and wins.",
    orderBy: { column: "order_index", ascending: true },
    columns: [
      { name: "title", label: "Title" },
      { name: "metric", label: "Metric" },
      { name: "date", label: "Date" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "metric", label: "Headline metric", type: "text", placeholder: "2× Gold" },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "description", label: "Description", type: "textarea", required: true, wide: true },
      { name: "order_index", label: "Order", type: "number" },
    ],
  },
  posts: {
    key: "posts",
    minRole: "admin",
    table: "posts",
    title: "Blog",
    singular: "Post",
    description: "Articles with Markdown, drafts and SEO fields.",
    slugFrom: "title",
    orderBy: { column: "created_at", ascending: false },
    columns: [
      { name: "title", label: "Title" },
      { name: "status", label: "Status" },
      { name: "published_at", label: "Published" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "slug", label: "Slug", type: "text", help: "Leave empty to generate from the title." },
      { name: "status", label: "Status", type: "select", options: ["draft", "published"], required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true, wide: true },
      { name: "content", label: "Content", type: "markdown", required: true, wide: true },
      { name: "cover_image", label: "Cover image", type: "image" },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "seo_title", label: "SEO title", type: "text", help: "≤ 60 characters" },
      { name: "seo_description", label: "SEO description", type: "textarea", help: "≤ 160 characters", wide: true },
    ],
  },
};

export const resourceKeys = Object.keys(resources);
