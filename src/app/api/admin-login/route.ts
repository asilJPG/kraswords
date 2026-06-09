import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, ADMIN_TOKEN } from '@/lib/admin-auth'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body || body.username !== 'admin' || body.password !== 'admin') {
    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, ADMIN_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
