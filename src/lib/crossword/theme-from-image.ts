// Собирает полную тему кроссворда из hero-картинки: доминирующие цвета →
// рецепт «тёмный фон + неоновый акцент» (как у темы Рика и Морти).
// Палитра всегда согласована с артом, поэтому результат гарантированно
// смотрится цельно без ручного подбора 15 цветов.

const hsl = (h: number, s: number, l: number) => `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
const hsla = (h: number, s: number, l: number, a: number) => `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const d = max - min
  let h = 0
  if (d > 0) {
    if (max === r / 255) h = ((g - b) / 255 / d) % 6
    else if (max === g / 255) h = (b - r) / 255 / d + 2
    else h = (r - g) / 255 / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return [h, max === 0 ? 0 : d / max, max]
}

function pickEffect(accentHue: number, avgSat: number): string {
  if (avgSat < 0.18) return 'rain'                            // серое/монохром — дождь
  if (accentHue >= 200 && accentHue < 270) return 'stars'     // синева — звёзды
  if (accentHue >= 30 && accentHue < 70) return 'magic-sparkles' // золото — искры
  if (accentHue >= 120 && accentHue < 200) return 'portal-drips' // зелень/бирюза — портал
  return 'particles'                                          // остальное — частицы
}

/** Извлекает палитру из картинки и строит объект theme_custom. */
export async function themeFromImage(blob: Blob): Promise<Record<string, string>> {
  const bmp = await createImageBitmap(blob)
  const W = 64
  const H = Math.max(1, Math.round((W * bmp.height) / bmp.width))
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bmp, 0, 0, W, H)
  const { data } = ctx.getImageData(0, 0, W, H)

  // Гистограмма хуёв (12 корзин по 30°), вес = насыщенность × яркость:
  // самая «звонкая» корзина даёт акцент, среднее по всем — базовый тон фона.
  const buckets = Array(12).fill(0)
  let sumX = 0, sumY = 0, satSum = 0, n = 0
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, v] = rgbToHsv(data[i], data[i + 1], data[i + 2])
    satSum += s
    n++
    const rad = (h * Math.PI) / 180
    sumX += Math.cos(rad) * s
    sumY += Math.sin(rad) * s
    if (s > 0.3 && v > 0.35) buckets[Math.floor(h / 30) % 12] += s * v
  }
  const avgSat = satSum / n
  const accentBucket = buckets.indexOf(Math.max(...buckets))
  const hasAccent = buckets[accentBucket] > 0
  const accentHue = hasAccent ? accentBucket * 30 + 15 : 210
  let baseHue = (Math.atan2(sumY, sumX) * 180) / Math.PI
  if (baseHue < 0) baseHue += 360
  if (!Number.isFinite(baseHue)) baseHue = accentHue

  const accSat = hasAccent ? 90 : 30
  return {
    pageBg: hsl(baseHue, 40, 6),
    bg: hsl(baseHue, 38, 9),
    bgImage: `radial-gradient(ellipse at 30% 20%, ${hsl(baseHue, 40, 14)} 0%, ${hsl(baseHue, 40, 6)} 60%)`,
    textColor: hsl(accentHue, 60, 86),
    mutedColor: hsla(accentHue, 70, 65, 0.5),
    cellBg: hsla(baseHue, 38, 13, 0.85),
    cellBorder: hsl(accentHue, accSat, 58),
    cellText: hsl(accentHue, accSat, 70),
    cellActiveBg: hsla(accentHue, accSat, 58, 0.25),
    cellHighlightBg: hsla(accentHue, accSat, 58, 0.1),
    blackCellBg: hsl(baseHue, 42, 4),
    accentColor: hsl(accentHue, accSat, 58),
    clueActiveBg: hsla(accentHue, accSat, 58, 0.15),
    navBg: hsla(baseHue, 40, 5, 0.9),
    navBorder: hsla(accentHue, accSat, 58, 0.13),
    particleColor: hsl(accentHue, accSat, 65),
    glowColor: hsl(accentHue, accSat, 58),
    effect: pickEffect(accentHue, avgSat),
  }
}
