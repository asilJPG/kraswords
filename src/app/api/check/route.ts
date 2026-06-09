import { NextResponse } from 'next/server'
import { getCrossword } from '@/lib/crosswords-private'

export async function POST(request: Request) {
  try {
    const { id, answers } = await request.json()

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing crossword id' }, { status: 400 })
    }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Missing answers' }, { status: 400 })
    }

    const crossword = getCrossword(id)
    if (!crossword) {
      return NextResponse.json({ error: 'Crossword not found' }, { status: 404 })
    }

    const result: Record<string, boolean> = {}
    let allCorrect = true

    for (const clue of crossword.clues) {
      for (let i = 0; i < clue.answer.length; i++) {
        const r = clue.direction === 'down' ? clue.row + i : clue.row
        const c = clue.direction === 'across' ? clue.col + i : clue.col
        const key = `${r},${c}`
        const userLetter = (answers as Record<string, string>)[key] || ''
        const isCorrect = userLetter.toUpperCase() === clue.answer[i]
        result[key] = isCorrect
        if (!isCorrect) allCorrect = false
      }
    }

    return NextResponse.json({ correct: allCorrect, cells: result })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
