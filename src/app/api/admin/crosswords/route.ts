import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { isUserAdmin } from '@/lib/admin-auth'
import type { CrosswordInsert } from '@/lib/supabase/types'

const SLUG_RE = /^[a-z0-9][a-z0-9-_]{0,49}$/i
const DIFFICULTIES = new Set(['лёгкий', 'средний', 'сложный'])
const DIRECTIONS = new Set(['across', 'down'])
const MAX_BODY_BYTES = 200_000  // 200KB — large editor JSON fits, bombs don't

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  return await isUserAdmin(supabase, user.id)
}

/** Validates the crossword row shape. Returns error string or null. */
function validateCrossword(row: unknown): { ok: true; row: CrosswordInsert } | { ok: false; error: string } {
  if (!row || typeof row !== 'object') return { ok: false, error: 'Не объект' }
  const r = row as Record<string, unknown>

  if (typeof r.id !== 'string' || !SLUG_RE.test(r.id)) {
    return { ok: false, error: 'id: только латиница, цифры, _-, до 50 символов' }
  }
  if (typeof r.title !== 'string' || r.title.length < 1 || r.title.length > 120) {
    return { ok: false, error: 'title: 1-120 символов' }
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
  // theme_custom опционально, без жёсткой схемы (jsonb)
  if (r.theme_custom !== undefined && r.theme_custom !== null && typeof r.theme_custom !== 'object') {
    return { ok: false, error: 'theme_custom: объект или null' }
  }
  return { ok: true, row: r as unknown as CrosswordInsert }
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('crosswords') as any)
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cl = req.headers.get('content-length')
  if (cl && parseInt(cl, 10) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Body too large' }, { status: 413 })
  }

  const raw = await req.json().catch(() => null)
  const result = validateCrossword(raw)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('crosswords') as any)
    .upsert(result.row, { onConflict: 'id' })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
