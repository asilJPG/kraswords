# Контекст для продолжения работы

Файл обновляется при каждом `git push`. Если открыл на другом компе — читай этот файл первым после `git pull`.

Last update: 2026-07-06 (полный аудит + security/логические фиксы, BUSINESS_STRATEGY.md)

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
│       ├── admin/crosswords/{route, [id]/route}.ts (GET, POST, PATCH публикация/snять, DELETE; валидация через lib/crossword/validate.ts)
│       ├── game-result/route.ts    (сервер сам верифицирует через verifyAnswers)
│       ├── login/route.ts          (login+password → server-side sign-in; email наружу не отдаётся, generic 401)
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
10. `supabase/migrations/008_security_fixes.sql` — **⚠️ НЕ ПРИМЕНЕНА, прогнать при первой возможности**: дроп `insert_own` на game_results (читерский прямой insert), дроп `auth_read_all` на crosswords (черновики с ответами были видны залогиненным), charset CHECK на username, фикс триггера updated_at для themes_custom

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

## 🚧 Закоммичено, но НЕ активировано на проде

Система **тем и декораций** (коммит `13f61ec`, 1055 строк):

- **Миграция 007** — таблица `themes_custom` (id, name, config jsonb, RLS admin-only write) — **НЕ применена на проде**
- **Admin UI** — `/admin/themes` CRUD: список, создание, редактирование (`ThemeEditor`, `ThemeForm`, `ThemeDeleteButton`, `ImageUploader`)
- **API** — `/api/admin/themes` GET/POST, `/api/admin/themes/[id]` GET/PATCH/DELETE; `/api/upload-hero` для загрузки hero/corner изображений
- **CornerObject** — плавающий декоративный элемент в игре (позиция, размер, анимация float/pulse)
- **Эффекты** — `Lightning.tsx`, `Rain.tsx`, `Stars.tsx`, `MagicSparkles.tsx`, `Particles.tsx`, `PortalDrips.tsx` в `src/components/game/effects/`

**Чтобы активировать:**
1. Применить `supabase/migrations/007_themes_and_decorations.sql` в Supabase SQL Editor
2. Создать bucket `heroes` (public) в Supabase Dashboard → Storage
3. Добавить storage policies для `heroes` (admin upload, public read) — SQL в конце миграции 007 в комментариях

## Code review (2026-06-16) — пофикшено

- ✅ **Open Redirect** в `auth/callback/route.ts` — валидация `next` (только `/`, не `//`)
- ✅ **URL injection** в `play/[id]/opengraph-image.tsx` — `encodeURIComponent(id)`
- ✅ **CDN failure = 500** в обоих `opengraph-image.tsx` — `.catch(() => null)` + fallback без шрифта
- ✅ **Non-array response** в `play/[id]/opengraph-image.tsx` — `Array.isArray` проверка
- ✅ **Loading stuck** в `LoginForm.tsx` — `try/catch` вокруг profiles query
- ✅ **Дублирующая/мёртвая валидация** в `LoginForm.tsx` — упрощена в один if
- ✅ **Мутация массива** в `ProfileClient.tsx` — `solved.sort` → `[...new Set(days)].sort`
- ✅ **Streak по уникальным дням** в `ProfileClient.tsx` — дедупликация по дате перед расчётом
- ✅ **key=index** в history list — `key={record.id + record.date}`

Остаётся (не критично):
- `update-profile/route.ts` — не проверяется `count` при update (silent no-op если профиля нет)
- `LoginForm.tsx:81` — signup не атомарен (user создаётся до profile)
- `LoginForm.tsx:34` — `window.location.origin` потенциально не SSR-safe (не критично, компонент `'use client'`)

## Аудит 2026-07-06 — пофикшено

Security:
- ✅ **Утечка email** — `/api/resolve-login` отдавал email по нику любому. Удалён; вход теперь целиком через новый `/api/login` (login+password → sign-in на сервере, куки ставит серверный клиент, generic 401). `LoginForm` переведён на него.
- ✅ **RLS-фиксы** — миграция 008 (см. выше, ⚠️ прогнать в SQL Editor): прямой insert в game_results, чтение черновиков, charset юзернейма в БД.
- ✅ Удалены мёртвые эндпоинты `/api/check` и `/api/leaderboard` (нигде не вызывались; check был оракулом для перебора букв без auth/rate-limit).
- ✅ Удалены мусорные файлы `test_cookie.mjs`, `_tests/`.

