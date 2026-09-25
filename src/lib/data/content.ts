/**
 * Static fallback content.
 *
 * Every public page reads from Supabase first (see `src/lib/content.ts`) and falls back
 * to this file when Supabase isn't configured or a query fails, so the site always
 * renders. The same data is inserted by `supabase/seed.sql`. Edit through /admin once
 * Supabase is connected.
 */
import type {
  Achievement,
  Certification,
  Experience,
  Milestone,
  Post,
  Profile,
  Project,
  Skill,
  Testimonial,
} from "@/types";

export const profile: Profile = {
  name: "Harshit Verma",
  title: "Full Stack Software Developer",
  tagline: "Elite engineering for modern digital products.",
  hero_text:
    "I design and ship fast, accessible, AI-native products — from pixel-perfect interfaces to the APIs and databases that power them.",
  bio: "I'm a full stack engineer based in New Delhi who cares about the entire lifecycle of a product: the problem, the architecture, the interface and the numbers after launch. I build with Next.js, Node.js, Supabase and cloud-native tooling, and I increasingly weave LLMs into products where they genuinely remove friction. Currently building at Instinctive Studio.",
  location: "New Delhi, India",
  email: "harshit2005verma@gmail.com",
  avatar_url: "/images/profile.jpeg",
  resume_url: "/resume.pdf",
  available_for_work: true,
  socials: {
    github: "https://github.com/Harshit-verma-25",
    linkedin: "https://www.linkedin.com/in/harshit-verma-533428284/",
    instagram: "https://www.instagram.com/_harshit.25_/",
  },
  now_building: {
    company: "Instinctive Studio",
    role: "Full Stack Developer",
    summary:
      "Shipping production web platforms for clients end-to-end — product discovery, system design, Next.js frontends, Node.js services and cloud deployments.",
    items: [
      "Multi-tenant dashboards with role-based access",
      "AI-assisted workflows powered by LLM APIs",
      "Design-system driven component libraries",
      "Performance budgets & Core Web Vitals monitoring",
    ],
  },
};

const brainNodes = [
  { id: "cam", label: "Camera Stream", group: "input" },
  { id: "pose", label: "Pose Estimation", group: "vision" },
  { id: "feat", label: "Feature Extractor", group: "vision" },
  { id: "rules", label: "Form Rules Engine", group: "logic" },
  { id: "llm", label: "LLM Coach", group: "ai" },
  { id: "tts", label: "Voice Feedback", group: "output" },
  { id: "db", label: "Session Store", group: "data" },
  { id: "dash", label: "Progress Dashboard", group: "output" },
];

