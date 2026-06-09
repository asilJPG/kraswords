import type { CrosswordData, Cell } from './types'
import { getCellsForClue } from './clue-utils'

export function buildCells(cw: CrosswordData): Cell[][] {
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

export function buildCorrectLetters(cw: CrosswordData): Record<string, string> {
  const map: Record<string, string> = {}
  for (const clue of cw.clues) {
    const positions = getCellsForClue(clue)
    for (let i = 0; i < clue.answer.length; i++) {
      const [r, c] = positions[i]
      map[`${r},${c}`] = clue.answer[i]
    }
  }
  return map
}
