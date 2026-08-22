import { useState, useEffect } from 'react'
import WeightChart from './WeightChart'
import Settings from './Settings'
import { addWeight } from './db'
import { parseWeight, parseSize } from './validate'

const CYCLE_DAYS = 14 // 측정 주기 — 텔레그램 알림(scripts/weight-reminder.sh)과 같은 2주
const DAY_MS = 86400e3
const todayStr = () => new Date().toLocaleDateString('sv-SE')
const fmtDate = d => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`
// 'YYYY-MM-DD' 문자열끼리의 날짜 계산 — new Date(문자열)은 UTC 자정이라 toISOString과 짝이 맞는다
const addDays = (d, n) => new Date(new Date(d).getTime() + n * DAY_MS).toISOString().slice(0, 10)
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / DAY_MS)

// props: weights(오름차순)는 App이 들고 있고, 저장하면 onSaved()로 다시 읽게 한다.
export default function Measure({ weights, onSaved }) {
  const today = todayStr()
  const [date, setDate] = useState(today)
  const [kg, setKg] = useState('')
  const [chest, setChest] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [msg, setMsg] = useState('')

  // 고른 날짜에 이미 기록이 있으면 입력칸에 채워 보여준다 (저장 후에도 그대로 남아 "저장됐구나"가 보이게)
  useEffect(() => {
    const ex = weights.find(w => w.date === date)
    setKg(ex ? String(ex.kg) : '')
    setChest(ex?.chest !== undefined ? String(ex.chest) : '')
    setWaist(ex?.waist !== undefined ? String(ex.waist) : '')
    setHip(ex?.hip !== undefined ? String(ex.hip) : '')
  }, [date, weights])

  async function handleSave() {
    const kgNum = parseWeight(kg)
    if (kgNum === null) {
      setMsg('체중을 확인해주세요 (20~300kg)')
      return
    }
    const sizes = {}
    for (const [key, raw] of [['chest', chest], ['waist', waist], ['hip', hip]]) {
      if (!raw.trim()) continue
      const v = parseSize(raw)
      if (v === null) {
        setMsg('사이즈 값을 확인해주세요 (20~200cm)')
        return
      }
      sizes[key] = v
    }
    await addWeight(date, kgNum, sizes)
    onSaved()
    setMsg(`${fmtDate(date)} 측정 저장했어요 ✓`)
  }

  const last = weights[weights.length - 1]
  const ago = last ? daysBetween(last.date, today) : null
  const sizeRecords = weights.filter(w => w.chest || w.waist || w.hip).slice().reverse() // 최신순

  return (
    <div>
      <h2>측정<em>EVERY {CYCLE_DAYS} DAYS</em></h2>

      <div className="notice">
        {last
          ? <>마지막 측정 <span className="num">{last.date}</span> ({ago === 0 ? '오늘' : <><span className="num">{ago}</span>일 전</>}) · 다음 측정 <span className="num">{addDays(last.date, CYCLE_DAYS)}</span></>
          : <>아직 측정 기록이 없어요 — 오늘 첫 측정 해볼까요?</>}
      </div>

      <div className="card glass lg-heavy">
        <div className="glass-layers" aria-hidden="true">
          <span className="gl-dist" /><span className="gl-tint" /><span className="gl-shine" />
        </div>
        <label className="field">
          날짜
          <input type="date" value={date} max={today} onChange={e => setDate(e.target.value)} />
        </label>
        <label className="field big">
          체중 (kg)
          <input type="text" inputMode="decimal" value={kg} onChange={e => setKg(e.target.value)} placeholder="58.5" />
        </label>
        <div className="measure-grid">
          <label className="field big">
            가슴 (cm)
            <input type="text" inputMode="decimal" value={chest} onChange={e => setChest(e.target.value)} placeholder="선택" />
          </label>
          <label className="field big">
            허리 (cm)
            <input type="text" inputMode="decimal" value={waist} onChange={e => setWaist(e.target.value)} placeholder="선택" />
          </label>
          <label className="field big">
            엉덩이 (cm)
            <input type="text" inputMode="decimal" value={hip} onChange={e => setHip(e.target.value)} placeholder="선택" />
          </label>
        </div>
        <button className="big-btn" onClick={handleSave}>측정 저장</button>
        {msg && <div className="notice">{msg}</div>}
      </div>

      <WeightChart weights={weights} />

      {sizeRecords.length > 0 && (
        <div className="card">
          <div>사이즈 기록</div>
          {sizeRecords.map(w => (
            <div key={w.date} className="text-sm">
              <span className="num">{fmtDate(w.date)}</span> — {[
                w.chest && `가슴 ${w.chest}cm`,
                w.waist && `허리 ${w.waist}cm`,
                w.hip && `엉덩이 ${w.hip}cm`,
              ].filter(Boolean).join(' · ')}
            </div>
          ))}
        </div>
      )}

      <Settings />
    </div>
  )
}