export const projects: Project[] = [
  {
    id: "quyl",
    slug: "quyl",
    title: "Quyl",
    tagline: "An education ecosystem connecting students, mentors and institutions.",
    description:
      "Quyl is an EdTech platform that brings courses, live mentorship, assessments and institution dashboards into one cohesive ecosystem, so learning, feedback and progress tracking stop living in five different tools.",
    category: "EdTech",
    tags: ["EdTech", "Full Stack", "SaaS"],
    tech: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Supabase", "Tailwind CSS"],
    cover_image: null,
    images: [],
    video_url: null,
    github_url: "https://github.com/Harshit-verma-25",
    live_url: null,
    featured: true,
    order_index: 1,
    year: 2025,
    accent: "#06B6D4",
    world: "ecosystem",
    case_study: {
      problem:
        "Students, mentors and institutions were juggling separate tools for content, scheduling, assessments and reporting. Context got lost between them and nobody had a single view of a learner's progress.",
      research:
        "Interviewed students and mentors, mapped every hand-off in a typical week and found that most friction came from switching tools and re-entering the same data. The core insight: progress should be a first-class, shared object — not a spreadsheet exported at the end of term.",
      architecture:
        "A Next.js App Router frontend with server components for fast, SEO-friendly course pages; a PostgreSQL schema modelling institutions → cohorts → learners with row-level security; realtime channels for live sessions; and background jobs for grading and notifications.",
      challenges: [
        { title: "Multi-tenant isolation", detail: "Institutions must never see each other's data. Solved with tenant-scoped RLS policies enforced in the database, not only in the API layer." },
        { title: "Realtime at a sensible cost", detail: "Live classes needed presence and chat without a dedicated socket server. Supabase Realtime channels scoped per session kept it simple and cheap." },
        { title: "Role-aware UI", detail: "Students, mentors and admins see very different products. A shared design system with role-gated route groups kept one codebase coherent." },
      ],
      features: [
        "Course builder with rich content blocks",
        "Live mentorship sessions with presence",
        "Assessments with automated grading",
        "Institution analytics dashboards",
        "Role-based access for students, mentors & admins",
      ],
      results: [
        "One place for content, sessions, assessments and progress",
        "Tenant isolation enforced at the database layer",
        "Server-rendered course pages with green Core Web Vitals",
      ],
      metrics: [
        { label: "User roles", value: "3" },
        { label: "Core modules", value: "5" },
        { label: "Lighthouse", value: "95+" },
      ],
    },
  },
  {
    id: "visioncoach",
    slug: "visioncoach",
    title: "VisionCoach",
    tagline: "An AI coach that watches your form and talks you through it in real time.",
    description:
      "VisionCoach combines computer vision with an LLM coaching layer: it tracks body pose from a camera stream, scores form against exercise-specific rules, and turns the analysis into natural, spoken feedback.",
    category: "AI",
    tags: ["AI", "Full Stack"],
    tech: ["Next.js", "TypeScript", "MediaPipe", "Gemini", "Node.js", "Firebase"],
    cover_image: null,
    images: [],
    video_url: null,
    github_url: "https://github.com/Harshit-verma-25",
    live_url: null,
    featured: true,
    order_index: 2,
    year: 2025,
    accent: "#8B5CF6",
    world: "brain",
    case_study: {
      problem:
        "Home workouts lack feedback. Without a coach, people repeat bad form until it causes injury — and generic workout videos can't see what you're doing.",
      research:
        "Benchmarked on-device pose estimation models for latency on mid-range laptops and phones, and studied how human coaches phrase corrections: short, positive and one cue at a time.",
      architecture:
        "Pose estimation runs in the browser so video never leaves the device. Landmarks feed a deterministic rules engine that scores each rep; only compact, structured summaries are sent to an LLM that generates the coaching cue, which is spoken back with text-to-speech.",
      architecture_nodes: brainNodes,
      challenges: [
        { title: "Latency budget", detail: "Feedback later than ~300ms feels disconnected. Keeping vision on-device and sending only summaries to the LLM kept the loop tight." },
        { title: "Hallucination-free coaching", detail: "The LLM never judges form itself — the rules engine does. The model only rephrases verified findings into friendly cues." },
        { title: "Privacy", detail: "No raw video is uploaded. Only anonymised rep metrics are stored for progress tracking." },
      ],
      features: [
        "Real-time pose tracking in the browser",
        "Rep counting and per-rep form scoring",
        "Spoken, context-aware coaching cues",
        "Session history and progress dashboard",
      ],
      results: [
        "Sub-second feedback loop on consumer hardware",
        "Video stays on-device by design",
        "Coaching grounded in deterministic scoring",
      ],
      metrics: [
        { label: "Pipeline stages", value: "6" },
        { label: "Video uploaded", value: "0 bytes" },
        { label: "Feedback loop", value: "< 1s" },
      ],
    },
  },
  {
    id: "skygaze-india",
    slug: "skygaze-india",
    title: "Skygaze India",
    tagline: "Astronomy for everyone — what's in the Indian night sky, tonight.",
    description:
      "Skygaze India turns astronomy data into an approachable experience: upcoming celestial events, ISS passes and sky conditions localised for Indian cities, wrapped in an immersive, space-themed interface.",
    category: "Full Stack",
    tags: ["Full Stack", "Cloud"],
    tech: ["React", "Three.js", "Node.js", "Express", "AWS"],
    cover_image: null,
    images: [],
    video_url: null,
    github_url: "https://github.com/Harshit-verma-25",
    live_url: null,
    featured: true,
    order_index: 3,
    year: 2024,
    accent: "#6366F1",
    world: "cosmos",
    case_study: {
      problem:
        "Most astronomy apps are built for Western audiences and assume dark skies. Indian stargazers need city-specific timings and realistic visibility guidance.",
      research:
        "Collected feedback from amateur astronomy groups and found that 'is it worth going outside tonight?' was the question that mattered most.",
      architecture:
        "An Express API aggregates and caches public astronomy and weather data per city, a React client renders the sky with Three.js, and scheduled jobs pre-compute nightly event feeds.",
      challenges: [
        { title: "Upstream rate limits", detail: "Aggregated sources through a caching layer with per-city TTLs." },
        { title: "Rendering thousands of stars", detail: "Used instanced points and a single draw call to keep the sky at 60fps on mobile." },
      ],
      features: ["City-based event calendar", "ISS pass predictions", "Visibility score for tonight", "Interactive 3D sky"],
      results: ["Localised astronomy for Indian cities", "Smooth 3D rendering on mobile"],
      metrics: [
        { label: "Draw calls for sky", value: "1" },
        { label: "Target FPS", value: "60" },
      ],
    },
  },
  {
    id: "kahaanibot",
    slug: "kahaanibot",
    title: "KahaaniBot",
    tagline: "An AI storyteller that writes and illustrates bedtime stories in Hindi and English.",
    description:
      "KahaaniBot lets kids and parents co-create stories: pick characters, a setting and a moral, and the bot writes a chaptered, age-appropriate story in Hindi or English with illustrations and read-aloud.",
    category: "AI",
    tags: ["AI", "SaaS"],
    tech: ["Next.js", "OpenAI", "Gemini", "Supabase", "Tailwind CSS"],
    cover_image: null,
    images: [],
    video_url: null,
    github_url: "https://github.com/Harshit-verma-25",
    live_url: null,
    featured: true,
    order_index: 4,
    year: 2024,
    accent: "#F472B6",
    world: "storybook",
    case_study: {
      problem: "Parents want fresh, safe, culturally familiar stories — in the language their children speak at home.",
      research: "Tested prompts with parents and found that structure (characters → setting → moral) produced far more consistent stories than free-form prompts.",
      architecture:
        "A guided story builder produces a structured prompt; LLM output is streamed chapter by chapter, passed through a safety filter, and stored in Supabase so families can build a personal library.",
      challenges: [
        { title: "Child safety", detail: "Layered moderation: constrained prompts, output filtering and a report button." },
        { title: "Bilingual quality", detail: "Prompted natively in Hindi rather than translating English output, which produced more natural stories." },
      ],
      features: ["Guided story builder", "Hindi & English generation", "Read-aloud mode", "Personal story library"],
      results: ["Structured prompting for consistent stories", "Streaming chapters for instant feedback"],
      metrics: [
        { label: "Languages", value: "2" },
        { label: "Safety layers", value: "3" },
      ],
    },
  },
  {
    id: "leave-management-system",
    slug: "leave-management-system",
    title: "Leave Management System",
    tagline: "Corporate leave workflows with approvals, balances and audit trails.",
    description:
      "A leave management platform for organisations: employees apply in seconds, managers approve from a single queue, and HR gets accurate balances, policies and reports without spreadsheets.",
    category: "SaaS",
    tags: ["SaaS", "Full Stack"],
    tech: ["React", "Node.js", "Express", "PostgreSQL", "Tailwind CSS"],
    cover_image: null,
    images: [],
    video_url: null,
    github_url: "https://github.com/Harshit-verma-25",
    live_url: null,
    featured: false,
    order_index: 5,
    year: 2024,
    accent: "#22C55E",
    world: "workflow",
    case_study: {
      problem: "Leave requests lived in email threads and spreadsheets, so balances drifted and approvals stalled.",
      research: "Mapped the approval chain across roles and identified multi-level approvals and policy accrual as the core complexity.",
      architecture:
        "A state-machine driven request lifecycle (draft → pending → approved/rejected → cancelled) on an Express + PostgreSQL backend, with every transition written to an audit log.",
      challenges: [
        { title: "Multi-level approvals", detail: "Modelled approval chains as data so organisations can configure them without code changes." },
        { title: "Accurate balances", detail: "Balances are derived from an append-only ledger instead of a mutable counter." },
      ],
      features: ["Apply & track requests", "Manager approval queue", "Policy-based accruals", "Audit trail & reports"],
      results: ["Single source of truth for leave balances", "Configurable approval chains"],
      metrics: [
        { label: "Request states", value: "5" },
        { label: "Audit coverage", value: "100%" },
      ],
    },
  },
  {
    id: "portfolio-os",
    slug: "portfolio-os",
    title: "Portfolio OS",
    tagline: "This site — an immersive, CMS-driven portfolio with an AI assistant.",
    description:
      "An open-source, production-grade portfolio built with Next.js 15, React Three Fiber, Supabase and Claude: 3D storytelling, a full admin CMS, analytics and an AI assistant that answers questions about my work.",
    category: "Open Source",
    tags: ["Open Source", "Full Stack", "AI"],
    tech: ["Next.js", "TypeScript", "Three.js", "Supabase", "Claude", "PostHog"],
    cover_image: null,
    images: [],
    video_url: null,
    github_url: "https://github.com/Harshit-verma-25/Portfolio",
    live_url: null,
    featured: false,
    order_index: 6,
    year: 2026,
    accent: "#F59E0B",
    world: null,
    case_study: null,
  },
];

