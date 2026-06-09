'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { CrosswordData, Clue, Direction, ThemeConfig } from '@/lib/crosswords'
import Link from 'next/link'

interface Cell {
  row: number
  col: number
  letter: string
  isBlack: boolean
  number?: number
}

function buildCells(cw: CrosswordData): Cell[][] {
  const size = cw.size
  const cells: Cell[][] = Array(size).fill(null).map((_, r) =>
    Array(size).fill(null).map((_, c) => ({
      row: r, col: c, letter: '', isBlack: false, number: undefined,
    }))
  )

  const covered = new Set<string>()
  for (const clue of cw.clues) {
    for (let i = 0; i < clue.length; i++) {
      const r = clue.direction === 'down' ? clue.row + i : clue.row
      const c = clue.direction === 'across' ? clue.col + i : clue.col
      if (r < size && c < size) covered.add(`${r},${c}`)
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!covered.has(`${r},${c}`)) cells[r][c].isBlack = true
    }
  }

  const numbered = new Set<string>()
  for (const clue of cw.clues) {
    const key = `${clue.row},${clue.col}`
    if (!numbered.has(key)) {
      cells[clue.row][clue.col].number = clue.number
      numbered.add(key)
    }
  }

  return cells
}

function getClueKey(clue: Clue): string {
  return `${clue.number}-${clue.direction}`
}

function getCellsForClue(clue: Clue): Array<[number, number]> {
  return Array(clue.length).fill(0).map((_, i) => [
    clue.direction === 'down' ? clue.row + i : clue.row,
    clue.direction === 'across' ? clue.col + i : clue.col,
  ])
}

function findCluesForCell(clues: Clue[], row: number, col: number): Clue[] {
  return clues.filter(clue =>
    getCellsForClue(clue).some(([r, c]) => r === row && c === col)
  )
}

function Particles({ theme }: { theme: ThemeConfig }) {
  if (!theme.particleColor) return null
  const particles = Array(30).fill(0).map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    size: 2 + Math.random() * 3,
    opacity: 0.15 + Math.random() * 0.3,
  }))

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: `${p.top}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '50%',
          background: theme.particleColor,
          opacity: p.opacity,
          animation: `twinkle ${p.duration}s ${p.delay}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  )
}

