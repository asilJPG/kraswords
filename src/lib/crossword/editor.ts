import type { Clue, Direction } from './types'
import { getCellsForClue } from './clue-utils'

/**
 * Word in the editor — answer + clue + placement.
 * `placed` = true when it sits on the grid.
 */
export interface EditorWord {
  id: string            // local uuid
  answer: string        // uppercase letters only
  clue: string
  row: number
  col: number
  direction: Direction
  placed: boolean
}

export interface PlacementCheck {
  ok: boolean
  reason?: string
  conflicts: Array<[number, number]>   // cells where letters clash
  intersections: Array<[number, number]> // cells where letters match an existing word
}

/**
 * Map of placed letters: "r,c" -> uppercase letter.
 * Built from all currently-placed words.
 */
export function buildLetterMap(words: EditorWord[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const w of words) {
    if (!w.placed) continue
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.direction === 'down' ? w.row + i : w.row
      const c = w.direction === 'across' ? w.col + i : w.col
      map[`${r},${c}`] = w.answer[i]
    }
  }
  return map
}

/**
 * Check if `word` of `length` placed at (row, col, dir) on `size`x`size` grid
 * is consistent with existing letters.
 */
export function checkPlacement(
  word: string,
  row: number,
  col: number,
  dir: Direction,
  size: number,
  letterMap: Record<string, string>,
): PlacementCheck {
  const conflicts: Array<[number, number]> = []
  const intersections: Array<[number, number]> = []

  // bounds
  const endR = dir === 'down' ? row + word.length - 1 : row
  const endC = dir === 'across' ? col + word.length - 1 : col
  if (row < 0 || col < 0 || endR >= size || endC >= size) {
    return { ok: false, reason: 'не помещается на сетке', conflicts, intersections }
  }

  for (let i = 0; i < word.length; i++) {
    const r = dir === 'down' ? row + i : row
    const c = dir === 'across' ? col + i : col
    const existing = letterMap[`${r},${c}`]
    if (existing) {
      if (existing === word[i]) intersections.push([r, c])
      else conflicts.push([r, c])
    }
  }

  if (conflicts.length > 0) {
    return { ok: false, reason: 'конфликт букв', conflicts, intersections }
  }
  return { ok: true, conflicts, intersections }
}

/**
 * Find all (row, col, dir) where `word` can be placed without conflicts.
 * Returns top `limit` matches, sorted by number of intersections (descending).
 */
export function findValidPlacements(
  word: string,
  size: number,
  letterMap: Record<string, string>,
  limit = 50,
): Array<{ row: number; col: number; dir: Direction; intersections: number }> {
  const results: Array<{ row: number; col: number; dir: Direction; intersections: number }> = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      for (const dir of ['across', 'down'] as Direction[]) {
        const check = checkPlacement(word, r, c, dir, size, letterMap)
        if (check.ok) {
          results.push({ row: r, col: c, dir, intersections: check.intersections.length })
        }
      }
    }
  }
  results.sort((a, b) => b.intersections - a.intersections)
  return results.slice(0, limit)
}

/**
 * Convert placed editor words into normalised Clue list with auto-numbering.
 * Numbering rule: any cell that starts at least one across/down word gets
 * a number, in row-major order.
 */
export function buildClues(words: EditorWord[]): Clue[] {
  const placed = words.filter(w => w.placed)
  // collect start-of-word positions, sorted row-major
  const starts = new Map<string, { row: number; col: number; words: EditorWord[] }>()
  for (const w of placed) {
    const k = `${w.row},${w.col}`
    if (!starts.has(k)) starts.set(k, { row: w.row, col: w.col, words: [] })
    starts.get(k)!.words.push(w)
  }
  const sorted = [...starts.values()].sort((a, b) =>
    a.row !== b.row ? a.row - b.row : a.col - b.col
  )
  const numberFor = new Map<string, number>()
  sorted.forEach((s, i) => numberFor.set(`${s.row},${s.col}`, i + 1))

  return placed.map(w => ({
    number: numberFor.get(`${w.row},${w.col}`)!,
    direction: w.direction,
    clue: w.clue,
    answer: w.answer,
    row: w.row,
    col: w.col,
    length: w.answer.length,
  }))
}

/**
 * Cells covered by all placed words — used to figure out black cells.
 */
export function coveredCells(words: EditorWord[]): Set<string> {
  const set = new Set<string>()
  for (const w of words) {
    if (!w.placed) continue
    const clue: Clue = {
      number: 0,
      direction: w.direction,
      clue: '',
      answer: w.answer,
      row: w.row,
      col: w.col,
      length: w.answer.length,
    }
    for (const [r, c] of getCellsForClue(clue)) set.add(`${r},${c}`)
  }
  return set
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function normaliseAnswer(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^А-ЯЁA-Z]/g, '')
}
