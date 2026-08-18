import { useState, useEffect, useMemo } from 'react'
import { MUSCLES, EQUIPMENT } from './exercises'
import { listSessions, listFavorites, toggleFavorite } from './db'

const TABS = [
  { key: 'all', label: '전체' },
  { key: 'fav', label: '좋아하는' },
  { key: 'frequent', label: '자주하는' },
  { key: 'recent', label: '최근' },
]

// 세션 기록에서 종목별 사용 횟수(최다순)와 최근 사용 순서(이름 배열)를 뽑는다.
function useUsageStats() {
  const [counts, setCounts] = useState({})
  const [recentOrder, setRecentOrder] = useState([])

  useEffect(() => {
    (async () => {
      const sessions = await listSessions() // 최신순
      const c = {}
      const recent = []
      for (const s of sessions) {
        for (const e of s.entries || []) {
          c[e.name] = (c[e.name] || 0) + 1
          if (!recent.includes(e.name)) recent.push(e.name)
        }
      }
      setCounts(c)
      setRecentOrder(recent)
    })()
  }, [])

  return { counts, recentOrder }
}

export default function ExercisePicker({ exercises, onSelect, onAddCustom, onClose }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [muscle, setMuscle] = useState('전체')
  const [equipment, setEquipment] = useState('전체')
  const [favorites, setFavorites] = useState(new Set())
  const { counts, recentOrder } = useUsageStats()

  useEffect(() => {
    listFavorites().then(f => setFavorites(new Set(f)))
  }, [])

  async function handleToggleFavorite(name) {
    await toggleFavorite(name)
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const list = useMemo(() => {
    let l = exercises
    if (search.trim()) l = l.filter(ex => ex.name.includes(search.trim()))
    if (muscle !== '전체') l = l.filter(ex => (ex.muscles || []).includes(muscle))
    if (equipment !== '전체') l = l.filter(ex => ex.equipment === equipment)
    if (tab === 'fav') l = l.filter(ex => favorites.has(ex.name))
    if (tab === 'frequent') l = [...l].filter(ex => counts[ex.name]).sort((a, b) => (counts[b.name] || 0) - (counts[a.name] || 0))
    if (tab === 'recent') {
      const rank = name => { const i = recentOrder.indexOf(name); return i === -1 ? Infinity : i }
      l = [...l].filter(ex => recentOrder.includes(ex.name)).sort((a, b) => rank(a.name) - rank(b.name))
    }
    return l
  }, [exercises, search, muscle, equipment, tab, favorites, counts, recentOrder])

  return (
    <div className="card exercise-picker">
      <input
        className="picker-search"
        placeholder="🔍 종목 검색"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="chip-row">
        {TABS.map(t => (
          <button key={t.key} className={`chip ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="chip-row chip-row-scroll">
        <button className={`chip ${muscle === '전체' ? 'active' : ''}`} onClick={() => setMuscle('전체')}>전체</button>
        {MUSCLES.map(m => (
          <button key={m} className={`chip ${muscle === m ? 'active' : ''}`} onClick={() => setMuscle(m)}>{m}</button>
        ))}
      </div>

      <div className="chip-row chip-row-scroll">
        <button className={`chip ${equipment === '전체' ? 'active' : ''}`} onClick={() => setEquipment('전체')}>전체</button>
        {EQUIPMENT.map(eq => (
          <button key={eq} className={`chip ${equipment === eq ? 'active' : ''}`} onClick={() => setEquipment(eq)}>{eq}</button>
        ))}
      </div>

      <div className="picker-list">
        {list.map(ex => (
          <div key={ex.name} className="picker-row">
            <button className="picker-row-main" onClick={() => onSelect(ex)}>
              <div className="picker-row-info">
                <span className="picker-row-name">{ex.name}</span>
                <span className="picker-row-meta">
                  <span className="text-sm">{(ex.muscles || []).join(' · ') || '부위 미지정'}</span>
                  <span className="equipment-chip">{ex.equipment || '맨몸'}</span>
                </span>
              </div>
            </button>
            <button
              className={`icon-btn heart-btn ${favorites.has(ex.name) ? 'active' : ''}`}
              onClick={() => handleToggleFavorite(ex.name)}
            >
              {favorites.has(ex.name) ? '♥' : '♡'}
            </button>
          </div>
        ))}
        {list.length === 0 && <div className="text-sm">조건에 맞는 종목이 없어요</div>}
      </div>

      <button onClick={onAddCustom}>✍️ 직접 추가</button>
      <button onClick={onClose}>닫기</button>
    </div>
  )
}
