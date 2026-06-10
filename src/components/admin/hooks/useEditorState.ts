import { useCallback, useMemo, useState } from 'react'
import { type EditorWord, buildLetterMap, coveredCells, uid } from '@/lib/crossword/editor'
import type { Direction } from '@/lib/crossword/types'

export interface CrosswordMeta {
  id: string
  title: string
  author: string
  emoji: string
  category: string
  difficulty: 'лёгкий' | 'средний' | 'сложный'
  theme_id: string
  theme_custom?: Record<string, any> | null
  size: number
  published: boolean
}

const defaultMeta: CrosswordMeta = {
  id: '',
  title: '',
  author: 'аноним',
  emoji: '🧩',
  category: 'разное',
  difficulty: 'средний',
  theme_id: 'default',
  theme_custom: null,
  size: 13,
  published: false,
}

export function useEditorState(initial?: { meta?: Partial<CrosswordMeta>; words?: EditorWord[] }) {
  const [meta, setMeta] = useState<CrosswordMeta>({ ...defaultMeta, ...initial?.meta })
  const [words, setWords] = useState<EditorWord[]>(initial?.words ?? [])

  const letterMap = useMemo(() => buildLetterMap(words), [words])
  const covered = useMemo(() => coveredCells(words), [words])

  const addWord = useCallback((answer: string, clue: string) => {
    const w: EditorWord = {
      id: uid(),
      answer,
      clue,
      row: 0,
      col: 0,
      direction: 'across',
      placed: false,
    }
    setWords(prev => [...prev, w])
    return w.id
  }, [])

  const removeWord = useCallback((id: string) => {
    setWords(prev => prev.filter(w => w.id !== id))
  }, [])

  const updateClue = useCallback((id: string, clue: string) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, clue } : w))
  }, [])

  const placeWord = useCallback((id: string, row: number, col: number, direction: Direction) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, row, col, direction, placed: true } : w))
  }, [])

  const unplaceWord = useCallback((id: string) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, placed: false } : w))
  }, [])

  return {
    meta, setMeta,
    words, setWords,
    letterMap, covered,
    addWord, removeWord, updateClue,
    placeWord, unplaceWord,
  }
}
