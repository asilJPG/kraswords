export type { CrosswordData, Clue, Direction, ThemeConfig } from '../crosswords'

export interface Cell {
  row: number
  col: number
  letter: string
  isBlack: boolean
  number?: number
}

export type CellStatus = 'correct' | 'wrong' | 'neutral'
