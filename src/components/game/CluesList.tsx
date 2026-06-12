'use client'

import type { Clue, ThemeConfig } from '@/lib/crossword/types'
import { getClueKey } from '@/lib/crossword/clue-utils'

interface ColumnProps {
  title: string
  clues: Clue[]
  activeClue: string | null
  theme: ThemeConfig
  onSelectClue: (clue: Clue) => void
}

function CluesColumn({ title, clues, activeClue, theme, onSelectClue }: ColumnProps) {
  return (
    <div style={{ flex: 1, minWidth: '160px' }}>
      <p style={{
        fontSize: '11px',
        color: theme.mutedColor,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginBottom: '12px',
        fontWeight: 600,
      }}>
        {title}
      </p>
      {clues.map(clue => {
        const key = getClueKey(clue)
        const isActive = activeClue === key
        return (
          <div
            key={key}
            onClick={() => onSelectClue(clue)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              marginBottom: '2px',
              cursor: 'pointer',
              background: isActive ? theme.clueActiveBg : 'transparent',
              transition: 'background 0.1s ease',
            }}
          >
            <span style={{
              color: theme.accentColor,
              fontSize: '12px',
              marginRight: '6px',
              fontWeight: 700,
            }}>
              {clue.number}.
            </span>
            <span style={{
              fontSize: '13px',
              color: isActive ? theme.textColor : theme.mutedColor,
            }}>
              {clue.clue}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface Props {
  clues: Clue[]
  activeClue: string | null
  theme: ThemeConfig
  isMobile: boolean
  onSelectClue: (clue: Clue) => void
}

export default function CluesList({ clues, activeClue, theme, isMobile, onSelectClue }: Props) {
  const across = clues.filter(c => c.direction === 'across').sort((a, b) => a.number - b.number)
  const down = clues.filter(c => c.direction === 'down').sort((a, b) => a.number - b.number)
  return (
    <div style={{
      flex: 1,
      minWidth: isMobile ? '100%' : '200px',
      width: isMobile ? '100%' : 'auto',
      display: 'flex',
      gap: isMobile ? '20px' : '28px',
      flexWrap: 'wrap',
    }}>
      <CluesColumn title="по горизонтали" clues={across} activeClue={activeClue} theme={theme} onSelectClue={onSelectClue} />
      <CluesColumn title="по вертикали" clues={down} activeClue={activeClue} theme={theme} onSelectClue={onSelectClue} />
    </div>
  )
}
