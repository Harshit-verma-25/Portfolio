# Harshit Verma — Portfolio

A fast, premium developer portfolio with a full CMS. Public pages are server-rendered from Supabase; everything is editable in a role-protected admin dashboard.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Framer Motion (LazyMotion) · Lenis · Zustand · Supabase (Postgres, Auth, Storage) · Claude API · PostHog · Vercel Analytics

## Highlights

- **Lightweight motion**: word-by-word name reveal, typed role, aurora/grid/noise backgrounds, glass cards with a pointer-following glow, scroll-linked timeline, count-up stats. No WebGL; CSS does the continuous animation, and everything respects `prefers-reduced-motion`.
- **Pages**: home, about, projects (filter and search), case studies with an interactive architecture diagram, experience timeline, blog, contact.
- **Extras**: AI assistant grounded in your CMS content (loaded on demand), a terminal (`` ` `` or Ctrl/⌘+K), live GitHub heatmap, LeetCode stats, Calendly.
- **Admin at `/admin`**: Supabase email/password auth with password reset, persistent sessions, `admin`/`editor` roles, CRUD for every content type, Markdown blog editor, media library, leads pipeline, team/role management, analytics.

## Quick start

```bash
npm install
cp .env.example .env.local     # add your Supabase URL + keys
npm run dev                    # http://localhost:3000
```

Then set up the database and your admin account. [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) walks through it in about five minutes:

1. Supabase → SQL Editor → run `supabase/migrations/20260926000000_schema.sql`, then `supabase/seed.sql`.
2. Authentication → Users → **Add user** with your email and a password (tick *Auto confirm*).
3. Run `update public.profiles set role = 'admin' where email = 'you@example.com';`
4. Sign in at `/admin/login`.

All content comes from the database — there is no bundled fallback content.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` · `npm run typecheck` | ESLint · `tsc --noEmit` |

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — structure, data flow, auth & roles, RLS, API, performance, accessibility.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Supabase, admin account, Vercel, integrations, troubleshooting.
