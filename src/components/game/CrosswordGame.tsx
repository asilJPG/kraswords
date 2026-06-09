'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CrosswordData } from '@/lib/crossword/types'
import { buildCells, buildCorrectLetters } from '@/lib/crossword/grid'
import { getClueKey } from '@/lib/crossword/clue-utils'
import { formatTime } from '@/lib/crossword/format'
import { saveGame } from '@/lib/gameHistory'
import ResultSheet from '@/components/ResultSheet'

import Particles from './effects/Particles'
import PortalDrips from './effects/PortalDrips'
import MagicSparkles from './effects/MagicSparkles'

import HiddenInput from './HiddenInput'
import GameNav from './GameNav'
import ClueBanner from './ClueBanner'
import Grid from './Grid'
import GameControls from './GameControls'
import CluesList from './CluesList'

import { useTimer } from './hooks/useTimer'
import { useWindowWidth } from './hooks/useWindowWidth'
import { useHideMainNav } from './hooks/useHideMainNav'
import { useCellSelection } from './hooks/useCellSelection'
import { useCrosswordInput } from './hooks/useCrosswordInput'

export default function CrosswordGame({ crossword }: { crossword: CrosswordData }) {
  useHideMainNav()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [rank, setRank] = useState<number | null>(null)

  const cells = useMemo(() => buildCells(crossword), [crossword])
  const correctLetters = useMemo(() => buildCorrectLetters(crossword), [crossword])

  const theme = crossword.theme
  const isDark = theme.id !== 'default' && theme.id !== 'nature'

  const hiddenInputRef = useRef<HTMLInputElement>(null)

  const sel = useCellSelection(crossword, cells, hiddenInputRef)

  // timer ref so onSolved callback always sees the latest time
  const timerRef = useRef(0)
  const inp = useCrosswordInput({
    crossword,
    cells,
    selected: sel.selected,
    setSelected: sel.setSelected,
    moveSelected: sel.moveSelected,
    direction: sel.direction,
    directionRef: sel.directionRef,
    hiddenInputRef,
    onSolved: () => {
      const t = timerRef.current
      saveGame({ crosswordId: crossword.id, time: t, date: new Date().toISOString(), solved: true })
      fetch('/api/game-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crossword_id: crossword.id, time_seconds: t, solved: true }),
      })
        .then(r => r.json())
        .then(d => { if (d.rank) setRank(d.rank) })
        .catch(() => null)
      setSheetOpen(true)
    },
  })

  const { timer, reset: resetTimer } = useTimer(sel.running, inp.solved)
  useEffect(() => { timerRef.current = timer }, [timer])

  const activeClueObj = sel.activeClue
    ? crossword.clues.find(c => getClueKey(c) === sel.activeClue) || null
    : null

  const windowWidth = useWindowWidth(460)
  const isMobile = windowWidth < 640
  const gap = 2
  const maxGrid = isMobile ? windowWidth - 24 : 460
  const cellSize = Math.min(48, Math.floor((maxGrid - gap * (crossword.size - 1)) / crossword.size))

  const handleReset = () => {
    inp.reset()
    resetTimer()
    sel.reset()
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: theme.bgImage || theme.pageBg,
      color: theme.textColor,
      overflowY: 'auto',
      zIndex: 200,
      fontFamily: theme.fontFamily || 'inherit',
    }}>
      <HiddenInput
        ref={hiddenInputRef}
        onInput={inp.handleMobileInput}
        onBackspace={inp.handleBackspace}
      />

      <Particles theme={theme} />
      <PortalDrips theme={theme} />
      <MagicSparkles theme={theme} />

      <GameNav
        theme={theme}
        emoji={crossword.emoji}
        title={crossword.title}
        timer={timer}
        solved={inp.solved}
      />

      <main style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: isMobile ? '16px 12px 40px' : '28px 20px 60px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <p style={{ fontSize: '13px', color: theme.mutedColor }}>
            {crossword.category} · {crossword.author} · {crossword.wordCount} слов
          </p>
          <span style={{ fontSize: '11px', color: theme.mutedColor }}>
            {inp.solved ? 'решён' : sel.running ? 'идёт...' : 'нажми на клетку'}
          </span>
        </div>

        {inp.solved && (
          <div style={{
            background: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
            border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            fontSize: '15px',
            color: isDark ? '#4ade80' : '#166534',
            fontWeight: 500,
          }}>
            кроссворд решён за {formatTime(timer)}
          </div>
        )}

        {activeClueObj && <ClueBanner clue={activeClueObj} theme={theme} isDark={isDark} />}

        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'flex-start',
          gap: isMobile ? '20px' : '36px',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: '0 0 auto' }}>
            <Grid
              cells={cells}
              size={crossword.size}
              cellSize={cellSize}
              selected={sel.selected}
              activeClueObj={activeClueObj}
              input={inp.input}
              checked={inp.checked}
              correctLetters={correctLetters}
              theme={theme}
              isDark={isDark}
              onSelectCell={sel.selectCell}
            />
            <GameControls
              theme={theme}
              isDark={isDark}
              onCheck={() => inp.setChecked(true)}
              onReset={handleReset}
            />
          </div>

          <CluesList
            clues={crossword.clues}
            activeClue={sel.activeClue}
            theme={theme}
            isMobile={isMobile}
            onSelectClue={sel.selectClue}
          />
        </div>
      </main>

      <ResultSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        time={timer}
        rank={rank}
        crosswordTitle={crossword.title}
      />
    </div>
  )
}
