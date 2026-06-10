import type { CrosswordData } from '@/lib/crossword/types'
import type { CrosswordRow } from '@/lib/supabase/types'
import { themes } from '@/lib/crosswords'

export function rowToCrosswordData(row: CrosswordRow): CrosswordData {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    date: row.created_at?.slice(0, 10) ?? '',
    difficulty: row.difficulty,
    emoji: row.emoji,
    size: row.size,
    clues: row.clues,
    solvers: row.solvers,
    theme: {
      ...(themes[row.theme_id] ?? themes.default),
      ...(row.theme_custom || {}),
    },
    wordCount: row.word_count,
    category: row.category,
  }
}
