# Architecture

## Structure

```
supabase/
  migrations/20260926000000_schema.sql   tables · profiles & roles · RLS · storage (idempotent)
  seed.sql                               starter content
src/
  middleware.ts                          session refresh + /admin gate
  app/
    (site)/                              public site: layout, page transition, pages
    admin/
      (auth)/login · forgot-password · reset-password
      (panel)/                           protected dashboard (layout checks role)
        page.tsx                         analytics
        [resource]/                      generic CRUD: projects, experiences, skills, certifications,
                                         testimonials, achievements, posts
        profile/ media/ leads/ team/
        error.tsx loading.tsx
      actions.ts                         server actions (all writes)
    api/  chat · contact · events · github · leetcode
    auth/ callback (PKCE code + token_hash) · signout
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx
  components/
    ui/ motion/ layout/ sections/ projects/ terminal/ chat/ seo/ admin/
  lib/
    content.ts           public reads (Supabase only)
    auth.ts              getSession / requireStaff / authorize
    supabase/            browser, server, service-role and middleware clients
    admin/               resource configs, analytics, media upload
```

## Data flow

```
Supabase (RLS: public read) → lib/content.ts (React cache) → Server Components (ISR, 1 h)
/admin server actions (user's JWT, RLS enforced) → revalidatePath("/", "layout") → pages regenerate
```

There is no bundled content. If Supabase is unreachable, sections render empty and the error is logged.

## Authentication & sessions

- **Sign in**: email + password (`signInWithPassword`) in the browser. `@supabase/ssr` stores the session in cookies, and the page then does a full navigation, so the server sees the new cookies on the first request.
- **Refresh and persistence**: `middleware.ts` runs on `/admin/*` and `/auth/*` and calls `supabase.auth.getUser()`. When the access token has expired, the client uses the refresh token and writes new cookies onto the response, so sessions survive reloads and idle time. `AuthListener` in the dashboard also refreshes in the background, sends every tab to login on `SIGNED_OUT`, and re-validates when a tab regains focus.
- **Route protection**: middleware redirects signed-out visitors from any `/admin` path except `/admin/login` and `/admin/forgot-password` to `/admin/login?next=<path>`. The `next` value is checked so it can only point inside `/admin`. The panel layout calls `requireStaff()`, which validates the JWT with Supabase (`getUser`, not the unverified `getSession`) and loads the role from `public.profiles`.
- **Password reset**: `/admin/forgot-password` → `resetPasswordForEmail(redirectTo: /auth/callback?next=/admin/reset-password)` → `/auth/callback` exchanges the code (or verifies a `token_hash`) and sets the session → `/admin/reset-password` → `updateUser({ password })` → sign out globally → log in again.
- **Sign out**: `POST /auth/signout` revokes the refresh token and clears the cookies.
- **No redirect loops**: a signed-in user without a role sees a "no role yet" notice on the login page instead of being bounced between login and dashboard.

## Roles

`public.profiles (id, email, role, created_at)`: one row per auth user, created by a trigger on `auth.users`. `role` is `admin`, `editor` or `null`, and new users start at `null`. Users can read their own row; only admins can change roles, from **Team**. Nobody can promote themselves.

Checked in three places: RLS (`is_admin()` / `is_staff()` security-definer helpers), server actions (`authorize(minRole)`), and the UI (`requireStaff(minRole)`, a filtered sidebar).

| Table | anon | editor | admin |
| --- | --- | --- | --- |
| projects, experiences, skills | read | read | write |
| certifications, testimonials, achievements | read | write | write |
| posts | published | read all | write |
| site_profile | read | read | write |
| media + storage bucket | public URLs | read index | write |
| leads | server insert only | read, update status | + delete |
| events | server insert only | read | read |
| profiles | — | own row | all, update roles |

## Admin

`lib/admin/resources.ts` declares every content type: its table, fields, list columns, sort order and `minRole`. `ResourceManager` and `RecordForm` render a searchable table and a dialog editor for any of them. Writes go through server actions that coerce form values into typed columns, run as the signed-in user so RLS applies, turn database errors into readable messages (duplicate slug, permission denied, expired session), and revalidate the site.

Media uploads go straight from the browser to Supabase Storage, so large files never pass through a serverless function. Each upload is then indexed in `media`.

## Performance

- No WebGL. Continuous animation (aurora, marquee, float, pulse) is CSS. Framer Motion loads through `LazyMotion` with `domAnimation`, which drops layout projection and drag.
- Loaded only when needed: the AI assistant panel (and its Markdown renderer), the terminal dialog, and PostHog (initialised when the browser is idle).
- Server Components with ISR for every public page. GitHub and LeetCode data is cached for 3 hours and streamed behind `<Suspense>`.
- Home page first-load JS: ~165 kB. The previous WebGL version was 309 kB plus lazy 3D chunks.
- Lenis smooth scrolling runs only for mouse wheels; touch devices keep native scrolling.

## Accessibility

Skip link, one `h1` per page, labelled sections, visible focus rings, keyboard-operable dialogs (Radix), `aria-live` for chat, terminal and filter results. Progress bars use `role="meter"`, and count-ups expose their final value to screen readers. Reduced motion disables the typing effect, transforms and CSS animations. Body text is at least 4.5:1 contrast.

## SEO

Metadata API with per-page canonical URLs, dynamic metadata for projects and posts, generated OG and Twitter images, JSON-LD (`Person`, `WebSite`, `CreativeWork`, `BlogPosting`, `BreadcrumbList`), a sitemap built from the database, and `robots.txt` that disallows `/admin`, `/api` and `/auth`.
