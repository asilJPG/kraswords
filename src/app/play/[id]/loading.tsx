export default function PlayLoading() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 32px)',
        gap: '4px',
        opacity: 0.6,
      }}>
        {Array.from({ length: 64 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
        ))}
      </div>
    </div>
  )
}
