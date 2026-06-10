import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

// PATCH /api/update-profile
// body: { avatar?: { type: 'emoji', value: string } }
// Currently supports avatar only — extensible to username/etc later.
export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null) as
    | { avatar?: { type: string; value: string } }
    | null
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const patch: Record<string, unknown> = {}

  if (body.avatar) {
    if (body.avatar.type === 'emoji') {
      const v = (body.avatar.value ?? '').trim()
      // 1-4 grapheme cluster emoji (rough safety check on raw chars)
      if (v.length < 1 || v.length > 10) {
        return NextResponse.json({ error: 'Bad emoji' }, { status: 400 })
      }
      patch.avatar = { type: 'emoji', value: v }
    } else {
      return NextResponse.json({ error: 'Unsupported avatar type' }, { status: 400 })
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin.from('profiles') as any)
    .update(patch)
    .eq('id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
