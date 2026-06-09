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
]

const difficulties = ['лёгкий', 'средний', 'сложный'] as const

export default function MetaForm({ meta, onChange }: Props) {
  const set = <K extends keyof CrosswordMeta>(key: K, val: CrosswordMeta[K]) =>
    onChange({ ...meta, [key]: val })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Field label="название">
        <input value={meta.title} onChange={e => set('title', e.target.value)} style={inp} placeholder="портальные загадки" />
      </Field>

      <Field label="emoji">
        <input value={meta.emoji} onChange={e => set('emoji', e.target.value)} style={{ ...inp, width: '60px' }} />
      </Field>

      <Field label="автор">
        <input value={meta.author} onChange={e => set('author', e.target.value)} style={inp} />
      </Field>

      <Field label="категория">
        <input value={meta.category} onChange={e => set('category', e.target.value)} style={inp} placeholder="Рик и Морти" />
      </Field>

      <Field label="тема оформления">
        <select value={meta.theme_id} onChange={e => set('theme_id', e.target.value)} style={inp}>
          {themes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </Field>

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
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
}
