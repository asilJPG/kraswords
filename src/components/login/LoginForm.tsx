'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { humanizeAuthError } from '@/lib/auth-errors'

type Mode = 'login' | 'register' | 'forgot'

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

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      if (error) {
        setError(humanizeAuthError(error.message))
      } else {
        setInfo('Письмо отправлено! Проверь почту и перейди по ссылке.')
      }
      setLoading(false)
      return
    }

    if (mode === 'register') {
      const trimmedUsername = username.trim()
      const exceptions = ['1', '2', 'a']
      if ((trimmedUsername.length < 4 && !exceptions.includes(trimmedUsername)) || trimmedUsername.length > 20) {
        setError('Юзернейм: 4–20 символов')
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
        setError(humanizeAuthError(error.message))
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

    // Sign-in целиком на сервере: email по нику наружу не отдаётся,
    // сессионные куки ставит серверный клиент.
    let loginData: { ok?: boolean; hasProfile?: boolean; error?: string } = {}
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginField, password }),
      })
      loginData = await res.json().catch(() => ({}))
      if (!res.ok || !loginData.ok) {
        setError(loginData.error ?? 'Неверный логин или пароль')
        setLoading(false)
        return
      }
    } catch {
      setError('Не получилось войти. Проверь интернет и попробуй ещё раз.')
      setLoading(false)
      return
    }
    if (!loginData.hasProfile) {
      router.push('/setup-profile')
      router.refresh()
      return
    }
    router.push(next)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} style={{
      width: '100%',
      maxWidth: '360px',
      background: 'var(--bg)',
      color: 'var(--text)',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: 'var(--shadow-pop)',
      border: '1px solid var(--border)',
    }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '4px' }}>
        {mode === 'login' ? 'вход' : mode === 'register' ? 'регистрация' : 'сброс пароля'}
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '24px' }}>красвордс</p>

      {mode === 'forgot' && (
        <>
          <label style={labelStyle}>email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="твой email"
          />
        </>
      )}

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
          <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
            4–20 символов, только буквы/цифры/_, виден в лидерборде
          </div>
        </>
      )}

      {mode !== 'forgot' && (
        <>
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
        </>
      )}

      {error && (
        <div style={{
          marginTop: '12px', padding: '10px 12px', borderRadius: '10px',
          background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: '12px',
          border: '1px solid var(--danger-border)',
        }}>
          {error}
        </div>
      )}

      {info && (
        <div style={{
          marginTop: '12px', padding: '10px 12px', borderRadius: '10px',
          background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: '12px',
          border: '1px solid var(--accent)',
        }}>
          {info}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: '20px', width: '100%', padding: '12px',
          borderRadius: '12px', background: 'var(--text)', color: 'var(--bg)',
          border: 'none', fontSize: '14px', fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          fontFamily: 'inherit',
        }}
      >
        {loading ? '...' : mode === 'login' ? 'войти' : mode === 'register' ? 'создать аккаунт' : 'отправить письмо'}
      </button>

      {mode === 'login' && (
        <button
          type="button"
          onClick={() => { setMode('forgot'); setError(null); setInfo(null) }}
          style={{
            marginTop: '8px', width: '100%', padding: '10px',
            borderRadius: '12px', background: 'transparent', color: 'var(--text-light)',
            border: 'none', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          забыл пароль?
        </button>
      )}

      <button
        type="button"
        onClick={() => { setMode(m => m === 'register' ? 'login' : 'register'); setError(null); setInfo(null) }}
        style={{
          marginTop: mode === 'login' ? '4px' : '12px', width: '100%', padding: '10px',
          borderRadius: '12px', background: 'transparent', color: 'var(--text-light)',
          border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {mode === 'register' ? 'уже есть аккаунт? войти' : 'нет аккаунта? зарегистрироваться'}
      </button>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', textTransform: 'uppercase',
  letterSpacing: '0.5px', color: 'var(--text-light)', marginBottom: '6px', fontWeight: 600,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: '14px',
  background: 'var(--surface)', color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: '10px', outline: 'none', fontFamily: 'inherit',
}
