# Harshit Verma — Portfolio

An immersive, CMS-driven developer portfolio: React Three Fiber scenes, scroll storytelling, an AI assistant trained on the résumé, an interactive terminal, and a full admin dashboard on Supabase.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Framer Motion · GSAP · Lenis · Three.js / React Three Fiber / Drei · Zustand · Supabase (Postgres, Auth, Storage) · Claude API · PostHog · Vercel Analytics

## Highlights

| Feature | Where |
| --- | --- |
| Hero: floating developer workspace (laptop typing code, terminal deploying, git graph, Postgres, API nodes) linked by flowing data particles; mouse parallax + scroll-driven camera | `src/components/three/hero-scene.tsx` |
| Skills Universe: each discipline is a planet, skills are moons; click to fly in | `src/components/three/skills-galaxy.tsx`, `sections/skills-universe.tsx` |
| Career timeline: pinned 3D helix, milestones as floating cards driven by scroll | `three/timeline-spine.tsx`, `sections/career-timeline.tsx` |
| Project worlds: AI brain network (VisionCoach), cosmos (Skygaze India), storybook (KahaaniBot), workflow (LMS), ecosystem (Quyl) | `three/project-worlds.tsx` |
| Interactive architecture diagram (VisionCoach) | `projects/architecture-flow.tsx` |
| Apple-style project cards: 3D tilt, reflection, dynamic light | `motion/tilt-card.tsx` |
| AI Portfolio Assistant (Claude, streaming, grounded in CMS content) | `app/api/chat/route.ts`, `lib/assistant.ts`, `chat/assistant.tsx` |
| Interactive terminal (`` ` `` or Ctrl/⌘+K anywhere) | `terminal/terminal.tsx` |
| Live GitHub heatmap + LeetCode stats | `lib/integrations.ts`, `sections/github-activity.tsx` |
| Admin CMS at `/admin` with roles, media library, Markdown blog editor, leads pipeline, analytics | `app/admin/**`, `components/admin/**` |

## Quick start

```bash
npm install
cp .env.example .env.local   # everything is optional for local dev
npm run dev                  # http://localhost:3000
```

The site renders **without any environment variables** — content falls back to `src/lib/data/content.ts`, the assistant and contact form explain they're not configured, and `/admin` redirects to its login page. Connect Supabase to turn on the CMS.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` · `npm run typecheck` | ESLint · `tsc --noEmit` |
| `npm run db:seed:generate` | Regenerate `supabase/seed.sql` from the static content file |

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — folder structure, data flow, component / Three.js / admin architecture, API routes, database & RLS, SEO, analytics, accessibility and performance.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Supabase, admin user, Vercel, PostHog, Claude, GitHub/LeetCode, Calendly and email setup.

## Content you should replace

- **Testimonials** in the seed are placeholders (attributed by role only). Replace them in `/admin/testimonials`.
- **Project details** (case-study copy, metrics, live URLs, screenshots) are starting drafts — refine them in `/admin/projects`.
- **Experience dates** for Instinctive Studio are approximate — confirm them in `/admin/experiences`.
- `public/resume.pdf` is generated from the site content; upload your own via **Admin → Profile → Résumé**.
