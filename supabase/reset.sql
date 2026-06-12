-- ============================================================
-- ПОЛНЫЙ СБРОС: удаляет старые таблицы и пересоздаёт всё с нуля
-- Запусти в Supabase SQL Editor целиком
-- ============================================================

drop table if exists public.game_results cascade;
drop table if exists public.profiles cascade;
drop table if exists public.crosswords cascade;

-- ============================================================
-- crosswords
-- ============================================================

create table public.crosswords (
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

create index crosswords_published_idx on public.crosswords (published, created_at desc);
create index crosswords_category_idx  on public.crosswords (category);

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

create table public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  username   text unique check (char_length(username) between 2 and 20),
  role       text not null default 'user' check (role in ('user', 'admin')),
  banner_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "read_profiles" on public.profiles for select using (true);

create policy "insert_own_profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());

create policy "update_own_profile" on public.profiles
  for update to authenticated using (id = auth.uid());

-- ============================================================
-- game_results
-- ============================================================

create table public.game_results (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users on delete cascade not null,
  crossword_id text references public.crosswords(id) on delete cascade not null,
  time_seconds int not null check (time_seconds >= 0),
  solved       boolean not null default false,
  played_at    timestamptz not null default now()
);

create index game_results_user_idx        on public.game_results(user_id, played_at desc);
create index game_results_leaderboard_idx on public.game_results(crossword_id, time_seconds) where solved = true;

alter table public.game_results enable row level security;

create policy "insert_own" on public.game_results
  for insert to authenticated with check (user_id = auth.uid());

create policy "read_own" on public.game_results
  for select to authenticated using (user_id = auth.uid());

create policy "read_solved_leaderboard" on public.game_results
  for select using (solved = true);

-- ============================================================
-- crosswords RLS
-- ============================================================

alter table public.crosswords enable row level security;

create policy "read_published" on public.crosswords
  for select using (published = true);

create policy "auth_read_all" on public.crosswords
  for select to authenticated using (true);

create policy "auth_insert" on public.crosswords
  for insert to authenticated with check (true);

create policy "auth_update" on public.crosswords
  for update to authenticated using (true) with check (true);

create policy "auth_delete" on public.crosswords
  for delete to authenticated using (true);
