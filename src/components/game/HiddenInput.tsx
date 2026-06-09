'use client'

import { forwardRef } from 'react'

interface Props {
  onInput: (e: React.FormEvent<HTMLInputElement>) => void
  onBackspace: () => void
}

const HiddenInput = forwardRef<HTMLInputElement, Props>(function HiddenInput(
  { onInput, onBackspace }, ref
) {
  return (
    <input
      ref={ref}
      onInput={onInput}
      onKeyDown={(e) => {
        if (e.key === 'Backspace') {
          e.preventDefault()
          onBackspace()
        }
      }}
      style={{
        position: 'fixed',
        top: '-100px',
        left: '-100px',
        width: '1px',
        height: '1px',
        opacity: 0,
        fontSize: '16px',
      }}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      inputMode="text"
      enterKeyHint="next"
    />
  )
})

export default HiddenInput
