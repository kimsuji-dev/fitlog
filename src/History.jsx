import { useState, useEffect } from 'react'
import WeightChart from './WeightChart'
import {
  listSessions, listWeights, listPeriods, getDiet, listDietDates,
  listRestDays, getRestDay, listInositolDates, getInositol,
} from './db'
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
  const [inositolDays, setInositolDays] = useState({}) // date -> bool
  const [restDays, setRestDays] = useState({}) // date -> bool
  const [allDates, setAllDates] = useState([]) // 세션+식단+이노시톨+쉬는날, 최신순
  const [openDate, setOpenDate] = useState(null)

  useEffect(() => {
    if (!active) return
    (async () => {
      const [w, p, s, dietDates, inositolDates, restDates] = await Promise.all([
        listWeights(), listPeriods(), listSessions(), listDietDates(), listInositolDates(), listRestDays(),
      ])
      setWeights(w)
      setPeriods(p)
      setSessions(s)

      const union = [...new Set([...s.map(sess => sess.date), ...dietDates, ...inositolDates, ...restDates])]
      union.sort((a, b) => b.localeCompare(a)) // 최신순
      setAllDates(union)

      const [dietEntries, inositolEntries, restEntries] = await Promise.all([
        Promise.all(union.map(async d => [d, await getDiet(d)])),
        Promise.all(union.map(async d => [d, await getInositol(d)])),
        Promise.all(union.map(async d => [d, await getRestDay(d)])),
      ])
      setDiets(Object.fromEntries(dietEntries))
      setInositolDays(Object.fromEntries(inositolEntries))
      setRestDays(Object.fromEntries(restEntries))
    })()
  }, [active])

  const inPeriod = date => periods.some(p => p.start <= date && (p.end === null || date <= p.end))

  // 사이즈(가슴/허리/엉덩이) 기록이 있는 날짜만, 최신순
  const sizeRecords = weights.filter(w => w.chest || w.waist || w.hip).slice().reverse()

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
      <h2>📔 다이어리</h2>

      <WeightChart weights={weights} periods={periods} />

      {sizeRecords.length > 0 && (
        <div className="card">
          <div>📏 사이즈 기록</div>
          {sizeRecords.map(w => (
            <div key={w.date} className="text-sm">
              {fmtDate(w.date)} — {[
                w.chest && `가슴 ${w.chest}cm`,
                w.waist && `허리 ${w.waist}cm`,
                w.hip && `엉덩이 ${w.hip}cm`,
              ].filter(Boolean).join(' · ')}
            </div>
          ))}
        </div>
      )}

      {recentByExercise.length > 0 && (
        <div className="card">
          <div>🏋️ 종목별 최근 기록</div>
          {recentByExercise.map(r => (
            <div key={r.name} className="text-sm">
              {r.name} — {fmtDate(r.date)}: {r.text}
            </div>
          ))}
        </div>
      )}

      {allDates.length === 0 && <div className="card">아직 기록이 없어요 🐣</div>}

      {allDates.map(date => {
        const s = sessions.find(sess => sess.date === date)
        if (s) {
          const open = openDate === s.date
          return (
            <div key={s.date} className="card">
              <button
                className="icon-btn toggle-btn"
                onClick={() => setOpenDate(open ? null : s.date)}
              >
                <span>
                  {fmtDate(s.date)} {s.start}–{s.end} · 종목 {s.entries.length}개 · 볼륨 {volume(s)}kg
                  {diets[s.date] && ` ${DIET_EMOJI[diets[s.date]]}`}
                  {inositolDays[s.date] && ' 💊'}
                  {inPeriod(s.date) && ' 🩸'}
                </span>
                <span>{open ? '▲' : '▼'}</span>
              </button>
              {open && (
                <div className="entry-list">
                  {s.entries.map((e, i) => (
                    <div key={i} className="entry-row">
                      <strong>{e.name}</strong>
                      {e.type === 'weight'
                        ? e.sets.map((set, si) => <div key={si}>{set.reps}회 × {set.kg}kg</div>)
                        : <div>{e.minutes}분{e.km ? ` / ${e.km}km` : ''}</div>}
                    </div>
                  ))}
                  {s.memo && <div className="text-sm">📝 {s.memo}</div>}
                </div>
              )}
            </div>
          )
        }
        return (
          <div key={date} className="card">
            <span>
              {fmtDate(date)} {restDays[date] ? '쉬는 날 😴' : '기록만 있어요'}
              {diets[date] && ` ${DIET_EMOJI[diets[date]]}`}
              {inositolDays[date] && ' 💊'}
              {inPeriod(date) && ' 🩸'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
