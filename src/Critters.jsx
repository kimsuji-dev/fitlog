// 오리지널 픽셀 캐릭터 3마리 — 잔디밭 장식용 (클릭 불가, 순수 장식)
// 16x16 픽셀 그리드, 글자 하나 = 픽셀 한 칸. '.' = 투명.

const GRID = 16

// 통통한 노란 햄스터 (분홍 볼)
const HAMSTER = {
  palette: {
    O: 'var(--text-color)',
    Y: '#ffd35c',
    D: '#f2b93a',
    P: '#f7a8c4',
    W: '#fdf6e3',
    K: '#3a2415',
    N: '#e0708f',
  },
  rows: [
    '....OO....OO....',
    '...OYYO..OYYO...',
    '..OYYYYOOYYYYO..',
    '.OYYYYYYYYYYYYO.',
    'OYYYYYYYYYYYYYO.',
    'OYYPYYYYYYPYYYO.',
    'OYPPKYOOOOKYPPO.',
    'OYYYYYOOOOYYYYO.',
    'OYYYYYYNNYYYYYO.',
    'OYYYYYYNNYYYYYO.',
    '.OYYYYYYYYYYYO..',
    '.ODYWWWWWWYDO...',
    '..ODWWWWWWDO....',
    '...ODDYYDDO.....',
    '....OO..OO......',
    '................',
  ],
}

// 동글동글한 파란 거북이 (무늬 없는 심플 등딱지)
const TURTLE = {
  palette: {
    O: 'var(--text-color)',
    S: '#3f7fc4',
    H: '#69a6e0',
    B: '#8fd6c9',
    C: '#6cbfae',
    K: '#3a2415',
  },
  rows: [
    '................',
    '....OOOOOOOO....',
    '...OSSSSSSSSO...',
    '..OSHSSSSSSHSO..',
    '.OSHHSSSSSSHHSO.',
    'OBCSSSSSSSSSSCBO',
    'OBCSSSSSSSSSSCBO',
    'OBBCCCCCCCCCCBBO',
    'OBKBCCCCCCCCKBBO',
    '.OBBCCCCCCCCBBO.',
    '..OBB......BBO..',
    '..OBB......BBO..',
    '...OO......OO...',
    '................',
    '................',
    '................',
  ],
}

// 갈색과 크림색이 섞인 충직한 강아지
const PUPPY = {
  palette: {
    O: 'var(--text-color)',
    B: '#a9702f',
    D: '#8a5722',
    C: '#f3e0c0',
    K: '#3a2415',
    N: '#5b3a1e',
    T: '#e58a9a',
  },
  rows: [
    '.OBBO.....OBBO..',
    'OBBBBO...OBBBBO.',
    'OBDDBO...OBDDBO.',
    '.OBBBOOOOOBBBO..',
    '..OBBBBBBBBBO...',
    '.OBBCCCCCCCBBO..',
    'OBBCKCCCCCKCBBO.',
    'OBBCCCCNNCCCBBO.',
    'OBBCCCCNNCCCBBO.',
    '.OBCCCTTCCCBO...',
    '.OBBCCCCCCBBO...',
    '..OBBCCCCBBO....',
    '..OB.CCCC.BO....',
    '..OB......BO....',
    '..OO......OO....',
    '................',
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
  assertGrid('HAMSTER', HAMSTER)
  assertGrid('TURTLE', TURTLE)
  assertGrid('PUPPY', PUPPY)
}

function PixelCritter({ def, size = 56, delay = 0 }) {
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
      className="critter-sprite"
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

export default function Critters() {
  return (
    <div className="critter-strip" aria-hidden="true">
      <PixelCritter def={HAMSTER} delay={0} />
      <PixelCritter def={TURTLE} delay={200} />
      <PixelCritter def={PUPPY} delay={400} />
    </div>
  )
}
