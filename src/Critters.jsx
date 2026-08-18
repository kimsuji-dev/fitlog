// 오리지널 픽셀 캐릭터 — 잔디밭의 부부 + 하늘의 아기천사 (클릭 불가, 순수 장식)
// 32x32 픽셀 그리드, 글자 하나 = 픽셀 한 칸. '.' = 투명.
// 색상은 pixelPalette.js의 공유 팔레트에서만 가져와 세 스프라이트가 한 세트처럼 보이게 한다.
// 좌우 대칭 포즈라 각 줄은 왼쪽 절반만 다듬고 오른쪽은 좌우 반전 결과를 그대로 적었다.

import { PALETTE } from './pixelPalette'

const GRID = 32

// 긴 다크 바이올렛 머리, 블러쉬 핑크 상의를 입은 아내
const WIFE = {
  palette: {
    i: PALETTE.hairWifeHighlight,
    h: PALETTE.hairWife,
    o: PALETTE.outline,
    s: PALETTE.skin,
    e: PALETTE.eye,
    b: PALETTE.blush,
    S: PALETTE.skinShadow,
    c: PALETTE.topWife,
    t: PALETTE.topWifeHighlight,
    p: PALETTE.pants,
    P: PALETTE.pantsShadow,
    x: PALETTE.shoe,
  },
  rows: [
    '...........ihhhhhhhhi...........',
    '.........ihhhhhhhhhhhhi.........',
    '.......ihhhhhhhhhhhhhhhhi.......',
    '.....ohhhhhhhhhhhhhhhhhhhho.....',
    '....ohhhhhhhhhhhhhhhhhhhhhho....',
    '...ohhsssssssssssssssssssshho...',
    '...ohhsssssssessssessssssshho...',
    '...ohhssssssbssssssbsssssshho...',
    '...ohssssssssssssssssssssssho...',
    '....ossssssssSSSSSSsssssssso....',
    '......ossssssSSSSSSsssssso......',
    '.........ssssSSSSSSssss.........',
    '...hhh...ccccsssssscccc...hhh...',
    '..hhhhoccccccccccccccccccohhhh..',
    '..hhhhoccccctcccccctcccccohhhh..',
    '.hhhhhoccccccccccccccccccohhhhh.',
    '.hhhhhoccccctcccccctcccccohhhhh.',
    '.hhhhhoccccccccccccccccccohhhhh.',
    '..hhhsoccccccccccccccccccoshhh..',
    '....ssoccccccccccccccccccoss....',
    '.......occcccccccccccccco.......',
    '.......oppppppppppppppppo.......',
    '......opppppp......ppppppo......',
    '......opppppp......ppppppo......',
    '......opppppp......ppppppo......',
    '......oPPPPPP......PPPPPPo......',
    '......oxxxxxx......xxxxxxo......',
    '......oxxxxxx......xxxxxxo......',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
}

// 짧은 다크 머리, 민트 틸 상의를 입은 남편
const HUSBAND = {
  palette: {
    i: PALETTE.hairHusbandHighlight,
    h: PALETTE.hairHusband,
    o: PALETTE.outline,
    s: PALETTE.skin,
    e: PALETTE.eye,
    b: PALETTE.blush,
    S: PALETTE.skinShadow,
    c: PALETTE.topHusband,
    t: PALETTE.topHusbandHighlight,
    p: PALETTE.pants,
    P: PALETTE.pantsShadow,
    x: PALETTE.shoe,
  },
  rows: [
    '............ihhhhhhi............',
    '..........ihhhhhhhhhhi..........',
    '........ihhhhhhhhhhhhhhi........',
    '......ohhhhhhhhhhhhhhhhhho......',
    '.....ohhhhhhhhhhhhhhhhhhhho.....',
    '....ohhsssssssssssssssssshho....',
    '....osssssssessssssessssssso....',
    '....ossssssbssssssssbsssssso....',
    '....osssssssssssssssssssssso....',
    '.....osssssssSSSSSSssssssso.....',
    '.......osssssSSSSSSssssso.......',
    '.........ssssSSSSSSssss.........',
    '...occcccccccssssssccccccccco...',
    '..occcccccccccccccccccccccccco..',
    '..occcccctcccccccccccctcccccco..',
    '.occcccccccccccccccccccccccccco.',
    '.occcccctcccccccccccccctcccccco.',
    '.occcccccccccccccccccccccccccco.',
    '..occcccccccccccccccccccccccco..',
    '....occcccccccccccccccccccco....',
    '......occcccccccccccccccco......',
    '......oppppppppppppppppppo......',
    '......opppppp......ppppppo......',
    '......opppppp......ppppppo......',
    '......opppppp......ppppppo......',
    '......oPPPPPP......PPPPPPo......',
    '......oxxxxxx......xxxxxxo......',
    '......oxxxxxx......xxxxxxo......',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
}

// 후광과 작은 날개를 단 통통한 아기천사 — 하늘에서 떠다닌다
const ANGEL = {
  palette: {
    j: PALETTE.haloHighlight,
    H: PALETTE.halo,
    o: PALETTE.outline,
    s: PALETTE.skin,
    e: PALETTE.eye,
    b: PALETTE.blush,
    S: PALETTE.skinShadow,
    w: PALETTE.wing,
    g: PALETTE.gown,
    t: PALETTE.gownHighlight,
    G: PALETTE.gownShadow,
  },
  rows: [
    '.....jHHHHH..........HHHHHj.....',
    '......HH................HH......',
    '.....HHHHHH..........HHHHHH.....',
    '......osssssssssssssssssso......',
    '....osssssssssssssssssssssso....',
    '...osssssssssssssssssssssssso...',
    '...osssssessssssssssssessssso...',
    '...ossssbssssssssssssssbsssso...',
    '...osssssssssssssssssssssssso...',
    '....ossssssssSSSSSSsssssssso....',
    '......ossssssSSSSSSsssssso......',
    '.........ssssSSSSSSssss.........',
    '.ww.ogggggggggssssgggggggggo.ww.',
    'www.oggggggggggggggggggggggo.www',
    'www.oggggggggggggggggggggggo.www',
    '.ww.oggggggggggggggggggggggo.ww.',
    '...oggggggggggggggggggggggggo...',
    '...oggggggtggggggggggtggggggo...',
    '...oggggggggggggggggggggggggo...',
    '....oggggggggggggggggggggggo....',
    '.....oggggggggggggggggggggo.....',
    '......oGGGGGGGGGGGGGGGGGGo......',
    '.......ss..............ss.......',
    '........GGGG........GGGG........',
    '..........GG........GG..........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
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

function PixelSprite({ def, size = 44, delay = 0, className = 'critter-sprite' }) {
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
