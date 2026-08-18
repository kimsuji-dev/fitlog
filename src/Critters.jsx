// 오리지널 픽셀 캐릭터 — 잔디밭의 부부 + 하늘의 아기천사 (클릭 불가, 순수 장식)
// 24x24 픽셀 그리드, 글자 하나 = 픽셀 한 칸. '.' = 투명.

const GRID = 24

// 긴 검은 머리, 따뜻한 핑크 상의를 입은 아내
const WIFE = {
  palette: {
    O: 'var(--text-color)',
    H: '#4a3f6b',
    S: '#f4c9a8',
    E: '#3d3355',
    N: '#f4a6c0',
    T: '#f7bdd2',
    P: '#c9c2e8',
    K: '#3d3355',
  },
  rows: [
    '........................',
    '.........HHHHHH.........',
    '.......HHHHHHHHHH.......',
    '......HHHHHHHHHHHH......',
    '.......HHSSSSSSHH.......',
    '......HHSSESSESSHH......',
    '......HHSSSSSSSSHH......',
    '......HHSNSSSSNSHH......',
    '.......HSSSSSSSSH.......',
    '.........HHHHHH.........',
    '.........HSSSSH.........',
    '.......HHHTTTTHHH.......',
    '.....HHTTTTTTTTTTHH.....',
    '....HTTTTTTTTTTTTTTH....',
    '....HTTTTTTTTTTTTTTH....',
    '.....TTTTTTTTTTTTTT.....',
    '.......TTTTTTTTTT.......',
    '.......PPPPPPPPPP.......',
    '.....PPPPPPPPPPPPPP.....',
    '.....PPPPPPPPPPPPPP.....',
    '......PPP.PPPP.PPP......',
    '......PPP.PPPP.PPP......',
    '......KKK.KKKK.KKK......',
    '........................',
  ],
}

// 짧은 검은 머리, 파랑/초록 상의를 입은 남편
const HUSBAND = {
  palette: {
    O: 'var(--text-color)',
    B: '#4a3f6b',
    S: '#f4c9a8',
    E: '#3d3355',
    U: '#9fc9c2',
    p: '#7a6fa8',
    K: '#3d3355',
  },
  rows: [
    '........................',
    '.........BBBBBB.........',
    '........BBBBBBBB........',
    '........BBBBBBBB........',
    '........BSSSSSSB........',
    '........BSESSESB........',
    '........BSSSSSSB........',
    '........BSSSSSSB........',
    '.........SSSSSS.........',
    '...........SS...........',
    '..........UUUU..........',
    '......UUUUUUUUUUUU......',
    '......UUUUUUUUUUUU......',
    '......UUUUUUUUUUUU......',
    '..........UUUU..........',
    '..........pppp..........',
    '.......pppppppppp.......',
    '.......pppppppppp.......',
    '......pp..pppp..pp......',
    '......pp..pppp..pp......',
    '......pp..pppp..pp......',
    '......KK..KKKK..KK......',
    '........................',
    '........................',
  ],
}

// 후광과 작은 날개를 단 통통한 아기천사 — 하늘에서 떠다닌다
const ANGEL = {
  palette: {
    O: '#f7d488',
    H: '#e8cfa0',
    S: '#f4c9a8',
    E: '#3d3355',
    N: '#f7bdd2',
    W: '#fdf8f4',
    C: '#ece7fb',
  },
  rows: [
    '.........OOOOOO.........',
    '..........O..O..........',
    '.........OOOOOO.........',
    '........................',
    '..........HHHH..........',
    '........HSSSSSSH........',
    '........SSESSESS........',
    '........SNSSSSNS........',
    '......WWSSSSSSSSWW......',
    '......WWWCCCCCCWWW......',
    '.....WWWCCCCCCCCWWW.....',
    '....WWWWCCCSSCCCWWWW....',
    '.....WWWCCCCCCCCWWW.....',
    '.......WWCCCCCCWW.......',
    '..........CCCC..........',
    '.......SS.SSSS.SS.......',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
  ],
}

function assertGrid(name, def) {
  def.rows.forEach((row, i) => {
    if (row.length !== GRID) {
      throw new Error(`Critters.jsx: ${name} row ${i} has length ${row.length}, expected ${GRID}`)
    }
  })
}

if (import.meta.env.DEV) {
  assertGrid('WIFE', WIFE)
  assertGrid('HUSBAND', HUSBAND)
  assertGrid('ANGEL', ANGEL)
}

function PixelSprite({ def, size = 42, delay = 0, className = 'critter-sprite' }) {
  const { palette, rows } = def
  const cells = []
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.') continue
      cells.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={palette[ch]} />
      )
    }
  })
  return (
    <svg
      className={className}
      style={{ animationDelay: `${delay}ms` }}
      width={size}
      height={size}
      viewBox={`0 0 ${GRID} ${GRID}`}
      shapeRendering="crispEdges"
    >
      {cells}
    </svg>
  )
}

// 잔디밭에 나란히 선 부부
export default function Critters() {
  return (
    <div className="critter-strip" aria-hidden="true">
      <PixelSprite def={WIFE} delay={0} />
      <PixelSprite def={HUSBAND} delay={200} />
    </div>
  )
}

// 하늘을 떠다니는 아기천사 (본문을 가리지 않도록 상단 고정)
export function SkyAngel() {
  return (
    <div className="sky-angel" aria-hidden="true">
      <PixelSprite def={ANGEL} size={34} className="angel-sprite" />
    </div>
  )
}
