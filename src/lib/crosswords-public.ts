export type Direction = 'across' | 'down'

export interface CluePublic {
  number: number
  direction: Direction
  clue: string
  row: number
  col: number
  length: number
}

export interface ThemeConfig {
  id: string
  name: string
  bg: string
  bgImage?: string
  pageBg: string
  textColor: string
  mutedColor: string
  cellBg: string
  cellBorder: string
  cellText: string
  cellActiveBg: string
  cellHighlightBg: string
  blackCellBg: string
  accentColor: string
  clueActiveBg: string
  navBg: string
  navBorder: string
  fontFamily?: string
  particleColor?: string
  glowColor?: string
}

export interface CrosswordDataPublic {
  id: string
  title: string
  author: string
  date: string
  difficulty: 'лёгкий' | 'средний' | 'сложный'
  emoji: string
  size: number
  clues: CluePublic[]
  solvers: number
  theme: ThemeConfig
  wordCount: number
  category: string
}

export const themes: Record<string, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'Классика',
    bg: '#ffffff',
    pageBg: '#fafafa',
    textColor: '#111827',
    mutedColor: '#9ca3af',
    cellBg: '#ffffff',
    cellBorder: '#d1d5db',
    cellText: '#111827',
    cellActiveBg: '#dbeafe',
    cellHighlightBg: '#eff6ff',
    blackCellBg: '#1f2937',
    accentColor: '#3b82f6',
    clueActiveBg: '#eff6ff',
    navBg: 'rgba(255,255,255,0.9)',
    navBorder: '#f3f4f6',
  },
  rickmorty: {
    id: 'rickmorty',
    name: 'Рик и Морти',
    bg: '#0a1628',
    bgImage: 'radial-gradient(ellipse at 30% 20%, #1a3a2a 0%, #0a1628 60%)',
    pageBg: '#070e1a',
    textColor: '#c0ffc0',
    mutedColor: '#39ff1480',
    cellBg: 'rgba(16, 42, 36, 0.85)',
    cellBorder: '#39ff14',
    cellText: '#39ff14',
    cellActiveBg: 'rgba(57, 255, 20, 0.25)',
    cellHighlightBg: 'rgba(57, 255, 20, 0.1)',
    blackCellBg: '#061210',
    accentColor: '#39ff14',
    clueActiveBg: 'rgba(57, 255, 20, 0.15)',
    navBg: 'rgba(7, 14, 26, 0.9)',
    navBorder: '#39ff1420',
    fontFamily: '"Courier New", monospace',
    particleColor: '#39ff14',
    glowColor: '#39ff14',
  },
  harrypotter: {
    id: 'harrypotter',
    name: 'Гарри Поттер',
    bg: '#1a0f0a',
    bgImage: 'radial-gradient(ellipse at 50% 0%, #2a1a0f 0%, #1a0f0a 70%)',
    pageBg: '#140b07',
    textColor: '#f5e6c8',
    mutedColor: '#c8a45a80',
    cellBg: 'rgba(42, 30, 18, 0.9)',
    cellBorder: '#c8a45a',
    cellText: '#f5e6c8',
    cellActiveBg: 'rgba(200, 164, 90, 0.3)',
    cellHighlightBg: 'rgba(200, 164, 90, 0.12)',
    blackCellBg: '#0d0804',
    accentColor: '#c8a45a',
    clueActiveBg: 'rgba(200, 164, 90, 0.15)',
    navBg: 'rgba(20, 11, 7, 0.9)',
    navBorder: '#c8a45a20',
    fontFamily: 'Georgia, serif',
    particleColor: '#ffd700',
    glowColor: '#c8a45a',
  },
}

// Standard 13x13 layout used by all crosswords.
const P = [
  { n: 1,  d: 'across' as Direction, r: 0,  c: 0, l: 5 },
  { n: 2,  d: 'down'   as Direction, r: 0,  c: 6, l: 4 },
  { n: 3,  d: 'down'   as Direction, r: 0,  c: 7, l: 4 },
  { n: 4,  d: 'across' as Direction, r: 1,  c: 8, l: 5 },
  { n: 5,  d: 'across' as Direction, r: 3,  c: 0, l: 6 },
  { n: 6,  d: 'down'   as Direction, r: 4,  c: 6, l: 4 },
  { n: 7,  d: 'across' as Direction, r: 4,  c: 7, l: 6 },
  { n: 8,  d: 'across' as Direction, r: 6,  c: 0, l: 5 },
  { n: 9,  d: 'down'   as Direction, r: 6,  c: 5, l: 4 },
  { n: 10, d: 'across' as Direction, r: 7,  c: 8, l: 5 },
  { n: 11, d: 'across' as Direction, r: 9,  c: 0, l: 6 },
  { n: 12, d: 'down'   as Direction, r: 9,  c: 6, l: 4 },
  { n: 13, d: 'across' as Direction, r: 10, c: 7, l: 6 },
  { n: 14, d: 'across' as Direction, r: 12, c: 0, l: 5 },
  { n: 15, d: 'across' as Direction, r: 12, c: 7, l: 6 },
]

