'use client'

import { useState } from 'react'
import { normaliseAnswer } from '@/lib/crossword/editor'

interface Props {
  onAdd: (answer: string, clue: string) => void
}

export default function AddWordForm({ onAdd }: Props) {
  const [answer, setAnswer] = useState('')
  const [clue, setClue] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const a = normaliseAnswer(answer)
    if (a.length < 2 || !clue.trim()) return
    onAdd(a, clue.trim())
    setAnswer('')
    setClue('')
  }

  return (
    <form onSubmit={submit} style={{
      display: 'flex', flexDirection: 'column', gap: '8px',
      padding: '12px', background: '#f9fafb', borderRadius: '12px',
    }}>
      <input
        type="text"
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="СЛОВО"
        style={{ ...inp, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}
      />
      <input
        type="text"
        value={clue}
        onChange={e => setClue(e.target.value)}
        placeholder="подсказка"
        style={inp}
      />
      <button type="submit" style={{
        padding: '8px',
        background: '#111827',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}>
        + добавить слово
      </button>
    </form>
  )
}

const inp: React.CSSProperties = {
  padding: '8px 10px',
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
}
