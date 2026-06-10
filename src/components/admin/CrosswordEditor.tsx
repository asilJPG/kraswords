'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Direction } from '@/lib/crossword/types'
import { analyzeConnectivity, buildClues, type EditorWord } from '@/lib/crossword/editor'
import { saveCrossword } from '@/lib/crossword/api'
import { useEditorState, type CrosswordMeta } from './hooks/useEditorState'
import { useAutosave } from './hooks/useAutosave'
import { themes } from '@/lib/crosswords'
import type { CrosswordData } from '@/lib/crossword/types'
import CrosswordGame from '@/components/game/CrosswordGame'

import MetaForm from './MetaForm'
import AddWordForm from './AddWordForm'
import WordList from './WordList'
import EditorGrid from './EditorGrid'

interface Props {
  draftId: string                    // local id for autosave
  initialMeta?: Partial<CrosswordMeta>
  initialWords?: EditorWord[]
}

export default function CrosswordEditor({ draftId, initialMeta, initialWords }: Props) {
  const router = useRouter()
  const s = useEditorState({ meta: initialMeta, words: initialWords })
  useAutosave(draftId, s.meta, s.words)

  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pendingDir, setPendingDir] = useState<Direction>('across')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)

  const pendingWord = pendingId ? s.words.find(w => w.id === pendingId) ?? null : null
  const conn = useMemo(() => analyzeConnectivity(s.words), [s.words])

  const previewCrossword = useMemo<CrosswordData | null>(() => {
    if (!isPreview) return null
    const clues = buildClues(s.words)
    const baseTheme = themes[s.meta.theme_id] ?? themes.default
    const theme = s.meta.theme_custom
      ? { ...baseTheme, ...s.meta.theme_custom }
      : baseTheme

    return {
      id: s.meta.id || 'preview',
      title: s.meta.title || 'Предпросмотр кроссворда',
      author: s.meta.author || 'аноним',
      date: new Date().toISOString().slice(0, 10),
      difficulty: s.meta.difficulty,
      emoji: s.meta.emoji,
      size: s.meta.size,
      clues,
      solvers: 0,
      theme,
      wordCount: clues.length,
      category: s.meta.category,
    }
  }, [isPreview, s.meta, s.words])

  const startPlacement = (id: string) => {
    setPendingId(id)
    const w = s.words.find(x => x.id === id)
    if (w?.placed) {
      setPendingDir(w.direction)
      s.unplaceWord(id)
    }
  }

  const handlePlace = (row: number, col: number, dir: Direction) => {
    if (!pendingId) return
    s.placeWord(pendingId, row, col, dir)
    setPendingId(null)
  }

  const handleSave = async () => {
    setSaveError(null)
    const placed = s.words.filter(w => w.placed)
    if (placed.length < 2) {
      setSaveError('нужно минимум 2 поставленных слова')
      return
    }
    if (!s.meta.id) {
      setSaveError('задай id (slug) в форме сверху')
      return
    }
    if (!s.meta.title) {
      setSaveError('задай название')
      return
    }
    if (!conn.connected) {
      setSaveError(`${conn.orphans.length} слов не пересекаются с основной сеткой`)
      return
    }
    if (conn.intersectionCount < placed.length - 1) {
      setSaveError('слабые пересечения — каждое слово должно пересекаться хотя бы с одним другим')
      return
    }
    const clues = buildClues(s.words)
    setSaving(true)
    try {
      await saveCrossword({
        id: s.meta.id,
        title: s.meta.title,
        author: s.meta.author,
        emoji: s.meta.emoji,
        category: s.meta.category,
        difficulty: s.meta.difficulty,
        theme_id: s.meta.theme_id,
        theme_custom: s.meta.theme_custom,
        size: s.meta.size,
        clues,
        word_count: clues.length,
        published: s.meta.published,
      })
      router.push('/admin')
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', gap: '16px', alignItems: 'start' }}>
      {/* LEFT: meta */}
      <aside style={card}>
        <SectionTitle>метаданные</SectionTitle>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <span style={lblSpan}>id (slug)</span>
          <input
            value={s.meta.id}
            onChange={e => s.setMeta({ ...s.meta, id: e.target.value })}
            placeholder="my-crossword-1"
            style={{
              padding: '8px 10px', background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: '8px', fontSize: '13px', outline: 'none',
              fontFamily: 'monospace', width: '100%',
            }}
          />
        </label>
        <MetaForm meta={s.meta} onChange={s.setMeta} />
      </aside>

      {/* CENTER: grid */}
      <section style={card}>
        <SectionTitle>сетка</SectionTitle>
        <EditorGrid
          size={s.meta.size}
          letterMap={s.letterMap}
          covered={s.covered}
          pendingWord={pendingWord?.answer ?? null}
          pendingDirection={pendingDir}
          onPlace={handlePlace}
          onCancelPending={() => setPendingId(null)}
        />
        <div style={{
          marginTop: '16px',
          display: 'flex', flexWrap: 'wrap', gap: '8px',
          fontSize: '12px',
        }}>
          <span style={{ color: '#9ca3af' }}>
            поставлено: <b style={{ color: '#111' }}>{conn.placedCount}</b> из {s.words.length}
          </span>
          <span style={{ color: '#9ca3af' }}>·</span>
          <span style={{ color: '#9ca3af' }}>
            пересечений: <b style={{ color: '#111' }}>{conn.intersectionCount}</b>
          </span>
          <span style={{ color: '#9ca3af' }}>·</span>
          {conn.connected && conn.placedCount > 0 ? (
            <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ связано</span>
          ) : conn.placedCount > 1 ? (
            <span style={{ color: '#dc2626', fontWeight: 600 }}>
              ✗ {conn.orphans.length} сирот
            </span>
          ) : (
            <span style={{ color: '#9ca3af' }}>—</span>
          )}
        </div>

        {saveError && (
          <div style={{
            marginTop: '12px', padding: '10px 12px', borderRadius: '8px',
            background: '#fef2f2', color: '#dc2626', fontSize: '12px',
          }}>{saveError}</div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '10px 16px',
            background: '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
            fontFamily: 'inherit',
            flex: 1,
          }}>
            {saving ? 'сохраняем...' : 'сохранить в supabase'}
          </button>

          <button
            type="button"
            onClick={() => setIsPreview(true)}
            style={{
              padding: '10px 16px',
              background: '#f3f4f6',
              color: '#1f2937',
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Предпросмотр темы
          </button>
        </div>
      </section>

      {/* RIGHT: words */}
      <aside style={card}>
        <SectionTitle>слова</SectionTitle>
        <AddWordForm onAdd={s.addWord} />
        <div style={{ marginTop: '12px' }}>
          <WordList
            words={s.words}
            pendingId={pendingId}
            pendingDirection={pendingDir}
            orphans={conn.orphans}
            onStartPlacement={startPlacement}
            onSetDirection={setPendingDir}
            onUnplace={s.unplaceWord}
            onDelete={(id) => {
              s.removeWord(id)
              if (pendingId === id) setPendingId(null)
            }}
            onEditClue={s.updateClue}
          />
        </div>
      </aside>
      {isPreview && previewCrossword && (
        <>
          <button
            onClick={() => setIsPreview(false)}
            style={{
              position: 'fixed',
              top: '16px',
              left: '16px',
              zIndex: 300,
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
              transition: 'transform 0.2s',
            }}
          >
            ← Выйти из предпросмотра
          </button>
          <CrosswordGame crossword={previewCrossword} />
        </>
      )}
    </div>
  )
}

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: '14px',
  padding: '16px',
  border: '1px solid #f3f4f6',
}

const lblSpan: React.CSSProperties = {
  display: 'block', fontSize: '10px', textTransform: 'uppercase',
  letterSpacing: '0.5px', color: '#9ca3af', fontWeight: 600, marginBottom: '4px',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>{children}</h2>
}
