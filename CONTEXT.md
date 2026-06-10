# Контекст для продолжения работы

Файл обновляется при каждом `git push`. Если открыл на другом компе — читай этот файл первым после `git pull`.

Last update: 2026-06-10 (Feature: Custom styling builder via theme_custom + Live Preview in admin editor)

---

## Стек

- Next.js **16.2.7** (Turbopack) — middleware переименован в **proxy** (файл `src/proxy.ts`, экспорт функции `proxy`)
- React 19, TypeScript
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`), auth + Postgres + Storage
- Inline styles только (НЕ Tailwind в компонентах — Tailwind в `globals.css` есть как `@import`, но в JSX inline)
- lucide-react для иконок в Nav (только мобилка)
- Тёмная тема через CSS vars (`--bg`, `--text`, `--surface`, etc.) — переключается `data-theme="dark"` на html

## Архитектура

```
src/
├── lib/
│   ├── crossword/     — pure: types, grid, clue-utils, format, editor, api (client), server-api, row-to-data
│   ├── supabase/      — client, server, proxy (middleware), types, admin-client (service role)
│   ├── admin-auth.ts  — isUserAdmin(supabase, userId) проверяет profiles.role==='admin'
│   ├── auth-errors.ts — humanizeAuthError() Supabase ошибки → русский
│   ├── crosswords.ts  — массив старых хардкод-кроссвордов + themes + verifyAnswers (themes используются, остальное legacy)
│   └── gameHistory.ts — localStorage stats + achievements (legacy, мигрировать на сервер когда понадобится)
│
├── components/
│   ├── game/          — CrosswordGame (оркестратор ~200 строк) + Grid/Cell/CluesList/ClueBanner/GameNav/GameControls/HiddenInput + effects/* + hooks/*
│   ├── admin/         — CrosswordEditor + EditorGrid/EditorCell/WordList/AddWordForm/MetaForm/PublishToggle/DeleteButton/LogoutButton/HideMainNav + hooks
│   ├── profile/       — BannerEditor
│   ├── login/         — LoginForm
│   ├── BottomSheet, ResultSheet, EventBanner, CrosswordList, Nav, ThemeToggle
│
├── app/
│   ├── page.tsx (главная, force-dynamic)
│   ├── play/[id]/page.tsx
│   ├── login/page.tsx + layout.tsx
│   ├── admin/{layout, page, new/page, edit/[id]/page}.tsx
│   ├── profile/{page, ProfileClient}.tsx
│   ├── setup-profile/{page, SetupForm}.tsx
│   ├── top/page.tsx
│   ├── events/page.tsx
│   └── api/
│       ├── admin/crosswords/{route, [id]/route}.ts (GET, POST, PATCH, DELETE)
│       ├── check/route.ts
│       ├── game-result/route.ts  (СЕРВЕР сам верифицирует, клиент шлёт answers)
│       ├── leaderboard/route.ts
│       ├── resolve-login/route.ts  (email или username → email)
│       ├── setup-profile/route.ts  (server-side validation + insert)
│       └── upload-banner/route.ts
│
└── proxy.ts — корневой middleware (Next 16: proxy)
```

## Env vars (`.env.local` + Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=https://rpxowoodkjdjhouppiky.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…  ← КРИТИЧНО, без него API крашатся
```

`ADMIN_EMAILS` больше не нужен — переключились на `profiles.role`.

## SQL для прогона

Прогнать в Supabase SQL Editor по порядку (если не прогонял):
1. `supabase/schema.sql` (таблицы + RLS)
2. `supabase/seed.sql` (опционально, демо-кроссворды)
3. `supabase/migrations/001_game_results_unique.sql` (UNIQUE constraint на (user_id, crossword_id))

Storage bucket `banners` — создаётся вручную в Supabase Dashboard → Storage (политики раскомментированы в schema.sql).

**Назначить себя админом:**
```sql
update profiles set role = 'admin' where username = '<твой_ник>';
```

## Что готово (с фокусом на launch)

- ✅ Регистрация/вход email или username, человеческие ошибки
- ✅ /admin только для role='admin', SQL-промоут
- ✅ Редактор-конструктор + autosave + проверка связности слов
- ✅ PublishToggle в списке /admin (1 клик)
- ✅ Server-verify решения (нельзя зафейкать solved)
- ✅ Game results dedupe (UNIQUE constraint, лучшее время)
- ✅ Banner upload: 500KB лимит, MIME whitelist, через /api/upload-banner
- ✅ Banner editor: канвас 1600×540, JPEG, серая подложка с границей
- ✅ Лидерборд (`/top`) — игроки + кроссворды
- ✅ Профиль с историей, ачивками, кнопкой "выйти"
- ✅ Тёмная тема через CSS vars (главная, /top, /profile, /login, /setup-profile, ResultSheet, BottomSheet)
- ✅ Duolingo-style ResultSheet с конфетти и поэтапной анимацией
- ✅ Mobile keyboard fix (iOS Safari): HiddenInput в видимой области + sync focus
- ✅ HSTS, password ≥8, generic 401 на резолв-логин
- ✅ Кастомизация оформления (цвета, шрифты, эффекты) через БД (`theme_custom`)
- ✅ Интерактивный полноэкранный предпросмотр (Preview) в панели администратора без сохранения в БД

## Известные мелочи / pending

- [ ] **Cell/ClueBanner/GameControls/CrosswordList** — themed по теме кроссворда (Рик и Морти, etc), не light/dark. By design — НЕ трогать.
- [ ] **Админка** (`/admin/*`) — пока хардкод цвета (не на vars). Низкий приоритет, ты единственный админ.
- [ ] **gameHistory.ts** — половина дублирует Supabase (localStorage leaderboard). Чистить когда переходим на server-side achievements.
- [ ] **Колонка `author` в БД** — оставлена с дефолтом 'аноним'. Дропать миграцией когда захочешь.
- [ ] **Старые баннеры** в БД были 600×200 — после фикса canvas 1600×540 они выглядят размытыми. Перерисовать или скрипт обновить.

## Отложено на post-launch

- CSP nonces (унас `unsafe-inline` в `next.config.ts`)
- CSRF tokens (SameSite=Lax дефолт даёт базовый)
- Rate limit на /login (нужна Upstash/Vercel KV)
- Audit log админ-действий
- Пагинация лидерборда
- Server-side achievements (когда ачивки начнут давать реальные привилегии)
- Forgot password / email verification callback
- OG image / favicon / реальный домен

## Запуск локально

```bash
git pull
npm install
npm run dev
```

Открыть http://localhost:3000. SQL миграции и `.env.local` должны быть применены.

## Тестовый чек-лист (e2e на проде)

A. Auth
1. `/login` → "нет аккаунта?" → зарегаться → редирект на `/setup-profile` или `/`
2. Выйти → войти по **username** + password
3. Выйти → войти по **email** + password
4. Неправильный пароль → "Неверный логин или пароль"

B. Админка
5. SQL: промоутни себя
6. `/admin` → пускает
7. `/admin/new` → создать кроссворд из 4 связанных слов → сохранить
8. В списке → нажать "опубликовать" → сразу появляется на `/`
9. Попробовать сохранить кроссворд с несвязанным словом → красная ошибка, сирота красным

C. Игра
10. Открыть кроссворд с `/` → решить → ResultSheet с конфетти
11. `/top` → твой результат в лидерборде
12. `/profile` → стата + кнопка "выйти"

D. Mobile
13. Открыть на телефоне → тапнуть ячейку → клава должна вылезти
14. Решить → должен показать sheet с поделиться

E. Безопасность
15. DevTools → перехватить POST `/api/game-result` → отправить пустые answers → должен записать solved=false
16. `/api/admin/crosswords` без auth → 401

## Деплой

GitHub master → Vercel автодеплой. Прод: `https://words-eta-ruby.vercel.app`