function makeCluesPublic(words: [string, string][]): CluePublic[] {
  return P.map((p, i) => ({
    number: p.n,
    direction: p.d,
    clue: words[i][1],
    row: p.r,
    col: p.c,
    length: p.l,
  }))
}

function cwPublic(
  id: string, title: string, author: string, date: string,
  difficulty: CrosswordDataPublic['difficulty'], emoji: string, category: string,
  solvers: number, theme: ThemeConfig,
  words: [string, string][],
): CrosswordDataPublic {
  return {
    id, title, author, date, difficulty, emoji, category,
    size: 13, solvers, wordCount: 15, theme,
    clues: makeCluesPublic(words),
  }
}

export const crosswords: CrosswordDataPublic[] = [
  cwPublic('1', 'Портальные загадки', 'швифти', '2026-06-09', 'средний', '🧪', 'Рик и Морти', 3421, themes.rickmorty, [
    ['МОРТИ', 'Внук учёного, вечно в тревоге'],
    ['ЛИФТ', 'Подъёмник между этажами'],
    ['РОСТ', 'Становиться больше'],
    ['РОБОТ', 'Создан только для масла'],
    ['ПОРТАЛ', 'Зелёное окно в другой мир'],
    ['МОЗГ', 'Главное оружие Рика'],
    ['САММЕР', 'Старшая сестра Морти'],
    ['ГЕНИЙ', 'Кто такой Рик по уму'],
    ['РУКИ', 'Чем Рик собирает изобретения'],
    ['НАУКА', 'Рик верит только в это'],
    ['ДЖЕРРИ', 'Самый бесполезный зять'],
    ['АУРА', 'Энергетическое поле'],
    ['МОНСТР', 'Чудовище с другой планеты'],
    ['ЗЕЛЬЕ', 'Жидкость с побочным эффектом'],
    ['ПЛАЗМА', 'Тип пушки Рика'],
  ]),
  cwPublic('2', 'Измерение C-137', 'швифти', '2026-06-02', 'сложный', '🌀', 'Рик и Морти', 1823, themes.rickmorty, [
    ['КЛОНЫ', 'Копии из параллельного мира'],
    ['ТЬМА', 'Кромешная темнота'],
    ['СТУЛ', 'Предмет мебели'],
    ['ПУШКА', 'Огнестрельное оружие учёного'],
    ['МУТАНТ', 'Изменённое существо'],
    ['ПЛОТ', 'Плавучее средство'],
    ['КОМЕТЫ', 'Хвостатые небесные тела'],
    ['ВИРУС', 'Невидимый враг организма'],
    ['ТЕМА', 'Предмет обсуждения'],
    ['КРЫСА', 'Обитатель канализации'],
    ['КЛЕТКА', 'Тюрьма для пришельца'],
    ['ДИСК', 'Носитель информации'],
    ['ЗАЩИТА', 'Силовое поле вокруг корабля'],
    ['ЛАЗЕР', 'Луч высокой энергии'],
    ['КОСМОС', 'Бесконечное пространство'],
  ]),
  cwPublic('3', 'Швифти-викторина', 'швифти', '2026-05-28', 'лёгкий', '💚', 'Рик и Морти', 5102, themes.rickmorty, [
    ['ТАНЕЦ', 'Рик любит двигаться'],
    ['ТОРТ', 'Праздничное угощение'],
    ['ЛУНА', 'Спутник ночного неба'],
    ['КОЛБА', 'Лабораторная посуда'],
    ['УЧЕНИК', 'Морти в роли помощника'],
    ['НОТА', 'Музыкальный знак'],
    ['ВНУЧКА', 'Саммер для Рика'],
    ['МАСЛО', 'Единственная цель робота'],
    ['УКАЗ', 'Официальное распоряжение'],
    ['КРОВЬ', 'Течёт в жилах пришельцев'],
    ['ПРИКАЗ', 'Рик отдаёт, Морти выполняет'],
    ['СЛОН', 'Большое животное'],
    ['КНОПКА', 'Нажимаешь на пульте'],
    ['СИРОП', 'Сладкая густая жидкость'],
    ['РАКЕТА', 'Летательный аппарат'],
  ]),

  cwPublic('4', 'Магические слова', 'дамблдор', '2026-06-08', 'средний', '⚡', 'Гарри Поттер', 2891, themes.harrypotter, [
    ['МЕТЛА', 'Летает по небу'],
    ['ПЫЛЬ', 'Оседает на полках замка'],
    ['ВИЗГ', 'Крик мандрагоры'],
    ['ДОББИ', 'Свободный домашний эльф'],
    ['ФЕНИКС', 'Птица, возрождающаяся из пепла'],
    ['СВЕТ', 'Появляется от Люмос'],
    ['КВИДИЧ', 'Спорт на мётлах'],
    ['ЗАМОК', 'Хогвартс — это огромный...'],
    ['КЛАН', 'Семейная группа волшебников'],
    ['ЗЕЛЬЕ', 'Варится в котле Снейпа'],
    ['ДРАКОН', 'Огнедышащее существо'],
    ['РАНА', 'Шрам на лбу Гарри'],
    ['МАНТИЯ', 'Одежда волшебника'],
    ['ГАРРИ', 'Мальчик, который выжил'],
    ['СВИТКИ', 'Древние магические документы'],
  ]),
  cwPublic('5', 'Заклинания', 'гермиона', '2026-06-03', 'лёгкий', '🪄', 'Гарри Поттер', 4510, themes.harrypotter, [
    ['ЛЮМОС', 'Заклинание света'],
    ['ЖАБА', 'Питомец Невилла'],
    ['ГОРБ', 'У старой ведьмы на спине'],
    ['НОКСА', 'Гасит свет палочки'],
    ['ЗАЩИТА', 'Протего создаёт это'],
    ['СОВА', 'Доставляет почту'],
    ['СТУПЕФ', 'Оглушающее заклинание'],
    ['МАГИЯ', 'Искусство волшебства'],
    ['БЛИН', 'Восклицание Рона'],
    ['ШКОЛА', 'Хогвартс — это...'],
    ['ПАТРОН', 'Светящийся защитник'],
    ['ПЛАЩ', 'Невидимость под ним'],
    ['ЭЛЬФОВ', 'Добби — один из них'],
    ['КЛАСС', 'Урок зельеварения'],
    ['ПИСЬМА', 'Совы приносят их'],
  ]),
  cwPublic('6', 'Тёмные тайны', 'снейп', '2026-05-30', 'сложный', '🐍', 'Гарри Поттер', 1340, themes.harrypotter, [
    ['ГЕРОЙ', 'Мальчик со шрамом-молнией'],
    ['ТЕНЬ', 'Следует за тобой в замке'],
    ['ПОРТ', 'Ключ-портал переносит сюда'],
    ['СНЕЙП', 'Профессор зельеварения'],
    ['КОЛЬЦО', 'Один из крестражей'],
    ['СВОД', 'Потолок подземелья'],
    ['СМЕРТЬ', 'Поцелуй дементора несёт...'],
    ['БИТВА', 'Финальная в Хогвартсе'],
    ['ЗМЕЙ', 'Символ Слизерина'],
    ['ЛОРДЫ', 'Тёмные волшебники'],
    ['МАЛФОЙ', 'Враг Гарри из Слизерина'],
    ['МРАК', 'Тьма подземелий'],
    ['МЕДАЛЬ', 'Награда за особые заслуги'],
    ['ОРДЕН', 'Феникса — тайное общество'],
    ['ТАЙНИК', 'Комната сокрытых вещей'],
  ]),

]

export const categories = [...new Set(crosswords.map(c => c.category))]

export function getCrossword(id: string): CrosswordDataPublic | undefined {
  return crosswords.find(c => c.id === id)
}

export function getDifficultyColor(d: CrosswordDataPublic['difficulty']): string {
  switch (d) {
    case 'лёгкий': return '#22c55e'
    case 'средний': return '#f59e0b'
    case 'сложный': return '#ef4444'
  }
}

export function getDifficultyBg(d: CrosswordDataPublic['difficulty']): string {
  switch (d) {
    case 'лёгкий': return '#f0fdf4'
    case 'средний': return '#fffbeb'
    case 'сложный': return '#fef2f2'
  }
}
