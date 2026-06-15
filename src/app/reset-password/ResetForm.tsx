'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { humanizeAuthError } from '@/lib/auth-errors'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: '14px',
  background: 'var(--surface)', color: 'var(--text)',
  border: '1px solid var(--border)', borderRadius: '10px',
  outline: 'none', fontFamily: 'inherit',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', textTransform: 'uppercase',
  letterSpacing: '0.5px', color: 'var(--text-light)', marginBottom: '6px', fontWeight: 600,
}

export default function ResetForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Пароль: минимум 8 символов'); return }
    if (password !== confirm) { setError('Пароли не совпадают'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(humanizeAuthError(error.message)); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/'), 2000)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <form onSubmit={onSubmit} style={{
        width: '100%', maxWidth: '360px', background: 'var(--bg)', color: 'var(--text)',
        borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow-pop)',
        border: '1px solid var(--border)',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '4px' }}>новый пароль</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '24px' }}>красвордс</p>

        {done ? (
          <div style={{ padding: '16px', background: 'var(--accent-soft)', borderRadius: '12px', textAlign: 'center', fontSize: '14px', color: 'var(--accent)' }}>
            Пароль изменён! Перенаправляем...
          </div>
        ) : (
          <>
            <label style={labelStyle}>новый пароль</label>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
            />

            <label style={{ ...labelStyle, marginTop: '14px' }}>повтори пароль</label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={inputStyle}
            />

            {error && (
              <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '10px', background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: '12px', border: '1px solid var(--danger-border)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '20px', width: '100%', padding: '12px',
                borderRadius: '12px', background: 'var(--text)', color: 'var(--bg)',
                border: 'none', fontSize: '14px', fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              {loading ? '...' : 'сохранить пароль'}
            </button>
          </>
        )}
      </form>
    </main>
  )
}
