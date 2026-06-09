'use client'

import type { Direction } from '@/lib/crossword/types'
import type { EditorWord } from '@/lib/crossword/editor'

interface Props {
  words: EditorWord[]
  pendingId: string | null
  pendingDirection: Direction
  onStartPlacement: (id: string) => void
  onSetDirection: (dir: Direction) => void
  onUnplace: (id: string) => void
  onDelete: (id: string) => void
  onEditClue: (id: string, clue: string) => void
}

export default function WordList({
  words, pendingId, pendingDirection,
  onStartPlacement, onSetDirection, onUnplace, onDelete, onEditClue,
}: Props) {
  if (words.length === 0) {
    return <div style={{ padding: '12px', textAlign: 'center', color: '#d1d5db', fontSize: '12px' }}>
      пока нет слов — добавь сверху
    </div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {words.map(w => {
        const isPending = pendingId === w.id
        return (
          <div key={w.id} style={{
            background: isPending ? '#eef2ff' : w.placed ? '#f0fdf4' : '#f9fafb',
            border: isPending ? '1px solid #c7d2fe' : '1px solid transparent',
            borderRadius: '10px',
            padding: '8px 10px',
            fontSize: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>{w.answer}</span>
              <span style={{ color: '#9ca3af', fontSize: '10px' }}>{w.answer.length}б</span>
              {w.placed && !isPending && <span style={{ color: '#16a34a', fontSize: '10px', marginLeft: 'auto' }}>
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
                background: '#fff',
                border: '1px solid #e5e7eb',
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
                ...miniBtn, marginLeft: 'auto', color: '#dc2626',
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
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
const primaryBtn: React.CSSProperties = {
  ...miniBtn, background: '#6366f1', color: '#fff', border: 'none',
}
const dirBtn = (active: boolean): React.CSSProperties => ({
  ...miniBtn,
  background: active ? '#6366f1' : '#fff',
  color: active ? '#fff' : '#111827',
  border: active ? 'none' : '1px solid #e5e7eb',
  width: '32px',
})
