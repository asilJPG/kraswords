'use client'

import { useEffect, useRef, useState } from 'react'
import { themeFromImage } from '@/lib/crossword/theme-from-image'

export interface HeroImage { wide: string; portrait: string }

interface Props {
  heroImage: HeroImage | null
  onApply: (hero: HeroImage, theme: Record<string, string> | null) => void
}

// Генерация идёт в браузере (бесплатный pollinations.ai, без ключей),
// чтобы не упираться в таймауты серверных функций. Заливка — через
// /api/upload-hero (admin-only) в публичный bucket `heroes`.
const genUrl = (prompt: string, w: number, h: number, seed: number) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${seed}`

async function genImage(prompt: string, w: number, h: number, seedShift: number): Promise<Blob> {
  let lastErr = ''
  for (let att = 0; att < 3; att++) {
    try {
      const res = await fetch(genUrl(prompt, w, h, seedShift + att * 13))
      if (res.ok) return await res.blob()
      lastErr = `HTTP ${res.status}`
    } catch (e) {
      lastErr = e instanceof Error ? e.message : 'сеть недоступна'
    }
    await new Promise(r => setTimeout(r, 5000))
  }
  throw new Error(lastErr)
}

async function uploadHero(blob: Blob, kind: 'hero-wide' | 'hero-portrait'): Promise<string> {
  const fd = new FormData()
  fd.append('file', new File([blob], `${kind}.jpg`, { type: 'image/jpeg' }))
  fd.append('kind', kind)
  const res = await fetch('/api/upload-hero', { method: 'POST', body: fd })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'не удалось загрузить')
  return data.url as string
}

export default function HeroGenerator({ heroImage, onApply }: Props) {
  const [prompt, setPrompt] = useState('')
  const [stage, setStage] = useState<'idle' | 'wide' | 'portrait' | 'uploading'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ wide: Blob; portrait: Blob } | null>(null)
  const [previewUrls, setPreviewUrls] = useState<{ wide: string; portrait: string } | null>(null)
  const [buildTheme, setBuildTheme] = useState(true)
  const seedRef = useRef(7)

  useEffect(() => () => {
    if (previewUrls) { URL.revokeObjectURL(previewUrls.wide); URL.revokeObjectURL(previewUrls.portrait) }
  }, [previewUrls])

  const generate = async () => {
    const p = prompt.trim()
    if (!p || stage !== 'idle') return
    setError(null)
    try {
      setStage('wide')
      const wide = await genImage(p + ', wide banner format, no text', 1920, 800, seedRef.current)
      setStage('portrait')
      const portrait = await genImage(p + ', vertical poster format, no text', 1080, 1350, seedRef.current)
      seedRef.current += 100 // следующая генерация — другой вариант
      setPreview({ wide, portrait })
      setPreviewUrls({ wide: URL.createObjectURL(wide), portrait: URL.createObjectURL(portrait) })
    } catch (e) {
      setError('Генерация не удалась: ' + (e instanceof Error ? e.message : '') + '. Попробуй ещё раз.')
    } finally {
      setStage('idle')
    }
  }

  const apply = async () => {
    if (!preview || stage !== 'idle') return
    setError(null)
    setStage('uploading')
    try {
      const theme = buildTheme ? await themeFromImage(preview.wide) : null
      const wide = await uploadHero(preview.wide, 'hero-wide')
      const portrait = await uploadHero(preview.portrait, 'hero-portrait')
      onApply({ wide, portrait }, theme)
      setPreview(null)
      setPreviewUrls(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setStage('idle')
    }
  }

  const busy = stage !== 'idle'
  const stageText = stage === 'wide' ? 'генерирую широкую…' : stage === 'portrait' ? 'генерирую вертикальную…' : stage === 'uploading' ? 'загружаю…' : null

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: '10px', padding: '12px',
      background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
        🎨 превью-картинка
      </span>

      {heroImage && !previewUrls && (
        <img src={heroImage.wide} alt="текущее превью" style={{ width: '100%', borderRadius: '8px', display: 'block' }} />
      )}

      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="опиши сцену на английском: dark epic anime style, colossal giant over stone walls at dusk, red sky"
        rows={2}
        style={{
          padding: '8px 10px', background: 'var(--bg)', color: 'var(--text)',
          border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px',
          outline: 'none', fontFamily: 'inherit', resize: 'vertical', width: '100%',
        }}
      />

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={generate}
          disabled={busy || !prompt.trim()}
          style={{ ...btn, opacity: busy || !prompt.trim() ? 0.5 : 1 }}
        >
          {stageText ?? (previewUrls ? 'сгенерировать другую' : 'сгенерировать')}
        </button>
        {previewUrls && !busy && (
          <button type="button" onClick={apply} style={{ ...btn, background: 'var(--text)', color: 'var(--bg)', border: 'none' }}>
            ✓ применить
          </button>
        )}
      </div>

      {previewUrls && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <img src={previewUrls.wide} alt="широкая" style={{ flex: 1, minWidth: 0, borderRadius: '8px', display: 'block' }} />
          <img src={previewUrls.portrait} alt="вертикальная" style={{ width: '72px', borderRadius: '8px', display: 'block' }} />
        </div>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
        <input type="checkbox" checked={buildTheme} onChange={e => setBuildTheme(e.target.checked)} />
        🪄 собрать всю тему из картинки (фон, цвета клеток, эффект)
      </label>

      {error && <div style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</div>}
      <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
        генерация бесплатная, ~30-60 сек. «применить» сохранит картинку в тему кроссворда.
      </div>
    </div>
  )
}

const btn: React.CSSProperties = {
  padding: '8px 12px', background: 'var(--bg)', color: 'var(--text)',
  border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px',
  cursor: 'pointer', fontFamily: 'inherit', flex: 1,
}
