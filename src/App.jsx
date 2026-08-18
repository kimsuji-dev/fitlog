import { useState, useEffect } from 'react'
import Today from './Today'
import History from './History'
import Settings from './Settings'
import NagLine from './NagLine'
import { listSessions } from './db'
import { volume } from './calc'

const TABS = [
  { id: 'today', label: '🏠 홈' },
  { id: 'history', label: '📔 다이어리' },
  { id: 'settings', label: '⚙️ 관리' },
]

const todayStr = () => new Date().toLocaleDateString('sv-SE')

export default function App() {
  const [tab, setTab] = useState('today')
  const [todayVolume, setTodayVolume] = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)

  useEffect(() => {
    (async () => {
      const sessions = await listSessions()
      setTotalSessions(sessions.length)
      const s = sessions.find(sess => sess.date === todayStr())
      setTodayVolume(s ? volume(s) : 0)
    })()
  }, [])

  return (
    <div className="app-shell">
      <div className="card minihompy-header">
        <div className="minihompy-title">♡ 수지님의 미니헬스 ♡</div>
        <div className="minihompy-counter">TODAY 볼륨 {todayVolume}kg | TOTAL {totalSessions}판</div>
      </div>

      <NagLine trigger={tab} />

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
