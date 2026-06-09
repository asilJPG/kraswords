import { useCallback, useRef, useState } from 'react'
import type { CrosswordData, Cell, Clue, Direction } from '@/lib/crossword/types'
import { findCluesForCell, getClueKey } from '@/lib/crossword/clue-utils'

export function useCellSelection(crossword: CrosswordData, cells: Cell[][], hiddenInputRef: React.RefObject<HTMLInputElement | null>) {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [direction, setDirection] = useState<Direction>('across')
  const [activeClue, setActiveClue] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  // Always-current refs to avoid stale closures
  const directionRef = useRef<Direction>('across')
  const selectedRef = useRef<{ row: number; col: number } | null>(null)

  const setDirectionSync = useCallback((d: Direction) => {
    directionRef.current = d
    setDirection(d)
  }, [])

  const setSelectedSync = useCallback((s: { row: number; col: number } | null) => {
    selectedRef.current = s
    setSelected(s)
  }, [])

  const getActiveClue = useCallback((row: number, col: number, dir: Direction): Clue | null => {
    const cluesForCell = findCluesForCell(crossword.clues, row, col)
    return cluesForCell.find(c => c.direction === dir) ?? null
  }, [crossword.clues])

  const selectCell = useCallback((row: number, col: number) => {
    if (cells[row][col].isBlack) return
    if (!running) setRunning(true)
    setTimeout(() => hiddenInputRef.current?.focus(), 0)

    const prev = selectedRef.current
    const curDir = directionRef.current

    // Same cell → toggle direction
    if (prev?.row === row && prev?.col === col) {
      const newDir: Direction = curDir === 'across' ? 'down' : 'across'
      const clue = getActiveClue(row, col, newDir)
      if (clue) {
        setDirectionSync(newDir)
        setActiveClue(getClueKey(clue))
      }
      return
    }

    setSelectedSync({ row, col })

    // Infer direction from movement (same col = probably going down)
    let preferredDir = curDir
    if (prev) {
      if (prev.col === col && prev.row !== row) preferredDir = 'down'
      else if (prev.row === row && prev.col !== col) preferredDir = 'across'
    }

    const clue = getActiveClue(row, col, preferredDir)
    if (clue) {
      setDirectionSync(preferredDir)
      setActiveClue(getClueKey(clue))
    } else {
      const otherDir: Direction = preferredDir === 'across' ? 'down' : 'across'
      const otherClue = getActiveClue(row, col, otherDir)
      if (otherClue) {
        setDirectionSync(otherDir)
        setActiveClue(getClueKey(otherClue))
      }
    }
  }, [cells, running, getActiveClue, hiddenInputRef, setDirectionSync, setSelectedSync])

  // Move cursor during typing — keeps direction, updates clue highlight
  const moveSelected = useCallback((row: number, col: number) => {
    setSelectedSync({ row, col })
    const clue = getActiveClue(row, col, directionRef.current)
    if (clue) setActiveClue(getClueKey(clue))
  }, [getActiveClue, setSelectedSync])

  const selectClue = useCallback((clue: Clue) => {
    setDirectionSync(clue.direction)
    setActiveClue(getClueKey(clue))
    setSelectedSync({ row: clue.row, col: clue.col })
    if (!running) setRunning(true)
    setTimeout(() => hiddenInputRef.current?.focus(), 0)
  }, [running, hiddenInputRef, setDirectionSync, setSelectedSync])

  const reset = useCallback(() => {
    setSelectedSync(null)
    setActiveClue(null)
    setRunning(false)
    setDirectionSync('across')
  }, [setSelectedSync, setDirectionSync])

  return {
    selected, setSelected: setSelectedSync,
    direction, setDirection: setDirectionSync,
    directionRef,
    activeClue, setActiveClue,
    running, setRunning,
    selectCell, selectClue, moveSelected,
    getActiveClue, reset,
  }
}