Логика:
- ✅ **Счётчик solvers недосчитывал** — если первая попытка была неудачной, при решении инкремент не срабатывал (`game-result/route.ts`). Теперь «первое решение» = нет записи ИЛИ запись была unsolved.
- ✅ **Повторный onSolved** — после решения можно было перепечатать букву → дублирующий POST и переоткрытие ResultSheet. Guard на `solved` в `useCrosswordInput`.
- ✅ **Вечный стрик** — серия в профиле не сбрасывалась, если последнее решение было давно. Теперь 0, если последний день решения не сегодня/вчера.
- ✅ **Ачивка «3 дня подряд» за 3 решения в один день** — diff<=1 считал тот же день продолжением серии. Дедупликация по дням + строгий diff===1 (ProfileClient + gameHistory).
- ✅ **Ластик баннера рисовал чёрным** — destination-out делал прозрачные дыры, JPEG превращал их в чёрные мазки. Ластик теперь рисует цветом подложки #f5f5f5.
- ✅ **Таймер занижал время** — считал тики setInterval (троттлятся в фоне); теперь от Date.now() с накоплением при паузе.
- ✅ **Валидатор кроссвордов** — вынесен в общий `src/lib/crossword/validate.ts` (был скопипащен в 2 роута) + новые проверки решаемости: слово не выходит за сетку, ответы только А-Я/A-Z uppercase, конфликты букв на пересечениях.

Известное, отложено осознанно:
- Время решения по-прежнему клиентское + ответы приходят в payload → топ фальсифицируем упорным читером. Честный тайминг = server-side (post-launch).
- `/top` и профиль тянут все game_results без агрегации в SQL — ок до ~тысяч записей.
- Ники-исключения '1', '2', 'a' может занять кто угодно.
- Домен: metadataBase/sitemap/robots указывают на красвордс.com (xn--80aegvwjdfe.com), прод пока на words-eta-ruby.vercel.app — **подключить домен** (первый пункт роадмапа в BUSINESS_STRATEGY.md).

## Бизнес-стратегия

См. `BUSINESS_STRATEGY.md` — позиционирование, каналы роста (SEO, Telegram, фандомные сообщества, короткие видео), retention-механики (стрик, челлендж дня, шеринг картинкой), монетизация, метрики и роадмап 30/60/90.

## Фикс билда (2026-06-17)

- ✅ **`next build` падал** на `/opengraph-image` и `/play/[id]/opengraph-image`: `Error: Unsupported OpenType signature wOF2` — Satori (рендерер `next/og`) не понимает `.woff2`, только `.woff`/`.ttf`/`.otf`. Поменяли источник шрифта с `inter-*.woff2` на `inter-*.woff` на Bunny Fonts CDN в обоих файлах.
- ✅ Убраны случайно закоммиченные мусорные файлы `settings.json` и `statusline-command.sh` (артефакты настройки статус-лайна Claude Code, попали в репо по ошибке в прошлом коммите).
- ⚠️ **Важно на будущее:** если добавляешь шрифты для `next/og` — всегда `.woff`/`.ttf`, никогда `.woff2`. `npm run build` нужно гонять перед пушем фич с `ImageResponse`, т.к. ошибка не ловится тайпчеком, только реальным build/prerender.

## Сделано сегодня (2026-07-07)

- ✅ **Hero-превью для всех кроссвордов** — сгенерированы бесплатно через pollinations.ai (никаких кредитов): wide 1920×800 + portrait 1080×1350 для Атаки Титанов, Магической Битвы, Блю-Лока, Пацанов (обе записи) и Бумажного Дома. Залиты в bucket `heroes`, прописаны в `theme_custom.heroImage`. Стилизации без прямых копирайтных персонажей.
- ✅ **Скрипт `scripts/gen-hero.mjs`** — новое превью одной командой: `node scripts/gen-hero.mjs <id> "<промпт>"` (генерация → bucket → theme_custom). Больше не «долго и заебишно».
- ✅ **Генератор превью в админке** — `HeroGenerator` в `MetaForm` редактора: поле промпта → «сгенерировать» (wide+portrait, предпросмотр) → «применить» (upload через `/api/upload-hero`, heroImage в theme_custom, сохраняется автосейвом). Генерация в браузере админа (нет серверных таймаутов), pollinations.ai добавлен в CSP connect-src. Проверено: tsc + build; e2e в админке руками не гонял (нет админ-креды в сессии) — Асилу глянуть при случае.
- ✅ **Автосборка всей темы из картинки** — главный анлок для «каждая страница уникальная без ручной возни»: `src/lib/crossword/theme-from-image.ts` вытаскивает доминирующие цвета из hero-арта и по рецепту рик-и-морти-темы строит весь theme_custom (тёмный фон, неоновый акцент, клетки, glow) + подбирает эффект по хуе (синева→stars, золото→sparkles, зелень→portal-drips, серое→rain). В админке — чекбокс «🪄 собрать всю тему из картинки» (вкл. по умолчанию) в HeroGenerator. Итоговый конвейер: **промпт → картинка → готовая страница**.
- ✅ Палитры применены ко всем 6 записям в базе (theme_id='custom'), визуально проверено на Блю-Локе — тёмно-синий + электрик, звёзды.
- 💡 Правило: только бесплатные генераторы, платные API (Higgsfield) не трогаем.

