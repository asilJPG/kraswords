import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { crossword_id, time_seconds, solved } = await req.json()
  if (!crossword_id || typeof time_seconds !== 'number') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const admin = createAdminClient()

  await (admin.from('game_results') as any).insert({
    user_id: user.id,
    crossword_id,
    time_seconds,
    solved: !!solved,
  })

  if (solved) {
    const { data: cw } = await (admin.from('crosswords') as any)
      .select('solvers').eq('id', crossword_id).single()
    if (cw) {
      await (admin.from('crosswords') as any)
        .update({ solvers: (cw.solvers ?? 0) + 1 })
        .eq('id', crossword_id)
    }

    // compute rank: how many players have better time for this crossword
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
