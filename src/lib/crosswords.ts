export type Direction = 'across' | 'down'

export interface Clue {
  number: number
  direction: Direction
  clue: string
  answer: string
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
  effect?: string
  heroImage?: {
    wide: string      // desktop landscape (~1920×800)
    portrait: string  // mobile portrait (~1400×1700)
  }
  cornerObject?: {
    imageUrl: string                                        // PNG with transparent bg
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    size?: number                                           // px, default 120
    animation?: 'none' | 'float' | 'pulse'                  // optional bobbing
  }
}

export interface CrosswordData {
  id: string
  title: string
  date: string
  difficulty: 'лёгкий' | 'средний' | 'сложный'
  emoji: string
  size: number
  clues: Clue[]
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
    heroImage: {
      wide: '/heroes/rickmorty-wide.jpg',
      portrait: '/heroes/rickmorty-portrait.jpg',
    },
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
  space: {
    id: 'space',
    name: 'Космос',
    bg: '#050520',
    bgImage: 'radial-gradient(ellipse at 60% 40%, #0f0f3d 0%, #050520 70%)',
    pageBg: '#030315',
    textColor: '#c7d2fe',
    mutedColor: '#818cf880',
    cellBg: 'rgba(15, 15, 60, 0.8)',
    cellBorder: '#6366f1',
    cellText: '#c7d2fe',
    cellActiveBg: 'rgba(99, 102, 241, 0.3)',
    cellHighlightBg: 'rgba(99, 102, 241, 0.12)',
    blackCellBg: '#020210',
    accentColor: '#818cf8',
    clueActiveBg: 'rgba(99, 102, 241, 0.15)',
    navBg: 'rgba(3, 3, 21, 0.9)',
    navBorder: '#818cf820',
    particleColor: '#e0e7ff',
    glowColor: '#818cf8',
  },
  nature: {
    id: 'nature',
    name: 'Природа',
    bg: '#f0fdf4',
    bgImage: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
    pageBg: '#ecfdf5',
    textColor: '#14532d',
    mutedColor: '#16a34a80',
    cellBg: '#ffffff',
    cellBorder: '#86efac',
    cellText: '#166534',
    cellActiveBg: '#bbf7d0',
    cellHighlightBg: '#dcfce7',
    blackCellBg: '#166534',
    accentColor: '#22c55e',
    clueActiveBg: '#dcfce7',
    navBg: 'rgba(236, 253, 245, 0.9)',
    navBorder: '#86efac40',
    particleColor: '#22c55e',
    glowColor: '#4ade80',
  },
  retro: {
    id: 'retro',
    name: 'Ретро',
    bg: '#1a1a2e',
    bgImage: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    pageBg: '#12122a',
    textColor: '#ff6b81',
    mutedColor: '#e9456080',
    cellBg: 'rgba(30, 30, 60, 0.9)',
    cellBorder: '#e94560',
    cellText: '#ff6b81',
    cellActiveBg: 'rgba(233, 69, 96, 0.3)',
    cellHighlightBg: 'rgba(233, 69, 96, 0.12)',
    blackCellBg: '#0f0f1a',
    accentColor: '#e94560',
    clueActiveBg: 'rgba(233, 69, 96, 0.15)',
    navBg: 'rgba(18, 18, 42, 0.9)',
    navBorder: '#e9456020',
    fontFamily: '"Courier New", monospace',
    particleColor: '#e94560',
    glowColor: '#ff6b81',
  },
}


export function getDifficultyColor(d: CrosswordData['difficulty']): string {
  switch (d) {
    case 'лёгкий': return '#22c55e'
    case 'средний': return '#f59e0b'
    case 'сложный': return '#ef4444'
  }
}

export function getDifficultyBg(d: CrosswordData['difficulty']): string {
  switch (d) {
    case 'лёгкий': return '#f0fdf4'
    case 'средний': return '#fffbeb'
    case 'сложный': return '#fef2f2'
  }
}

export interface VerifyResult {
  correct: boolean
  cells: Record<string, boolean>
}

export function verifyAnswers(crossword: CrosswordData, answers: Record<string, string>): VerifyResult {
  const cells: Record<string, boolean> = {}
  let allCorrect = true

  for (const clue of crossword.clues) {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === 'down' ? clue.row + i : clue.row
      const c = clue.direction === 'across' ? clue.col + i : clue.col
      const key = `${r},${c}`
      const userLetter = (answers[key] || '').toUpperCase()
      const isCorrect = userLetter === clue.answer[i]
      cells[key] = isCorrect
      if (!isCorrect) allCorrect = false
    }
  }

  return { correct: allCorrect, cells }
}
