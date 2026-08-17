import { useState } from 'react'
import Today from './Today'
import History from './History'
import Settings from './Settings'

const TABS = [
  { id: 'today', label: '💪 오늘' },
  { id: 'history', label: '📈 이력' },
  { id: 'settings', label: '⚙️ 설정' },
]

export default function App() {
  const [tab, setTab] = useState('today')

  return (
    <div className="app-shell">
      <div style={{ display: tab === 'today' ? undefined : 'none' }}><Today /></div>
      <div style={{ display: tab === 'history' ? undefined : 'none' }}><History active={tab === 'history'} /></div>
      <div style={{ display: tab === 'settings' ? undefined : 'none' }}><Settings active={tab === 'settings'} /></div>

      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'active' : ''}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
