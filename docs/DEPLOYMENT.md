# Deployment guide

## 1. Supabase

### Database

In **SQL Editor**, run these two files in order:

1. `supabase/migrations/20260926000000_schema.sql` — tables, the `profiles` role table, RLS policies, the `media` storage bucket. It is idempotent: safe to re-run, and it upgrades a database created by the earlier schema (`admin_users` → `profiles`, `profile` → `site_profile`).
2. `supabase/seed.sql` — starter content (profile, projects, experience and education, skills, achievements). Re-running it replaces that content.

(With the CLI instead: `npx supabase link --project-ref <ref> && npx supabase db push`, then run the seed.)

### Authentication settings

**Authentication → URL Configuration**
- *Site URL*: your production URL, e.g. `https://harshitverma.dev`
- *Redirect URLs*: add `https://harshitverma.dev/auth/callback` and `http://localhost:3000/auth/callback`

These are required for password-reset emails. If they're missing, reset links fail or point to the wrong host.

**Authentication → Sign In / Providers → Email**
- Keep *Email* enabled.
- Turn **off** *Allow new users to sign up*. Accounts are created by you, and new accounts get no dashboard access anyway (`role = null`).

### Your admin account

1. **Authentication → Users → Add user → Create new user**: your email and a strong password, *Auto confirm user* ticked.
2. In the SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
   (The migration already promotes `harshit2005verma@gmail.com` if that user exists when it runs.)
3. Sign in at `/admin/login`. Use **Forgot password?** on that page whenever you need to reset.

Grant other people access from **Admin → Team** after creating their user in Supabase.

| Role | Can do |
| --- | --- |
| `admin` | Everything: profile, projects, experience, skills, blog, media, leads, team, analytics |
| `editor` | Dashboard, testimonials, certifications, achievements, lead statuses |
| none | Nothing — sees a "no role yet" notice after signing in |

## 2. Environment variables

`.env.local` for local development; Vercel → Project → Settings → Environment Variables in production. See `.env.example`.

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs, sitemap, OG images |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | everything (content, auth) |
| `SUPABASE_SERVICE_ROLE_KEY` | contact form + event counters (server only — never prefix with `NEXT_PUBLIC_`) |
| `ANTHROPIC_API_KEY` | AI assistant |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | product analytics |
| `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID`, `POSTHOG_API_HOST` | visitor numbers in the admin dashboard |
| `GITHUB_USERNAME`, `GITHUB_TOKEN` | contribution heatmap |
| `LEETCODE_USERNAME` | LeetCode card (hidden when unset) |
| `NEXT_PUBLIC_CALENDLY_URL` | "Book a call" |
| `RESEND_API_KEY`, `CONTACT_NOTIFY_EMAIL` | email on new leads |

`NEXT_PUBLIC_*` values are inlined at build time. Redeploy after changing them.

## 3. Vercel

1. Import the repository; the Next.js preset is detected.
2. Add the environment variables, then deploy.
3. Add your domain, then update `NEXT_PUBLIC_SITE_URL` and Supabase's *Site URL* / *Redirect URLs* to match.
4. Enable Analytics and Speed Insights in the Vercel dashboard (they only load on Vercel).

Content saved in `/admin` revalidates the site immediately; otherwise pages refresh hourly (ISR).

## 4. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `/admin/login` says Supabase isn't configured | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` missing at build time — set them and redeploy |
| Signed in but "no role yet" | Run the `update public.profiles set role = 'admin' …` statement for your email |
| "Couldn't load this page" in the dashboard | Tables missing — run the migration |
| Reset link says "invalid or expired" | Add `/auth/callback` to Redirect URLs; links expire after 1 hour and work once |
| Contact form says it isn't configured | `SUPABASE_SERVICE_ROLE_KEY` missing |
| Public sections are empty | Seed not run, or content deleted in the dashboard |
