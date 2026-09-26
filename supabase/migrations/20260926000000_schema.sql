-- ═══════════════════════════════════════════════════════════════════════════
-- Harshit Verma Portfolio — database schema
-- Tables · auth profiles & roles · RLS policies · storage bucket
--
-- Idempotent: safe to run on a fresh project or re-run on an existing one.
-- Paste into Supabase → SQL Editor → Run, or `npx supabase db push`.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────── Auth profiles & roles ─────────────────────────────
-- One row per auth user, created automatically on sign-up.
--   role = 'admin'  → full access
--   role = 'editor' → dashboard access; can manage testimonials, certifications,
--                     achievements and lead statuses
--   role = null     → no dashboard access (default for every new account)
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  role       text check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email on auth.users
  for each row execute function public.handle_new_user();

-- Backfill users that existed before this migration.
insert into public.profiles (id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do nothing;

-- Role helpers. SECURITY DEFINER so RLS policies can call them without recursion.
create or replace function public.current_role_name()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() in ('admin', 'editor'), false);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() = 'admin', false);
$$;

revoke all on function public.current_role_name(), public.is_staff(), public.is_admin() from public;
grant execute on function public.current_role_name(), public.is_staff(), public.is_admin() to anon, authenticated;

-- Superseded by `profiles`.
drop table if exists public.admin_users cascade;

-- ───────────────────────────── Helpers ─────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────────── Content tables ─────────────────────────────
-- Single-row table with the public site's owner details.
create table if not exists public.site_profile (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  title              text not null,
  tagline            text not null default '',
  hero_text          text not null default '',
  bio                text not null default '',
  location           text not null default '',
  email              text not null,
  avatar_url         text not null default '/images/profile.jpeg',
  resume_url         text not null default '/resume.pdf',
  available_for_work boolean not null default true,
  socials            jsonb not null default '{}'::jsonb,
  now_building       jsonb not null default '{"company":"","role":"","summary":"","items":[]}'::jsonb,
  updated_at         timestamptz not null default now()
);
-- Migrate data from the earlier `profile` table name, if present.
do $$
begin
  if to_regclass('public.profile') is not null then
    insert into public.site_profile (name, title, tagline, hero_text, bio, location, email, avatar_url, resume_url, available_for_work, socials, now_building)
    select name, title, tagline, hero_text, bio, location, email, avatar_url, resume_url, available_for_work, socials, now_building
    from public.profile
    where not exists (select 1 from public.site_profile);
    drop table public.profile cascade;
  end if;
end $$;

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title       text not null,
  tagline     text not null,
  description text not null,
  category    text not null check (category in ('Full Stack', 'AI', 'SaaS', 'EdTech', 'Cloud', 'Open Source')),
  tags        text[] not null default '{}',
  tech        text[] not null default '{}',
  cover_image text,
  images      text[] not null default '{}',
  video_url   text,
  github_url  text,
  live_url    text,
  featured    boolean not null default false,
  order_index integer not null default 0,
  year        integer not null default extract(year from now()),
  accent      text not null default '#6366F1',
  case_study  jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.projects drop column if exists world;
create index if not exists projects_order_idx on public.projects (order_index);

