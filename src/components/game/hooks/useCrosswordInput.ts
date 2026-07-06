import { useCallback, useEffect, useRef, useState } from 'react'
import type { CrosswordData, Cell, Direction } from '@/lib/crossword/types'
import { verifyAnswers } from '@/lib/crosswords'
import { findCluesForCell, getCellsForClue } from '@/lib/crossword/clue-utils'

interface Params {
  crossword: CrosswordData
  cells: Cell[][]
  selected: { row: number; col: number } | null
  setSelected: (s: { row: number; col: number } | null) => void
  moveSelected: (row: number, col: number) => void
  direction: Direction
  directionRef: React.RefObject<Direction>
  hiddenInputRef: React.RefObject<HTMLInputElement | null>
  onSolved: (answers: Record<string, string>) => void
}

export function useCrosswordInput({
  crossword, cells, selected, setSelected, moveSelected, direction, directionRef, hiddenInputRef, onSolved,
}: Params) {
  const [input, setInput] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [solved, setSolved] = useState(false)
  const inputRef = useRef(input)
  useEffect(() => { inputRef.current = input })

  const onSolvedRef = useRef(onSolved)
  useEffect(() => { onSolvedRef.current = onSolved })

  const checkSolved = useCallback(
    (next: Record<string, string>) => verifyAnswers(crossword, next).correct,
    [crossword]
  )

  const advanceCaret = useCallback((row: number, col: number) => {
    const dir = directionRef.current
    const clue = findCluesForCell(crossword.clues, row, col).find(c => c.direction === dir)
    if (!clue) return
    const clueCells = getCellsForClue(clue)
    const idx = clueCells.findIndex(([r, c]) => r === row && c === col)
    if (idx >= 0 && idx < clueCells.length - 1) {
      const [nr, nc] = clueCells[idx + 1]
      moveSelected(nr, nc)
    }
  }, [directionRef, crossword.clues, moveSelected])

  const writeLetter = useCallback((letter: string) => {
    if (!selected || solved) return
    const { row, col } = selected
    const next = { ...inputRef.current, [`${row},${col}`]: letter }
    setInput(next)
    setChecked(false)
    advanceCaret(row, col)
    if (checkSolved(next)) {
      setSolved(true)
      onSolvedRef.current(next)
    }
  }, [selected, solved, advanceCaret, checkSolved])

  const handleBackspace = useCallback(() => {
    if (!selected || solved) return
    const { row, col } = selected
    const key = `${row},${col}`
    if (inputRef.current[key]) {
      setInput(prev => { const n = { ...prev }; delete n[key]; return n })
      return
    }
    const dir = directionRef.current
    const nr = dir === 'down' ? row - 1 : row
    const nc = dir === 'across' ? col - 1 : col
    if (nr >= 0 && nc >= 0 && !cells[nr]?.[nc]?.isBlack) {
      moveSelected(nr, nc)
      const k = `${nr},${nc}`
      if (inputRef.current[k]) {
        setInput(prev => { const n = { ...prev }; delete n[k]; return n })
      }
    }
  }, [selected, solved, directionRef, cells, moveSelected])

  // physical keyboard
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!selected) return
    if (e.target === hiddenInputRef.current) return

    if (e.key === 'Backspace') { handleBackspace(); return }
    if (/^[а-яёА-ЯЁa-zA-Z]$/.test(e.key)) writeLetter(e.key.toUpperCase())
  }, [selected, handleBackspace, writeLetter, hiddenInputRef])

  const handleKeyRef = useRef(handleKey)
  useEffect(() => { handleKeyRef.current = handleKey })
  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKeyRef.current(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleMobileInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value
    e.currentTarget.value = ''
    if (!val) return
    const letter = val.slice(-1).toUpperCase()
    if (!/^[А-ЯЁA-Z]$/.test(letter)) return
    writeLetter(letter)
  }, [writeLetter])

  const reset = useCallback(() => {
    setInput({})
    setChecked(false)
    setSolved(false)
  }, [])

  return {
    input, checked, solved,
    handleMobileInput, handleBackspace,
    setChecked, reset,
  }
}
