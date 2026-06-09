'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push(next)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} style={{
      width: '100%',
      maxWidth: '360px',
      background: '#fff',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      border: '1px solid #f3f4f6',
    }}>
      <h1 style={{
        fontSize: '22px',
        fontWeight: 700,
        letterSpacing: '-0.5px',
        marginBottom: '4px',
      }}>
        вход в админку
      </h1>
      <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>
        красвордс · конструктор
      </p>

      <label style={labelStyle}>email</label>
      <input
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={inputStyle}
      />

      <label style={{ ...labelStyle, marginTop: '14px' }}>пароль</label>
      <input
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={inputStyle}
      />

      {error && (
        <div style={{
          marginTop: '12px',
          padding: '10px 12px',
          borderRadius: '10px',
          background: '#fef2f2',
          color: '#dc2626',
          fontSize: '12px',
          border: '1px solid #fecaca',
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: '20px',
          width: '100%',
          padding: '12px',
          borderRadius: '12px',
          background: '#111827',
          color: '#fff',
          border: 'none',
          fontSize: '14px',
          fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'входим...' : 'войти'}
      </button>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#9ca3af',
  marginBottom: '6px',
  fontWeight: 600,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  background: '#f9fafb',
  border: '1px solid #f3f4f6',
  borderRadius: '10px',
  outline: 'none',
  fontFamily: 'inherit',
}
