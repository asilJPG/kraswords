-- Tighten RLS on crosswords: only role='admin' may write.
-- Before this migration, any authenticated user could insert/update/delete
-- crosswords directly via the anon JWT — bypassing /api/admin/crosswords.
-- Reads remain unchanged (public sees published, auth sees all).

-- INSERT
drop policy if exists "auth_insert" on public.crosswords;
drop policy if exists "admin_insert" on public.crosswords;
create policy "admin_insert" on public.crosswords
  for insert to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- UPDATE
drop policy if exists "auth_update" on public.crosswords;
drop policy if exists "admin_update" on public.crosswords;
create policy "admin_update" on public.crosswords
  for update to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- DELETE
drop policy if exists "auth_delete" on public.crosswords;
drop policy if exists "admin_delete" on public.crosswords;
create policy "admin_delete" on public.crosswords
  for delete to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Note: /api/admin/crosswords uses createAdminClient() (service_role key)
-- which bypasses RLS entirely. Admin flow continues to work.
-- This migration only blocks direct DB writes via user anon JWTs.
