'use client'

import { useState, useEffect } from 'react'
import { getHistory, getTotalSolved, getAverageTime, ACHIEVEMENTS, GameRecord } from '@/lib/gameHistory'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const BannerEditor = dynamic(() => import('@/components/profile/BannerEditor'), { ssr: false })

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

interface DbRecord { crossword_id: string; time_seconds: number; played_at: string; solved: boolean }

interface Props {
  userId: string | null
  userEmail: string | null
  dbHistory: DbRecord[]
  username: string | null
  bannerUrl: string | null
}

export default function ProfileClient({ userId, userEmail, dbHistory, username, bannerUrl: initialBannerUrl }: Props) {
  const [localHistory, setLocalHistory] = useState<GameRecord[]>([])
  const [totalSolved, setTotalSolved] = useState(0)
  const [avgTime, setAvgTime] = useState<number | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [bannerUrl, setBannerUrl] = useState(initialBannerUrl)

  useEffect(() => {
    if (!userEmail) {
      setLocalHistory(getHistory())
      setTotalSolved(getTotalSolved())
      setAvgTime(getAverageTime())
    }
  }, [userEmail])

  const isDb = !!userEmail
  const history = isDb
    ? dbHistory.map(r => ({ id: r.crossword_id, time: r.time_seconds, date: r.played_at, solved: r.solved }))
    : localHistory.map(r => ({ id: r.crosswordId, time: r.time, date: r.date, solved: r.solved }))

  const solved = history.filter(h => h.solved)
  const displayTotal = isDb ? solved.length : totalSolved
  const displayAvg = isDb
    ? (solved.length ? Math.round(solved.reduce((s, h) => s + h.time, 0) / solved.length) : null)
    : avgTime

  const streak = (() => {
    const s = solved.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    if (!s.length) return 0
    let count = 1
    for (let i = 1; i < s.length; i++) {
      const diff = Math.floor((new Date(s[i-1].date).getTime() - new Date(s[i].date).getTime()) / 86400000)
      if (diff <= 1) count++ ; else break
    }
    return count
  })()

  const achievementProgress: Record<string, number> = (() => {
    const progress: Record<string, number> = {}
    progress['first_solve'] = Math.min(solved.length, 1)
    progress['solve_3'] = Math.min(solved.length, 3)
    progress['solve_all'] = Math.min(solved.length, 6)
    progress['speed_3min'] = solved.some(h => h.time < 180) ? 1 : 0
    progress['speed_5min'] = solved.some(h => h.time < 300) ? 1 : 0
    const sortedByDate = [...solved].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let maxStreak = 0, run = 0
    for (let i = 0; i < sortedByDate.length; i++) {
      if (i === 0) { run = 1 } else {
        const diff = Math.floor((new Date(sortedByDate[i].date).getTime() - new Date(sortedByDate[i - 1].date).getTime()) / 86400000)
        run = diff <= 1 ? run + 1 : 1
      }
      maxStreak = Math.max(maxStreak, run)
    }
    progress['streak_3'] = Math.min(maxStreak, 3)
    return progress
  })()

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px 40px' }}>
      {/* Banner */}
      <div className="animate-fade-in" style={{ position: 'relative', marginBottom: '52px' }}>
        <div style={{
          width: '100%',
          height: '140px',
          borderRadius: '20px',
          overflow: 'hidden',
          background: bannerUrl ? undefined : '#f3f4f6',
          position: 'relative',
        }}>
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="banner"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}

          {/* Edit button */}
          {userId && (
            <button
              onClick={() => setEditorOpen(true)}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(17,24,39,0.06)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(17,24,39,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              🎨
            </button>
          )}
        </div>

        {/* Avatar overlapping banner */}
        <div style={{
          position: 'absolute', left: '50%', bottom: '-36px',
          transform: 'translateX(-50%)',
          width: '76px', height: '76px', borderRadius: '50%',
          background: '#f9fafb', border: '4px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          😎
        </div>
      </div>

      {/* Username + handle */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '2px' }}>
          {username ?? userEmail?.split('@')[0] ?? 'игрок'}
        </h1>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          {userEmail ?? 'гость'}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '36px' }}>
        {[
          { label: 'решено', value: String(displayTotal) },
          { label: 'среднее', value: displayAvg ? formatTime(displayAvg) : '—' },
          { label: 'серия', value: String(streak) },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#f9fafb', borderRadius: '14px', padding: '18px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}>ачивки</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '10px',
        marginBottom: '36px',
      }}>
        {ACHIEVEMENTS.map(a => {
          const progress = achievementProgress[a.id] ?? 0
          const unlocked = progress >= a.maxProgress
          return (
            <div key={a.id} style={{
              background: unlocked ? '#fff' : '#f9fafb',
              border: '1px solid #f3f4f6',
              borderRadius: '12px',
              padding: '14px',
              opacity: unlocked ? 1 : 0.5,
            }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{a.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{a.title}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{a.description}</div>
              {a.maxProgress > 1 && (
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                  {Math.min(progress, a.maxProgress)}/{a.maxProgress}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* History */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}>история игр</h2>
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#d1d5db', fontSize: '14px', background: '#f9fafb', borderRadius: '14px' }}>
          ещё не решал кроссвордов
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
          {history.map((record, i) => (
            <Link key={i} href={`/play/${record.id}`}>
              <div style={{
                display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px',
                borderBottom: i < history.length - 1 ? '1px solid #f9fafb' : 'none', cursor: 'pointer',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{record.id}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {new Date(record.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: record.solved ? '#22c55e' : '#9ca3af' }}>
                  {record.solved ? formatTime(record.time) : 'не решён'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!userEmail && (
        <div style={{ marginTop: '24px', padding: '16px', background: '#f9fafb', borderRadius: '14px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '10px' }}>
            Войди, чтобы история сохранялась на всех устройствах
          </p>
          <Link href="/login" style={{ fontSize: '13px', fontWeight: 500, color: '#111827', textDecoration: 'underline' }}>
            войти или зарегистрироваться
          </Link>
        </div>
      )}

      {editorOpen && userId && (
        <BannerEditor
          userId={userId}
          currentBannerUrl={bannerUrl}
          onSaved={url => setBannerUrl(url)}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </main>
  )
}
