import { useEffect, useRef } from 'react'
import type { EditorWord } from '@/lib/crossword/editor'
import type { CrosswordMeta } from './useEditorState'

const KEY_PREFIX = 'kraswords_draft_'

export interface Draft {
  meta: CrosswordMeta
  words: EditorWord[]
  savedAt: string
}

export function loadDraft(id: string): Draft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY_PREFIX + id)
    if (!raw) return null
    return JSON.parse(raw) as Draft
  } catch {
    return null
  }
}

export function listDrafts(): Array<{ id: string; meta: CrosswordMeta; savedAt: string }> {
  if (typeof window === 'undefined') return []
  const out: Array<{ id: string; meta: CrosswordMeta; savedAt: string }> = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(KEY_PREFIX)) continue
    try {
      const data = JSON.parse(localStorage.getItem(key)!) as Draft
      out.push({ id: key.slice(KEY_PREFIX.length), meta: data.meta, savedAt: data.savedAt })
    } catch { /* skip */ }
  }
  return out.sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

export function deleteDraft(id: string) {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY_PREFIX + id)
}

export function useAutosave(id: string, meta: CrosswordMeta, words: EditorWord[]) {
  const lastWrite = useRef<string>('')
  useEffect(() => {
    if (!id) return
    const payload: Draft = { meta, words, savedAt: new Date().toISOString() }
    const json = JSON.stringify(payload)
    if (json === lastWrite.current) return
    const t = setTimeout(() => {
      localStorage.setItem(KEY_PREFIX + id, json)
      lastWrite.current = json
    }, 400)
    return () => clearTimeout(t)
  }, [id, meta, words])
}