export const experiences: Experience[] = [
  {
    id: "instinctive-fulltime",
    company: "Instinctive Studio",
    position: "Full Stack Developer",
    location: "New Delhi, India",
    employment_type: "Full-time",
    start_date: "2025-06-01",
    end_date: null,
    description: "Building production web platforms for clients end-to-end, from system design to deployment.",
    achievements: [
      "Own features across Next.js frontends, Node.js APIs and PostgreSQL schemas",
      "Integrate LLM-powered workflows into client products",
      "Introduced shared component patterns and performance budgets",
    ],
    tech: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
    order_index: 1,
  },
  {
    id: "instinctive-intern",
    company: "Instinctive Studio",
    position: "Software Developer Intern",
    location: "New Delhi, India",
    employment_type: "Internship",
    start_date: "2024-12-01",
    end_date: "2025-05-31",
    description: "Joined the product team to build and ship client-facing features.",
    achievements: [
      "Shipped responsive, accessible UI features for client projects",
      "Built REST endpoints and database migrations",
      "Converted to a full-time role",
    ],
    tech: ["React", "Express", "Tailwind CSS", "Firebase"],
    order_index: 2,
  },
];

const skill = (id: string, name: string, category: Skill["category"], proficiency: number, years: number, order_index: number): Skill => ({
  id,
  name,
  category,
  icon: id,
  proficiency,
  years,
  order_index,
});

