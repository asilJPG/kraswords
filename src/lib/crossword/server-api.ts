import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { CrosswordRow } from '@/lib/supabase/types'
import type { CrosswordData } from '@/lib/crossword/types'
import { rowToCrosswordData } from './row-to-data'

export async function fetchPublishedCrosswords(): Promise<CrosswordData[]> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('crosswords') as any)
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as CrosswordRow[]).map(rowToCrosswordData)
}

export const fetchCrosswordById = cache(async (id: string): Promise<CrosswordData | null> => {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('crosswords') as any)
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return rowToCrosswordData(data as CrosswordRow)
})
