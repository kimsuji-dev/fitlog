// 오리지널 픽셀 근육 지도 — 앞모습 단일 대형 바디를 40x56 그리드로 그리고,
// 선택된 부위 셀만 강조 바이올렛으로 칠한다. Critters.jsx와 동일한 <rect> 기법 +
// 공유 팔레트(pixelPalette.js)를 사용해 톤을 맞춘다.
//
// 뒷면 근육(등/삼두/둔근/햄스트링/종아리)은 실루엣이 앞모습뿐이라 각자 대응하는
// 앞모습 위치(등=몸통 바깥쪽 라인, 삼두=팔 바깥쪽 라인, 둔근=엉덩이 상단 밴드,
// 햄스트링=허벅지 바깥쪽 라인, 종아리=아랫다리 전체)에 그리되, 활성화됐을 때
// hiliteShadow를 기본톤으로 써서(hilite보다 어두움) "뒷면 부위" 표시를 준다.
//
// 명암: 각 근육 블록의 맨 윗줄은 하이라이트, 아랫줄은 그림자 톤으로 칠해
// (활성/비활성 상관없이) 입체감을 준다 — 광원은 좌상단.

import { PALETTE } from './pixelPalette'

const W = 40
const H = 56

// 문자 → 근육 그룹 이름 (null이면 신체 셀이지만 특정 근육에 매핑되지 않음)
const MAP = {
  h: null, n: null, e: null, // 머리/목, 팔뚝+손, 발 — 근육 없음
  s: '어깨', c: '가슴', b: '이두', a: '복근', g: '대퇴사두', // 앞모습 근육
  T: '삼두', k: '등', d: '둔근', m: '햄스트링', v: '종아리', // 뒷모습 근육 → 대응 위치에 표시
}

// 뒷모습 근육(활성 시 더 어두운 바이올렛으로 "뒷면" 표시)
const BACK_CHARS = new Set(['T', 'k', 'd', 'm', 'v'])

// 좌우 대칭이라 왼쪽 절반만 다듬고 오른쪽은 좌우 반전 결과를 그대로 적었다.
const ROWS = [
  '................hhhhhhhh................',
  '..............hhhhhhhhhhhh..............',
  '.............ohhhhhhhhhhhho.............',
  '.............ohhhhhhhhhhhho.............',
  '.............ohhhhhhhhhhhho.............',
  '.............ohhhhhhhhhhhho.............',
  '..............ohhhhhhhhhho..............',
  '...............ohhhhhhhho...............',
  '...............ohhhhhhhho...............',
  '......osssss.occcccccccccco.ssssso......',
  '...ossssss.okkcccccccccccckko.sssssso...',
  '...oTTobb.okoccccccccccccccoko.bboTTo...',
  '...oTTobb.okoccccccccccccccoko.bboTTo...',
  '...oTTobb.okoccccccccccccccoko.bboTTo...',
  '...oTTobbb.okoccccccccccccoko.bbboTTo...',
  '....oTobbb.okoccccccccccccoko.bbboTo....',
  '....oTobbb.okoccccccccccccoko.bbboTo....',
  '....oTobbb.okoccccccccccccoko.bbboTo....',
  '.....oTobb.okoccccccccccccoko.bboTo.....',
  '.....oTobb.okoccccccccccccoko.bboTo.....',
  '.....oTobb.okoccccccccccccoko.bboTo.....',
  '......onn.okoaaaaaaaaaaaaaaoko.nno......',
  '......onn.okoaaaaaaaaaaaaaaoko.nno......',
  '......on.okoaaaaaaaaaaaaaaaaoko.no......',
  '......on.okoaaaaaaaaaaaaaaaaoko.no......',
  '......on.okoaaaaaaaaaaaaaaaaoko.no......',
  '......okkoaaaaaaaaaaaaaaaaaaaaokko......',
  '........okoaaaaaaaaaaaaaaaaaaoko........',
  '.........okoaaaaaaaaaaaaaaaaoko.........',
  '.........okoaaaaaaaaaaaaaaaaoko.........',
  '......oddddddddddddddddddddddddddo......',
  '......oddddddddddddddddddddddddddo......',
  '......omogggggggggg..ggggggggggomo......',
  '......omogggggggggg..ggggggggggomo......',
  '......omoggggggggg....gggggggggomo......',
  '......omoggggggggg....gggggggggomo......',
  '......omogggggggg......ggggggggomo......',
  '......omogggggggg......ggggggggomo......',
  '......omoggggggg........gggggggomo......',
  '......omoggggggg........gggggggomo......',
  '......omogggggg..........ggggggomo......',
  '......omoggggg............gggggomo......',
  '.........oggggg..........gggggo.........',
  '.........oggggg..........gggggo.........',
  '.........ovvvvv..........vvvvvo.........',
  '.........ovvvvv..........vvvvvo.........',
  '.........ovvvvv..........vvvvvo.........',
  '.........ovvvvv..........vvvvvo.........',
  '.........ovvvvv..........vvvvvo.........',
  '.........ovvvvv..........vvvvvo.........',
  '.........ovvvvv..........vvvvvo.........',
  '.........ovvvvv..........vvvvvo.........',
  '........oeeeeee..........eeeeeeo........',
  '.......oeeeeeee..........eeeeeeeo.......',
  '.......oeeeeeee..........eeeeeeeo.......',
  '.......oeeeeeee..........eeeeeeeo.......',
]

