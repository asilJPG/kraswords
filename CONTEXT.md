# Контекст для продолжения работы

Файл обновляется при каждом `git push`. Если открыл на другом компе — читай этот файл первым после `git pull`.

Last update: 2026-06-15 (themes & decorations system WIP, hero card, visual effects)

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
│   ├── crosswords.ts  — 220 строк: типы, themes (палитры тем), verifyAnswers, getDifficultyColor/Bg
│   └── gameHistory.ts — localStorage achievements + история игр (legacy, мигрировать когда нужно)
│
├── components/
│   ├── game/          — CrosswordGame (~200 строк) + Grid/Cell/CluesList/ClueBanner/GameNav/GameControls/HiddenInput + CornerObject + effects/* + hooks/*
│   ├── admin/         — CrosswordEditor + EditorGrid/EditorCell/WordList/AddWordForm/MetaForm/PublishToggle/DeleteButton/LogoutButton/HideMainNav + ThemeEditor/ThemeForm/ThemeDeleteButton/ImageUploader + hooks
│   ├── profile/       — BannerEditor, AvatarPicker
│   ├── login/         — LoginForm
│   ├── BottomSheet, ResultSheet, EventBanner, CrosswordList, Nav, ThemeToggle, ConfirmDialog
│
├── app/
│   ├── page.tsx (главная, force-dynamic)
│   ├── play/[id]/page.tsx
│   ├── login/page.tsx + layout.tsx
│   ├── admin/{layout, page, new/page, edit/[id]/page, themes/page, themes/new/page, themes/[id]/page}.tsx
│   ├── profile/{page, ProfileClient}.tsx
│   ├── setup-profile/{page, SetupForm}.tsx
│   ├── top/page.tsx
│   └── api/
│       ├── admin/crosswords/{route, [id]/route}.ts (GET, POST, PATCH публикация/snять, DELETE)
│       ├── check/route.ts          (использует fetchCrosswordById)
│       ├── game-result/route.ts    (сервер сам верифицирует через verifyAnswers)
│       ├── leaderboard/route.ts
│       ├── resolve-login/route.ts  (email или username → email, generic 401 на любую неудачу)
│       ├── setup-profile/route.ts  (server-side validation + insert)
│       ├── update-profile/route.ts (PATCH avatar/etc — jsonb)
│       ├── upload-banner/route.ts
│       ├── upload-hero/route.ts        (POST FormData: file+kind → heroes bucket, admins only, ≤1.5MB)
│       ├── admin/themes/{route, [id]/route}.ts (CRUD для кастомных тем)
│       └── admin/import-crossword/route.ts (POST для bulk import через Bearer токен)
│
└── proxy.ts — корневой middleware (Next 16: proxy)
```

## Env vars (`.env.local` + Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=https://rpxowoodkjdjhouppiky.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…  ← КРИТИЧНО, без него API крашатся
IMPORT_API_KEY=…              ← для bulk import кроссвордов через POST (опционально)
```

`ADMIN_EMAILS` НЕ нужен — переключились на `profiles.role`.

## SQL для прогона

В Supabase SQL Editor по порядку (если не прогонял):
1. `supabase/schema.sql` (таблицы + RLS)
2. `supabase/seed.sql` (опционально, демо-кроссворды)
3. `supabase/migrations/001_game_results_unique.sql` (UNIQUE constraint на (user_id, crossword_id))
4. `supabase/migrations/002_profile_avatar.sql` (jsonb avatar column)
5. `supabase/migrations/003_crossword_theme_custom.sql` (theme_custom для кастомных палитр)
6. `supabase/migrations/004_crosswords_admin_only.sql` (RLS на crosswords — только admin может писать; критичный security fix)
7. `supabase/migrations/005_admin_users_table.sql` (роли вынесены в admin_users; profiles.role удалена; список админов больше не утекает)
8. `supabase/migrations/006_drop_author_column.sql` (удалена неиспользуемая колонка author из crosswords)
9. `supabase/migrations/007_themes_and_decorations.sql` (таблица `themes_custom` + RLS + bucket `heroes`)

Storage bucket `banners` — создаётся вручную в Supabase Dashboard → Storage (политики раскомментированы в schema.sql).
Storage bucket `heroes` — для hero-изображений и corner-объектов тем (public read, admin upload). Создаётся вручную.

**Назначить себя админом (после миграции 005):**
```sql
insert into public.admin_users (user_id)
select id from public.profiles where username = '<твой_ник>';
```

**Обновить ограничение юзернеймов до 4-20 символов с исключениями ('1', '2', 'a'):**
```sql
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_check CHECK ((char_length(username) between 4 and 20) OR username IN ('1', '2', 'a'));
```

## Что готово (с фокусом на launch)

- ✅ Регистрация/вход email или username, человеческие ошибки
- ✅ /admin только для role='admin', SQL-промоут
- ✅ Редактор-конструктор + autosave + проверка связности слов
- ✅ Кастомные палитры (`theme_custom` jsonb) + живой preview в редакторе
- ✅ PublishToggle в списке /admin: 1 клик, inline-ошибка с авто-исчезновением (3s)
- ✅ DeleteButton: кастомный `ConfirmDialog` модал (Esc/Enter, scroll lock, danger variant)
- ✅ Server-verify решения через `fetchCrosswordById` из БД (не локалка)
- ✅ Game results dedupe (UNIQUE constraint, лучшее время)
- ✅ Banner upload: 500KB, MIME whitelist, JPEG q=0.9, canvas 1600×540
- ✅ Banner editor: серая подложка канваса с границей
- ✅ AvatarPicker: emoji-сетка 6×N, расширяемо под характеры (jsonb {type:'emoji'} now → {type:'character'} later)
- ✅ Лидерборд (`/top`) — игроки + кроссворды
- ✅ Профиль с историей, ачивками, банером, аватаром, кнопкой "выйти"
- ✅ Тёмная тема через CSS vars (main, /top, /profile, /login, /setup, /admin, ResultSheet, BottomSheet, ConfirmDialog)
- ✅ ResultSheet Duolingo-style: конфетти, поэтапная анимация, кнопка share только если есть `navigator.share`
- ✅ Mobile keyboard fix (iOS Safari): HiddenInput в видимой области + sync focus
- ✅ HSTS, password ≥8, generic 401, RLS, UNIQUE constraints
- ✅ Чистка legacy: убран массив старых кроссвордов и шаблон `P` из `crosswords.ts` (381 → 179 строк)
- ✅ Удалена `/events` страница (mockEvents больше нет)
- ✅ Переведен хардкод цветов на CSS-переменные в 7 файлах админки (с сохранением необходимых сигнальных цветов в ячейках)
- ✅ Юзернеймы обычных пользователей ограничены 4–20 символами, с поддержкой коротких исключений ('1', '2', 'a') на клиенте, сервере и в БД
- ✅ Server-side валидация шейпа/размера в `/api/game-result` (50KB) и `/api/admin/crosswords` POST (200KB, полная схема clues)
- ✅ Роли вынесены в `admin_users` (мигр. 005) — список админов больше не утекает через `select role from profiles`
- ✅ Bulk import endpoint `/api/admin/import-crossword` (Bearer токен IMPORT_API_KEY, до 50 кроссвордов за раз)
- ✅ Profile показывает заголовок кроссворда (через embedded join) вместо технического slug
- ✅ Proxy оптимизирован: skip `/api/*` и публичных страниц (нет сетевого `getUser()` на главной и /top → ~150ms на навигацию)
- ✅ Loading skeletons (`loading.tsx`) для `/profile`, `/admin`, `/top`, `/play/[id]` — мгновенный отклик навигации
- ✅ Дропнута колонка `author` из crosswords (миграция 006, убрана из типов/API/редактора/seed)
- ✅ Гостевая игра: `/play` доступен без логина, после решения — CTA «войди, чтобы сохранить результат»
- ✅ SEO-оптимизация: добавлены `robots.ts` и `sitemap.ts` для индексации кроссвордов, настроены rich-метаданные и заглушка верификации домена в `layout.tsx`.
- ✅ Кастомная иконка сайта: удален дефолтный `favicon.ico` от Vercel и создана новая SVG-иконка.
- ✅ Hero-карточка «Кроссворд дня» на главной для темы Рик и Морти (коммит `2362d05`)

## 🚧 В процессе (НЕ закоммичено)

Система **тем и декораций** — позволяет админам создавать переиспользуемые визуальные темы:

- **Миграция 007** — таблица `themes_custom` (id, name, config jsonb, RLS admin-only write)
- **Admin UI** — `/admin/themes` CRUD: список, создание, редактирование (`ThemeEditor`, `ThemeForm`, `ThemeDeleteButton`, `ImageUploader`)
- **API** — `/api/admin/themes` GET/POST, `/api/admin/themes/[id]` GET/PATCH/DELETE; `/api/upload-hero` для загрузки hero/corner изображений
- **CornerObject** — плавающий декоративный элемент в игре (позиция, размер, анимация float/pulse)
- **Эффекты** — `Lightning.tsx`, `Rain.tsx`, `Stars.tsx`, `MagicSparkles.tsx`, `Particles.tsx`, `PortalDrips.tsx` в `src/components/game/effects/`
- **Изменения в существующих файлах** — `CrosswordGame.tsx` (подключение эффектов/corner), `crosswords.ts` (новые типы тем), `globals.css` (анимации corner-float/corner-pulse), `admin/layout.tsx` (ссылка на /admin/themes)

**Статус:** код написан, но НЕ закоммичен. Миграция 007 НЕ применена на проде. Bucket `heroes` нужно создать вручную.

## Известные мелочи / pending

- [ ] **Cell/ClueBanner/GameControls/CrosswordList** — themed по теме кроссворда (Рик и Морти, etc), не light/dark. By design — НЕ трогать.
- [ ] **gameHistory.ts** — у залогиненных `ResultSheet` всё ещё читает прогресс ачивок из localStorage. Чистить когда переходим на server-side achievements (когда ачивки начнут давать привилегии).

## Отложено на post-launch

- CSP nonces (у нас `unsafe-inline` в `next.config.ts`)
- CSRF tokens (SameSite=Lax дефолт даёт базовый)
- Rate limit на /login (нужна Upstash/Vercel KV)
- Audit log админ-действий
- Пагинация лидерборда (top-10 хардкод)
- Server-side achievements (когда ачивки начнут давать реальные привилегии)
- Forgot password / email verification callback
- OG image / реальный домен (favicon уже сделан)
- Custom SMTP + русские email-шаблоны (Resend/Mailgun, нужен свой домен; Site URL уже настроен на прод)

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
4. Неправильный пароль → "Неверный логин или пароль" (generic)

B. Админка
5. SQL: промоутни себя
6. `/admin` → пускает
7. `/admin/new` → создать кроссворд из 4 связанных слов → сохранить
8. В списке → нажать "опубликовать" → сразу появляется на `/`
9. Попробовать сохранить кроссворд с несвязанным словом → красная ошибка, сирота красным
10. Кликнуть × → кастомный модал подтверждения → удалить → удалилось
11. Переключить тёмную тему → /admin/* должна нормально читаться

C. Игра
12. Открыть кроссворд с `/` → решить → ResultSheet с конфетти
13. На десктопе кнопки share не должно быть, только "продолжить →"
14. На мобиле — должны быть обе кнопки
15. `/top` → твой результат в лидерборде
16. `/profile` → стата + кликнуть аватар → emoji picker → сохранить

D. Mobile
17. Открыть на телефоне → тапнуть ячейку → клава должна вылезти
18. Решить → должен показать sheet с поделиться

E. Безопасность
19. DevTools → перехватить POST `/api/game-result` → отправить пустые answers → должен записать solved=false
20. `/api/admin/crosswords` без auth → 401

## Деплой

GitHub master → Vercel автодеплой. Прод: `https://words-eta-ruby.vercel.app`