export const skills: Skill[] = [
  skill("react", "React", "frontend", 92, 3, 1),
  skill("nextjs", "Next.js", "frontend", 90, 2.5, 2),
  skill("typescript", "TypeScript", "frontend", 88, 2.5, 3),
  skill("tailwind", "Tailwind CSS", "frontend", 94, 3, 4),
  skill("threejs", "Three.js", "frontend", 72, 1, 5),
  skill("nodejs", "Node.js", "backend", 86, 2.5, 1),
  skill("express", "Express", "backend", 85, 2.5, 2),
  skill("python", "Python", "backend", 75, 3, 3),
  skill("postgresql", "PostgreSQL", "database", 80, 2, 1),
  skill("mysql", "MySQL", "database", 78, 3, 2),
  skill("aws", "AWS", "cloud", 70, 1.5, 1),
  skill("firebase", "Firebase", "cloud", 82, 2, 2),
  skill("supabase", "Supabase", "cloud", 85, 1.5, 3),
  skill("vercel", "Vercel", "cloud", 88, 2, 4),
  skill("gemini", "Gemini", "ai", 80, 1, 1),
  skill("openai", "OpenAI", "ai", 82, 1.5, 2),
  skill("vertexai", "Vertex AI", "ai", 68, 1, 3),
  skill("git", "Git", "tools", 88, 3, 1),
  skill("docker", "Docker", "tools", 65, 1, 2),
  skill("figma", "Figma", "tools", 75, 2, 3),
];

export const certifications: Certification[] = [];

