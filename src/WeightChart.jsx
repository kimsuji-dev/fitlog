// 순수 표시 컴포넌트 — DB 접근 없음. props: {weights:[{date,kg}], periods?:[{start,end}]}
const W = 320
const H = 140
const PAD = { top: 16, right: 12, bottom: 24, left: 36 }

// 먹빛 팔레트 — 선·점은 흰빛, 점 테두리만 먹빛으로 떼어낸다
const LINE_COLOR = '#ffffff'
const POINT_COLOR = '#ffffff'
const POINT_STROKE = '#0a0a0c'
const PERIOD_FILL = 'rgba(255, 255, 255, 0.10)'
const POINT_SIZE = 6

const todayStr = () => new Date().toLocaleDateString('sv-SE')
const fmtDate = d => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`

export default function WeightChart({ weights, periods }) {
  if (!weights || weights.length === 0) {
    return <div className="card">몸무게를 기록하면 그래프가 생겨요</div>
  }
  if (weights.length === 1) {
    const w = weights[0]
    return <div className="card"><span className="num">{fmtDate(w.date)} {w.kg}kg</span> — 한 번 더 기록하면 그래프가 생겨요</div>
  }

  const dates = weights.map(w => w.date)
  const kgs = weights.map(w => w.kg)
  const minKg = Math.min(...kgs)
  const maxKg = Math.max(...kgs)
  const kgPad = (maxKg - minKg) * 0.15 || 1
  const yMin = minKg - kgPad
  const yMax = maxKg + kgPad

  const t0 = new Date(dates[0]).getTime()
  const t1 = new Date(dates[dates.length - 1]).getTime()
  const tSpan = Math.max(1, t1 - t0)

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const xFor = d => PAD.left + ((new Date(d).getTime() - t0) / tSpan) * innerW
  const yFor = kg => PAD.top + (1 - (kg - yMin) / (yMax - yMin)) * innerH

  const points = weights.map(w => ({ x: xFor(w.date), y: yFor(w.kg), date: w.date, kg: w.kg }))
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  const today = todayStr()
  const bands = (periods || []).map(p => {
    const start = Math.max(t0, new Date(p.start).getTime())
    const end = Math.min(t1, new Date(p.end || today).getTime())
    if (end < start) return null
    return { x1: xFor(new Date(start).toISOString().slice(0, 10)), x2: xFor(new Date(end).toISOString().slice(0, 10)) }
  }).filter(Boolean)

  // y축 눈금: min/max 두 개만
  const yTicks = [yMin + kgPad, yMax - kgPad]

  return (
    <div className="card">
      <div>몸무게 추이</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible', fontFamily: 'var(--serif)' }} role="img" aria-label="몸무게 변화 그래프">
        {bands.map((b, i) => (
          <rect key={i} x={b.x1} y={PAD.top} width={Math.max(1, b.x2 - b.x1)} height={innerH} fill={PERIOD_FILL} />
        ))}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={yFor(t)} x2={W - PAD.right} y2={yFor(t)} stroke="var(--glass-border)" strokeWidth="1" />
            <text x={PAD.left - 6} y={yFor(t) + 3} textAnchor="end" fontSize="9" fill="var(--text-2)">{t.toFixed(1)}</text>
          </g>
        ))}
        <polyline points={polyline} fill="none" stroke={LINE_COLOR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <rect key={i} x={p.x - POINT_SIZE / 2} y={p.y - POINT_SIZE / 2} width={POINT_SIZE} height={POINT_SIZE} fill={POINT_COLOR} stroke={POINT_STROKE} strokeWidth="1" />
        ))}
        <text x={PAD.left} y={H - 6} fontSize="9" fill="var(--text-2)" textAnchor="start">{dates[0].slice(5)}</text>
        <text x={W - PAD.right} y={H - 6} fontSize="9" fill="var(--text-2)" textAnchor="end">{dates[dates.length - 1].slice(5)}</text>
      </svg>
    </div>
  )
}
