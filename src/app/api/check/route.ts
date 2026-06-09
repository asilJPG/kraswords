import { NextResponse } from 'next/server'
import { getCrossword, verifyAnswers } from '@/lib/crosswords'

const CELL_KEY_RE = /^\d+,\d+$/
const LETTER_RE = /^[A-ZА-ЯЁ]$/i

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const { id, answers } = body as Record<string, unknown>

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing crossword id' }, { status: 400 })
    }

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return NextResponse.json({ error: 'Missing answers' }, { status: 400 })
    }

    const entries = Object.entries(answers as Record<string, unknown>)
    if (entries.length > 500) {
      return NextResponse.json({ error: 'Answers too large' }, { status: 400 })
    }

    const normalized: Record<string, string> = {}
    for (const [key, value] of entries) {
      if (!CELL_KEY_RE.test(key)) {
        return NextResponse.json({ error: `Invalid cell key: ${key}` }, { status: 400 })
      }
      if (typeof value !== 'string' || value.length !== 1 || !LETTER_RE.test(value)) {
        return NextResponse.json({ error: `Invalid letter for ${key}` }, { status: 400 })
      }
      normalized[key] = value.toUpperCase()
    }

    const crossword = getCrossword(id)
    if (!crossword) {
      return NextResponse.json({ error: 'Crossword not found' }, { status: 404 })
    }

    const result = verifyAnswers(crossword, normalized)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
