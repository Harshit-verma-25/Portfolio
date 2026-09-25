-- ═══════════════════════════════════════════════════════════════════════════
-- Harshit Verma Portfolio — initial schema
-- Tables · role helpers · RLS policies · storage bucket
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ───────────────────────────── Roles ─────────────────────────────
-- A user is staff only if they have a row here. Insert yourself after signing up:
--   insert into public.admin_users (user_id, role) values ('<auth.users.id>', 'admin');
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so policies can check roles without recursive RLS on admin_users.
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'admin');
$$;

revoke all on function public.is_staff() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_staff() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ───────────────────────────── Helpers ─────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────────── Content tables ─────────────────────────────
create table if not exists public.profile (
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
  world       text check (world in ('brain', 'cosmos', 'storybook', 'workflow', 'ecosystem')),
  case_study  jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists projects_order_idx on public.projects (order_index);
create index if not exists projects_featured_idx on public.projects (featured) where featured;

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
  category    text not null check (category in ('frontend', 'backend', 'cloud', 'ai', 'database', 'tools')),
  icon        text not null default '',
  proficiency integer not null default 50 check (proficiency between 0 and 100),
  years       numeric(4, 1) not null default 0 check (years >= 0),
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

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

-- First-party conversion counters (resume downloads, project views).
create table if not exists public.events (
  id         bigint generated always as identity primary key,
  type       text not null check (type in ('resume_download', 'project_view')),
  ref        text,
  path       text,
  created_at timestamptz not null default now()
);
create index if not exists events_type_created_idx on public.events (type, created_at desc);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['profile','projects','experiences','skills','certifications','testimonials','achievements','posts'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ═══════════════════════════════ RLS ═══════════════════════════════
alter table public.admin_users    enable row level security;
alter table public.profile        enable row level security;
alter table public.projects       enable row level security;
alter table public.experiences    enable row level security;
alter table public.skills         enable row level security;
alter table public.certifications enable row level security;
alter table public.testimonials   enable row level security;
alter table public.achievements   enable row level security;
alter table public.posts          enable row level security;
alter table public.media          enable row level security;
alter table public.leads          enable row level security;
alter table public.events         enable row level security;

-- admin_users: staff can see who's staff; only admins manage roles.
create policy "staff read roles"   on public.admin_users for select to authenticated using (public.is_staff());
create policy "admins manage roles" on public.admin_users for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Public content: anyone reads, staff write.
do $$
declare t text;
begin
  foreach t in array array['projects','experiences','skills','certifications','testimonials','achievements'] loop
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "staff insert" on public.%I for insert to authenticated with check (public.is_staff())', t);
    execute format('create policy "staff update" on public.%I for update to authenticated using (public.is_staff()) with check (public.is_staff())', t);
    execute format('create policy "staff delete" on public.%I for delete to authenticated using (public.is_staff())', t);
  end loop;
end $$;

-- Profile: public read, admin-only write.
create policy "public read profile" on public.profile for select to anon, authenticated using (true);
create policy "admin write profile" on public.profile for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Posts: the public sees only published posts; staff see and edit everything.
create policy "public read published posts" on public.posts for select to anon, authenticated using (status = 'published' or public.is_staff());
create policy "staff insert posts" on public.posts for insert to authenticated with check (public.is_staff());
create policy "staff update posts" on public.posts for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff delete posts" on public.posts for delete to authenticated using (public.is_staff());

-- Media index: staff read/insert, admin delete.
create policy "staff read media"   on public.media for select to authenticated using (public.is_staff());
create policy "staff insert media" on public.media for insert to authenticated with check (public.is_staff());
create policy "admin delete media" on public.media for delete to authenticated using (public.is_admin());

-- Leads: written only by the server (service role bypasses RLS); admins read and manage.
create policy "admin read leads"   on public.leads for select to authenticated using (public.is_admin());
create policy "admin update leads" on public.leads for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete leads" on public.leads for delete to authenticated using (public.is_admin());

-- Events: written only by the server; staff read for the dashboard.
create policy "staff read events" on public.events for select to authenticated using (public.is_staff());

-- ═══════════════════════════ Storage ═══════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800, array['image/png','image/jpeg','image/webp','image/avif','image/gif','image/svg+xml','video/mp4','video/webm','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Public bucket → files are readable by URL. Only staff upload/update; only admins delete.
create policy "staff upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_staff());
create policy "staff update media" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_staff());
create policy "admin delete media objects" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
