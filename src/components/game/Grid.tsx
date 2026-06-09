'use client'

import type { Cell as CellType, Clue, ThemeConfig, CellStatus } from '@/lib/crossword/types'
import { getCellsForClue } from '@/lib/crossword/clue-utils'
import Cell from './Cell'

interface Props {
  cells: CellType[][]
  size: number
  cellSize: number
  selected: { row: number; col: number } | null
  activeClueObj: Clue | null
  input: Record<string, string>
  checked: boolean
  correctLetters: Record<string, string>
  theme: ThemeConfig
  isDark: boolean
  onSelectCell: (row: number, col: number) => void
}

export default function Grid({
  cells, size, cellSize, selected, activeClueObj, input, checked, correctLetters, theme, isDark, onSelectCell,
}: Props) {
  const highlightedKeys = new Set(
    activeClueObj
      ? getCellsForClue(activeClueObj).map(([r, c]) => `${r},${c}`)
      : []
  )

  const getStatus = (r: number, c: number): CellStatus => {
    if (!checked) return 'neutral'
    const userLetter = input[`${r},${c}`]
    if (!userLetter) return 'neutral'
    const expected = correctLetters[`${r},${c}`]
    if (!expected) return 'neutral'
    return userLetter === expected ? 'correct' : 'wrong'
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
      gap: '2px',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: theme.glowColor
        ? `0 0 40px ${theme.glowColor}15`
        : '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {cells.map((row, r) =>
        row.map((cell, c) => {
          const key = `${r},${c}`
          return (
            <Cell
              key={key}
              cell={cell}
              cellSize={cellSize}
              isSelected={selected?.row === r && selected?.col === c}
              isHighlighted={highlightedKeys.has(key)}
              status={getStatus(r, c)}
              letter={input[key] || ''}
              theme={theme}
              isDark={isDark}
              onClick={() => onSelectCell(r, c)}
            />
          )
        })
      )}
    </div>
  )
}