if (import.meta.env.DEV) {
  ROWS.forEach((row, i) => {
    if (row.length !== W) {
      throw new Error(`MuscleMap.jsx: ROWS row ${i} has length ${row.length}, expected ${W}`)
    }
  })
  if (ROWS.length !== H) {
    throw new Error(`MuscleMap.jsx: ROWS has ${ROWS.length} rows, expected ${H}`)
  }
}

// 각 근육 블록의 맨 윗줄(하이라이트) / 아랫줄(그림자) — 활성 여부와 무관하게 입체감을 준다.
const HIGHLIGHT_ROWS = new Set([9, 11, 21, 30, 32, 44])
const SHADOW_ROWS = new Set([20, 26, 29, 31, 41, 43, 51])

function toneFor(y, ch, on) {
  if (!on) {
    if (SHADOW_ROWS.has(y)) return PALETTE.neutralShadow
    if (HIGHLIGHT_ROWS.has(y)) return PALETTE.neutralHighlight
    return PALETTE.neutral
  }
  // 뒷모습 근육은 활성 시 기본톤 자체를 한 단계 어둡게(hiliteShadow) 써서 구분한다.
  if (BACK_CHARS.has(ch)) {
    return HIGHLIGHT_ROWS.has(y) ? PALETTE.hilite : PALETTE.hiliteShadow
  }
  if (SHADOW_ROWS.has(y)) return PALETTE.hiliteShadow
  if (HIGHLIGHT_ROWS.has(y)) return PALETTE.hiliteHighlight
  return PALETTE.hilite
}

// muscles=['가슴','삼두'] 처럼 넘기면 해당 부위 셀만 강조 바이올렛으로 칠한다.
// '전신'이거나 muscles가 비어 있으면 전신을 중립색으로 보여준다.
export default function MuscleMap({ muscles = [], size = 40 }) {
  const active = new Set(muscles)
  const allOn = muscles.length === 0 || muscles.includes('전신')

  const cells = []
  ROWS.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.') continue
      let fill
      if (ch === 'o') {
        fill = PALETTE.outline
      } else {
        const name = MAP[ch]
        const on = allOn || (name !== null && active.has(name))
        fill = toneFor(y, ch, on)
      }
      cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />)
    }
  })

  return (
    <div className="muscle-map" aria-hidden="true">
      <svg width={size} height={(size / W) * H} viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges">
        {cells}
      </svg>
    </div>
  )
}
