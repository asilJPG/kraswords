const achievements = [
  { emoji: '🧪', name: 'Портальный мастер', desc: 'Все кроссворды Рик и Морти', unlocked: false },
  { emoji: '⚡', name: 'Волшебник', desc: 'Решить без подсказок', unlocked: true },
  { emoji: '🌌', name: 'Звездоход', desc: 'Все кроссворды про космос', unlocked: false },
  { emoji: '🏎️', name: 'Молния', desc: 'Решить за минуту', unlocked: true },
  { emoji: '🔥', name: 'Серия', desc: '5 кроссвордов подряд', unlocked: false },
  { emoji: '👾', name: 'Ретро-геймер', desc: 'Все пиксельные кроссворды', unlocked: false },
]

const characters = [
  { emoji: '🧪', name: 'Рик', unlocked: true },
  { emoji: '😰', name: 'Морти', unlocked: false },
  { emoji: '⚡', name: 'Гарри', unlocked: true },
  { emoji: '🌙', name: 'Луна', unlocked: false },
  { emoji: '🍄', name: 'Марио', unlocked: false },
  { emoji: '💛', name: 'Пакмен', unlocked: true },
]

export default function ProfilePage() {
  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px' }}>
      {/* avatar & stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '40px',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
        }}>
          😎
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
            игрок
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>
            на сайте с июня 2026
          </p>
        </div>
      </div>

      {/* stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '48px',
      }}>
        {[
          { label: 'решено', value: '12' },
          { label: 'среднее', value: '3:24' },
          { label: 'серия', value: '3' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#f9fafb',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* achievements */}
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
        ачивки
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '48px',
      }}>
        {achievements.map(a => (
          <div key={a.name} style={{
            background: a.unlocked ? '#ffffff' : '#f9fafb',
            border: `1px solid ${a.unlocked ? '#f3f4f6' : '#f3f4f6'}`,
            borderRadius: '12px',
            padding: '16px',
            opacity: a.unlocked ? 1 : 0.5,
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{a.emoji}</div>
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{a.name}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{a.desc}</div>
          </div>
        ))}
      </div>

      {/* characters */}
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
        персонажи
      </h2>
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        {characters.map(ch => (
          <div key={ch.name} style={{
            width: '72px',
            textAlign: 'center',
            opacity: ch.unlocked ? 1 : 0.3,
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: ch.unlocked ? '#f3f4f6' : '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              margin: '0 auto 6px',
            }}>
              {ch.unlocked ? ch.emoji : '🔒'}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>{ch.name}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
