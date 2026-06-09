import { useCallback, useState } from 'react'
import type { CrosswordData, Cell, Clue, Direction } from '@/lib/crossword/types'
import { findCluesForCell, getClueKey } from '@/lib/crossword/clue-utils'

export function useCellSelection(crossword: CrosswordData, cells: Cell[][], hiddenInputRef: React.RefObject<HTMLInputElement | null>) {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [direction, setDirection] = useState<Direction>('across')
  const [activeClue, setActiveClue] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  const getActiveClue = useCallback((row: number, col: number, dir: Direction): Clue | null => {
    const cluesForCell = findCluesForCell(crossword.clues, row, col)
    return cluesForCell.find(c => c.direction === dir) || cluesForCell[0] || null
  }, [crossword.clues])

  const selectCell = useCallback((row: number, col: number) => {
    if (cells[row][col].isBlack) return
    if (!running) setRunning(true)
    setTimeout(() => hiddenInputRef.current?.focus(), 0)

    if (selected?.row === row && selected?.col === col) {
      const newDir: Direction = direction === 'across' ? 'down' : 'across'
      setDirection(newDir)
      const clue = getActiveClue(row, col, newDir)
      setActiveClue(clue ? getClueKey(clue) : null)
      return
    }

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
  }, [cells, selected, direction, running, getActiveClue, hiddenInputRef])

  const selectClue = useCallback((clue: Clue) => {
    setDirection(clue.direction)
    setActiveClue(getClueKey(clue))
    setSelected({ row: clue.row, col: clue.col })
    if (!running) setRunning(true)
    setTimeout(() => hiddenInputRef.current?.focus(), 0)
  }, [running, hiddenInputRef])

  const reset = useCallback(() => {
    setSelected(null)
    setActiveClue(null)
    setRunning(false)
    setDirection('across')
  }, [])

  return {
    selected, setSelected,
    direction, setDirection,
    activeClue, setActiveClue,
    running, setRunning,
    selectCell, selectClue,
    getActiveClue, reset,
  }
}
