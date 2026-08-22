import { useState } from 'react'
import { volume } from './calc'

// 순수 표시 컴포넌트 — DB 접근 없음. props: { sessions: 최신순 세션 배열 }. 최근 10회만 보여준다.
const LIMIT = 10
const fmtDate = d => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`

export default function History({ sessions }) {
  const [openDate, setOpenDate] = useState(null)
  const recent = sessions.slice(0, LIMIT)

  return (
    <div>
      <h2>최근 운동<em>LAST {LIMIT}</em></h2>

      {recent.length === 0 && <div className="card">아직 기록이 없어요</div>}

      {recent.map(s => {
        const open = openDate === s.date
        return (
          <div key={s.date} className="card">
            <button
              className="icon-btn toggle-btn"
              onClick={() => setOpenDate(open ? null : s.date)}
            >
              <span>
                <span className="num">{fmtDate(s.date)} {s.start}–{s.end}</span>
                {' · 종목 '}<span className="num">{s.entries.length}</span>
                {' · 볼륨 '}<span className="num">{volume(s)}</span>kg
              </span>
              <span>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
              <div className="entry-list">
                {s.entries.map((e, i) => (
                  <div key={i} className="entry-row">
                    <strong>{e.name}</strong>
                    {e.type === 'weight'
                      ? e.sets.map((set, si) => <div key={si} className="num">{set.reps}회 × {set.kg}kg</div>)
                      : <div className="num">{e.minutes}분{e.km ? ` / ${e.km}km` : ''}</div>}
                  </div>
                ))}
                {s.memo && <div className="text-sm">메모 — {s.memo}</div>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
