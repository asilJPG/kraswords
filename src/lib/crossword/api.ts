import type { CrosswordRow, CrosswordInsert } from '@/lib/supabase/types'

export async function listCrosswords(): Promise<CrosswordRow[]> {
  const res = await fetch('/api/admin/crosswords', { cache: 'no-store' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getCrosswordById(id: string): Promise<CrosswordRow | null> {
  const res = await fetch(`/api/admin/crosswords/${id}`, { cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function saveCrossword(row: CrosswordInsert): Promise<CrosswordRow> {
  const res = await fetch('/api/admin/crosswords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteCrossword(id: string): Promise<void> {
  const res = await fetch(`/api/admin/crosswords/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await res.text())
}
