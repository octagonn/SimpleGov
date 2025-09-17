-- SimpleGov MVP schema
-- Run this file in your Supabase SQL editor or via migrations.

-- Extensions
create extension if not exists "pgcrypto" with schema public;
create extension if not exists "pgvector" with schema public;
create schema if not exists infra;

-- Custom types
create type document_visibility as enum ('public', 'private');
create type document_status as enum ('imported', 'processed', 'failed');
create type action_type as enum ('view', 'save', 'share');

-- Utility function for updated_at timestamps
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- Users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text,
  first_name text,
  last_name text,
  avatar_url text,
  age_bucket text,
  state text,
  signup_channel text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger trg_users_updated_at
before update on public.users
for each row execute function set_updated_at();

-- Images (shared asset metadata)
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  mime text,
  width integer,
  height integer,
  created_at timestamptz not null default timezone('utc', now())
);

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger trg_organizations_updated_at
before update on public.organizations
for each row execute function set_updated_at();

-- Officials
create table if not exists public.officials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  org_id uuid references public.organizations(id) on delete set null,
  image_id uuid references public.images(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_officials_org on public.officials(org_id);

create trigger trg_officials_updated_at
before update on public.officials
for each row execute function set_updated_at();

-- Documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text not null,
  title text not null,
  published_at timestamptz,
  imported_at timestamptz not null default timezone('utc', now()),
  status document_status not null default 'imported',
  raw_text text,
  summary text,
  summary_confidence numeric,
  categories jsonb not null default '[]'::jsonb,
  embedding vector(1536),
  image_id uuid references public.images(id) on delete set null,
  url text,
  visibility document_visibility not null default 'public',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_documents_source on public.documents(source, source_id);
create index if not exists idx_documents_status on public.documents(status);
create index if not exists idx_documents_published_at on public.documents(published_at desc);
create index if not exists idx_documents_categories on public.documents using gin (categories);
create index if not exists idx_documents_embedding on public.documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create trigger trg_documents_updated_at
before update on public.documents
for each row execute function set_updated_at();

-- User actions (views, saves, shares)
create table if not exists public.user_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  action action_type not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_user_actions_user on public.user_actions(user_id, action);
create index if not exists idx_user_actions_document on public.user_actions(document_id);

-- Approval votes for officials
create table if not exists public.approval_votes (
  id uuid primary key default gen_random_uuid(),
  official_id uuid not null references public.officials(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)),
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_approval_votes_unique on public.approval_votes(official_id, user_id);

-- Edge function jobs (optional lightweight queue)
create table if not exists infra.edge_jobs (
  id bigserial primary key,
  job_type text not null,
  payload jsonb not null,
  status text not null default 'pending',
  error text,
  scheduled_at timestamptz not null default timezone('utc', now()),
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists idx_edge_jobs_status on infra.edge_jobs(status, scheduled_at);

-- Row level security
alter table public.users enable row level security;
alter table public.documents enable row level security;
alter table public.user_actions enable row level security;
alter table public.approval_votes enable row level security;
alter table public.officials enable row level security;

create policy "Users can view their own profile" on public.users
for select using (auth.uid() = id);

create policy "Users manage own profile" on public.users
using (auth.uid() = id) with check (auth.uid() = id);

create policy "Public documents are readable" on public.documents
for select using (visibility = 'public');

create policy "Authenticated users insert actions" on public.user_actions
for insert with check (auth.uid() = user_id);

create policy "Users can view their actions" on public.user_actions
for select using (auth.uid() = user_id);

create policy "Users can manage their votes" on public.approval_votes
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Public official records" on public.officials
for select using (true);

-- Helpful views
create or replace view public.document_feed as
select
  d.id,
  d.title,
  d.summary,
  d.categories,
  d.published_at,
  d.source,
  d.visibility,
  coalesce(stats.views_7d, 0) as recent_views,
  coalesce(stats.saves_7d, 0) as recent_saves
from public.documents d
left join (
  select
    document_id,
    count(*) filter (where action = 'view' and created_at >= timezone('utc', now()) - interval '7 days') as views_7d,
    count(*) filter (where action = 'save' and created_at >= timezone('utc', now()) - interval '7 days') as saves_7d
  from public.user_actions
  group by document_id
) stats on stats.document_id = d.id
where d.visibility = 'public';

comment on view public.document_feed is 'Pre-aggregated stats supporting the personalized feed baseline.';

