import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function getCrossword(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/crosswords?id=eq.${id}&select=title,emoji&published=eq.true&limit=1`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      next: { revalidate: 3600 },
    }
  )
  const data = await res.json()
  return data[0] as { title: string; emoji: string } | undefined
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const crossword = await getCrossword(id)

  const title = crossword?.title ?? 'кроссворд'
  const emoji = crossword?.emoji ?? '🧩'

  const [latinFont, cyrillicFont] = await Promise.all([
    fetch('https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff2').then(r => r.arrayBuffer()),
    fetch('https://fonts.bunny.net/inter/files/inter-cyrillic-700-normal.woff2').then(r => r.arrayBuffer()),
  ])

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: '#0a0a0a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter',
        position: 'relative',
      }}>
        {/* KRS badge top-left */}
        <div style={{
          position: 'absolute', top: 52, left: 64,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 800, color: '#000', letterSpacing: 1,
          }}>KRS</div>
          <span style={{ color: '#555', fontSize: 26, fontWeight: 700 }}>красвордс</span>
        </div>

        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '0 80px', textAlign: 'center' }}>
          <span style={{ fontSize: 96 }}>{emoji}</span>
          <div style={{
            fontSize: title.length > 24 ? 52 : 64,
            fontWeight: 800, color: '#fff',
            letterSpacing: -1, lineHeight: 1.1,
          }}>
            «{title}»
          </div>
          <div style={{ fontSize: 28, color: '#555', fontWeight: 700, marginTop: 4 }}>
            кроссворд онлайн
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: latinFont, style: 'normal', weight: 700 },
        { name: 'Inter', data: cyrillicFont, style: 'normal', weight: 700 },
      ],
    }
  )
}
