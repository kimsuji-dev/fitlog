import { useState, useEffect, useMemo } from 'react'
import { MUSCLES, EQUIPMENT, BUILTIN, matchesSearch } from './exercises'
import { listSessions, listFavorites, toggleFavorite } from './db'
import MuscleFigure from './MuscleFigure'
import MotionDiagram from './MotionDiagram'

const TABS = [
  { key: 'all', label: '전체' },
  { key: 'fav', label: '좋아하는' },
  { key: 'frequent', label: '자주하는' },
  { key: 'recent', label: '최근' },
]

// 패턴별 동작 포인트 — MotionDiagram.jsx 의 패턴 키와 1:1로 대응
const CUES = {
  squat: ['발은 어깨너비로 벌리고 발끝은 살짝 바깥으로', '무릎이 발끝과 같은 방향을 향하게', '엉덩이를 뒤로 앉듯이 내려갔다 올라오기'],
  hinge: ['무릎은 살짝만 굽히고 엉덩이를 뒤로 밀기', '등은 둥글게 말지 않고 곧게 유지', '햄스트링이 당겨지는 지점까지만 내려가기'],
  lunge: ['상체는 세우고 한 발을 앞으로 내딛기', '앞무릎이 발끝을 넘어가지 않게', '뒷무릎은 바닥에 닿기 직전까지'],
  horizontalPress: ['어깨는 아래로 내려 고정', '팔꿈치는 몸통과 45도 정도', '가슴에 닿을 만큼만 내렸다 밀어내기'],
  verticalPress: ['갈비뼈가 앞으로 튀어나오지 않게 코어 조이기', '팔꿈치는 손목 바로 아래', '머리 위로 곧게 밀어올리기'],
  horizontalPull: ['어깨를 뒤로 모으며 당기기', '손이 아니라 등으로 당긴다는 느낌으로', '상체가 앞뒤로 흔들리지 않게'],
  verticalPull: ['어깨를 아래로 내린 상태에서 시작', '가슴을 열고 위에서 아래로 당기기', '반동 없이 천천히 되돌리기'],
  curl: ['팔꿈치를 몸통 옆에 고정', '손목은 꺾지 않고 곧게', '내릴 때 천천히 버티며'],
  extension: ['팔꿈치 위치를 고정한 채 아래팔만 움직이기', '어깨가 앞으로 말리지 않게', '끝에서 무리하게 펴지 않기'],
  core: ['허리를 바닥에서 과하게 띄우지 않기', '목에 힘이 들어가면 잠시 쉬기', '호흡을 참지 말고 내쉬며 힘주기'],
  cardio: ['시선은 정면, 어깨에 힘 빼기', '대화가 가능한 정도의 강도부터', '통증이 생기면 즉시 멈추기'],
  isolationMachine: ['시트와 패드 높이를 몸에 맞게 조절', '반동 없이 천천히 움직이기', '목표 부위에 자극이 오는지 확인하며'],
}

function ExerciseDetail({ ex, onBack, onAdd }) {
  return (
    <div className="exercise-detail">
      <div className="detail-header">
        <button className="icon-btn" onClick={onBack} aria-label="뒤로">←</button>
        <strong className="detail-title">{ex.name}</strong>
      </div>

      <div className="detail-section">
        <div className="detail-heading">동작</div>
        <MotionDiagram pattern={ex.pattern} photos={ex.photos} wg={ex.wg} size={140} />
      </div>

      <ul className="detail-cues">
        {(CUES[ex.pattern] || []).map((cue, i) => <li key={i}>{cue}</li>)}
      </ul>

      <div className="detail-section">
        <div className="detail-heading">자극 부위</div>
        <MuscleFigure muscles={ex.muscles || []} size={150} />
        <div className="text-sm detail-muscle-names">{(ex.muscles || []).join(' · ') || '부위 미지정'}</div>
      </div>

      <span className="equipment-chip">도구: {ex.equipment || '맨몸'}</span>

      <button className="big-btn" onClick={() => onAdd(ex)}>이 운동 추가</button>

      <div className="text-sm detail-disclaimer">정확한 자세는 트레이너에게 확인하는 게 가장 안전해요.</div>
    </div>
  )
}

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

const BUILTIN_NAMES = new Set(BUILTIN.map(e => e.name))

export default function ExercisePicker({ exercises, onSelect, onAddCustom, onDeleteCustom, onClose, initialMuscle = '전체' }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [muscle, setMuscle] = useState(initialMuscle)
  const [equipment, setEquipment] = useState('전체')
  const [favorites, setFavorites] = useState(new Set())
  const [detail, setDetail] = useState(null)
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
    if (search.trim()) l = l.filter(ex => matchesSearch(ex.name, search))
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

  if (detail) {
    return (
      <div className="card exercise-picker">
        <ExerciseDetail ex={detail} onBack={() => setDetail(null)} onAdd={onSelect} />
      </div>
    )
  }

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
            <button className="picker-row-main" onClick={() => setDetail(ex)}>
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
              onClick={e => { e.stopPropagation(); handleToggleFavorite(ex.name) }}
            >
              {favorites.has(ex.name) ? '♥' : '♡'}
            </button>
            {!BUILTIN_NAMES.has(ex.name) && (
              <button
                className="icon-btn danger"
                onClick={e => { e.stopPropagation(); onDeleteCustom?.(ex.name) }}
                aria-label="직접 추가한 종목 삭제"
              >✕</button>
            )}
          </div>
        ))}
        {list.length === 0 && <div className="text-sm">조건에 맞는 종목이 없어요</div>}
      </div>

      <button onClick={onAddCustom}>✍️ 직접 추가</button>
      <button onClick={onClose}>닫기</button>
    </div>
  )
}
