-- Move admin role out of profiles into a separate `admin_users` table.
-- Before this migration, profiles.role was readable by anyone (RLS read_profiles
-- using (true)), so anyone could enumerate admins.
-- After: admin_users RLS lets you see only your own row. Nobody can list other admins.

-- 1) Create admin_users table
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "read_own_admin" on public.admin_users;
create policy "read_own_admin" on public.admin_users
  for select to authenticated
  using (user_id = auth.uid());

-- (No INSERT/UPDATE/DELETE policies — only service_role / manual SQL can promote.)

-- 2) Migrate existing admins from profiles.role
insert into public.admin_users (user_id)
select id from public.profiles where role = 'admin'
on conflict (user_id) do nothing;

-- 3) Update crosswords RLS policies to use admin_users
drop policy if exists "admin_insert" on public.crosswords;
create policy "admin_insert" on public.crosswords
  for insert to authenticated
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "admin_update" on public.crosswords;
create policy "admin_update" on public.crosswords
  for update to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "admin_delete" on public.crosswords;
create policy "admin_delete" on public.crosswords
  for delete to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- 4) Drop role column from profiles (and its check constraint)
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop column if exists role;

-- Promote a user to admin going forward:
--   insert into public.admin_users (user_id)
--   select id from auth.users where email = 'a@b.c';
-- or via username:
--   insert into public.admin_users (user_id)
--   select id from public.profiles where username = 'твой_ник';
