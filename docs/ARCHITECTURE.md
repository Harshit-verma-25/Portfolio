# Architecture

## 1. Folder structure

```
.
├── public/                    # profile photo, résumé PDF, icon
├── scripts/generate-seed.mjs  # builds supabase/seed.sql from src/lib/data/content.ts
├── supabase/
│   ├── migrations/            # schema, role helpers, RLS, storage bucket + policies
│   └── seed.sql               # generated starter content
└── src/
    ├── middleware.ts          # Supabase session refresh + /admin gate
    ├── app/
    │   ├── layout.tsx         # <html>, fonts, global metadata, Vercel Analytics
    │   ├── (site)/            # public site (route group with its own layout)
    │   │   ├── layout.tsx     # navbar, footer, assistant, terminal, cursor, JSON-LD
    │   │   ├── template.tsx   # page transition
    │   │   ├── page.tsx       # home
    │   │   ├── about/ experience/ contact/
    │   │   ├── projects/ (+ [slug] case studies)
    │   │   └── blog/ (+ [slug])
    │   ├── admin/
    │   │   ├── actions.ts     # server actions (CRUD, profile, leads, media)
    │   │   ├── (auth)/login/
    │   │   └── (panel)/       # protected: layout checks role
    │   │       ├── page.tsx   # analytics dashboard
    │   │       ├── [resource]/ # generic CRUD (projects, experiences, skills, …)
    │   │       ├── profile/ media/ leads/
    │   ├── api/
    │   │   ├── chat/          # AI assistant (streaming)
    │   │   ├── contact/       # lead capture + email notification
    │   │   ├── events/        # first-party counters (résumé downloads, project views)
    │   │   ├── github/ leetcode/
    │   ├── auth/callback/ auth/signout/
    │   ├── sitemap.ts robots.ts manifest.ts opengraph-image.tsx twitter-image.tsx
    ├── components/
    │   ├── ui/                # shadcn-style primitives (Radix + cva)
    │   ├── motion/            # Reveal, TextReveal, Magnetic, TiltCard, SectionHeading
    │   ├── layout/            # Navbar, Footer, SmoothScroll (Lenis+GSAP), cursor, aurora, providers
    │   ├── three/             # SceneCanvas + all WebGL scenes, lazy entry points
    │   ├── sections/          # home/page sections
    │   ├── projects/          # cards, cover art, explorer, architecture diagram
    │   ├── terminal/ chat/ seo/ admin/
    ├── hooks/                 # media queries, device tier, in-view
    ├── lib/
    │   ├── content.ts         # data access with static fallback
    │   ├── data/content.ts    # static fallback + seed source
    │   ├── supabase/          # browser / server / service / middleware clients
    │   ├── admin/             # resource configs, analytics queries, media upload
    │   ├── assistant.ts integrations.ts analytics.ts auth.ts rate-limit.ts site.ts utils.ts
    ├── store/ui.ts            # Zustand: menu, chat, terminal, cursor, hero progress, active planet
    └── types/
```

## 2. Data flow

```
Supabase (Postgres, RLS: public read) ──► lib/content.ts (React cache) ──► Server Components (ISR, revalidate 1h)
            ▲                                     │ on error / empty
            │                                     └──► lib/data/content.ts (static fallback)
   /admin server actions ──► revalidatePath("/", "layout")  →  pages regenerate immediately
```

- Public pages are **statically generated with ISR**. Content reads use a cookie-less anon client so they stay cacheable.
- Admin writes go through **server actions** using the signed-in user's client, so **RLS is the source of truth**; the actions re-check the role as defence in depth and revalidate the whole site.
- The AI assistant's knowledge base is built from the same `lib/content.ts` calls, so editing a project in the CMS updates what the assistant knows.

## 3. Component architecture