- ✅ **Подсказки в игре** (топ-1 бэклога): кнопка 💡 в `GameControls`, 3 за игру, открывает букву в выбранной клетке → в активном слове → первую пустую по сетке; сброс восстанавливает; `revealLetter` в `useCrosswordInput`. Проверено в браузере: 3→0, кнопка гаснет, solved срабатывает.
- ✅ **Hydration mismatch во всех эффектах** — `Math.random()` в рендере (Stars/Rain ещё и без useMemo → дрожание при каждом вводе). Новый хук `effects/useClientRandom.ts`: генерация один раз после маунта, SSR-пусто. Ошибки в консоли ушли.
- ⚠️ **На проде ноль опубликованных кроссвордов** — все 7 в базе published=false, главная показывает «пока пусто». Ждём решения Асила какие публиковать. Это блокер запуска № 1.
- Для теста временно публиковался/снят `my-cross-1`.
- Напоминание: миграция 008 всё ещё не прогнана; домен не подключён.

## Сделано сегодня (2026-07-06)

- ✅ **Полный аудит сайта** — API, RLS-схема, миграции, auth, игровая логика, клиент (детали в секции «Аудит 2026-07-06» выше)
- ✅ Новый `/api/login` — вход целиком на сервере, email по нику больше не утекает; `LoginForm` переведён, старый `/api/resolve-login` удалён
- ✅ Миграция `008_security_fixes.sql` — **⚠️ ещё НЕ прогнана в Supabase SQL Editor, сделать!**
- ✅ 7 логических багов пофикшено: solvers, дубль onSolved, вечный стрик, ачивка streak_3, ластик баннера, таймер в фоне, валидатор кроссвордов (общий + проверки решаемости)
- ✅ Удалены мёртвые `/api/check`, `/api/leaderboard`, мусорные `test_cookie.mjs`, `_tests/`
- ✅ **BUSINESS_STRATEGY.md** — стратегия роста: позиционирование, каналы, retention-механики, монетизация, метрики, роадмап 30/60/90
- Проверено: `tsc` чистый, `npm run build` проходит, логин-флоу протестирован в браузере (форма → generic 401)
- Следующие шаги: прогнать миграцию 008 → подключить домен красвордс.com к Vercel → подсказки в игре (роадмап 30 дней в стратегии)

## Сделано сегодня (2026-06-16)

- ✅ Bucket `heroes` создан (public), storage policies применены → система тем полностью активна
- ✅ Логотип KRS (чёрный квадрат) в Nav + иконка сайта обновлена
- ✅ SEO: `generateMetadata` для `/play/[id]` (title, description, canonical, OG, Twitter card)
- ✅ `fetchCrosswordById` обёрнут в `cache()` — нет двойного запроса к Supabase
- ✅ **Forgot password** — `/auth/callback` + `/reset-password`, ссылка "забыл пароль?" в LoginForm
- ✅ **Настройки профиля** — bottom sheet: смена юзернейма + смена пароля
- ✅ **История игр** — клик по строке открывает result sheet вместо перехода на кроссворд
- ✅ **OG images** — `opengraph-image.tsx` для главной и каждого кроссворда (Inter Cyrillic, dark bg)

## Известные мелочи / pending

- [ ] **Cell/ClueBanner/GameControls/CrosswordList** — themed по теме кроссворда (Рик и Морти, etc), не light/dark. By design — НЕ трогать.
- [ ] **gameHistory.ts** — у залогиненных `ResultSheet` всё ещё читает прогресс ачивок из localStorage. Чистить когда переходим на server-side achievements (когда ачивки начнут давать привилегии).

## Backlog фич (приоритет сверху вниз)

### Высокий приоритет
- [ ] **Подсказка в игре** — кнопка "подсказать букву" в `GameControls` (max 2-3 за игру), снижает фрустрацию новичков
- [ ] **Автосохранение игры** — при закрытии браузера сохранять прогресс в localStorage, при возврате предлагать "продолжить"
- [ ] **Фильтр "только не решённые"** — на главной, тоггл чтобы видеть только новый контент
- [ ] **Оценка кроссворда ⭐** — после решения форма "оценить 1-5 звёзд", собирать в БД, сортировать по рейтингу
- [ ] **Статистика по сложности** — в профиле: % решённых и среднее время для easy/medium/hard

### Средний приоритет
- [ ] **Экспорт результата как картинка** — скачать PNG с временем, эмодзи, местом в топе (усилит шеринг)
- [ ] **"Лучшее время" метка** — в истории игр иконка если текущий результат лучше предыдущего
- [ ] **Медаль топ-10 на профиле** — если игрок в топ-10 по кол-ву решённых
- [ ] **Отбор по сложности на главной** — горизонтальный скролл Easy/Medium/Hard помимо категорий

### Низкий приоритет / амбициозные
- [ ] **Ежедневный челлендж** — серия из 3-5 кроссвордов, бонус-ачивка, отдельный топ
- [ ] **PWA уведомления** — подписка на уведомления при публикации нового кроссворда
- [ ] **Анимация раскрытия сетки** — плавное появление клеток снизу вверх при старте игры
- [ ] **Тултип горячих клавиш** — при первом входе в игру, запомнить в localStorage

## Отложено на post-launch

- CSP nonces (у нас `unsafe-inline` в `next.config.ts`)
- CSRF tokens (SameSite=Lax дефолт даёт базовый)
- Rate limit на /login (нужна Upstash/Vercel KV)
- Audit log админ-действий
- Server-side achievements (когда ачивки начнут давать реальные привилегии)
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
