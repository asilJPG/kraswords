'use client'

export interface GameRecord {
  crosswordId: string
  time: number
  date: string
  solved: boolean
}

export interface UserProfile {
  nickname: string
  emoji: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  maxProgress: number
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_solve', title: 'Первый шаг', description: 'Реши свой первый кроссворд', icon: '🎯', maxProgress: 1 },
  { id: 'solve_3', title: 'Набираешь обороты', description: 'Реши 3 кроссворда', icon: '🔥', maxProgress: 3 },
  { id: 'solve_all', title: 'Кроссвордоман', description: 'Реши все 6 кроссвордов', icon: '👑', maxProgress: 6 },
  { id: 'speed_3min', title: 'Молния', description: 'Реши кроссворд быстрее 3 минут', icon: '⚡', maxProgress: 1 },
  { id: 'speed_5min', title: 'Быстрый ум', description: 'Реши кроссворд быстрее 5 минут', icon: '🧠', maxProgress: 1 },
  { id: 'streak_3', title: 'Серия побед', description: 'Реши 3 кроссворда подряд', icon: '🎮', maxProgress: 3 },
]

const STORAGE_KEY = 'kraswords_history'
const PROFILE_KEY = 'kraswords_profile'
const LEADERBOARD_KEY = 'kraswords_leaderboard'

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
  if (record.solved) {
    const profile = getProfile()
    addToLeaderboard(record.crosswordId, profile.nickname, profile.emoji, record.time)
  }
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

export function getBestOverallTime(): number | null {
  const solved = getHistory().filter(h => h.solved)
  if (solved.length === 0) return null
  return Math.min(...solved.map(h => h.time))
}

export function getProfile(): UserProfile {
  if (typeof window === 'undefined') return { nickname: 'игрок', emoji: '😎' }
  try {
    const stored = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    return { nickname: stored.nickname || 'игрок', emoji: stored.emoji || '😎' }
  } catch {
    return { nickname: 'игрок', emoji: '😎' }
  }
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function getAchievementProgress(): Record<string, number> {
  const history = getHistory()
  const solved = history.filter(h => h.solved)
  const progress: Record<string, number> = {}
  progress['first_solve'] = Math.min(solved.length, 1)
  progress['solve_3'] = Math.min(solved.length, 3)
  progress['solve_all'] = Math.min(solved.length, 6)
  progress['speed_3min'] = solved.some(h => h.time < 180) ? 1 : 0
  progress['speed_5min'] = solved.some(h => h.time < 300) ? 1 : 0
  const sortedByDate = solved.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let maxStreak = 0, streak = 0
  for (let i = 0; i < sortedByDate.length; i++) {
    if (i === 0) { streak = 1 } else {
      const diff = Math.floor((new Date(sortedByDate[i].date).getTime() - new Date(sortedByDate[i - 1].date).getTime()) / 86400000)
      streak = diff <= 1 ? streak + 1 : 1
    }
    maxStreak = Math.max(maxStreak, streak)
  }
  progress['streak_3'] = Math.min(maxStreak, 3)
  return progress
}

export interface LeaderboardEntry {
  nickname: string
  emoji: string
  time: number
  date: string
}

export function getLeaderboard(crosswordId: string): LeaderboardEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const all = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '{}')
    return (all[crosswordId] || []).sort((a: LeaderboardEntry, b: LeaderboardEntry) => a.time - b.time)
  } catch {
    return []
  }
}

export function getOverallLeaderboard(): (LeaderboardEntry & { totalSolved: number; avgTime: number })[] {
  if (typeof window === 'undefined') return []
  try {
    const all = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '{}') as Record<string, LeaderboardEntry[]>
    const players: Record<string, { emoji: string; times: number[] }> = {}
    for (const entries of Object.values(all)) {
      for (const e of entries) {
        if (!players[e.nickname]) players[e.nickname] = { emoji: e.emoji, times: [] }
        players[e.nickname].times.push(e.time)
      }
    }
    return Object.entries(players)
      .map(([nickname, data]) => ({
        nickname, emoji: data.emoji,
        time: Math.min(...data.times), date: '',
        totalSolved: data.times.length,
        avgTime: Math.round(data.times.reduce((s, t) => s + t, 0) / data.times.length),
      }))
      .sort((a, b) => b.totalSolved - a.totalSolved || a.avgTime - b.avgTime)
  } catch {
    return []
  }
}

function addToLeaderboard(crosswordId: string, nickname: string, emoji: string, time: number) {
  try {
    const all = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '{}')
    if (!all[crosswordId]) all[crosswordId] = []
    const existing = all[crosswordId].findIndex((e: LeaderboardEntry) => e.nickname === nickname)
    const entry = { nickname, emoji, time, date: new Date().toISOString() }
    if (existing >= 0) {
      if (time < all[crosswordId][existing].time) all[crosswordId][existing] = entry
    } else {
      all[crosswordId].push(entry)
    }
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}

export function getMyRank(crosswordId: string): number | null {
  const profile = getProfile()
  const lb = getLeaderboard(crosswordId)
  const idx = lb.findIndex(e => e.nickname === profile.nickname)
  return idx >= 0 ? idx + 1 : null
}
