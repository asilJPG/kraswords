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
        bottom: '0',
        left: '0',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        fontSize: '16px',
        border: 'none',
        background: 'transparent',
        zIndex: -1,
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
