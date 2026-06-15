'use client'

import ImageUploader from './ImageUploader'

// Theme config shape — mirrors ThemeConfig in lib/crosswords.ts but loose-typed
// to allow partial editing. Saves into themes_custom.config jsonb or
// crosswords.theme_custom jsonb.
export interface ThemeConfigDraft {
  bg?: string
  pageBg?: string
  textColor?: string
  mutedColor?: string
  cellBg?: string
  cellBorder?: string
  cellText?: string
  cellActiveBg?: string
  cellHighlightBg?: string
  blackCellBg?: string
  accentColor?: string
  clueActiveBg?: string
  navBg?: string
  navBorder?: string
  fontFamily?: string
  particleColor?: string
  glowColor?: string
  effect?: string
  heroImage?: { wide?: string | null; portrait?: string | null }
  cornerObject?: {
    imageUrl?: string | null
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    size?: number
    animation?: 'none' | 'float' | 'pulse'
  }
}

export const DEFAULT_THEME: ThemeConfigDraft = {
  bg: '#ffffff',
  pageBg: '#fafafa',
  textColor: '#111827',
  mutedColor: '#9ca3af',
  cellBg: '#ffffff',
  cellBorder: '#d1d5db',
  cellText: '#111827',
  cellActiveBg: '#dbeafe',
  cellHighlightBg: '#eff6ff',
  blackCellBg: '#1f2937',
  accentColor: '#3b82f6',
  clueActiveBg: '#eff6ff',
  navBg: 'rgba(255,255,255,0.9)',
  navBorder: '#f3f4f6',
  fontFamily: 'inherit',
  effect: 'none',
  particleColor: '#3b82f6',
}

interface Props {
  value: ThemeConfigDraft
  onChange: (next: ThemeConfigDraft) => void
}

export default function ThemeEditor({ value, onChange }: Props) {
  const set = <K extends keyof ThemeConfigDraft>(key: K, val: ThemeConfigDraft[K]) =>
    onChange({ ...value, [key]: val })

  const setHero = (k: 'wide' | 'portrait', url: string | null) =>
    onChange({ ...value, heroImage: { ...value.heroImage, [k]: url } })

  const setCorner = <K extends keyof NonNullable<ThemeConfigDraft['cornerObject']>>(
    k: K,
    v: NonNullable<ThemeConfigDraft['cornerObject']>[K],
  ) => onChange({ ...value, cornerObject: { ...value.cornerObject, [k]: v } })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Section label="Основные цвета">
        <ColorRow label="Фон страницы" v={value.pageBg ?? ''} onChange={x => { set('pageBg', x); set('bg', x) }} />
        <ColorRow label="Цвет текста" v={value.textColor ?? ''} onChange={x => set('textColor', x)} />
        <ColorRow label="Акцент" v={value.accentColor ?? ''} onChange={x => set('accentColor', x)} />
      </Section>

      <Section label="Сетка кроссворда">
        <ColorRow label="Фон ячейки" v={value.cellBg ?? ''} onChange={x => set('cellBg', x)} />
        <ColorRow label="Граница ячейки" v={value.cellBorder ?? ''} onChange={x => set('cellBorder', x)} />
        <ColorRow label="Текст ячейки" v={value.cellText ?? ''} onChange={x => set('cellText', x)} />
        <ColorRow label="Активная ячейка" v={value.cellActiveBg ?? ''} onChange={x => set('cellActiveBg', x)} />
        <ColorRow label="Подсветка слова" v={value.cellHighlightBg ?? ''} onChange={x => set('cellHighlightBg', x)} />
        <ColorRow label="Пустая клетка" v={value.blackCellBg ?? ''} onChange={x => set('blackCellBg', x)} />
        <ColorRow label="Активный вопрос" v={value.clueActiveBg ?? ''} onChange={x => set('clueActiveBg', x)} />
      </Section>

      <Section label="Типографика и эффекты">
        <Field label="Шрифт">
          <select value={value.fontFamily ?? 'inherit'} onChange={e => set('fontFamily', e.target.value)} style={inp}>
            <option value="inherit">стандартный (Inter)</option>
            <option value="Georgia, serif">сериф (Georgia)</option>
            <option value="'Courier New', monospace">моноширинный</option>
            <option value="system-ui, sans-serif">системный</option>
          </select>
        </Field>

        <Field label="Визуальный эффект">
          <select value={value.effect ?? 'none'} onChange={e => set('effect', e.target.value)} style={inp}>
            <option value="none">нет</option>
            <option value="particles">плавающие частицы</option>
            <option value="portal-drips">падающие капли портала</option>
            <option value="magic-sparkles">волшебные искры</option>
            <option value="stars">мерцающие звёзды</option>
            <option value="rain">дождь</option>
            <option value="lightning">молнии</option>
          </select>
        </Field>

        {(value.effect && value.effect !== 'none') && (
          <ColorRow label="Цвет эффекта" v={value.particleColor ?? ''} onChange={x => set('particleColor', x)} />
        )}
      </Section>

      <Section label="Hero для карточки на главной">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
          <ImageUploader
            kind="hero-wide"
            value={value.heroImage?.wide ?? null}
            onChange={url => setHero('wide', url)}
            label="Wide (десктоп)"
            hint="~1920×800, до 1.5MB"
          />
          <ImageUploader
            kind="hero-portrait"
            value={value.heroImage?.portrait ?? null}
            onChange={url => setHero('portrait', url)}
            label="Portrait (мобилка)"
            hint="~1400×1700"
          />
        </div>
      </Section>

      <Section label="Угловой объект (на странице игры)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <ImageUploader
            kind="corner"
            value={value.cornerObject?.imageUrl ?? null}
            onChange={url => setCorner('imageUrl', url)}
            label="Картинка (PNG с прозрачным фоном)"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Field label="Позиция">
              <select
                value={value.cornerObject?.position ?? 'bottom-right'}
                onChange={e => setCorner('position', e.target.value as NonNullable<ThemeConfigDraft['cornerObject']>['position'])}
                style={inp}
              >
                <option value="bottom-right">снизу справа</option>
                <option value="bottom-left">снизу слева</option>
                <option value="top-right">сверху справа</option>
                <option value="top-left">сверху слева</option>
              </select>
            </Field>
            <Field label="Размер, px">
              <input
                type="number" min={40} max={400}
                value={value.cornerObject?.size ?? 120}
                onChange={e => setCorner('size', Math.max(40, Math.min(400, parseInt(e.target.value) || 120)))}
                style={inp}
              />
            </Field>
            <Field label="Анимация">
              <select
                value={value.cornerObject?.animation ?? 'none'}
                onChange={e => setCorner('animation', e.target.value as NonNullable<ThemeConfigDraft['cornerObject']>['animation'])}
                style={inp}
              >
                <option value="none">нет</option>
                <option value="float">плавание</option>
                <option value="pulse">пульсация</option>
              </select>
            </Field>
          </div>
        </div>
      </Section>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '14px',
      background: 'var(--surface)',
    }}>
      <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{label}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{children}</div>
    </div>
  )
}

function ColorRow({ label, v, onChange }: { label: string; v: string; onChange: (x: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
      <input
        type="color"
        value={v || '#000000'}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '50px', height: '32px', padding: 0, border: '1px solid var(--border)',
          borderRadius: '6px', cursor: 'pointer', background: 'transparent',
        }}
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-light)', fontWeight: 600, marginBottom: '4px' }}>{label}</span>
      {children}
    </label>
  )
}

const inp: React.CSSProperties = {
  padding: '8px 10px',
  background: 'var(--bg)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
}
