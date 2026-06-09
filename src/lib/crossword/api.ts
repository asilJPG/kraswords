import { createClient } from '@/lib/supabase/client'
import type { CrosswordRow, CrosswordInsert } from '@/lib/supabase/types'

// We cast to `any` at the .from() boundary because our handwritten Database
// types are minimal — Supabase's generated types would be richer.
// Output types are still strict via the explicit return types below.

export async function listCrosswords(): Promise<CrosswordRow[]> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('crosswords') as any)
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data as CrosswordRow[]) ?? []
}

export async function getCrosswordById(id: string): Promise<CrosswordRow | null> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('crosswords') as any)
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as CrosswordRow
}

export async function saveCrossword(row: CrosswordInsert): Promise<CrosswordRow> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('crosswords') as any)
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data as CrosswordRow
}

export async function deleteCrossword(id: string): Promise<void> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('crosswords') as any).delete().eq('id', id)
  if (error) throw error
}
