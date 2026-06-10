-- Profile avatar — flexible JSON so we can swap from emoji to a customisable
-- character later without another migration.
-- Current shape: {"type":"emoji","value":"😎"}
-- Future shape: {"type":"character","parts":{"hair":"...","skin":"...","outfit":"..."}}
alter table public.profiles
  add column if not exists avatar jsonb not null default '{"type":"emoji","value":"😎"}'::jsonb;

create index if not exists profiles_avatar_type_idx
  on public.profiles ((avatar->>'type'));
