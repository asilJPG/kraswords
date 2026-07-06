-- Security fixes из аудита 2026-07-06.

-- 1) game_results: запись результатов только через /api/game-result (service role).
--    Раньше insert_own позволял залогиненному юзеру вставить solved=true/time=1
--    напрямую через anon-клиент, минуя серверную верификацию.
drop policy if exists "insert_own" on public.game_results;

-- 2) crosswords: неопубликованные черновики (вместе с ответами) больше не
--    читаются любым залогиненным юзером напрямую. Админка ходит через service role.
drop policy if exists "auth_read_all" on public.crosswords;

-- 3) profiles.username: charset теперь и на уровне БД (раньше только в API,
--    прямой update через anon-клиент обходил валидацию).
alter table public.profiles drop constraint if exists profiles_username_charset_check;
alter table public.profiles add constraint profiles_username_charset_check
  check (username is null or username ~ '^[a-zA-Zа-яёА-ЯЁ0-9_]+$');

-- 4) themes_custom.updated_at: триггер из миграции 007 не создался — функция
--    называется touch_updated_at, а не set_updated_at.
drop trigger if exists themes_custom_updated_at on public.themes_custom;
create trigger themes_custom_updated_at
  before update on public.themes_custom
  for each row execute function public.touch_updated_at();
