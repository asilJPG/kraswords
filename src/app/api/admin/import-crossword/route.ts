import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import type { CrosswordInsert } from '@/lib/supabase/types'
import { validateCrossword } from '@/lib/crossword/validate'

const MAX_BODY_BYTES = 2_000_000  // 2MB — bulk import can be larger
const MAX_ITEMS = 50

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
