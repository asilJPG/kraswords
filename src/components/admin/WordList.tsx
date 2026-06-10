'use client'

import type { Direction } from '@/lib/crossword/types'
import type { EditorWord } from '@/lib/crossword/editor'

interface Props {
  words: EditorWord[]
  pendingId: string | null
  pendingDirection: Direction
  orphans?: string[]
  onStartPlacement: (id: string) => void
  onSetDirection: (dir: Direction) => void
  onUnplace: (id: string) => void
  onDelete: (id: string) => void
  onEditClue: (id: string, clue: string) => void
}

export default function WordList({
  words, pendingId, pendingDirection, orphans,
  onStartPlacement, onSetDirection, onUnplace, onDelete, onEditClue,
}: Props) {
  const orphanSet = new Set(orphans ?? [])
  if (words.length === 0) {
    return <div style={{ padding: '12px', textAlign: 'center', color: 'var(--border-strong)', fontSize: '12px' }}>
      пока нет слов — добавь сверху
    </div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {words.map(w => {
        const isPending = pendingId === w.id
        const isOrphan = w.placed && orphanSet.has(w.id)
        return (
          <div key={w.id} style={{
            background: isPending ? 'rgba(99, 102, 241, 0.12)' : isOrphan ? 'var(--danger-soft)' : w.placed ? 'var(--accent-soft)' : 'var(--surface-2)',
            border: isPending ? '1px solid #6366f1' : isOrphan ? '1px solid var(--danger)' : '1px solid var(--border)',
            borderRadius: '10px',
            padding: '8px 10px',
            fontSize: '12px',
            color: 'var(--text)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>{w.answer}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{w.answer.length}б</span>
              {w.placed && !isPending && <span style={{ color: 'var(--accent)', fontSize: '10px', marginLeft: 'auto' }}>
                {w.direction === 'across' ? '→' : '↓'} ({w.row+1},{w.col+1})
              </span>}
            </div>
            <input
              type="text"
              value={w.clue}
              onChange={e => onEditClue(w.id, e.target.value)}
              placeholder="подсказка"
              style={{
                width: '100%',
                marginTop: '4px',
                padding: '4px 6px',
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '12px',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              {isPending ? (
                <>
                  <button onClick={() => onSetDirection('across')} style={dirBtn(pendingDirection === 'across')}>→</button>
                  <button onClick={() => onSetDirection('down')} style={dirBtn(pendingDirection === 'down')}>↓</button>
                  <span style={{ flex: 1, fontSize: '10px', color: '#6366f1', alignSelf: 'center' }}>клик на зелёную</span>
                </>
              ) : w.placed ? (
                <>
                  <button onClick={() => onUnplace(w.id)} style={miniBtn}>снять</button>
                  <button onClick={() => onStartPlacement(w.id)} style={miniBtn}>переставить</button>
                </>
              ) : (
                <button onClick={() => onStartPlacement(w.id)} style={primaryBtn}>поставить</button>
              )}
              <button onClick={() => onDelete(w.id)} style={{
                ...miniBtn, marginLeft: 'auto', color: 'var(--danger)',
              }}>×</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const miniBtn: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: '11px',
  background: 'var(--surface)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
const primaryBtn: React.CSSProperties = {
  ...miniBtn, background: '#6366f1', color: 'var(--bg)', border: 'none',
}
const dirBtn = (active: boolean): React.CSSProperties => ({
  ...miniBtn,
  background: active ? '#6366f1' : 'var(--surface)',
  color: active ? 'var(--bg)' : 'var(--text)',
  border: active ? 'none' : '1px solid var(--border)',
  width: '32px',
})
