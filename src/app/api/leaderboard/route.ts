import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

export async function GET() {
  const admin = createAdminClient()

  const { data, error } = await (admin.from('game_results') as any)
    .select('user_id, time_seconds, crossword_id')
    .eq('solved', true)

  if (error) return NextResponse.json([], { status: 200 })

  const { data: profiles } = await (admin.from('profiles') as any)
    .select('id, username')

  const profileMap: Record<string, string> = {}
  for (const p of profiles ?? []) profileMap[p.id] = p.username

  const players: Record<string, { username: string; times: number[]; crosswords: Set<string> }> = {}
  for (const r of data ?? []) {
    const username = profileMap[r.user_id]
    if (!username) continue
    if (!players[r.user_id]) players[r.user_id] = { username, times: [], crosswords: new Set() }
    players[r.user_id].times.push(r.time_seconds)
    players[r.user_id].crosswords.add(r.crossword_id)
  }

  const leaderboard = Object.values(players)
    .map(p => ({
      username: p.username,
      total_solved: p.crosswords.size,
      avg_time: Math.round(p.times.reduce((s, t) => s + t, 0) / p.times.length),
      best_time: Math.min(...p.times),
    }))
    .sort((a, b) => b.total_solved - a.total_solved || a.avg_time - b.avg_time)
    .slice(0, 20)

  return NextResponse.json(leaderboard)
}
