import Link from 'next/link'
import { fetchPublishedCrosswords } from '@/lib/crossword/server-api'
import { createAdminClient } from '@/lib/supabase/admin-client'

export const dynamic = 'force-dynamic'

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

export default async function TopPage() {
  const crosswords = await fetchPublishedCrosswords()
  const sorted = [...crosswords].sort((a, b) => b.solvers - a.solvers)

  const admin = createAdminClient()
  const { data: results } = await (admin.from('game_results') as any)
    .select('user_id, time_seconds, crossword_id')
    .eq('solved', true)
  const { data: profiles } = await (admin.from('profiles') as any).select('id, username')

  const profileMap: Record<string, string> = {}
  for (const p of profiles ?? []) profileMap[p.id] = p.username

  const players: Record<string, { username: string; times: number[]; cwIds: Set<string> }> = {}
  for (const r of results ?? []) {
    const username = profileMap[r.user_id]
    if (!username) continue
    if (!players[r.user_id]) players[r.user_id] = { username, times: [], cwIds: new Set() }
    players[r.user_id].times.push(r.time_seconds)
    players[r.user_id].cwIds.add(r.crossword_id)
  }

  const leaderboard = Object.values(players)
    .map(p => ({
      username: p.username,
      total: p.cwIds.size,
      avg: Math.round(p.times.reduce((s, t) => s + t, 0) / p.times.length),
    }))
    .sort((a, b) => b.total - a.total || a.avg - b.avg)
    .slice(0, 10)

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px 40px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '32px' }}>
        топ
      </h1>

      {/* Player leaderboard */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>
        игроки
      </h2>
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', overflow: 'hidden', marginBottom: '36px' }}>
        {leaderboard.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            пока никто не решал
          </div>
        ) : leaderboard.map((p, i) => (
          <div key={p.username} style={{
            display: 'flex', alignItems: 'center', padding: '14px 20px',
            borderBottom: i < leaderboard.length - 1 ? '1px solid #f9fafb' : 'none',
            gap: '12px',
          }}>
            <span style={{ width: '24px', fontSize: i < 3 ? '16px' : '13px', fontWeight: 700, color: i < 3 ? '#111827' : '#d1d5db', textAlign: 'center' }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{p.username}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{p.total} <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '12px' }}>реш.</span></div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>ср. {fmt(p.avg)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Crossword top */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>
        кроссворды
      </h2>
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>пока нет кроссвордов</div>
        ) : sorted.map((cw, i) => (
          <Link key={cw.id} href={`/play/${cw.id}`}>
            <div style={{
              display: 'flex', alignItems: 'center', padding: '14px 20px',
              borderBottom: i < sorted.length - 1 ? '1px solid #f9fafb' : 'none',
              gap: '12px', cursor: 'pointer',
            }}>
              <span style={{ width: '24px', fontSize: i < 3 ? '16px' : '13px', fontWeight: 700, color: i < 3 ? '#111827' : '#d1d5db', textAlign: 'center' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </span>
              <span style={{ fontSize: '20px' }}>{cw.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{cw.title}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{cw.category}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{cw.solvers.toLocaleString('ru')}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>решили</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
