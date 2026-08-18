// 오리지널 픽셀 캐릭터 — 잔디밭의 부부 + 하늘의 아기천사 (클릭 불가, 순수 장식)
// 24x24 픽셀 그리드, 글자 하나 = 픽셀 한 칸. '.' = 투명.

const GRID = 24

// 긴 검은 머리, 따뜻한 핑크 상의를 입은 아내
const WIFE = {
  palette: {
    O: 'var(--text-color)',
    H: '#2e2018',
    S: '#e8b083',
    E: '#3a2415',
    N: '#e0708f',
    T: '#e8749a',
    P: '#c65b7c',
    K: '#3a2415',
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
    B: '#231a14',
    S: '#e8b083',
    E: '#3a2415',
    U: '#3f7fa0',
    p: '#4a6b3d',
    K: '#3a2415',
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
    O: '#f2c14e',
    H: '#caa15a',
    S: '#f6c9a0',
    E: '#3a2415',
    N: '#f2a0b0',
    W: '#fdf6e3',
    C: '#f3e6bd',
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

function PixelSprite({ def, size = 64, delay = 0, className = 'critter-sprite' }) {
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
      <PixelSprite def={ANGEL} size={40} className="angel-sprite" />
    </div>
  )
}