function PortalDrips({ theme }: { theme: ThemeConfig }) {
  if (theme.id !== 'rickmorty') return null
  const drips = Array(10).fill(0).map(() => ({
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 5 + Math.random() * 4,
    width: 2 + Math.random() * 2,
    height: 30 + Math.random() * 60,
  }))

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {drips.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${d.left}%`,
          top: 0,
          width: `${d.width}px`,
          height: `${d.height}px`,
          background: `linear-gradient(180deg, transparent, ${theme.particleColor}60, transparent)`,
          borderRadius: '2px',
          animation: `drip ${d.duration}s ${d.delay}s infinite linear`,
        }} />
      ))}
    </div>
  )
}

function MagicSparkles({ theme }: { theme: ThemeConfig }) {
  if (theme.id !== 'harrypotter') return null
  const sparkles = Array(18).fill(0).map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 2 + Math.random() * 3,
    size: 3 + Math.random() * 5,
  }))

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {sparkles.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${s.left}%`,
          top: `${s.top}%`,
          width: `${s.size}px`,
          height: `${s.size}px`,
          background: theme.particleColor,
          borderRadius: '50%',
          boxShadow: `0 0 ${s.size * 2}px ${theme.particleColor}`,
          animation: `sparkle ${s.duration}s ${s.delay}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  )
}

export default function CrosswordGame({ crossword }: { crossword: CrosswordData }) {
  const [cells] = useState(() => buildCells(crossword))
  const [input, setInput] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [activeClue, setActiveClue] = useState<string | null>(null)
  const [direction, setDirection] = useState<Direction>('across')
  const [checked, setChecked] = useState(false)
  const [solved, setSolved] = useState(false)
  const [timer, setTimer] = useState(0)
  const [running, setRunning] = useState(false)
  const inputRef = useRef(input)
  inputRef.current = input

  const theme = crossword.theme
  const isDark = theme.id !== 'default' && theme.id !== 'nature'

  // hide the main Nav when this component mounts
  useEffect(() => {
    const mainNav = document.querySelector('[data-main-nav]') as HTMLElement | null
    if (mainNav) mainNav.style.display = 'none'
    return () => {
      if (mainNav) mainNav.style.display = ''
    }
  }, [])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (running && !solved) {
      interval = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [running, solved])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const getActiveClue = useCallback((row: number, col: number, dir: Direction): Clue | null => {
    const cluesForCell = findCluesForCell(crossword.clues, row, col)
    return cluesForCell.find(c => c.direction === dir) || cluesForCell[0] || null
  }, [crossword.clues])

  const selectCell = useCallback((row: number, col: number) => {
    if (cells[row][col].isBlack) return
    if (!running) setRunning(true)

    if (selected?.row === row && selected?.col === col) {
      const newDir: Direction = direction === 'across' ? 'down' : 'across'
      setDirection(newDir)
      const clue = getActiveClue(row, col, newDir)
      setActiveClue(clue ? getClueKey(clue) : null)
    } else {
      setSelected({ row, col })
      const clue = getActiveClue(row, col, direction)
      if (clue) {
        setActiveClue(getClueKey(clue))
      } else {
        const otherDir: Direction = direction === 'across' ? 'down' : 'across'
        const otherClue = getActiveClue(row, col, otherDir)
        if (otherClue) {
          setDirection(otherDir)
          setActiveClue(getClueKey(otherClue))
        }
      }
    }
  }, [cells, selected, direction, running, getActiveClue])

  const checkSolved = useCallback((currentInput: Record<string, string>) => {
    for (const clue of crossword.clues) {
      const positions = getCellsForClue(clue)
      for (let i = 0; i < clue.answer.length; i++) {
        const [r, c] = positions[i]
        if (currentInput[`${r},${c}`] !== clue.answer[i]) return false
      }
    }
    return true
  }, [crossword.clues])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!selected) return
    const { row, col } = selected

    if (e.key === 'Backspace') {
      const key = `${row},${col}`
      if (inputRef.current[key]) {
        setInput(prev => { const n = { ...prev }; delete n[key]; return n })
      } else {
        const nr = direction === 'down' ? row - 1 : row
        const nc = direction === 'across' ? col - 1 : col
        if (nr >= 0 && nc >= 0 && !cells[nr]?.[nc]?.isBlack) {
          setSelected({ row: nr, col: nc })
          const k = `${nr},${nc}`
          if (inputRef.current[k]) setInput(prev => { const n = { ...prev }; delete n[k]; return n })
        }
      }
      return
    }

    if (e.key === 'ArrowRight') { setDirection('across'); const c = getActiveClue(row, col, 'across'); setActiveClue(c ? getClueKey(c) : null); return }
    if (e.key === 'ArrowDown') { setDirection('down'); const c = getActiveClue(row, col, 'down'); setActiveClue(c ? getClueKey(c) : null); return }
    if (e.key === 'ArrowLeft' && col > 0 && !cells[row][col-1].isBlack) { setSelected({ row, col: col - 1 }); return }
    if (e.key === 'ArrowUp' && row > 0 && !cells[row-1]?.[col]?.isBlack) { setSelected({ row: row - 1, col }); return }

    if (/^[а-яёА-ЯЁa-zA-Z]$/.test(e.key)) {
      const letter = e.key.toUpperCase()
      const newInput = { ...inputRef.current, [`${row},${col}`]: letter }
      setInput(newInput)
      setChecked(false)

      const size = crossword.size
      if (direction === 'across') {
        let nc = col + 1
        while (nc < size && cells[row][nc].isBlack) nc++
        if (nc < size) setSelected({ row, col: nc })
      } else {
        let nr = row + 1
        while (nr < size && cells[nr]?.[col]?.isBlack) nr++
        if (nr < size) setSelected({ row: nr, col })
      }

      if (checkSolved(newInput)) { setSolved(true); setRunning(false) }
    }
  }, [selected, direction, cells, crossword, getActiveClue, checkSolved])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const activeClueObj = activeClue
    ? crossword.clues.find(c => getClueKey(c) === activeClue) || null
    : null

  const isHighlighted = (row: number, col: number) => {
    if (!activeClueObj) return false
    return getCellsForClue(activeClueObj).some(([r, c]) => r === row && c === col)
  }

  const getCellStatus = (row: number, col: number): 'correct' | 'wrong' | 'neutral' => {
    if (!checked) return 'neutral'
    const userLetter = input[`${row},${col}`]
    if (!userLetter) return 'neutral'
    for (const clue of crossword.clues) {
      const positions = getCellsForClue(clue)
      for (let i = 0; i < positions.length; i++) {
        const [r, c] = positions[i]
        if (r === row && c === col) {
          return userLetter === clue.answer[i] ? 'correct' : 'wrong'
        }
      }
    }
    return 'neutral'
  }

  const handleCheck = () => setChecked(true)
  const handleReset = () => {
    setInput({})
    setChecked(false)
    setSolved(false)
    setTimer(0)
    setRunning(false)
    setSelected(null)
  }

  const cellSize = Math.min(48, Math.floor((Math.min(460, typeof window !== 'undefined' ? window.innerWidth - 40 : 460)) / crossword.size))
  const acrossClues = crossword.clues.filter(c => c.direction === 'across')
  const downClues = crossword.clues.filter(c => c.direction === 'down')

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
      <Particles theme={theme} />
      <PortalDrips theme={theme} />
      <MagicSparkles theme={theme} />

      {/* themed nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: theme.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.navBorder}`,
      }}>
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 20px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{
            fontSize: '13px',
            color: theme.mutedColor,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            ← назад
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{crossword.emoji}</span>
            <span style={{
              fontWeight: 600,
              fontSize: '15px',
              color: theme.textColor,
            }}>
              {crossword.title}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              color: solved ? '#22c55e' : theme.textColor,
            }}>
              {formatTime(timer)}
            </div>
          </div>
        </div>
      </nav>

      <main style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '28px 20px 60px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* subtitle */}
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
            {solved ? 'решён' : running ? 'идёт...' : 'нажми на клетку'}
          </span>
        </div>

        {solved && (
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

        {/* active clue hint */}
        {activeClueObj && (
          <div style={{
            background: theme.clueActiveBg,
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '24px',
            fontSize: '14px',
            color: theme.textColor,
            border: `1px solid ${isDark ? theme.accentColor + '25' : '#e5e7eb'}`,
          }}>
            <span style={{
              color: theme.accentColor,
              marginRight: '8px',
              fontWeight: 700,
            }}>
              {activeClueObj.number}{activeClueObj.direction === 'across' ? '→' : '↓'}
            </span>
            {activeClueObj.clue}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '36px',
          flexWrap: 'wrap',
        }}>
          {/* grid */}
          <div style={{ flex: '0 0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${crossword.size}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${crossword.size}, ${cellSize}px)`,
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
                  const isSelected = selected?.row === r && selected?.col === c
                  const isHigh = isHighlighted(r, c)
                  const status = getCellStatus(r, c)
                  const userLetter = input[key] || ''

                  if (cell.isBlack) {
                    return (
                      <div key={key} style={{
                        width: cellSize,
                        height: cellSize,
                        background: theme.blackCellBg,
                      }} />
                    )
                  }

                  let bg = theme.cellBg
                  if (isSelected) bg = theme.cellActiveBg
                  else if (isHigh) bg = theme.cellHighlightBg
                  if (status === 'correct') bg = isDark ? 'rgba(34, 197, 94, 0.25)' : '#dcfce7'
                  if (status === 'wrong') bg = isDark ? 'rgba(239, 68, 68, 0.25)' : '#fef2f2'

                  return (
                    <div
                      key={key}
                      onClick={() => selectCell(r, c)}
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
                        {userLetter}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={handleCheck}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: isDark ? theme.accentColor + '18' : '#f3f4f6',
                  border: `1px solid ${isDark ? theme.accentColor + '35' : '#e5e7eb'}`,
                  borderRadius: '10px',
                  color: isDark ? theme.accentColor : '#374151',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
              >
                проверить
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: `1px solid ${isDark ? theme.accentColor + '20' : '#e5e7eb'}`,
                  borderRadius: '10px',
                  color: theme.mutedColor,
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
              >
                сброс
              </button>
            </div>
          </div>

          {/* clues */}
          <div style={{
            flex: 1,
            minWidth: '200px',
            display: 'flex',
            gap: '28px',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <p style={{
                fontSize: '11px',
                color: theme.mutedColor,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '12px',
                fontWeight: 600,
              }}>
                по горизонтали
              </p>
              {acrossClues.map(clue => {
                const key = getClueKey(clue)
                const isActive = activeClue === key
                return (
                  <div
                    key={key}
                    onClick={() => {
                      setDirection('across')
                      setActiveClue(key)
                      setSelected({ row: clue.row, col: clue.col })
                    }}
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

            <div style={{ flex: 1, minWidth: '160px' }}>
              <p style={{
                fontSize: '11px',
                color: theme.mutedColor,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '12px',
                fontWeight: 600,
              }}>
                по вертикали
              </p>
              {downClues.map(clue => {
                const key = getClueKey(clue)
                const isActive = activeClue === key
                return (
                  <div
                    key={key}
                    onClick={() => {
                      setDirection('down')
                      setActiveClue(key)
                      setSelected({ row: clue.row, col: clue.col })
                    }}
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
          </div>
        </div>
      </main>
    </div>
  )
}
