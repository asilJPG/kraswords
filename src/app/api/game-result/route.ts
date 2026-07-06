import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { verifyAnswers } from '@/lib/crosswords'
import { fetchCrosswordById } from '@/lib/crossword/server-api'

const CELL_KEY_RE = /^\d+,\d+$/
const LETTER_RE = /^[A-ZА-ЯЁ]$/i
const MAX_BODY_BYTES = 50_000  // 50KB hard cap — crosswords don't need more

export async function POST(req: Request) {
  // Pre-check Content-Length to reject obvious bombs before JSON.parse
  const cl = req.headers.get('content-length')
  if (cl && parseInt(cl, 10) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Body too large' }, { status: 413 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null) as
    | { crossword_id?: unknown; time_seconds?: unknown; answers?: unknown }
    | null
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { crossword_id, time_seconds, answers } = body
  if (typeof crossword_id !== 'string' || crossword_id.length > 100) {
    return NextResponse.json({ error: 'Invalid crossword_id' }, { status: 400 })
  }
  if (typeof time_seconds !== 'number' || !Number.isFinite(time_seconds) || time_seconds < 0 || time_seconds > 86400) {
    return NextResponse.json({ error: 'Invalid time_seconds' }, { status: 400 })
  }
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return NextResponse.json({ error: 'Invalid answers' }, { status: 400 })
  }

  const entries = Object.entries(answers as Record<string, unknown>)
  if (entries.length > 500) {
    return NextResponse.json({ error: 'Answers too large' }, { status: 400 })
  }
  const normalisedAnswers: Record<string, string> = {}
  for (const [key, value] of entries) {
    if (!CELL_KEY_RE.test(key)) {
      return NextResponse.json({ error: 'Invalid cell key' }, { status: 400 })
    }
    if (typeof value !== 'string' || value.length !== 1 || !LETTER_RE.test(value)) {
      return NextResponse.json({ error: 'Invalid letter' }, { status: 400 })
    }
    normalisedAnswers[key] = value.toUpperCase()
  }

  // Server-side verification: fetch crossword and verify answers
  const crossword = await fetchCrosswordById(crossword_id)
  if (!crossword) {
    return NextResponse.json({ error: 'Crossword not found' }, { status: 404 })
  }

  const verification = verifyAnswers(crossword, normalisedAnswers)
  const solved = verification.correct

  const admin = createAdminClient()

  // Check if result already exists for this user+crossword
  const { data: existing } = await (admin.from('game_results') as any)
    .select('time_seconds, solved')
    .eq('user_id', user.id)
    .eq('crossword_id', crossword_id)
    .single()

  let isNewBest = false

  if (existing) {
    // Only update if new time is better (for solved) or if we're now solving it
    if (solved && (!existing.solved || time_seconds < existing.time_seconds)) {
      await (admin.from('game_results') as any)
        .update({ time_seconds, solved: true })
        .eq('user_id', user.id)
        .eq('crossword_id', crossword_id)
      isNewBest = !existing.solved || time_seconds < existing.time_seconds
    } else if (!existing.solved && !solved) {
      // Update time for unsolved attempts
      await (admin.from('game_results') as any)
        .update({ time_seconds })
        .eq('user_id', user.id)
        .eq('crossword_id', crossword_id)
    }
    // If existing is solved and new attempt is worse, do nothing
  } else {
    // First attempt for this crossword
    await (admin.from('game_results') as any).insert({
      user_id: user.id,
      crossword_id,
      time_seconds,
      solved,
    })
    isNewBest = solved
  }

  // First successful solve: either no record yet, or the earlier attempt was unsolved
  if (solved && (!existing || !existing.solved)) {
    const { data: cw } = await (admin.from('crosswords') as any)
      .select('solvers').eq('id', crossword_id).single()
    if (cw) {
      await (admin.from('crosswords') as any)
        .update({ solvers: (cw.solvers ?? 0) + 1 })
        .eq('id', crossword_id)
    }
  }

  if (solved) {
    // Compute rank: how many players have better time for this crossword
    const { data: better } = await (admin.from('game_results') as any)
      .select('user_id')
      .eq('crossword_id', crossword_id)
      .eq('solved', true)
      .lt('time_seconds', time_seconds)
      .neq('user_id', user.id)
    const rank = (better?.length ?? 0) + 1
    return NextResponse.json({ ok: true, rank })
  }

  return NextResponse.json({ ok: true })
}