create table if not exists public.experiences (
  id              uuid primary key default gen_random_uuid(),
  company         text not null,
  position        text not null,
  location        text not null default '',
  employment_type text not null default 'Full-time',
  start_date      date not null,
  end_date        date,
  description     text not null default '',
  achievements    text[] not null default '{}',
  tech            text[] not null default '{}',
  order_index     integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table if not exists public.skills (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,
  icon        text not null default '',
  proficiency integer not null default 50 check (proficiency between 0 and 100),
  years       numeric(4, 1) not null default 0 check (years >= 0),
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
update public.skills set category = 'devops' where category = 'tools';
alter table public.skills drop constraint if exists skills_category_check;
alter table public.skills add constraint skills_category_check check (category in ('frontend', 'backend', 'database', 'cloud', 'ai', 'devops'));

create table if not exists public.certifications (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  issuer         text not null,
  issue_date     date not null,
  credential_url text,
  order_index    integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null,
  company     text not null,
  quote       text not null,
  avatar_url  text,
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.achievements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  date        date not null,
  metric      text,
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title           text not null,
  excerpt         text not null default '',
  content         text not null default '',
  cover_image     text,
  tags            text[] not null default '{}',
  status          text not null default 'draft' check (status in ('draft', 'published')),
  published_at    timestamptz,
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists posts_published_idx on public.posts (published_at desc) where status = 'published';

create table if not exists public.media (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  path       text not null unique,
  url        text not null,
  mime_type  text not null,
  size       bigint not null default 0,
  created_at timestamptz not null default now()
);

-- ───────────────────────────── Leads & events ─────────────────────────────
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) <= 100),
  email      text not null check (char_length(email) <= 200),
  subject    text not null check (char_length(subject) <= 150),
  message    text not null check (char_length(message) <= 5000),
  budget     text,
  status     text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);
create index if not exists leads_status_idx on public.leads (status, created_at desc);

create table if not exists public.events (
  id         bigint generated always as identity primary key,
  type       text not null check (type in ('resume_download', 'project_view')),
  ref        text,
  path       text,
  created_at timestamptz not null default now()
);
create index if not exists events_type_created_idx on public.events (type, created_at desc);

do $$
declare t text;
begin
  foreach t in array array['site_profile','projects','experiences','skills','certifications','testimonials','achievements','posts'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ═══════════════════════════════ RLS ═══════════════════════════════
do $$
declare
  t text;
  p record;
begin
  -- Enable RLS and drop every existing policy so this file is the single source of truth.
  foreach t in array array['profiles','site_profile','projects','experiences','skills','certifications','testimonials','achievements','posts','media','leads','events'] loop
    execute format('alter table public.%I enable row level security', t);
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
  end loop;

  -- Public content, admin-only writes.
  foreach t in array array['projects','experiences','skills'] loop
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;

  -- Public content, staff (admin + editor) writes.
  foreach t in array array['certifications','testimonials','achievements'] loop
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "staff write" on public.%I for all to authenticated using (public.is_staff()) with check (public.is_staff())', t);
  end loop;
end $$;

-- profiles: everyone reads their own row (needed to resolve their role); admins read all and manage roles.
create policy "read own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "admin manage roles" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- site_profile: public read, admin write.
create policy "public read" on public.site_profile for select to anon, authenticated using (true);
create policy "admin write" on public.site_profile for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- posts: public sees published only; staff can read drafts; admin writes.
create policy "read published" on public.posts for select to anon, authenticated using (status = 'published' or public.is_staff());
create policy "admin write" on public.posts for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- media index: staff read, admin write.
create policy "staff read" on public.media for select to authenticated using (public.is_staff());
create policy "admin write" on public.media for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- leads: inserted by the server with the service role; staff read and update status; admin deletes.
create policy "staff read" on public.leads for select to authenticated using (public.is_staff());
create policy "staff update" on public.leads for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "admin delete" on public.leads for delete to authenticated using (public.is_admin());

-- events: inserted by the server with the service role; staff read.
create policy "staff read" on public.events for select to authenticated using (public.is_staff());

-- ═══════════════════════════ Storage ═══════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800, array['image/png','image/jpeg','image/webp','image/avif','image/gif','image/svg+xml','video/mp4','video/webm','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "staff upload media" on storage.objects;
drop policy if exists "staff update media" on storage.objects;
drop policy if exists "admin delete media objects" on storage.objects;
drop policy if exists "admin insert media objects" on storage.objects;
drop policy if exists "admin update media objects" on storage.objects;

-- Public bucket: files are readable by URL. Only admins upload, replace or delete.
create policy "admin insert media objects" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "admin update media objects" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "admin delete media objects" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ═══════════════════════════ Bootstrap admin ═══════════════════════════
-- Promote the site owner once their auth user exists (Authentication → Users → Add user).
-- Re-run just this statement after creating the user if it didn't exist yet.
update public.profiles set role = 'admin' where lower(email) = 'harshit2005verma@gmail.com';
