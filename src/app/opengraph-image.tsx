import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const fonts = await Promise.all([
    fetch('https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff2').then(r => r.arrayBuffer()).catch(() => null),
    fetch('https://fonts.bunny.net/inter/files/inter-cyrillic-700-normal.woff2').then(r => r.arrayBuffer()).catch(() => null),
  ])
  const loadedFonts = fonts.flatMap((data) =>
    data ? [{ name: 'Inter', data, style: 'normal' as const, weight: 700 as const }] : []
  )

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 100 }}>🧩</span>
          <div style={{ fontSize: 72, fontWeight: 800, color: '#fff', letterSpacing: -2, lineHeight: 1 }}>
            красвордс
          </div>
          <div style={{ fontSize: 30, color: '#666', fontWeight: 400, marginTop: 4 }}>
            современные тематические кроссворды онлайн
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: loadedFonts,
    }
  )
}