// Sample testimonials — replace with real ones from /admin → Testimonials.
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Engineering Lead",
    role: "Engineering Lead",
    company: "Instinctive Studio",
    quote: "Harshit takes ownership from the first sketch to production. He asks the right product questions and ships clean, well-tested code quickly.",
    avatar_url: null,
    order_index: 1,
  },
  {
    id: "t2",
    name: "Product Manager",
    role: "Product Manager",
    company: "Client Project",
    quote: "The attention to detail in the UI and the speed of iteration made a real difference to our launch.",
    avatar_url: null,
    order_index: 2,
  },
  {
    id: "t3",
    name: "Project Mentor",
    role: "Mentor",
    company: "VIPS",
    quote: "A rare combination of design sense and engineering depth. Harshit's projects always feel finished.",
    avatar_url: null,
    order_index: 3,
  },
];

export const achievements: Achievement[] = [
  {
    id: "a1",
    title: "Double gold — Blind Coding",
    description: "Won two gold medals at the Blind Coding event held at IMS, Ghaziabad.",
    date: "2022-12-01",
    metric: "2× Gold",
    order_index: 1,
  },
  {
    id: "a2",
    title: "Intern → Full-time",
    description: "Converted an internship at Instinctive Studio into a full-time engineering role.",
    date: "2025-06-01",
    metric: "Full-time",
    order_index: 2,
  },
  {
    id: "a3",
    title: "Production projects shipped",
    description: "Designed and shipped products across AI, EdTech, SaaS and astronomy.",
    date: "2025-01-01",
    metric: "5+",
    order_index: 3,
  },
];

export const milestones: Milestone[] = [
  { id: "m1", year: "2021", title: "Class 10", subtitle: "Indian Public School, Amritsar", description: "Wrote my first lines of HTML and fell in love with building for the web.", kind: "education" },
  { id: "m2", year: "2022", title: "Blind Coding — 2× Gold", subtitle: "IMS, Ghaziabad", description: "Won two gold medals coding without seeing the screen.", kind: "community" },
  { id: "m3", year: "2023", title: "Class 12 → BCA", subtitle: "KDB Public School → VIPS, New Delhi", description: "Started a Bachelor of Computer Applications at Vivekanand Institute of Professional Studies.", kind: "education" },
  { id: "m4", year: "2024", title: "Major projects", subtitle: "Skygaze India · KahaaniBot · LMS", description: "Shipped full stack products across astronomy, AI storytelling and enterprise workflows.", kind: "project" },
  { id: "m5", year: "2024", title: "Internship", subtitle: "Instinctive Studio", description: "Joined as a Software Developer Intern building client products.", kind: "work" },
  { id: "m6", year: "2025", title: "Full-Time Developer", subtitle: "Instinctive Studio", description: "Converted to a full-time Full Stack Developer role.", kind: "work" },
  { id: "m7", year: "2026", title: "Open Source", subtitle: "Portfolio OS & more", description: "Open-sourcing tools and this portfolio for other developers.", kind: "community" },
];

export const posts: Post[] = [
  {
    id: "p1",
    slug: "building-an-immersive-portfolio",
    title: "Building an immersive portfolio without killing performance",
    excerpt: "How I kept Lighthouse at 95+ while shipping React Three Fiber scenes, smooth scroll and an AI assistant.",
    content: `## The constraint

A portfolio that's heavy is a portfolio nobody sees. I set a hard budget before writing a single scene: **Lighthouse 95+ and green Core Web Vitals on a mid-range phone.**

## What made it possible

- **Lazy 3D** — every canvas is dynamically imported and only mounted when it scrolls into view.
- **Adaptive quality** — device pixel ratio is capped, and low-power devices get fewer particles.
- **Server components by default** — content is rendered on the server; only interactive islands ship JavaScript.
- **Reduced motion** — respected everywhere, including WebGL.

## Takeaway

Performance isn't a pass at the end. It's a design constraint, and constraints make better work.`,
    cover_image: null,
    tags: ["Next.js", "Three.js", "Performance"],
    status: "published",
    published_at: "2026-01-15T00:00:00.000Z",
    seo_title: null,
    seo_description: null,
  },
];

export const techStack = {
  Frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "GSAP", "Three.js"],
  Backend: ["Node.js", "Express", "REST", "Python"],
  Data: ["PostgreSQL", "Supabase", "MySQL", "Firebase"],
  Cloud: ["Vercel", "AWS", "Docker"],
  AI: ["Claude", "Gemini", "OpenAI", "Vertex AI"],
};
