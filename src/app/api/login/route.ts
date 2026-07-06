import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { humanizeAuthError } from '@/lib/auth-errors'

// POST { login, password } → { ok, hasProfile }
// `login` — email или username. Email наружу не отдаём (раньше /api/resolve-login
// возвращал email по нику любому желающему); сюда перенесён и сам sign-in —
// сессионные куки ставит серверный клиент.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { login?: string; password?: string } | null
  const login = body?.login?.trim()
  const password = body?.password
  if (!login || typeof password !== 'string' || !password) {
    return NextResponse.json({ error: 'Введи логин и пароль' }, { status: 400 })
  }

  let email = login
  if (!login.includes('@')) {
    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (admin.from('profiles') as any)
      .select('id')
      .eq('username', login)
      .single()
    if (!profile) {
      return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 })
    }
    const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(profile.id)
    if (userErr || !userRes.user?.email) {
      return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 })
    }
    email = userRes.user.email
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    return NextResponse.json(
      { error: error ? humanizeAuthError(error.message) : 'Неверный логин или пароль' },
      { status: 401 },
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRow } = await (supabase.from('profiles') as any)
    .select('username')
    .eq('id', data.user.id)
    .maybeSingle()

  return NextResponse.json({ ok: true, hasProfile: !!profileRow })
}
