export default function ProfileLoading() {
  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px 40px' }}>
      {/* Banner */}
      <div style={{ position: 'relative', marginBottom: '52px' }}>
        <div className="skeleton" style={{ width: '100%', height: '140px', borderRadius: '20px' }} />
        <div className="skeleton" style={{
          position: 'absolute', left: '50%', bottom: '-36px',
          transform: 'translateX(-50%)',
          width: '76px', height: '76px', borderRadius: '50%',
          border: '4px solid var(--bg)',
        }} />
      </div>

      {/* Username + handle */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="skeleton" style={{ height: '24px', width: '140px', margin: '0 auto 6px' }} />
        <div className="skeleton" style={{ height: '12px', width: '180px', margin: '0 auto' }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '36px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="skeleton" style={{ height: '66px', borderRadius: '14px' }} />
        ))}
      </div>

      {/* Achievements heading */}
      <div className="skeleton" style={{ height: '18px', width: '80px', marginBottom: '14px' }} />
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '10px', marginBottom: '36px',
      }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: '108px', borderRadius: '12px' }} />
        ))}
      </div>

      {/* History */}
      <div className="skeleton" style={{ height: '18px', width: '110px', marginBottom: '14px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: '54px', borderRadius: '12px' }} />
        ))}
      </div>
    </main>
  )
}
