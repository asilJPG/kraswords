// Бесплатная генерация hero-картинок для кроссворда (pollinations.ai, без ключей и кредитов).
// Генерит wide (1920×800) + portrait (1080×1350), заливает в bucket `heroes`,
// прописывает theme_custom.heroImage у кроссворда.
//
// Использование:
//   node scripts/gen-hero.mjs <crossword-id> "<английский промпт сцены>"
//
// Пример:
//   node scripts/gen-hero.mjs AttackTitan "dark epic anime style, colossal giant over stone walls at dusk"
//
// Промпт-советы: стиль + сцена + палитра + "cinematic composition, no text".
// Не называть франшизы/персонажей напрямую — только стилизация.
import fs from 'fs'

const [id, promptBase] = process.argv.slice(2)
if (!id || !promptBase) {
  console.error('usage: node scripts/gen-hero.mjs <crossword-id> "<prompt>"')
  process.exit(1)
}

const env = Object.fromEntries(fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .split('\n').filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]))
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY

const slug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-')

async function gen(prompt, w, h) {
  for (let att = 0; att < 4; att++) {
    const seed = 7 + att * 13
    try {
      const r = await fetch(
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${seed}`,
        { signal: AbortSignal.timeout(180000) },
      )
      if (r.ok) return r.arrayBuffer()
      console.log(`  attempt ${att + 1}: HTTP ${r.status}`)
    } catch (e) {
      console.log(`  attempt ${att + 1}: ${e.message}`)
    }
    await new Promise(r => setTimeout(r, 8000))
  }
  throw new Error('generation failed after 4 attempts')
}

async function upload(name, buf) {
  const r = await fetch(`${URL_}/storage/v1/object/heroes/${name}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
    body: Buffer.from(buf),
  })
  if (!r.ok) throw new Error('upload ' + r.status + ' ' + await r.text())
  return `${URL_}/storage/v1/object/public/heroes/${name}`
}

process.stdout.write('wide... ')
const wide = await gen(promptBase + ', wide banner format', 1920, 800)
process.stdout.write('portrait... ')
const portrait = await gen(promptBase + ', vertical poster format', 1080, 1350)

const wideUrl = await upload(`hero-wide-${slug}.jpg`, wide)
const portraitUrl = await upload(`hero-portrait-${slug}.jpg`, portrait)

const rowRes = await fetch(`${URL_}/rest/v1/crosswords?id=eq.${encodeURIComponent(id)}&select=theme_custom`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
})
const [row] = await rowRes.json()
if (!row) {
  console.log(`\nкроссворд «${id}» не найден — картинки залиты, но не привязаны:\n${wideUrl}\n${portraitUrl}`)
  process.exit(1)
}
const merged = { ...(row.theme_custom || {}), heroImage: { wide: wideUrl, portrait: portraitUrl } }
const patch = await fetch(`${URL_}/rest/v1/crosswords?id=eq.${encodeURIComponent(id)}`, {
  method: 'PATCH',
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ theme_custom: merged }),
})
if (!patch.ok) throw new Error('patch ' + patch.status)
console.log(`ok\n${wideUrl}\n${portraitUrl}`)
