import { useState, useEffect } from 'react'
import WeightChart from './WeightChart'
import { listSessions, listWeights, listPeriods, getDiet } from './db'
import { volume } from './calc'

const DIET_EMOJI = { good: '🥗', normal: '😐', pig: '🐷' }
const fmtDate = d => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`

function lastSetSummary(entries) {
  const seen = new Map()
  for (const e of entries) {
    if (seen.has(e.name)) continue
    if (e.type === 'weight') {
      const last = e.sets[e.sets.length - 1]
      seen.set(e.name, `${e.sets.length}×${last.reps}×${last.kg}kg`)
    } else {
      seen.set(e.name, `${e.minutes}분${e.km ? ` / ${e.km}km` : ''}`)
    }
  }
  return seen
}

export default function History({ active } = {}) {
  const [weights, setWeights] = useState([])
  const [periods, setPeriods] = useState([])
  const [sessions, setSessions] = useState([])
  const [diets, setDiets] = useState({}) // date -> rating
  const [openDate, setOpenDate] = useState(null)

  useEffect(() => {
    if (!active) return
    (async () => {
      const [w, p, s] = await Promise.all([listWeights(), listPeriods(), listSessions()])
      setWeights(w)
      setPeriods(p)
      setSessions(s)
      const entries = await Promise.all(s.map(async sess => [sess.date, await getDiet(sess.date)]))
      setDiets(Object.fromEntries(entries))
    })()
  }, [active])

  const inPeriod = date => periods.some(p => p.start <= date && (p.end === null || date <= p.end))

  // 종목별 최근 기록: 최신 세션부터 훑어 종목당 처음(=가장 최근) 등장만 채택
  const recentByExercise = []
  const claimed = new Set()
  for (const s of sessions) {
    const summary = lastSetSummary(s.entries)
    for (const [name, text] of summary) {
      if (claimed.has(name)) continue
      claimed.add(name)
      recentByExercise.push({ name, date: s.date, text })
    }
  }

  return (
    <div>
      <h2>📈 이력</h2>

      <WeightChart weights={weights} periods={periods} />

      {recentByExercise.length > 0 && (
        <div className="card">
          <div>🏋️ 종목별 최근 기록</div>
          {recentByExercise.map(r => (
            <div key={r.name} style={{ fontSize: '0.9rem' }}>
              {r.name} — {fmtDate(r.date)}: {r.text}
            </div>
          ))}
        </div>
      )}

      {sessions.length === 0 && <div className="card">아직 기록된 운동이 없어요 🐣</div>}

      {sessions.map(s => {
        const open = openDate === s.date
        return (
          <div key={s.date} className="card">
            <button
              className="icon-btn"
              onClick={() => setOpenDate(open ? null : s.date)}
              style={{ display: 'flex', justifyContent: 'space-between', width: '100%', textAlign: 'left' }}
            >
              <span>
                {fmtDate(s.date)} {s.start}–{s.end} · 종목 {s.entries.length}개 · 볼륨 {volume(s)}kg
                {diets[s.date] && ` ${DIET_EMOJI[diets[s.date]]}`}
                {inPeriod(s.date) && ' 🩸'}
              </span>
              <span>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {s.entries.map((e, i) => (
                  <div key={i} className="entry-row">
                    <strong>{e.name}</strong>
                    {e.type === 'weight'
                      ? e.sets.map((set, si) => <div key={si}>{set.reps}회 × {set.kg}kg</div>)
                      : <div>{e.minutes}분{e.km ? ` / ${e.km}km` : ''}</div>}
                  </div>
                ))}
                {s.memo && <div style={{ fontSize: '0.85rem' }}>📝 {s.memo}</div>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
