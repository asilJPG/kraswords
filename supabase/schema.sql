-- ============================================================
-- kraswords schema
-- Run in Supabase SQL Editor.
-- ============================================================

create table if not exists public.crosswords (
  id          text primary key,
  title       text not null,
  author      text not null default 'аноним',
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
-- RLS
-- ============================================================
alter table public.crosswords enable row level security;

-- Anyone (anon + authed) can read published crosswords
drop policy if exists "read_published" on public.crosswords;
create policy "read_published" on public.crosswords
  for select
  using (published = true);

-- Authenticated users can read everything (drafts included)
drop policy if exists "auth_read_all" on public.crosswords;
create policy "auth_read_all" on public.crosswords
  for select
  to authenticated
  using (true);

-- Authenticated users can insert/update/delete
drop policy if exists "auth_insert" on public.crosswords;
create policy "auth_insert" on public.crosswords
  for insert
  to authenticated
  with check (true);

drop policy if exists "auth_update" on public.crosswords;
create policy "auth_update" on public.crosswords
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "auth_delete" on public.crosswords;
create policy "auth_delete" on public.crosswords
  for delete
  to authenticated
  using (true);
