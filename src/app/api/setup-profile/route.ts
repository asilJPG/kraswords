import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

// POST { username } → { ok: true } or { error, status }
// Server-side username validation & insertion with service-role client
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { username?: string } | null
  const username = body?.username?.trim()

  if (!username) {
    return NextResponse.json({ error: 'Юзернейм обязателен' }, { status: 400 })
  }

  // Validate username format
  const exceptions = ['1', '2', 'a']
  if (username.length < 4 && !exceptions.includes(username)) {
    return NextResponse.json({ error: 'Юзернейм: минимум 4 символа' }, { status: 400 })
  }
  if (username.length < 1 || username.length > 20) {
    return NextResponse.json({ error: 'Юзернейм: 1–20 символов' }, { status: 400 })
  }

  if (!/^[a-zA-Zа-яёА-ЯЁ0-9_]+$/.test(username)) {
    return NextResponse.json({ error: 'Юзернейм: только буквы, цифры и _' }, { status: 400 })
  }

  // Verify caller is logged in
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  // Insert profile with admin client (bypasses RLS)
  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin.from('profiles') as any).insert({
    id: user.id,
    username,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Такой юзернейм уже занят' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
