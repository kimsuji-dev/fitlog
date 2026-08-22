import { useState, useEffect } from 'react'
import WeightChart from './WeightChart'
import Settings from './Settings'
import MeasureFigure from './MeasureFigure'
import { addWeight, getProfile } from './db'
import { parseWeight, parseSize } from './validate'

const CYCLE_DAYS = 14 // 측정 주기 — 텔레그램 알림(scripts/weight-reminder.sh)과 같은 2주
const DAY_MS = 86400e3
const todayStr = () => new Date().toLocaleDateString('sv-SE')
const fmtDate = d => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`
// 'YYYY-MM-DD' 문자열끼리의 날짜 계산 — new Date(문자열)은 UTC 자정이라 toISOString과 짝이 맞는다
const addDays = (d, n) => new Date(new Date(d).getTime() + n * DAY_MS).toISOString().slice(0, 10)
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / DAY_MS)

// 사이즈 항목 — 입력칸·기록 목록이 이 순서를 따른다. 앞 3개는 한 줄, 뒤 2개는 한 줄.
const SIZES = [['chest', '가슴'], ['waist', '허리'], ['hip', '엉덩이'], ['thigh', '허벅지'], ['arm', '팔뚝']]
// 재는 법 — ACE 둘레 측정 프로토콜 + 대한비만학회 허리 기준 (근거는 vault fitlog-운동앱 노트)
const TIPS = [
  ['허리', '갈비뼈 맨 아래와 골반뼈 꼭대기의 중간. 발 살짝 벌리고 숨 편히 내쉰 뒤'],
  ['엉덩이', '가장 두꺼운 지점. 발 모으고 수평으로'],
  ['허벅지', '한 발을 의자에 올려 무릎 90°. 사타구니 주름과 무릎뼈 위 끝의 중간'],
  ['팔뚝', '팔 내리고 힘 뺀 상태. 어깨 끝과 팔꿈치의 중간'],
  ['가슴', '가장 두꺼운 지점 수평. 속옷 따라 달라져서 참고용'],
  ['공통', '운동 전 · 같은 시간대 · 줄자는 피부에 붙이되 누르지 않기 · 두 번 재서 5mm 넘게 다르면 다시'],
]

// props: weights(오름차순)는 App이 들고 있고, 저장하면 onSaved()로 다시 읽게 한다.
export default function Measure({ weights, onSaved }) {
  const today = todayStr()
  const [date, setDate] = useState(today)
  const [kg, setKg] = useState('')
  const [sizes, setSizes] = useState({}) // {chest: '88', ...} 문자열 그대로
  const [heightCm, setHeightCm] = useState(null)
  const [active, setActive] = useState(null) // 마네킹에서 강조할 부위 = 마지막으로 포커스한 입력칸
  const [msg, setMsg] = useState('')

  useEffect(() => { getProfile().then(p => setHeightCm(p?.heightCm || null)) }, [])

  // 고른 날짜에 이미 기록이 있으면 입력칸에 채워 보여준다 (저장 후에도 그대로 남아 "저장됐구나"가 보이게)
  useEffect(() => {
    const ex = weights.find(w => w.date === date)
    setKg(ex ? String(ex.kg) : '')
    setSizes(Object.fromEntries(SIZES.map(([k]) => [k, ex?.[k] !== undefined ? String(ex[k]) : ''])))
  }, [date, weights])

  async function handleSave() {
    const kgNum = parseWeight(kg)
    if (kgNum === null) {
      setMsg('체중을 확인해주세요 (20~300kg)')
      return
    }
    const parsed = {}
    for (const [key] of SIZES) {
      const raw = sizes[key] || ''
      if (!raw.trim()) continue
      const v = parseSize(raw)
      if (v === null) {
        setMsg('사이즈 값을 확인해주세요 (20~200cm)')
        return
      }
      parsed[key] = v
    }
    await addWeight(date, kgNum, parsed)
    onSaved()
    setMsg(`${fmtDate(date)} 측정 저장했어요 ✓`)
  }

  const last = weights[weights.length - 1]
  const ago = last ? daysBetween(last.date, today) : null
  const sizeRecords = weights.filter(w => SIZES.some(([k]) => w[k])).slice().reverse() // 최신순
  // 비율은 허리가 있는 가장 최근 기록 기준. 허리/키 0.5 미만(NICE), 허리/엉덩이는 낮을수록 좋음(ACE)
  const lastWaist = sizeRecords.find(w => w.waist)
  const whtr = lastWaist && heightCm ? (lastWaist.waist / heightCm).toFixed(2) : null
  const whr = lastWaist?.hip ? (lastWaist.waist / lastWaist.hip).toFixed(2) : null

  return (
    <div>
      <h2>측정<em>EVERY {CYCLE_DAYS} DAYS</em></h2>

      <div className="notice">
        {last
          ? <>마지막 측정 <span className="num">{last.date}</span> ({ago === 0 ? '오늘' : <><span className="num">{ago}</span>일 전</>}) · 다음 측정 <span className="num">{addDays(last.date, CYCLE_DAYS)}</span></>
          : <>아직 측정 기록이 없어요 — 오늘 첫 측정 해볼까요?</>}
        {lastWaist && (
          <div className="ratio-row">
            {whtr
              ? <>허리/키 <span className="num">{whtr}</span> <span className="text-sm">(0.5 미만이 목표)</span></>
              : <span className="text-sm">설정에 키를 넣으면 허리/키 비율이 나와요</span>}
            {whr && <> · 허리/엉덩이 <span className="num">{whr}</span></>}
          </div>
        )}
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
        <MeasureFigure active={active} />
        <div className="measure-grid">
          {SIZES.slice(0, 3).map(([k, label]) => (
            <label key={k} className="field big">
              {label} (cm)
              <input type="text" inputMode="decimal" value={sizes[k] || ''} onChange={e => setSizes(s => ({ ...s, [k]: e.target.value }))} onFocus={() => setActive(k)} placeholder="선택" />
            </label>
          ))}
        </div>
        <div className="measure-grid two">
          {SIZES.slice(3).map(([k, label]) => (
            <label key={k} className="field big">
              {label} (cm)
              <input type="text" inputMode="decimal" value={sizes[k] || ''} onChange={e => setSizes(s => ({ ...s, [k]: e.target.value }))} onFocus={() => setActive(k)} placeholder="선택" />
            </label>
          ))}
        </div>
        <details className="tips">
          <summary>📐 어디를 어떻게 재나요?</summary>
          <ul>
            {TIPS.map(([k, v]) => <li key={k}><b>{k}</b>{v}</li>)}
          </ul>
        </details>
        <button className="big-btn" onClick={handleSave}>측정 저장</button>
        {msg && <div className="notice">{msg}</div>}
      </div>

      <WeightChart weights={weights} />

      {sizeRecords.length > 0 && (
        <div className="card">
          <div>사이즈 기록</div>
          {sizeRecords.map(w => (
            <div key={w.date} className="text-sm">
              <span className="num">{fmtDate(w.date)}</span> — {SIZES.filter(([k]) => w[k]).map(([k, label]) => `${label} ${w[k]}cm`).join(' · ')}
            </div>
          ))}
        </div>
      )}

      <Settings />
    </div>
  )
}
