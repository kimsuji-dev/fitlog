// 근육 자극 부위 — react-body-highlighter 로 앞/뒤 인체 SVG를 렌더링하고
// exercises.js 의 한글 부위명을 라이브러리의 근육 슬러그로 매핑해 하이라이트한다.
import Model from 'react-body-highlighter'

const BODY_COLOR = '#4a3f63'
const HIGHLIGHT_COLORS = ['#d4af37', '#d4af37']

// 한글 부위명 → react-body-highlighter 근육 슬러그
const MUSCLE_MAP = {
  가슴: ['chest'],
  등: ['upper-back', 'lower-back', 'trapezius'],
  어깨: ['front-deltoids', 'back-deltoids'],
  이두: ['biceps'],
  삼두: ['triceps'],
  복근: ['abs', 'obliques'],
  둔근: ['gluteal'],
  대퇴사두: ['quadriceps'],
  햄스트링: ['hamstring'],
  종아리: ['calves'],
}
const ALL_SLUGS = [...new Set(Object.values(MUSCLE_MAP).flat())]

function toSlugs(muscles) {
  if (muscles.includes('전신')) return ALL_SLUGS
  return [...new Set(muscles.flatMap(m => MUSCLE_MAP[m] || []))]
}

export default function MuscleFigure({ muscles = [], size = 150 }) {
  const data = [{ name: 'exercise', muscles: toSlugs(muscles) }]
  const figureHeight = size
  const figureWidth = size / 2

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
      {[
        { type: 'anterior', label: '앞' },
        { type: 'posterior', label: '뒤' },
      ].map(({ type, label }) => (
        <div key={type} style={{ textAlign: 'center' }}>
          <Model
            type={type}
            data={data}
            bodyColor={BODY_COLOR}
            highlightedColors={HIGHLIGHT_COLORS}
            style={{ width: figureWidth, height: figureHeight }}
          />
          <div style={{ fontSize: 9, color: '#b7a9c9' }}>{label}</div>
        </div>
      ))}
    </div>
  )
}
