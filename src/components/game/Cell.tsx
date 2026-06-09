'use client'

import type { Cell as CellType, ThemeConfig, CellStatus } from '@/lib/crossword/types'

interface Props {
  cell: CellType
  cellSize: number
  isSelected: boolean
  isHighlighted: boolean
  status: CellStatus
  letter: string
  theme: ThemeConfig
  isDark: boolean
  onClick: () => void
}

export default function Cell({
  cell, cellSize, isSelected, isHighlighted, status, letter, theme, isDark, onClick,
}: Props) {
  if (cell.isBlack) {
    return <div style={{ width: cellSize, height: cellSize, background: theme.blackCellBg }} />
  }

  let bg = theme.cellBg
  if (isSelected) bg = theme.cellActiveBg
  else if (isHighlighted) bg = theme.cellHighlightBg
  if (status === 'correct') bg = isDark ? 'rgba(34, 197, 94, 0.25)' : '#dcfce7'
  if (status === 'wrong') bg = isDark ? 'rgba(239, 68, 68, 0.25)' : '#fef2f2'

  return (
    <div
      onClick={onClick}
      style={{
        width: cellSize,
        height: cellSize,
        background: bg,
        border: `1.5px solid ${isSelected ? theme.accentColor : theme.cellBorder + (isDark ? '40' : '')}`,
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        transition: 'all 0.1s ease',
        boxShadow: isSelected && theme.glowColor
          ? `0 0 14px ${theme.glowColor}50, inset 0 0 8px ${theme.glowColor}15`
          : 'none',
      }}
    >
      {cell.number && (
        <span style={{
          position: 'absolute',
          top: '2px',
          left: '3px',
          fontSize: `${Math.max(8, cellSize * 0.2)}px`,
          color: isDark ? theme.accentColor + '80' : '#9ca3af',
          lineHeight: 1,
          fontWeight: 600,
        }}>
          {cell.number}
        </span>
      )}
      <span style={{
        fontSize: `${Math.max(14, cellSize * 0.45)}px`,
        fontWeight: 600,
        color: status === 'correct'
          ? (isDark ? '#4ade80' : '#16a34a')
          : status === 'wrong'
            ? (isDark ? '#f87171' : '#dc2626')
            : theme.cellText,
      }}>
        {letter}
      </span>
    </div>
  )
}
