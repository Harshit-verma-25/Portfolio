# Deployment guide

The site deploys to **Vercel** with **Supabase** as the backend. Every integration is optional — skip any step and that feature degrades gracefully.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema — either with the CLI:
   ```bash
   npx supabase link --project-ref <ref>
   npx supabase db push          # runs supabase/migrations/*
   psql "$DATABASE_URL" -f supabase/seed.sql   # optional starter content
   ```
   or paste `supabase/migrations/20260925000000_init.sql` and then `supabase/seed.sql` into the SQL editor.
3. The migration creates the public `media` storage bucket and its policies.
4. **Auth → URL configuration**: set *Site URL* to your domain and add `https://<your-domain>/auth/callback` to *Redirect URLs* (needed for magic links).
5. Copy **Project URL**, **anon key** and **service role key** (Settings → API).

### Create your admin account

1. Auth → Users → *Add user* (email + password). Consider disabling public sign-ups (Auth → Providers → Email → *Allow new users to sign up* off).
2. Grant the role in the SQL editor:
   ```sql
   insert into public.admin_users (user_id, role)
   select id, 'admin' from auth.users where email = 'you@example.com';
   ```
   Use `'editor'` for collaborators who should edit content but not see leads or analytics-sensitive data.
3. Sign in at `/admin/login`.

## 2. Environment variables

Set these in Vercel (Project → Settings → Environment Variables). See `.env.example`.

| Variable | Required for |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs, sitemap, OG — e.g. `https://harshitverma.dev` |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | CMS content, admin |
| `SUPABASE_SERVICE_ROLE_KEY` | contact form & event counters (server only) |
| `ANTHROPIC_API_KEY` | AI assistant |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (`/ingest`) | product analytics |
| `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID`, `POSTHOG_API_HOST` | admin analytics dashboard (personal key with *query:read*) |
| `GITHUB_USERNAME`, `GITHUB_TOKEN` (optional, read-only) | contribution heatmap (token enables GraphQL + higher limits) |
| `LEETCODE_USERNAME` | LeetCode card (hidden when unset) |
| `NEXT_PUBLIC_CALENDLY_URL` | “Book a call” scheduler |
| `RESEND_API_KEY`, `CONTACT_NOTIFY_EMAIL` | email notification for new leads |

If you use PostHog's EU cloud, change the two rewrite destinations in `next.config.ts` to `eu.i.posthog.com` / `eu-assets.i.posthog.com` and set `POSTHOG_API_HOST=https://eu.posthog.com`.

## 3. Vercel

1. Import the GitHub repository in Vercel — the framework preset (Next.js) is detected automatically.
2. Add the environment variables above for *Production* (and *Preview* if you want previews to hit the same Supabase).
3. Deploy. Enable **Analytics** and **Speed Insights** in the Vercel dashboard — the components only render on Vercel.
4. Add your custom domain and update `NEXT_PUBLIC_SITE_URL` + Supabase's Site URL to match.

Content edited in `/admin` revalidates the site immediately; everything else refreshes hourly (ISR).

## 4. Post-deploy checklist

- [ ] `/admin/login` → sign in → edit the profile, replace sample testimonials, upload your résumé.
- [ ] Submit the contact form once and confirm it appears in **Admin → Leads** (and in your inbox if Resend is set).
- [ ] Ask the assistant a question.
- [ ] Check `/sitemap.xml`, `/robots.txt` and share a URL in a social card validator to confirm the OG image.
- [ ] Run Lighthouse on the home page (mobile + desktop).
