'use client'

import type { CrosswordMeta } from './hooks/useEditorState'

interface Props {
  meta: CrosswordMeta
  onChange: (next: CrosswordMeta) => void
}

const themes = [
  { id: 'default',     label: 'классика' },
  { id: 'rickmorty',   label: 'Рик и Морти' },
  { id: 'harrypotter', label: 'Гарри Поттер' },
  { id: 'custom',      label: 'Кастомная тема' },
]

const defaultCustomTheme = {
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

const difficulties = ['лёгкий', 'средний', 'сложный'] as const

export default function MetaForm({ meta, onChange }: Props) {
  const set = <K extends keyof CrosswordMeta>(key: K, val: CrosswordMeta[K]) =>
    onChange({ ...meta, [key]: val })

  const setCustom = (key: string, val: any) => {
    const custom = meta.theme_custom || defaultCustomTheme
    onChange({
      ...meta,
      theme_custom: { ...custom, [key]: val }
    })
  }

  const handleThemeChange = (themeId: string) => {
    if (themeId === 'custom' && !meta.theme_custom) {
      onChange({ ...meta, theme_id: themeId, theme_custom: defaultCustomTheme })
    } else {
      onChange({ ...meta, theme_id: themeId })
    }
  }

  const custom = meta.theme_custom || defaultCustomTheme

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Field label="название">
        <input value={meta.title} onChange={e => set('title', e.target.value)} style={inp} placeholder="портальные загадки" />
      </Field>

      <Field label="emoji">
        <input value={meta.emoji} onChange={e => set('emoji', e.target.value)} style={{ ...inp, width: '60px' }} />
      </Field>

      <Field label="категория">
        <input value={meta.category} onChange={e => set('category', e.target.value)} style={inp} placeholder="Рик и Морти" />
      </Field>

      <Field label="тема оформления">
        <select value={meta.theme_id} onChange={e => handleThemeChange(e.target.value)} style={inp}>
          {themes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </Field>

      {meta.theme_id === 'custom' && (
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '12px',
          background: '#f9fafb',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: '4px',
          marginBottom: '4px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase' }}>
            Настройки темы
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Field label="Фон страницы">
              <input type="color" value={custom.pageBg || '#fafafa'} onChange={e => {
                setCustom('pageBg', e.target.value)
                setCustom('bg', e.target.value)
              }} style={colorInp} />
            </Field>
            <Field label="Цвет текста">
              <input type="color" value={custom.textColor || '#111827'} onChange={e => setCustom('textColor', e.target.value)} style={colorInp} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Field label="Акцент (кнопки)">
              <input type="color" value={custom.accentColor || '#3b82f6'} onChange={e => setCustom('accentColor', e.target.value)} style={colorInp} />
            </Field>
            <Field label="Фон ячеек">
              <input type="color" value={custom.cellBg || '#ffffff'} onChange={e => setCustom('cellBg', e.target.value)} style={colorInp} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Field label="Границы ячеек">
              <input type="color" value={custom.cellBorder || '#d1d5db'} onChange={e => setCustom('cellBorder', e.target.value)} style={colorInp} />
            </Field>
            <Field label="Текст ячеек">
              <input type="color" value={custom.cellText || '#111827'} onChange={e => setCustom('cellText', e.target.value)} style={colorInp} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Field label="Активная ячейка">
              <input type="color" value={custom.cellActiveBg || '#dbeafe'} onChange={e => setCustom('cellActiveBg', e.target.value)} style={colorInp} />
            </Field>
            <Field label="Подсветка слова">
              <input type="color" value={custom.cellHighlightBg || '#eff6ff'} onChange={e => setCustom('cellHighlightBg', e.target.value)} style={colorInp} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Field label="Пустая ячейка">
              <input type="color" value={custom.blackCellBg || '#1f2937'} onChange={e => setCustom('blackCellBg', e.target.value)} style={colorInp} />
            </Field>
            <Field label="Активный вопрос">
              <input type="color" value={custom.clueActiveBg || '#eff6ff'} onChange={e => setCustom('clueActiveBg', e.target.value)} style={colorInp} />
            </Field>
          </div>

          <Field label="Шрифт">
            <select value={custom.fontFamily || 'inherit'} onChange={e => setCustom('fontFamily', e.target.value)} style={inp}>
              <option value="inherit">стандартный</option>
              <option value="Georgia, serif">сериф (Georgia)</option>
              <option value="'Courier New', monospace">моноширинный</option>
              <option value="system-ui, sans-serif">системный</option>
            </select>
          </Field>

          <Field label="Визуальный эффект">
            <select value={custom.effect || 'none'} onChange={e => setCustom('effect', e.target.value)} style={inp}>
              <option value="none">нет</option>
              <option value="particles">плавающие частицы</option>
              <option value="portal-drips">падающие капли портала</option>
              <option value="magic-sparkles">волшебные искры</option>
            </select>
          </Field>

          {custom.effect !== 'none' && (
            <Field label="Цвет эффекта">
              <input type="color" value={custom.particleColor || '#3b82f6'} onChange={e => setCustom('particleColor', e.target.value)} style={colorInp} />
            </Field>
          )}
        </div>
      )}

      <Field label="сложность">
        <select value={meta.difficulty} onChange={e => set('difficulty', e.target.value as typeof difficulties[number])} style={inp}>
          {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>

      <Field label="размер сетки">
        <input
          type="number"
          min={5}
          max={25}
          value={meta.size}
          onChange={e => set('size', Math.max(5, Math.min(25, parseInt(e.target.value) || 13)))}
          style={{ ...inp, width: '80px' }}
        />
      </Field>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
        <input type="checkbox" checked={meta.published} onChange={e => set('published', e.target.checked)} />
        опубликовать (видно всем)
      </label>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{
        display: 'block', fontSize: '10px', textTransform: 'uppercase',
        letterSpacing: '0.5px', color: '#9ca3af', fontWeight: 600, marginBottom: '4px',
      }}>{label}</span>
      {children}
    </label>
  )
}

const inp: React.CSSProperties = {
  padding: '8px 10px',
  background: '#fff',
  color: '#111827',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
}

const colorInp: React.CSSProperties = {
  padding: '0 2px',
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  height: '32px',
  outline: 'none',
  width: '100%',
  cursor: 'pointer',
}
