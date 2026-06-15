'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory, getTotalSolved, getAverageTime, ACHIEVEMENTS, GameRecord } from '@/lib/gameHistory'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const BannerEditor = dynamic(() => import('@/components/profile/BannerEditor'), { ssr: false })
const AvatarPicker = dynamic(() => import('@/components/profile/AvatarPicker'), { ssr: false })

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
  titleById?: Record<string, { title: string; emoji: string }>
  username: string | null
  bannerUrl: string | null
  avatarEmoji: string
}

export default function ProfileClient({ userId, userEmail, dbHistory, titleById, username, bannerUrl: initialBannerUrl, avatarEmoji: initialAvatarEmoji }: Props) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [localHistory, setLocalHistory] = useState<GameRecord[]>([])
  const [totalSolved, setTotalSolved] = useState(0)
  const [avgTime, setAvgTime] = useState<number | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [avatarEmoji, setAvatarEmoji] = useState(initialAvatarEmoji)
  const [bannerUrl, setBannerUrl] = useState(initialBannerUrl)
  const [selectedRecord, setSelectedRecord] = useState<{ id: string; time: number; date: string; solved: boolean } | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [newUsername, setNewUsername] = useState(username ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [settingsInfo, setSettingsInfo] = useState<string | null>(null)
  const [savingUsername, setSavingUsername] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

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
          background: bannerUrl ? undefined : 'var(--banner-fallback)',
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
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(0,0,0,0.08)',
                color: '#111',
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
        <button
          onClick={() => { if (userId) setAvatarOpen(true) }}
          disabled={!userId}
          style={{
            position: 'absolute', left: '50%', bottom: '-36px',
            transform: 'translateX(-50%)',
            width: '76px', height: '76px', borderRadius: '50%',
            background: 'var(--surface)', border: '4px solid var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', boxShadow: 'var(--shadow-card)',
            cursor: userId ? 'pointer' : 'default',
            fontFamily: 'inherit', padding: 0,
          }}
          title={userId ? 'сменить аватар' : ''}
        >
          {avatarEmoji}
        </button>
      </div>

      {/* Username + handle */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '2px' }}>
          {username ?? userEmail?.split('@')[0] ?? 'игрок'}
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
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
          <div key={stat.label} style={{ background: 'var(--surface)', borderRadius: '14px', padding: '18px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
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
              background: unlocked ? 'var(--bg)' : 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '14px',
              opacity: unlocked ? 1 : 0.5,
            }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{a.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{a.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{a.description}</div>
              {a.maxProgress > 1 && (
                <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '6px' }}>
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
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-light)', fontSize: '14px', background: 'var(--surface)', borderRadius: '14px' }}>
          ещё не решал кроссвордов
        </div>
      ) : (
        <div style={{ background: 'var(--bg)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {history.map((record, i) => {
            const meta = titleById?.[record.id]
            const displayTitle = meta?.title ?? record.id
            const displayEmoji = meta?.emoji ?? '🧩'
            return (
            <div key={i} onClick={() => setSelectedRecord(record)} style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px',
              borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer',
            }}>
              <span style={{ fontSize: '20px' }}>{displayEmoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayTitle}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                  {new Date(record.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: record.solved ? 'var(--accent)' : 'var(--text-light)' }}>
                {record.solved ? formatTime(record.time) : 'не решён'}
              </div>
            </div>
            )
          })}
        </div>
      )}

      {selectedRecord && (() => {
        const meta = titleById?.[selectedRecord.id]
        const displayTitle = meta?.title ?? selectedRecord.id
        const displayEmoji = meta?.emoji ?? '🧩'
        return (
          <div
            onClick={() => setSelectedRecord(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg)', borderRadius: '24px 24px 0 0',
                padding: '32px 24px 40px', width: '100%', maxWidth: '480px',
                boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>{displayEmoji}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{displayTitle}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                  {new Date(selectedRecord.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
                <div style={{ textAlign: 'center', padding: '20px 40px', background: 'var(--surface)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: selectedRecord.solved ? 'var(--accent)' : 'var(--text-light)' }}>
                    {selectedRecord.solved ? formatTime(selectedRecord.time) : '—'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {selectedRecord.solved ? 'время решения' : 'не решён'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href={`/play/${selectedRecord.id}`}
                  onClick={() => setSelectedRecord(null)}
                  style={{
                    display: 'block', textAlign: 'center', padding: '14px',
                    background: 'var(--text)', color: 'var(--bg)',
                    borderRadius: '14px', fontSize: '15px', fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  играть снова
                </Link>
                <button
                  onClick={() => setSelectedRecord(null)}
                  style={{
                    padding: '14px', background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: '14px',
                    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
                    color: 'var(--text)', fontFamily: 'inherit',
                  }}
                >
                  закрыть
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {!userEmail && (
        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--surface)', borderRadius: '14px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '10px' }}>
            Войди, чтобы история сохранялась на всех устройствах
          </p>
          <Link href="/login" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', textDecoration: 'underline' }}>
            войти или зарегистрироваться
          </Link>
        </div>
      )}

      {userEmail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
          <button
            onClick={() => { setSettingsOpen(true); setSettingsError(null); setSettingsInfo(null) }}
            style={{
              width: '100%', padding: '14px', background: 'transparent',
              border: '1px solid var(--border)', borderRadius: '14px',
              fontSize: '14px', fontWeight: 500, color: 'var(--text)',
              cursor: 'pointer', fontFamily: 'inherit', minHeight: '48px',
            }}
          >
            настройки профиля
          </button>
          <button
            onClick={async () => {
              setSigningOut(true)
              const supabase = createClient()
              await supabase.auth.signOut()
              router.push('/')
              router.refresh()
            }}
            disabled={signingOut}
            style={{
              width: '100%', padding: '14px', background: 'transparent',
              border: '1px solid var(--danger-border)', borderRadius: '14px',
              fontSize: '14px', fontWeight: 500, color: 'var(--danger)',
              cursor: signingOut ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              opacity: signingOut ? 0.6 : 1, minHeight: '48px',
            }}
          >
            {signingOut ? 'выходим...' : 'выйти из аккаунта'}
          </button>
        </div>
      )}

      {settingsOpen && (
        <div
          onClick={() => setSettingsOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg)', borderRadius: '24px 24px 0 0', padding: '32px 24px 40px', width: '100%', maxWidth: '480px', boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>настройки профиля</h2>

            {settingsError && (
              <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '10px', background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: '12px', border: '1px solid var(--danger-border)' }}>
                {settingsError}
              </div>
            )}
            {settingsInfo && (
              <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '10px', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: '12px', border: '1px solid var(--accent)' }}>
                {settingsInfo}
              </div>
            )}

            {/* Change username */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-light)', marginBottom: '6px', fontWeight: 600 }}>
                юзернейм
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  maxLength={20}
                  style={{ flex: 1, padding: '10px 12px', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '10px', outline: 'none', fontFamily: 'inherit' }}
                />
                <button
                  onClick={async () => {
                    setSettingsError(null); setSettingsInfo(null); setSavingUsername(true)
                    const res = await fetch('/api/update-profile', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ username: newUsername }),
                    })
                    const data = await res.json().catch(() => ({}))
                    if (!res.ok) { setSettingsError(data.error ?? 'Ошибка') }
                    else { setSettingsInfo('Юзернейм обновлён') }
                    setSavingUsername(false)
                  }}
                  disabled={savingUsername || newUsername.trim() === (username ?? '')}
                  style={{
                    padding: '10px 16px', background: 'var(--text)', color: 'var(--bg)',
                    border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                    cursor: savingUsername || newUsername.trim() === (username ?? '') ? 'not-allowed' : 'pointer',
                    opacity: savingUsername || newUsername.trim() === (username ?? '') ? 0.5 : 1,
                    fontFamily: 'inherit',
                  }}
                >
                  {savingUsername ? '...' : 'сохранить'}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>4–20 символов, только буквы/цифры/_</div>
            </div>

            {/* Change password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-light)', marginBottom: '6px', fontWeight: 600 }}>
                новый пароль
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="минимум 8 символов"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '10px', outline: 'none', fontFamily: 'inherit', marginBottom: '8px' }}
              />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="повтори пароль"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', fontSize: '14px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '10px', outline: 'none', fontFamily: 'inherit' }}
              />
              <button
                onClick={async () => {
                  setSettingsError(null); setSettingsInfo(null)
                  if (newPassword.length < 8) { setSettingsError('Пароль: минимум 8 символов'); return }
                  if (newPassword !== confirmPassword) { setSettingsError('Пароли не совпадают'); return }
                  setSavingPassword(true)
                  const supabase = createClient()
                  const { error } = await supabase.auth.updateUser({ password: newPassword })
                  if (error) { setSettingsError(error.message) }
                  else { setSettingsInfo('Пароль изменён'); setNewPassword(''); setConfirmPassword('') }
                  setSavingPassword(false)
                }}
                disabled={savingPassword || !newPassword}
                style={{
                  marginTop: '8px', width: '100%', padding: '12px',
                  background: 'var(--text)', color: 'var(--bg)',
                  border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                  cursor: savingPassword || !newPassword ? 'not-allowed' : 'pointer',
                  opacity: savingPassword || !newPassword ? 0.5 : 1,
                  fontFamily: 'inherit',
                }}
              >
                {savingPassword ? '...' : 'сменить пароль'}
              </button>
            </div>

            <button
              onClick={() => setSettingsOpen(false)}
              style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit' }}
            >
              закрыть
            </button>
          </div>
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

      {avatarOpen && userId && (
        <AvatarPicker
          current={avatarEmoji}
          onSave={async (emoji) => {
            const res = await fetch('/api/update-profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ avatar: { type: 'emoji', value: emoji } }),
            })
            if (!res.ok) {
              const data = await res.json().catch(() => ({}))
              throw new Error(data.error ?? 'Ошибка сохранения')
            }
            setAvatarEmoji(emoji)
          }}
          onClose={() => setAvatarOpen(false)}
        />
      )}
    </main>
  )
}
