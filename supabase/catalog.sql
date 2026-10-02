-- Shared video catalog. Run once in the Supabase SQL editor.
-- A daily server job fills this. The app reads it. The browser does not have to stay open.

create table if not exists public.catalog_videos (
  id text primary key,
  title text not null,
  channel_title text,
  category_id text,
  age_group text not null,
  language text not null default 'en',
  duration_seconds integer,
  thumbnail text,
  approved boolean not null default true,
  added_at timestamptz not null default now()
);

alter table public.catalog_videos enable row level security;

drop policy if exists "catalog_read" on public.catalog_videos;
create policy "catalog_read"
on public.catalog_videos
for select
to anon, authenticated
using (approved = true);

grant select on public.catalog_videos to anon, authenticated;
