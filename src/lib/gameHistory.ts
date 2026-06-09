'use client'

export interface GameRecord {
  crosswordId: string
  time: number
  date: string
  solved: boolean
}

const STORAGE_KEY = 'kraswords_history'

export function getHistory(): GameRecord[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveGame(record: GameRecord) {
  const history = getHistory()
  const existing = history.findIndex(h => h.crosswordId === record.crosswordId)
  if (existing >= 0) {
    if (record.solved && (!history[existing].solved || record.time < history[existing].time)) {
      history[existing] = record
    }
  } else {
    history.push(record)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function getBestTime(crosswordId: string): number | null {
  const record = getHistory().find(h => h.crosswordId === crosswordId && h.solved)
  return record ? record.time : null
}

export function getTotalSolved(): number {
  return getHistory().filter(h => h.solved).length
}

export function getAverageTime(): number | null {
  const solved = getHistory().filter(h => h.solved)
  if (solved.length === 0) return null
  return Math.round(solved.reduce((sum, h) => sum + h.time, 0) / solved.length)
}
