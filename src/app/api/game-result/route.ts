import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { verifyAnswers } from '@/lib/crosswords'
import { fetchCrosswordById } from '@/lib/crossword/server-api'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { crossword_id, time_seconds, answers } = await req.json()
  if (!crossword_id || typeof time_seconds !== 'number' || !answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  // Server-side verification: fetch crossword and verify answers
  const crossword = await fetchCrosswordById(crossword_id)
  if (!crossword) {
    return NextResponse.json({ error: 'Crossword not found' }, { status: 404 })
  }

  const verification = verifyAnswers(crossword, answers)
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

  if (solved && isNewBest && !existing) {
    // Increment solver count only on first successful solve
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
