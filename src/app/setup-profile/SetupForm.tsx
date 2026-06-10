'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetupForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = username.trim()
    if (trimmed.length < 2) { setError('Минимум 2 символа'); return }
    if (trimmed.length > 20) { setError('Максимум 20 символов'); return }
    if (!/^[a-zA-Zа-яёА-ЯЁ0-9_]+$/.test(trimmed)) {
      setError('Только буквы, цифры и _')
      return
    }
    setLoading(true)
    const res = await fetch('/api/setup-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: trimmed }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) {
      setError(data.error ?? 'Ошибка при создании юзернейма')
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} style={{
      width: '100%', maxWidth: '360px', background: '#fff',
      borderRadius: '20px', padding: '32px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
    }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '4px' }}>
        выбери юзернейм
      </h1>
      <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>
        он будет виден в лидерборде
      </p>

      <label style={labelStyle}>юзернейм</label>
      <input
        type="text"
        required
        autoFocus
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={inputStyle}
        placeholder="например: швифти"
        maxLength={20}
      />
      <div style={{ fontSize: '11px', color: '#d1d5db', marginTop: '4px' }}>
        2–20 символов, только буквы/цифры/_
      </div>

      {error && (
        <div style={{
          marginTop: '12px', padding: '10px 12px', borderRadius: '10px',
          background: '#fef2f2', color: '#dc2626', fontSize: '12px',
          border: '1px solid #fecaca',
        }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} style={{
        marginTop: '20px', width: '100%', padding: '12px',
        borderRadius: '12px', background: '#111827', color: '#fff',
        border: 'none', fontSize: '14px', fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
        fontFamily: 'inherit',
      }}>
        {loading ? '...' : 'готово'}
      </button>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', textTransform: 'uppercase',
  letterSpacing: '0.5px', color: '#9ca3af', marginBottom: '6px', fontWeight: 600,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: '14px',
  background: '#f9fafb', border: '1px solid #f3f4f6',
  borderRadius: '10px', outline: 'none', fontFamily: 'inherit',
}