- **Server by default.** Sections that only render content (`About`, `FeaturedProjects`, `Testimonials`, `Achievements`, `TechStack`, `GithubActivity`) are Server Components. Interactive islands (`Hero`, `SkillsUniverse`, `CareerTimeline`, `ExperienceList`, `ProjectsExplorer`, `Terminal`, `Assistant`, `ContactForm`) are client components receiving plain props.
- **Motion primitives** (`components/motion`) wrap Framer Motion patterns — reveal on view, staggered children, masked word reveals, magnetic buttons, 3D tilt cards — so sections stay declarative. `MotionConfig reducedMotion="user"` disables transforms for users who prefer reduced motion.
- **Smooth scroll**: Lenis is driven by GSAP's ticker and pipes scroll into `ScrollTrigger.update`, keeping GSAP and Lenis perfectly in sync. It's skipped entirely under reduced motion.
- **Global UI state** lives in a tiny Zustand store (`store/ui.ts`). R3F scenes read it inside `useFrame` via `useUI.getState()` so scroll progress never re-renders React.

## 4. Three.js architecture

```
three/lazy.tsx            next/dynamic(ssr:false) entry points — three.js is never in the server bundle or first paint
three/scene-canvas.tsx    shared <Canvas>: DPR capped by device tier, PerformanceMonitor lowers DPR on FPS drops,
                          frameloop="never" when off-screen, role="img" + aria-label
three/primitives.tsx      Label3D (canvas-texture sprites; no font fetch), FlowParticles (1 draw call),
                          CurveLine, Starfield, bezier()
three/textures.ts         animated canvas textures: code editor (typing), terminal (deploy log)
three/hero-scene.tsx      workspace + Rig (pointer parallax, scroll camera keyframes from store.heroProgress)
three/skills-galaxy.tsx   sun, orbit rings, planets (click → store.activePlanet), CameraDirector fly-in
three/timeline-spine.tsx  helix tube; progress tube uses setDrawRange so progress follows the curve
three/project-worlds.tsx  brain / cosmos / storybook / workflow / ecosystem + PointerOrbit
```

Performance rules applied everywhere: geometry/material/texture disposal on unmount, instanced/points rendering for particles, canvas textures redrawn at ~20 fps rather than every frame, particle counts scaled by `useDeviceTier()`, and every scene has a static fallback (aurora/gradient/cover art) under `prefers-reduced-motion`.

**Mobile**: the hero repositions the workspace above the headline at 60 % scale; the career timeline switches to a vertical rail (no pinning); the skills galaxy exposes planets as a horizontally scrollable chip row; the custom cursor, tilt and magnetic effects only activate for fine pointers.

## 5. Admin architecture

- **Auth**: Supabase Auth (password or magic link). `middleware.ts` refreshes the session and requires a user for `/admin/*`; `(panel)/layout.tsx` calls `requireStaff()` which checks `admin_users`.
- **Roles**: `admin` (everything) and `editor` (content CRUD + media upload). Profile, leads and media deletion require `admin`. Enforced by RLS helpers `is_staff()` / `is_admin()` and mirrored in the UI.
- **Generic CRUD**: `lib/admin/resources.ts` declares each resource (table, fields, list columns, ordering). `ResourceManager` + `RecordForm` render a searchable table and a dialog editor for any config. Field types: text, textarea, markdown, number, date, switch, tags, lines, select, url, image, images, json, color.
- **Blog**: Markdown editor with toolbar + shortcuts (⌘B/⌘I/⌘K), media insertion, live preview using the public renderer, draft/publish (publishing stamps `published_at` once), SEO title/description.
- **Media library**: browser-direct uploads to Supabase Storage (no serverless body limits), indexed in `media`; drag & drop, type filters, copy URL, admin-only delete. A `MediaPicker` dialog is reused by image fields, the profile form and the Markdown editor.
- **Leads**: status pipeline (new → contacted → closed), filter chips, expand message, mailto reply, delete.
- **Analytics**: see §8.

## 6. API architecture

| Route | Method | Purpose | Protection |
| --- | --- | --- | --- |
| `/api/chat` | POST | Streams Claude answers as `text/plain` | zod validation, 20 req/min/IP, 20 messages × 2 000 chars max |
| `/api/contact` | POST | Validates, stores lead (service role), emails via Resend | zod, honeypot, 5 req/10 min/IP |
| `/api/events` | POST | Records `resume_download` / `project_view` | zod, 60 req/min/IP, service role insert |
| `/api/github` | GET | Contribution calendar + top repos | cached 3 h |
| `/api/leetcode` | GET | Solved counts + contest rating | cached 3 h |
| `/auth/callback` | GET | Magic-link code exchange | redirects only to `/admin*` |
| `/auth/signout` | POST | Sign out | — |

