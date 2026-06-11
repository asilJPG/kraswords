export default function AdminLoading() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div className="skeleton" style={{ height: '26px', width: '160px' }} />
        <div className="skeleton" style={{ height: '34px', width: '110px', borderRadius: '10px' }} />
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
        ))}
      </div>
    </div>
  )
}
