import { useState } from 'react'
import Today from './Today'
import History from './History'

const TABS = [
  { id: 'today', label: '💪 오늘' },
  { id: 'history', label: '📈 이력' },
  { id: 'settings', label: '⚙️ 설정' },
]

export default function App() {
  const [tab, setTab] = useState('today')

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, fontFamily: 'sans-serif', paddingBottom: 80 }}>
      {tab === 'today' && <Today />}
      {tab === 'history' && <History />}
      {tab === 'settings' && <div style={{ padding: '20px', background: 'var(--accent-color)', borderRadius: 'var(--border-radius)', marginBottom: '20px' }}>설정 (Task 8)</div>}

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        borderTop: '2px solid var(--border-color)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '14px 8px',
              border: 'none',
              background: 'transparent',
              fontWeight: tab === t.id ? 'bold' : 'normal',
              color: tab === t.id ? 'var(--primary-color)' : 'var(--text-color)',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
              borderBottom: tab === t.id ? '3px solid var(--primary-color)' : '3px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
