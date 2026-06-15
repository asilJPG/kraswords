-- Reusable user-defined themes + corner-object support.
-- After this migration:
--   * Admins can create named themes in /admin/themes and apply them by id
--   * Each theme can carry a hero image (wide + portrait) and a corner object
--   * `crosswords.theme_id` may now be either a built-in slug ('rickmorty', etc.)
--     or a UUID referencing public.themes_custom.id
--   * Per-crossword `theme_custom` jsonb override still works (mergea over base)

create table if not exists public.themes_custom (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 60),
  config      jsonb not null default '{}'::jsonb,
  created_by  uuid references auth.users on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists themes_custom_updated_idx
  on public.themes_custom (updated_at desc);

-- updated_at trigger (reuse pattern from schema.sql if function set_updated_at exists)
do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    drop trigger if exists themes_custom_updated_at on public.themes_custom;
    create trigger themes_custom_updated_at
      before update on public.themes_custom
      for each row execute function set_updated_at();
  end if;
end $$;

-- RLS: everyone authenticated can READ themes; only admins can write.
alter table public.themes_custom enable row level security;

drop policy if exists "read_themes" on public.themes_custom;
create policy "read_themes" on public.themes_custom
  for select using (true);

drop policy if exists "admin_insert_theme" on public.themes_custom;
create policy "admin_insert_theme" on public.themes_custom
  for insert to authenticated
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "admin_update_theme" on public.themes_custom;
create policy "admin_update_theme" on public.themes_custom
  for update to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "admin_delete_theme" on public.themes_custom;
create policy "admin_delete_theme" on public.themes_custom
  for delete to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Storage bucket setup (run manually in Supabase Dashboard if not present):
--   id = 'heroes', public = true
-- Policies (run separately):
--   create policy "admin_upload_hero" on storage.objects for insert to authenticated
--     with check (bucket_id = 'heroes' and exists (select 1 from public.admin_users where user_id = auth.uid()));
--   create policy "public_read_hero" on storage.objects for select using (bucket_id = 'heroes');