Admin mutations are **server actions** (`app/admin/actions.ts`), not public routes.

The in-memory rate limiter is per-instance; add Vercel WAF rules or an Upstash limiter for a global cap.

### AI assistant

`/api/chat` uses the official `@anthropic-ai/sdk` with `claude-opus-5`, `output_config.effort: "low"` (fast conversational answers), the server-side refusal fallback (`fallbacks: "default"` with the `server-side-fallback-2026-07-01` beta), and a cached system prompt (`cache_control: ephemeral`) containing the knowledge base. The prompt instructs the model to answer only from the knowledge base and point to `/contact` otherwise.

## 7. Database

Tables: `profile` (single row), `projects`, `experiences`, `skills`, `certifications`, `testimonials`, `achievements`, `posts`, `media`, `leads`, `events`, `admin_users`. All have RLS enabled:

| Table | anon | editor | admin |
| --- | --- | --- | --- |
| projects, experiences, skills, certifications, testimonials, achievements | read | CRUD | CRUD |
| posts | read published | CRUD (incl. drafts) | CRUD |
| profile | read | read | write |
| media (index) | — | read, insert | + delete |
| storage `media` bucket | public URLs | upload/update | + delete |
| leads | — (server inserts with service role) | — | read, update, delete |
| events | — (server inserts) | read | read |
| admin_users | — | read | manage |

`is_staff()` / `is_admin()` are `SECURITY DEFINER` functions so policies can check roles without recursive RLS.

## 8. Analytics

- **PostHog** (client): initialised in `AnalyticsProvider` behind a `/ingest` reverse proxy (see `next.config.ts`), manual `$pageview` on route change, custom events via `track()` — `resume_downloaded`, `project_viewed`, `contact_submitted`, `assistant_message`, `terminal_command`, `planet_opened`, `calendly_opened`. Respects Do Not Track.
- **First-party counters**: résumé downloads and project views are also written to `events` so the dashboard has numbers even when ad-blockers drop PostHog.
- **Admin dashboard** (`lib/admin/analytics.ts`): HogQL queries via the PostHog Query API (visitors, pageviews, daily visitors, top pages) + Supabase counts (contact submissions, résumé downloads, project views, top projects). Without PostHog credentials the chart falls back to first-party events.
- **Vercel Analytics + Speed Insights** are rendered only on Vercel deployments.

## 9. SEO

- Metadata API: title template, description, keywords, canonical URLs per page, Open Graph + Twitter cards, `robots` (admin is `noindex`).
- Dynamic metadata for project case studies and blog posts (`generateMetadata`).
- Generated OG/Twitter images (`opengraph-image.tsx`) with `next/og`.
- JSON-LD: `Person` + `WebSite` site-wide; `CreativeWork` per project; `BlogPosting` per post; `BreadcrumbList` on inner pages.
- `sitemap.ts` (includes CMS projects and posts), `robots.ts` (disallows `/admin`, `/api`, `/auth`), `manifest.ts`.

## 10. Accessibility

- Skip link, landmark structure, one `h1` per page, `aria-labelledby` sections.
- All animated text keeps the full sentence in `aria-label`; animated spans are `aria-hidden`.
- Every canvas has `role="img"` + a descriptive label; content inside 3D scenes is duplicated in accessible DOM (timeline `sr-only` list, planet toolbar buttons, architecture nodes are focusable buttons).
- Visible `:focus-visible` rings, keyboard-operable terminal / assistant / dialogs (Radix), `aria-live` regions for chat, terminal output and filter results.
- `prefers-reduced-motion`: Lenis off, WebGL replaced by static art, Framer transforms disabled, CSS animations collapsed.
- Colour: text on `#050816` uses white / `#A1A1AA` (≥ 4.5:1).

## 11. Performance

- Three.js, the galaxy and project worlds are code-split and client-only; canvases pause off-screen.
- Server Components + ISR for all public pages; GitHub/LeetCode fetches cached 3 h and streamed behind `<Suspense>`.
- `next/image` with AVIF/WebP, `optimizePackageImports` for icon/animation libs, local Geist fonts (no layout shift, no external font request).
- Calendly iframe mounts only on click; the AI assistant bundle is small and streams responses.
