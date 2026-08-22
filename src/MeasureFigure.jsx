// 측정 마네킹 — react-body-highlighter 앞모습(viewBox 0 0 100 200) 위에 줄자 띠를 얹는다.
// 입력칸에 포커스가 가면 그 부위 띠가 밝아진다. 탭 대상은 입력칸이라 여기엔 클릭 핸들러가 없다.
import Model from 'react-body-highlighter'

// 좌표는 라이브러리 앞모습 폴리곤에서 읽음: 가슴 y41–58, 복사근 최협부 y≈74, 고관절 최대 y≈100, 대퇴 중간 y≈120, 이두 y49–71
const BANDS = [
  { key: 'chest', label: '가슴', y: 50, cx: 50, rx: 20, side: 'r' },
  { key: 'waist', label: '허리', y: 74, cx: 50, rx: 16, side: 'r' },
  { key: 'hip', label: '엉덩이', y: 100, cx: 50, rx: 21, side: 'r' },
  { key: 'thigh', label: '허벅지', y: 120, cx: 36.5, rx: 8.5, side: 'l' },
  { key: 'arm', label: '팔뚝', y: 60, cx: 23.5, rx: 6.5, side: 'l' },
]
const RY = 3 // 띠 두께(원근감)

export default function MeasureFigure({ active, height = 220 }) {
  return (
    <div className="measure-figure" style={{ height, width: height }} aria-hidden="true">
      <div className="measure-figure-model">
        <Model type="anterior" data={[]} bodyColor="#4a4a52" highlightedColors={['#4a4a52', '#4a4a52']} style={{ width: '100%', height: '100%' }} />
      </div>
      <svg viewBox="-50 0 200 200" className="measure-figure-bands">
        {BANDS.map(b => {
          const right = b.side === 'r'
          return (
            <g key={b.key} className={b.key === active ? 'band on' : 'band'}>
              <ellipse cx={b.cx} cy={b.y} rx={b.rx} ry={RY} />
              <line x1={right ? b.cx + b.rx : b.cx - b.rx} y1={b.y} x2={right ? 104 : -4} y2={b.y} />
              <text x={right ? 107 : -7} y={b.y + 3.5} textAnchor={right ? 'start' : 'end'}>{b.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
