import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { isUserAdmin } from '@/lib/admin-auth'

const MAX_BYTES = 1_500_000  // 1.5MB — heroes/corners are bigger than banners
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

/**
 * POST /api/upload-hero
 *
 * FormData fields:
 *   - file:   File (jpeg/png/webp, ≤1.5MB)
 *   - kind:   'hero-wide' | 'hero-portrait' | 'corner'   — controls filename prefix
 *
 * Returns: { url: string }
 *
 * Only admins can upload (checked via admin_users table).
 * Files land in the public `heroes` bucket; the URL is publicly readable.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isUserAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Invalid form' }, { status: 400 })

  const file = form.get('file')
  const kind = String(form.get('kind') ?? 'hero-wide')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Файл больше 1.5MB' }, { status: 413 })
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'Только JPEG/PNG/WebP' }, { status: 415 })
  }
  if (!['hero-wide', 'hero-portrait', 'corner'].includes(kind)) {
    return NextResponse.json({ error: 'Invalid kind' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${kind}-${Date.now()}.${ext}`

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await admin.storage.from('heroes').upload(filename, buffer, {
    contentType: file.type,
    upsert: false,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: pub } = admin.storage.from('heroes').getPublicUrl(filename)
  return NextResponse.json({ url: pub.publicUrl })
}
