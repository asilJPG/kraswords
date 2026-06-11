import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import type { CrosswordInsert } from '@/lib/supabase/types'

const SLUG_RE = /^[a-z0-9][a-z0-9-_]{0,49}$/i
const DIFFICULTIES = new Set(['лёгкий', 'средний', 'сложный'])
const DIRECTIONS = new Set(['across', 'down'])
const MAX_BODY_BYTES = 2_000_000  // 2MB — bulk import can be larger
const MAX_ITEMS = 50

/** Same validator as /api/admin/crosswords POST */
function validateCrossword(row: unknown): { ok: true; row: CrosswordInsert } | { ok: false; error: string } {
  if (!row || typeof row !== 'object') return { ok: false, error: 'Не объект' }
  const r = row as Record<string, unknown>

  if (typeof r.id !== 'string' || !SLUG_RE.test(r.id)) {
    return { ok: false, error: 'id: только латиница/цифры/_-, до 50 символов' }
  }
  if (typeof r.title !== 'string' || r.title.length < 1 || r.title.length > 120) {
    return { ok: false, error: 'title: 1-120 символов' }
  }
  if (typeof r.author !== 'string' || r.author.length > 60) {
    return { ok: false, error: 'author: до 60 символов' }
  }
  if (typeof r.emoji !== 'string' || r.emoji.length > 10) {
    return { ok: false, error: 'emoji: до 10 символов' }
  }
  if (typeof r.category !== 'string' || r.category.length > 60) {
    return { ok: false, error: 'category: до 60 символов' }
  }
  if (typeof r.difficulty !== 'string' || !DIFFICULTIES.has(r.difficulty)) {
    return { ok: false, error: 'difficulty: лёгкий | средний | сложный' }
  }
  if (typeof r.theme_id !== 'string' || r.theme_id.length > 30) {
    return { ok: false, error: 'theme_id невалидный' }
  }
  if (typeof r.size !== 'number' || !Number.isInteger(r.size) || r.size < 5 || r.size > 25) {
    return { ok: false, error: 'size: целое 5-25' }
  }
  if (typeof r.published !== 'boolean') {
    return { ok: false, error: 'published должен быть boolean' }
  }
  if (typeof r.word_count !== 'number' || !Number.isInteger(r.word_count) || r.word_count < 0 || r.word_count > 200) {
    return { ok: false, error: 'word_count невалидный' }
  }
  if (!Array.isArray(r.clues) || r.clues.length < 1 || r.clues.length > 200) {
    return { ok: false, error: 'clues: 1-200 элементов' }
  }
  for (const c of r.clues) {
    if (!c || typeof c !== 'object') return { ok: false, error: 'clue не объект' }
    const cl = c as Record<string, unknown>
    if (typeof cl.number !== 'number' || !Number.isInteger(cl.number) || cl.number < 1) {
      return { ok: false, error: 'clue.number невалидный' }
    }
    if (typeof cl.direction !== 'string' || !DIRECTIONS.has(cl.direction)) {
      return { ok: false, error: 'clue.direction: across | down' }
    }
    if (typeof cl.clue !== 'string' || cl.clue.length < 1 || cl.clue.length > 500) {
      return { ok: false, error: 'clue.clue: 1-500 символов' }
    }
    if (typeof cl.answer !== 'string' || cl.answer.length < 1 || cl.answer.length > 30) {
      return { ok: false, error: 'clue.answer: 1-30 символов' }
    }
    if (typeof cl.row !== 'number' || !Number.isInteger(cl.row) || cl.row < 0 || cl.row >= r.size) {
      return { ok: false, error: 'clue.row вне сетки' }
    }
    if (typeof cl.col !== 'number' || !Number.isInteger(cl.col) || cl.col < 0 || cl.col >= r.size) {
      return { ok: false, error: 'clue.col вне сетки' }
    }
    if (typeof cl.length !== 'number' || cl.length !== cl.answer.length) {
      return { ok: false, error: 'clue.length не совпадает с answer' }
    }
  }
  if (r.theme_custom !== undefined && r.theme_custom !== null && typeof r.theme_custom !== 'object') {
    return { ok: false, error: 'theme_custom: объект или null' }
  }
  return { ok: true, row: r as unknown as CrosswordInsert }
}

interface ItemResult {
  index: number
  id?: string
  ok: boolean
  error?: string
}

/**
 * POST /api/admin/import-crossword
 *
 * Auth: header `Authorization: Bearer <IMPORT_API_KEY>`
 *
 * Body shapes:
 *   1. Single crossword object — { id, title, ..., clues: [...] }
 *   2. Bulk — { items: [crossword1, crossword2, ...] }
 *
 * curl example:
 *   curl -X POST https://your-site.com/api/admin/import-crossword \
 *     -H "Authorization: Bearer $IMPORT_API_KEY" \
 *     -H "Content-Type: application/json" \
 *     --data @crossword.json
 */
export async function POST(req: Request) {
  // 1. Auth
  const expected = process.env.IMPORT_API_KEY
  if (!expected) {
    return NextResponse.json({ error: 'Import disabled — IMPORT_API_KEY not set' }, { status: 503 })
  }
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null
  if (!token || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Body size pre-check
  const cl = req.headers.get('content-length')
  if (cl && parseInt(cl, 10) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Body too large' }, { status: 413 })
  }

  const raw = await req.json().catch(() => null)
  if (!raw || typeof raw !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 3. Normalise to array of candidates
  const candidates: unknown[] = Array.isArray((raw as Record<string, unknown>).items)
    ? (raw as { items: unknown[] }).items
    : [raw]
  if (candidates.length === 0) {
    return NextResponse.json({ error: 'Пусто' }, { status: 400 })
  }
  if (candidates.length > MAX_ITEMS) {
    return NextResponse.json({ error: `Слишком много (максимум ${MAX_ITEMS})` }, { status: 400 })
  }

  // 4. Validate all upfront — refuse partial imports for predictability
  const validated: CrosswordInsert[] = []
  const errors: ItemResult[] = []
  for (let i = 0; i < candidates.length; i++) {
    const v = validateCrossword(candidates[i])
    if (!v.ok) {
      errors.push({ index: i, ok: false, error: v.error })
    } else {
      validated.push(v.row)
    }
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: 'Validation failed', items: errors }, { status: 400 })
  }

  // 5. Upsert all via service role (bypasses RLS)
  const supabase = createAdminClient()
  const results: ItemResult[] = []
  for (let i = 0; i < validated.length; i++) {
    const row = validated[i]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('crosswords') as any)
      .upsert(row, { onConflict: 'id' })
    if (error) {
      results.push({ index: i, id: row.id, ok: false, error: error.message })
    } else {
      results.push({ index: i, id: row.id, ok: true })
    }
  }

  const okCount = results.filter(r => r.ok).length
  const failed = results.filter(r => !r.ok)
  return NextResponse.json({
    ok: failed.length === 0,
    saved: okCount,
    total: validated.length,
    failed,
  })
}
