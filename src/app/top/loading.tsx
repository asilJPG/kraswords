export default function TopLoading() {
  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px 40px' }}>
      <div className="skeleton" style={{ height: '36px', width: '60px', marginBottom: '32px' }} />

      <div className="skeleton" style={{ height: '18px', width: '80px', marginBottom: '12px' }} />
      <div style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: '16px', overflow: 'hidden', marginBottom: '36px',
        display: 'flex', flexDirection: 'column',
      }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{
            height: '52px',
            borderRadius: 0,
            borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
          }} />
        ))}
      </div>

      <div className="skeleton" style={{ height: '18px', width: '110px', marginBottom: '12px' }} />
      <div style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: '16px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{
            height: '60px',
            borderRadius: 0,
            borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
          }} />
        ))}
      </div>
    </main>
  )
}
