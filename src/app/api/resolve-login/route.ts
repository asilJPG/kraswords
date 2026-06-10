import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin-client'

// POST { login } → { email }
// `login` is either an email (contains @) or a username from profiles.
// Always returns the same generic error to avoid leaking which usernames exist.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { login?: string } | null
  const login = body?.login?.trim()
  if (!login) {
    return NextResponse.json({ error: 'Введи логин' }, { status: 400 })
  }

  if (login.includes('@')) {
    return NextResponse.json({ email: login })
  }

  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error } = await (admin.from('profiles') as any)
    .select('id')
    .eq('username', login)
    .single()
  if (error || !profile) {
    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 })
  }

  const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(profile.id)
  if (userErr || !userRes.user?.email) {
    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 })
  }

  return NextResponse.json({ email: userRes.user.email })
}
