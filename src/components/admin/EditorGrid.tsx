'use client'

import { useMemo, useState } from 'react'
import type { Direction } from '@/lib/crossword/types'
import { checkPlacement, findValidPlacements } from '@/lib/crossword/editor'
import EditorCell from './EditorCell'

interface Props {
  size: number
  letterMap: Record<string, string>
  covered: Set<string>
  // current word being placed (if any)
  pendingWord: string | null
  pendingDirection: Direction
  onPlace: (row: number, col: number, dir: Direction) => void
  onCancelPending: () => void
}

export default function EditorGrid({
  size, letterMap, covered, pendingWord, pendingDirection, onPlace, onCancelPending,
}: Props) {
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null)
  const cellPx = Math.max(28, Math.min(40, Math.floor(560 / size)))

  // pre-compute valid placement starts when a word is pending
  const validStarts = useMemo(() => {
    if (!pendingWord) return new Set<string>()
    const valid = findValidPlacements(pendingWord, size, letterMap, 9999)
      .filter(p => p.dir === pendingDirection)
    return new Set(valid.map(p => `${p.row},${p.col}`))
  }, [pendingWord, pendingDirection, size, letterMap])

  // preview cells for current hover
  const preview = useMemo(() => {
    if (!pendingWord || !hover) {
      return { cells: new Set<string>(), conflicts: new Set<string>(), intersections: new Set<string>() }
    }
    const check = checkPlacement(pendingWord, hover.row, hover.col, pendingDirection, size, letterMap)
    const cells = new Set<string>()
    for (let i = 0; i < pendingWord.length; i++) {
      const r = pendingDirection === 'down' ? hover.row + i : hover.row
      const c = pendingDirection === 'across' ? hover.col + i : hover.col
      if (r < size && c < size) cells.add(`${r},${c}`)
    }
    return {
      cells,
      conflicts: new Set(check.conflicts.map(([r, c]) => `${r},${c}`)),
      intersections: new Set(check.intersections.map(([r, c]) => `${r},${c}`)),
    }
  }, [pendingWord, pendingDirection, hover, size, letterMap])

  const handleClick = (r: number, c: number) => {
    if (!pendingWord) return
    const check = checkPlacement(pendingWord, r, c, pendingDirection, size, letterMap)
    if (check.ok) onPlace(r, c, pendingDirection)
  }

  return (
    <div>
      {pendingWord && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px',
          padding: '10px 14px', background: '#eef2ff', borderRadius: '10px',
          fontSize: '13px', color: '#3730a3',
        }}>
          <span>ставлю <b>{pendingWord}</b> ({pendingDirection === 'across' ? '→ горизонталь' : '↓ вертикаль'})</span>
          <button onClick={onCancelPending} style={cancelBtn}>отмена</button>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
        gap: '2px',
        background: '#f3f4f6',
        padding: '4px',
        borderRadius: '8px',
        width: 'fit-content',
      }}>
        {Array.from({ length: size }).map((_, r) =>
          Array.from({ length: size }).map((_, c) => {
            const k = `${r},${c}`
            return (
              <EditorCell
                key={k}
                size={cellPx}
                letter={letterMap[k] ?? null}
                isCovered={covered.has(k)}
                isValid={validStarts.has(k)}
                isPreview={preview.cells.has(k)}
                isConflict={preview.conflicts.has(k)}
                isIntersection={preview.intersections.has(k)}
                onClick={() => handleClick(r, c)}
                onHover={() => setHover({ row: r, col: c })}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

const cancelBtn: React.CSSProperties = {
  marginLeft: 'auto',
  padding: '4px 10px',
  fontSize: '11px',
  border: 'none',
  background: '#fff',
  borderRadius: '6px',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
