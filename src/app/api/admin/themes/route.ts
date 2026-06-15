import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { isUserAdmin } from '@/lib/admin-auth'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  return await isUserAdmin(supabase, user.id)
}

interface BodyShape { name?: unknown; config?: unknown }

function validateBody(b: BodyShape): { ok: true; name: string; config: Record<string, unknown> } | { ok: false; error: string } {
  if (typeof b.name !== 'string' || b.name.length < 1 || b.name.length > 60) {
    return { ok: false, error: 'name: 1-60 символов' }
  }
  if (!b.config || typeof b.config !== 'object' || Array.isArray(b.config)) {
    return { ok: false, error: 'config: объект' }
  }
  const json = JSON.stringify(b.config)
  if (json.length > 30_000) {
    return { ok: false, error: 'config слишком большой' }
  }
  return { ok: true, name: b.name, config: b.config as Record<string, unknown> }
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('themes_custom') as any)
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => null) as BodyShape | null
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  const v = validateBody(body)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('themes_custom') as any)
    .insert({ name: v.name, config: v.config })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
