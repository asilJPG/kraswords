import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 500_000 // 500 KB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Server-side validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 500 KB limit' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const ext = file.type.split('/')[1] || 'png'
    const path = `${user.id}/banner.${ext}`

    const adminClient = createAdminClient()
    const { error: uploadError } = await adminClient.storage
      .from('banners')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = adminClient.storage
      .from('banners')
      .getPublicUrl(path)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('Banner upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
