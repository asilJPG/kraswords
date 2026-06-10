import type { Clue } from '@/lib/crossword/types'

export interface CrosswordRow {
  id: string
  title: string
  author: string
  emoji: string
  category: string
  difficulty: 'лёгкий' | 'средний' | 'сложный'
  theme_id: string
  theme_custom?: Record<string, any> | null
  size: number
  clues: Clue[]
  word_count: number
  solvers: number
  published: boolean
  created_at: string
  updated_at: string
}

export type CrosswordInsert = Omit<CrosswordRow, 'created_at' | 'updated_at' | 'solvers'> & {
  solvers?: number
}

export type CrosswordUpdate = Partial<CrosswordInsert>

export interface Database {
  public: {
    Tables: {
      crosswords: {
        Row: CrosswordRow
        Insert: CrosswordInsert
        Update: CrosswordUpdate
      }
    }
  }
}
