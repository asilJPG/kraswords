'use client'

import { useRef, useState } from 'react'

interface Props {
  kind: 'hero-wide' | 'hero-portrait' | 'corner'
  value: string | null
  onChange: (url: string | null) => void
  label: string
  hint?: string
}

const ASPECT: Record<Props['kind'], string> = {
  'hero-wide': '21 / 9',
  'hero-portrait': '4 / 5',
  'corner': '1 / 1',
}

export default function ImageUploader({ kind, value, onChange, label, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File) => {
    setBusy(true)
    setError(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('kind', kind)
    try {
      const res = await fetch('/api/upload-hero', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Ошибка загрузки')
        return
      }
      onChange(data.url)
    } catch {
      setError('Не удалось отправить')
    } finally {
      setBusy(false)
    }
  }

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f) upload(f)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{
        fontSize: '10px', textTransform: 'uppercase',
        letterSpacing: '0.5px', color: 'var(--text-light)', fontWeight: 600,
      }}>{label}</span>

      <div
        onClick={() => !busy && inputRef.current?.click()}
        style={{
          aspectRatio: ASPECT[kind],
          background: value ? `url(${value}) center/cover no-repeat` : 'var(--surface-2)',
          border: '2px dashed var(--border)',
          borderRadius: '10px',
          cursor: busy ? 'wait' : 'pointer',
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-light)', fontSize: '12px',
          minHeight: kind === 'corner' ? '120px' : '90px',
          maxWidth: kind === 'hero-wide' ? '100%' : kind === 'corner' ? '160px' : '200px',
        }}
      >
        {!value && (busy ? 'загружаем…' : '+ загрузить')}
        {value && busy && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '8px',
          }}>загружаем…</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {hint && <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>{hint}</span>}
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{
              marginLeft: 'auto', padding: '4px 8px', fontSize: '10px',
              background: 'transparent', color: 'var(--danger)',
              border: '1px solid var(--danger-border)', borderRadius: '6px',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            убрать
          </button>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '11px', color: 'var(--danger)' }}>{error}</span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onPick}
        style={{ display: 'none' }}
      />
    </div>
  )
}
