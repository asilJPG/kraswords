'use client'

interface Props {
  size: number
  letter: string | null
  isCovered: boolean
  isValid: boolean       // cell is a valid placement start
  isPreview: boolean     // cell shows where current word would land
  isConflict: boolean    // preview would clash here
  isIntersection: boolean // preview would intersect existing letter
  onClick: () => void
  onHover: () => void
}

export default function EditorCell({
  size, letter, isCovered, isValid, isPreview, isConflict, isIntersection, onClick, onHover,
}: Props) {
  let bg = '#fff'
  if (!isCovered && !isPreview && !isValid) bg = '#1f2937'  // black cell
  if (isCovered) bg = '#fff'
  if (isValid) bg = '#dcfce7'                                // green hint
  if (isPreview) bg = '#bbf7d0'                              // brighter on preview path
  if (isIntersection) bg = '#86efac'                         // intersection bonus
  if (isConflict) bg = '#fecaca'                             // conflict

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      style={{
        width: size,
        height: size,
        background: bg,
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(11, size * 0.45),
        fontWeight: 600,
        cursor: 'pointer',
        userSelect: 'none',
        color: '#111827',
        transition: 'background 0.08s',
      }}
    >
      {letter ?? ''}
    </div>
  )
}
