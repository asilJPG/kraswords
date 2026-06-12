-- ============================================================
-- kraswords schema
-- Run in Supabase SQL Editor.
-- ============================================================

create table if not exists public.crosswords (
  id          text primary key,
  title       text not null,
  emoji       text not null default '🧩',
  category    text not null default 'разное',
  difficulty  text not null default 'средний' check (difficulty in ('лёгкий', 'средний', 'сложный')),
  theme_id    text not null default 'default',
  size        int  not null default 13 check (size between 5 and 25),
  clues       jsonb not null default '[]'::jsonb,
  word_count  int  not null default 0,
  solvers     int  not null default 0,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists crosswords_published_idx on public.crosswords (published, created_at desc);
create index if not exists crosswords_category_idx  on public.crosswords (category);

-- auto updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crosswords_touch on public.crosswords;
create trigger crosswords_touch
  before update on public.crosswords
  for each row execute function public.touch_updated_at();

-- ============================================================
-- profiles
-- ============================================================

create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  username   text unique check (char_length(username) between 2 and 20),
  banner_url text,
  created_at timestamptz not null default now()
);

-- Admin role lives in a separate table so the list of admins isn't readable
-- by everyone via profiles SELECT. RLS lets a user see only their own row.
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "read_own_admin" on public.admin_users;
create policy "read_own_admin" on public.admin_users
  for select to authenticated
  using (user_id = auth.uid());

-- Storage bucket for profile banners (run separately in Supabase Dashboard → Storage)
-- insert into storage.buckets (id, name, public) values ('banners', 'banners', true);
-- create policy "upload_own_banner" on storage.objects for insert to authenticated
--   with check (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);
-- create policy "update_own_banner" on storage.objects for update to authenticated
--   using (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);
-- create policy "read_banners" on storage.objects for select using (bucket_id = 'banners');

alter table public.profiles enable row level security;

drop policy if exists "read_profiles" on public.profiles;
create policy "read_profiles" on public.profiles for select using (true);

drop policy if exists "insert_own_profile" on public.profiles;
create policy "insert_own_profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "update_own_profile" on public.profiles;
create policy "update_own_profile" on public.profiles
  for update to authenticated using (id = auth.uid());

-- ============================================================
-- game_results
-- ============================================================

create table if not exists public.game_results (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users on delete cascade not null,
  crossword_id text references public.crosswords(id) on delete cascade not null,
  time_seconds int not null check (time_seconds >= 0),
  solved       boolean not null default false,
  played_at    timestamptz not null default now()
);

create index if not exists game_results_user_idx      on public.game_results(user_id, played_at desc);
create index if not exists game_results_leaderboard_idx on public.game_results(crossword_id, time_seconds) where solved = true;

-- ============================================================
-- RLS — crosswords
-- ============================================================
alter table public.crosswords enable row level security;

drop policy if exists "read_published" on public.crosswords;
create policy "read_published" on public.crosswords
  for select using (published = true);

drop policy if exists "auth_read_all" on public.crosswords;
create policy "auth_read_all" on public.crosswords
  for select to authenticated using (true);

drop policy if exists "auth_insert" on public.crosswords;
drop policy if exists "admin_insert" on public.crosswords;
create policy "admin_insert" on public.crosswords
  for insert to authenticated
  with check (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );

drop policy if exists "auth_update" on public.crosswords;
drop policy if exists "admin_update" on public.crosswords;
create policy "admin_update" on public.crosswords
  for update to authenticated
  using (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );

drop policy if exists "auth_delete" on public.crosswords;
drop policy if exists "admin_delete" on public.crosswords;
create policy "admin_delete" on public.crosswords
  for delete to authenticated
  using (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );

-- ============================================================
-- RLS — game_results
-- ============================================================
alter table public.game_results enable row level security;

drop policy if exists "insert_own" on public.game_results;
create policy "insert_own" on public.game_results
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "read_own" on public.game_results;
create policy "read_own" on public.game_results
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "read_solved_leaderboard" on public.game_results;
create policy "read_solved_leaderboard" on public.game_results
  for select using (solved = true);
