'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const CANVAS_W = 600
const CANVAS_H = 200
const MAX_FILE_SIZE = 500_000 // 500 KB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const COLORS = [
  '#ffffff', '#111827', '#6366f1', '#8b5cf6', '#ec4899',
  '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#f97316',
  '#84cc16', '#06b6d4', '#a855f7', '#fbbf24', '#34d399',
]


interface Props {
  userId: string
  currentBannerUrl?: string | null
  onSaved: (url: string) => void
  onClose: () => void
}

export default function BannerEditor({ userId, currentBannerUrl, onSaved, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [color, setColor] = useState('#ffffff')
  const [size, setSize] = useState(4)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const drawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    if (currentBannerUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H)
      img.onerror = () => clearCanvas()
      img.src = currentBannerUrl
    } else {
      clearCanvas()
    }
  }, [currentBannerUrl, clearCanvas])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    // Client-side validation
    if (file.size > MAX_FILE_SIZE) {
      setError('Файл больше 500 KB')
      return
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError('Только JPEG, PNG, WebP и GIF')
      return
    }
    setError(null)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        // cover-fit: scale to fill canvas, crop overflow, centered
        const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height)
        const w = img.width * scale
        const h = img.height * scale
        const x = (CANVAS_W - w) / 2
        const y = (CANVAS_H - h) / 2
        ctx.drawImage(img, x, y, w, h)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    if ('touches' in e) {
      const t = e.touches[0]
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    drawing.current = true
    const pos = getPos(e)
    if (pos) lastPos.current = pos
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!drawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)
    if (!pos || !lastPos.current) return
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = tool === 'eraser' ? '#00000000' : color
    ctx.lineWidth = tool === 'eraser' ? size * 4 : size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.stroke()
    lastPos.current = pos
  }

  const stopDraw = () => {
    drawing.current = false
    lastPos.current = null
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.globalCompositeOperation = 'source-over'
  }

  const handleSave = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setSaving(true)
    setError(null)
    canvas.toBlob(async (blob) => {
      if (!blob) { setSaving(false); setError('Ошибка сохранения'); return }
      const formData = new FormData()
      formData.append('file', blob, 'banner.png')
      try {
        const res = await fetch('/api/upload-banner', {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Ошибка сохранения')
          setSaving(false)
          return
        }
        const data = await res.json()
        const supabase = createClient()
        const timestamp = Date.now()
        await (supabase.from('profiles') as any)
          .upsert({ id: userId, banner_url: data.url + '?t=' + timestamp }, { onConflict: 'id' })
        onSaved(data.url + '?t=' + timestamp)
        setSaving(false)
        onClose()
      } catch (err) {
        setError('Ошибка сохранения')
        setSaving(false)
      }
    }, 'image/png')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '24px',
        width: '100%', maxWidth: '660px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>редактор шапки</h2>
          <button onClick={onClose} style={iconBtn}>✕</button>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ width: '100%', borderRadius: '12px', cursor: tool === 'eraser' ? 'cell' : 'crosshair', touchAction: 'none', display: 'block' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Tools row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Clear */}
            <button onClick={clearCanvas} style={{
              padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'inherit',
              border: 'none', cursor: 'pointer', background: '#f3f4f6', color: '#374151',
            }}>
              🗑 очистить
            </button>

            {/* Photo upload */}
            <button onClick={() => fileInputRef.current?.click()} style={{
              padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'inherit',
              border: 'none', cursor: 'pointer', background: '#f3f4f6', color: '#374151',
            }}>
              📷 фото
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            {error && <span style={{
              fontSize: '12px', color: '#ef4444', fontWeight: 500
            }}>{error}</span>}

            {/* Tool toggle */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['pen', 'eraser'] as const).map(t => (
                <button key={t} onClick={() => setTool(t)} style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontFamily: 'inherit',
                  border: 'none', cursor: 'pointer',
                  background: tool === t ? '#111827' : '#f3f4f6',
                  color: tool === t ? '#fff' : '#374151',
                  fontWeight: tool === t ? 600 : 400,
                }}>
                  {t === 'pen' ? '✏️ кисть' : '⬜ ластик'}
                </button>
              ))}
            </div>

            {/* Size */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>размер</span>
              {[2, 4, 8, 16].map(s => (
                <button key={s} onClick={() => setSize(s)} style={{
                  width: '28px', height: '28px', borderRadius: '50%', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: size === s ? '#111827' : '#f3f4f6',
                }}>
                  <div style={{
                    width: s * 1.5, height: s * 1.5, borderRadius: '50%',
                    background: size === s ? '#fff' : '#374151',
                  }} />
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('pen') }}
                style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: c, border: color === c ? '3px solid #111827' : '2px solid #e5e7eb',
                  cursor: 'pointer',
                }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={e => { setColor(e.target.value); setTool('pen') }}
              style={{ width: '26px', height: '26px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0 }}
              title="свой цвет"
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                background: '#111827', color: '#fff', border: 'none',
                fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1, fontFamily: 'inherit',
              }}
            >
              {saving ? 'сохраняем...' : 'сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const iconBtn: React.CSSProperties = {
  background: '#f3f4f6', border: 'none', borderRadius: '8px',
  padding: '6px 10px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
}
