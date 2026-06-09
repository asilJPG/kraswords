import type { Clue } from './types'

export function getClueKey(clue: Clue): string {
  return `${clue.number}-${clue.direction}`
}

export function getCellsForClue(clue: Clue): Array<[number, number]> {
  return Array(clue.length).fill(0).map((_, i) => [
    clue.direction === 'down' ? clue.row + i : clue.row,
    clue.direction === 'across' ? clue.col + i : clue.col,
  ])
}

export function findCluesForCell(clues: Clue[], row: number, col: number): Clue[] {
  return clues.filter(clue =>
    getCellsForClue(clue).some(([r, c]) => r === row && c === col)
  )
}
