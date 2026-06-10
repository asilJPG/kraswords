'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'register'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [loginField, setLoginField] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    const supabase = createClient()

    if (mode === 'register') {
      const trimmedUsername = username.trim()
      if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
        setError('Юзернейм: 2–20 символов')
        setLoading(false)
        return
      }
      if (!/^[a-zA-Zа-яёА-ЯЁ0-9_]+$/.test(trimmedUsername)) {
        setError('Юзернейм: только буквы, цифры и _')
        setLoading(false)
        return
      }
      if (password.length < 8) {
        setError('Пароль: минимум 8 символов')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      if (data.user && !data.session) {
        setInfo('Проверь почту — мы отправили письмо для подтверждения.')
        setLoading(false)
        return
      }
      if (data.user) {
        const setupRes = await fetch('/api/setup-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmedUsername }),
        })
        const setupData = await setupRes.json().catch(() => ({}))
        if (!setupRes.ok || !setupData.ok) {
          setError(setupData.error ?? 'Ошибка при создании юзернейма')
          setLoading(false)
          return
        }
      }
      router.push(next)
      router.refresh()
      return
    }

    // resolve email from login (email OR username)
    const resolveRes = await fetch('/api/resolve-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginField }),
    })
    const resolveData = await resolveRes.json().catch(() => ({}))
    if (!resolveRes.ok || !resolveData.email) {
      setError(resolveData.error ?? 'Неверный логин')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: resolveData.email, password,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase.from('profiles') as any)
        .select('username').eq('id', data.user.id).single()
      if (!profile) {
        router.push('/setup-profile')
        router.refresh()
        return
      }
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
      <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '4px' }}>
        {mode === 'login' ? 'вход' : 'регистрация'}
      </h1>
      <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>красвордс</p>

      {mode === 'login' ? (
        <>
          <label style={labelStyle}>email или юзернейм</label>
          <input
            type="text"
            autoComplete="username"
            required
            value={loginField}
            onChange={e => setLoginField(e.target.value)}
            style={inputStyle}
            placeholder="email или ник"
          />
        </>
      ) : (
        <>
          <label style={labelStyle}>email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
        </>
      )}

      {mode === 'register' && (
        <>
          <label style={{ ...labelStyle, marginTop: '14px' }}>юзернейм</label>
          <input
            type="text"
            autoComplete="nickname"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={inputStyle}
            placeholder="например: швифти"
            maxLength={20}
          />
          <div style={{ fontSize: '11px', color: '#d1d5db', marginTop: '4px' }}>
            2–20 символов, только буквы/цифры/_, виден в лидерборде
          </div>
        </>
      )}

      <label style={{ ...labelStyle, marginTop: '14px' }}>пароль</label>
      <input
        type="password"
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        required
        minLength={mode === 'register' ? 8 : undefined}
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={inputStyle}
      />

      {error && (
        <div style={{
          marginTop: '12px', padding: '10px 12px', borderRadius: '10px',
          background: '#fef2f2', color: '#dc2626', fontSize: '12px',
          border: '1px solid #fecaca',
        }}>
          {error}
        </div>
      )}

      {info && (
        <div style={{
          marginTop: '12px', padding: '10px 12px', borderRadius: '10px',
          background: '#f0fdf4', color: '#166534', fontSize: '12px',
          border: '1px solid #bbf7d0',
        }}>
          {info}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: '20px', width: '100%', padding: '12px',
          borderRadius: '12px', background: '#111827', color: '#fff',
          border: 'none', fontSize: '14px', fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? '...' : mode === 'login' ? 'войти' : 'создать аккаунт'}
      </button>

      <button
        type="button"
        onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null); setInfo(null) }}
        style={{
          marginTop: '12px', width: '100%', padding: '10px',
          borderRadius: '12px', background: 'transparent', color: '#9ca3af',
          border: '1px solid #f3f4f6', fontSize: '13px', cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {mode === 'login' ? 'нет аккаунта? зарегистрироваться' : 'уже есть аккаунт? войти'}
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
