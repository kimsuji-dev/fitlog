// 오리지널 픽셀 근육 지도 — 앞모습/뒷모습을 32x40 그리드로 그리고,
// 선택된 부위 셀만 강조 바이올렛으로 칠한다. Critters.jsx와 동일한 <rect> 기법 +
// 공유 팔레트(pixelPalette.js)를 사용해 톤을 맞춘다.
//
// 명암: 각 근육 블록의 맨 윗줄은 하이라이트, 아랫줄은 그림자 톤으로 칠해
// (활성/비활성 상관없이) 입체감을 준다 — 광원은 좌상단.

import { PALETTE } from './pixelPalette'

const W = 32
const H = 40

// 문자 → 근육 그룹 이름 (null이면 신체 셀이지만 특정 근육에 매핑되지 않음)
const FRONT_MAP = { h: null, s: '어깨', c: '가슴', b: '이두', f: null, a: '복근', p: null, g: '대퇴사두', l: null }
const BACK_MAP = { h: null, s: '어깨', k: '등', t: '삼두', d: '둔근', m: '햄스트링', v: '종아리' }

// 좌우 대칭이라 각 줄은 왼쪽 절반만 다듬고 오른쪽은 좌우 반전 결과를 그대로 적었다.
const FRONT_ROWS = [
  '..............hhhh..............',
  '.............hhhhhh.............',
  '............ohhhhhho............',
  '............ohhhhhho............',
  '.............ohhhho.............',
  '......osssssssssssssssssso......',
  '..osssss.obbbbbbbbbbbbo.ssssso..',
  '.ossss.obbbbbbbbbbbbbbbbo.sssso.',
  '.occcc.obbbbbbbbbbbbbbbbo.cccco.',
  '.occccc.obbbbbbbbbbbbbbo.ccccco.',
  '.occcccc.obbbbbbbbbbbbo.cccccco.',
  '.occcccc.obbbbbbbbbbbbo.cccccco.',
  '..occcccc.offffffffffo.cccccco..',
  '..occcccc.offffffffffo.cccccco..',
  '...occcccc.offffffffo.cccccco...',
  '....occcccccccccccccccccccco....',
  '.....oaaaaaaaaaaaaaaaaaaaao.....',
  '.....oaaaaaaaaaaaaaaaaaaaao.....',
  '.....oaaaaaaaaaaaaaaaaaaaao.....',
  '......oaaaaaaaaaaaaaaaaaao......',
  '......oaaaaaaaaaaaaaaaaaao......',
  '......oaaaaaaaaaaaaaaaaaao......',
  '....oppppppppppppppppppppppo....',
  '...oppppppppppppppppppppppppo...',
  '...oppppppppppppppppppppppppo...',
  '......ogggggg......ggggggo......',
  '......ogggggg......ggggggo......',
  '......ogggggg......ggggggo......',
  '......ogggggg......ggggggo......',
  '......ogggggg......ggggggo......',
  '......ogggggg......ggggggo......',
  '......ogggggg......ggggggo......',
  '......ogggggg......ggggggo......',
  '......ogggggg......ggggggo......',
  '........ollll......llllo........',
  '........ollll......llllo........',
  '........ollll......llllo........',
  '........ollll......llllo........',
  '........ollll......llllo........',
  '........ollll......llllo........',
]

const BACK_ROWS = [
  '..............hhhh..............',
  '.............hhhhhh.............',
  '............ohhhhhho............',
  '............ohhhhhho............',
  '.............ohhhho.............',
  '......osssssssssssssssssso......',
  '..osssss.otttttttttttto.ssssso..',
  '.ossss.otttttttttttttttto.sssso.',
  '.okkkk.otttttttttttttttto.kkkko.',
  '.okkkkk.otttttttttttttto.kkkkko.',
  '.okkkkkk.otttttttttttto.kkkkkko.',
  '.okkkkkk.otttttttttttto.kkkkkko.',
  '..okkkkkk.otttttttttto.kkkkkko..',
  '..okkkkkk.otttttttttto.kkkkkko..',
  '...okkkkkk.otttttttto.kkkkkko...',
  '....okkkkkkkkkkkkkkkkkkkkkko....',
  '.....okkkkkkkkkkkkkkkkkkkko.....',
  '.....okkkkkkkkkkkkkkkkkkkko.....',
  '.....okkkkkkkkkkkkkkkkkkkko.....',
  '......okkkkkkkkkkkkkkkkkko......',
  '......okkkkkkkkkkkkkkkkkko......',
  '......okkkkkkkkkkkkkkkkkko......',
  '....oddddddddddddddddddddddo....',
  '...oddddddddddddddddddddddddo...',
  '...oddddddddddddddddddddddddo...',
  '......ommmmmm......mmmmmmo......',
  '......ommmmmm......mmmmmmo......',
  '......ommmmmm......mmmmmmo......',
  '......ommmmmm......mmmmmmo......',
  '......ommmmmm......mmmmmmo......',
  '......ommmmmm......mmmmmmo......',
  '......ommmmmm......mmmmmmo......',
  '......ommmmmm......mmmmmmo......',
  '......ommmmmm......mmmmmmo......',
  '........ovvvv......vvvvo........',
  '........ovvvv......vvvvo........',
  '........ovvvv......vvvvo........',
  '........ovvvv......vvvvo........',
  '........ovvvv......vvvvo........',
  '........ovvvv......vvvvo........',
]

if (import.meta.env.DEV) {
  ;[['FRONT_ROWS', FRONT_ROWS], ['BACK_ROWS', BACK_ROWS]].forEach(([name, rows]) => {
    rows.forEach((row, i) => {
      if (row.length !== W) {
        throw new Error(`MuscleMap.jsx: ${name} row ${i} has length ${row.length}, expected ${W}`)
      }
    })
    if (rows.length !== H) {
      throw new Error(`MuscleMap.jsx: ${name} has ${rows.length} rows, expected ${H}`)
    }
  })
}

// 각 근육 블록의 맨 윗줄(하이라이트) / 아랫줄(그림자) — 활성 여부와 무관하게 입체감을 준다.
const HIGHLIGHT_ROWS = new Set([5, 8, 16, 25])
const SHADOW_ROWS = new Set([12, 13, 14, 19, 20, 21, 31, 32, 33, 37, 38, 39])

function toneFor(y, on) {
  const [base, shadow, highlight] = on
    ? [PALETTE.hilite, PALETTE.hiliteShadow, PALETTE.hiliteHighlight]
    : [PALETTE.neutral, PALETTE.neutralShadow, PALETTE.neutralHighlight]
  if (SHADOW_ROWS.has(y)) return shadow
  if (HIGHLIGHT_ROWS.has(y)) return highlight
  return base
}

function BodySilhouette({ rows, map, active, size }) {
  const cells = []
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.') continue
      const fill = ch === 'o' ? PALETTE.outline : toneFor(y, map[ch] && active.has(map[ch]))
      cells.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
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
export default function MuscleMap({ muscles = [], size = 36 }) {
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
