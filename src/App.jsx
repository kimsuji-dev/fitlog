import { useState, useEffect } from 'react'
import Today from './Today'
import Measure from './Measure'
import { listSessions, listWeights } from './db'
import { volume } from './calc'
import { parseDeepLink } from './validate'

const todayStr = () => new Date().toLocaleDateString('sv-SE')

export default function App() {
  // 텔레그램 딥링크(?tab=measure)면 측정 탭으로 바로 연다
  const [tab, setTab] = useState(() => parseDeepLink(location.search)?.tab || 'workout')
  // 세션(최신순)·측정(오름차순)은 여기서 한 번 읽고 두 탭에 내려보낸다. 저장한 탭이 reload 를 부른다.
  const [sessions, setSessions] = useState([])
  const [weights, setWeights] = useState([])

  const reloadSessions = async () => setSessions(await listSessions())
  const reloadWeights = async () => setWeights(await listWeights())
  useEffect(() => { reloadSessions(); reloadWeights() }, [])

  // 탭을 갈아끼운 뒤 렌즈(.lg-heavy) 재부착 — 사라진 요소 정리 + 새 요소 등록
  useEffect(() => { window.LiquidGlass?.apply() }, [tab])

  const todaySession = sessions.find(s => s.date === todayStr())
  const TABS = [
    { id: 'workout', label: '💪 운동', count: sessions.length },
    { id: 'measure', label: '📏 측정', count: weights.length },
  ]

  return (
    <div className="app-shell">
      <header className="top">
        <div className="top-title">수지님의 미니헬스<em>FITLOG</em></div>
        <div className="top-stat">오늘 {todaySession ? volume(todaySession) : 0}kg</div>
      </header>

      <div style={{ display: tab === 'workout' ? undefined : 'none' }}>
        <Today sessions={sessions} weights={weights} onSaved={reloadSessions} />
      </div>
      <div style={{ display: tab === 'measure' ? undefined : 'none' }}>
        <Measure weights={weights} onSaved={reloadWeights} />
      </div>

      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'active' : ''}
            aria-label={`${t.label} ${t.count}`}>
            {t.label}<span className="count">{t.count}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
