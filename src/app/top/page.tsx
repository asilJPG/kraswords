import { fetchPublishedCrosswords } from '@/lib/crossword/server-api'
import { createAdminClient } from '@/lib/supabase/admin-client'
import TopClient from './TopClient'

export const dynamic = 'force-dynamic'

export default async function TopPage() {
  const crosswords = await fetchPublishedCrosswords()
  const sorted = [...crosswords]
    .sort((a, b) => b.solvers - a.solvers)
    .map(cw => ({ id: cw.id, title: cw.title, emoji: cw.emoji, category: cw.category, solvers: cw.solvers }))

  const admin = createAdminClient()
  const { data: results } = await (admin.from('game_results') as any)
    .select('user_id, time_seconds, crossword_id')
    .eq('solved', true)
  const { data: profiles } = await (admin.from('profiles') as any).select('id, username')

  const profileMap: Record<string, string> = {}
  for (const p of profiles ?? []) profileMap[p.id] = p.username

  const agg: Record<string, { username: string; times: number[]; cwIds: Set<string> }> = {}
  for (const r of results ?? []) {
    const username = profileMap[r.user_id]
    if (!username) continue
    if (!agg[r.user_id]) agg[r.user_id] = { username, times: [], cwIds: new Set() }
    agg[r.user_id].times.push(r.time_seconds)
    agg[r.user_id].cwIds.add(r.crossword_id)
  }

  const players = Object.values(agg)
    .map(p => ({
      username: p.username,
      total: p.cwIds.size,
      avg: Math.round(p.times.reduce((s, t) => s + t, 0) / p.times.length),
    }))
    .sort((a, b) => b.total - a.total || a.avg - b.avg)

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px 40px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '24px' }}>
        топ
      </h1>
      <TopClient players={players} crosswords={sorted} />
    </main>
  )
}
