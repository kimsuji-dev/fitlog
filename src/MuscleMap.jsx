// 오리지널 픽셀 근육 지도 — 앞모습/뒷모습을 16x28 그리드로 그리고,
// 선택된 부위 셀만 accent-color(빨강)로 칠한다. Critters.jsx와 동일한 <rect> 기법.

const W = 16
const H = 28

// 문자 → 근육 그룹 이름 (null이면 신체 셀이지만 특정 근육에 매핑되지 않음)
const FRONT_MAP = { h: null, s: '어깨', c: '가슴', b: '이두', a: '복근', f: null, p: null, g: '대퇴사두', l: null }
const BACK_MAP = { h: null, s: '어깨', k: '등', t: '삼두', f: null, d: '둔근', m: '햄스트링', v: '종아리' }

const FRONT_ROWS = [
  '......hhhh......',
  '......hhhh......',
  '......hhhh......',
  '.......hh.......',
  '...ssssssssss...',
  '...ssccccccss...',
  '...ssccccccss...',
  '...ssccccccss...',
  '...ssccccccss...',
  '...ssccccccss...',
  '..bb..aaaa..bb..',
  '..bb..aaaa..bb..',
  '..bb..aaaa..bb..',
  '.ff...aaaa...ff.',
  '.ff...aaaa...ff.',
  '.....pppppp.....',
  '.....pppppp.....',
  '.....pppppp.....',
  '.....gggggg.....',
  '.....gggggg.....',
  '.....gggggg.....',
  '.....gggggg.....',
  '.....gggggg.....',
  '.....gggggg.....',
  '.....llllll.....',
  '.....llllll.....',
  '.....llllll.....',
  '.....llllll.....',
]

const BACK_ROWS = [
  '......hhhh......',
  '......hhhh......',
  '......hhhh......',
  '.......hh.......',
  '...ssssssssss...',
  '...sskkkkkkss...',
  '...sskkkkkkss...',
  '...sskkkkkkss...',
  '...sskkkkkkss...',
  '...sskkkkkkss...',
  '..tt..kkkk..tt..',
  '..tt..kkkk..tt..',
  '..tt..kkkk..tt..',
  '.ff...kkkk...ff.',
  '.ff...kkkk...ff.',
  '.....dddddd.....',
  '.....dddddd.....',
  '.....dddddd.....',
  '.....mmmmmm.....',
  '.....mmmmmm.....',
  '.....mmmmmm.....',
  '.....mmmmmm.....',
  '.....mmmmmm.....',
  '.....mmmmmm.....',
  '.....vvvvvv.....',
  '.....vvvvvv.....',
  '.....vvvvvv.....',
  '.....vvvvvv.....',
]

const NEUTRAL = '#c9a876'
const HILITE = 'var(--accent-color)'

function BodySilhouette({ rows, map, active, size }) {
  const cells = []
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.') continue
      const muscle = map[ch]
      const on = muscle && active.has(muscle)
      cells.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={on ? HILITE : NEUTRAL} />
      )
    }
  })
  return (
    <svg width={size} height={(size / W) * H} viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges">
      {cells}
    </svg>
  )
}

const FRONT_MUSCLES = new Set(['가슴', '복근', '이두', '대퇴사두', '어깨'])
const BACK_MUSCLES = new Set(['등', '삼두', '둔근', '햄스트링', '종아리'])

// muscles=['가슴','삼두'] 처럼 넘기면 해당 부위가 속한 뷰만(또는 둘 다) 나란히 그린다.
// '전신'이거나 muscles가 비어 있으면 앞/뒤 둘 다 중립색으로 보여준다.
export default function MuscleMap({ muscles = [], size = 48 }) {
  const active = new Set(muscles)
  const wantsFront = muscles.length === 0 || muscles.includes('전신') || muscles.some(m => FRONT_MUSCLES.has(m))
  const wantsBack = muscles.length === 0 || muscles.includes('전신') || muscles.some(m => BACK_MUSCLES.has(m))

  return (
    <div className="muscle-map" aria-hidden="true">
      {wantsFront && <BodySilhouette rows={FRONT_ROWS} map={FRONT_MAP} active={active} size={size} />}
      {wantsBack && <BodySilhouette rows={BACK_ROWS} map={BACK_MAP} active={active} size={size} />}
    </div>
  )
}
