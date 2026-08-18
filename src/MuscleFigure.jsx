// 근육 자극 부위 — 앞/뒤 두 인체 도형에 자극 부위를 색으로 겹쳐 그린다.
const LINE = '#3a3350'
const REST = '#e4e2ee'
const HIT = '#7c6cf0'

function fillFor(muscles, name) {
  return muscles.includes(name) || muscles.includes('전신') ? HIT : REST
}

// 한 인체(정면 또는 후면)의 외곽선 — 머리/목/어깨/몸통/팔/다리를 부드러운 도형으로.
function BodyOutline() {
  return (
    <g stroke={LINE} strokeWidth="1.5" fill="none" strokeLinejoin="round">
      {/* 머리 */}
      <circle cx="50" cy="17" r="11" fill="#fff" />
      {/* 목 */}
      <rect x="44" y="26" width="12" height="8" rx="3" fill="#fff" />
      {/* 몸통 (가슴~허리~골반, 허리에서 좁아짐) */}
      <path
        d="M32,37 C24,40 24,58 29,72 C25,82 26,90 32,97 L68,97 C74,90 75,82 71,72 C76,58 76,40 68,37 C60,33 40,33 32,37 Z"
        fill="#fff"
      />
      {/* 왼팔 (위팔+팔꿈치+아래팔) */}
      <rect x="17" y="39" width="10" height="28" rx="5" fill="#fff" />
      <circle cx="22" cy="69" r="5" fill="#fff" />
      <rect x="18" y="69" width="8" height="25" rx="4" fill="#fff" />
      {/* 오른팔 */}
      <rect x="73" y="39" width="10" height="28" rx="5" fill="#fff" />
      <circle cx="78" cy="69" r="5" fill="#fff" />
      <rect x="74" y="69" width="8" height="25" rx="4" fill="#fff" />
      {/* 왼다리 (허벅지+무릎+종아리+발) */}
      <rect x="33" y="97" width="15" height="30" rx="7" fill="#fff" />
      <circle cx="40.5" cy="129" r="6" fill="#fff" />
      <rect x="34" y="129" width="13" height="23" rx="6" fill="#fff" />
      <ellipse cx="40.5" cy="154" rx="8" ry="4" fill="#fff" />
      {/* 오른다리 */}
      <rect x="52" y="97" width="15" height="30" rx="7" fill="#fff" />
      <circle cx="59.5" cy="129" r="6" fill="#fff" />
      <rect x="53" y="129" width="13" height="23" rx="6" fill="#fff" />
      <ellipse cx="59.5" cy="154" rx="8" ry="4" fill="#fff" />
    </g>
  )
}

function FrontMuscles({ muscles }) {
  return (
    <g stroke={LINE} strokeWidth="0.75">
      {/* 어깨 (삼각근 캡) */}
      <ellipse cx="22" cy="42" rx="7" ry="7" fill={fillFor(muscles, '어깨')} />
      <ellipse cx="78" cy="42" rx="7" ry="7" fill={fillFor(muscles, '어깨')} />
      {/* 가슴 */}
      <path d="M34,40 C30,44 30,52 34,57 L50,54 L66,57 C70,52 70,44 66,40 C58,36 42,36 34,40 Z" fill={fillFor(muscles, '가슴')} />
      {/* 복근 */}
      <rect x="41" y="58" width="18" height="30" rx="4" fill={fillFor(muscles, '복근')} />
      {/* 이두 (양팔 위팔 앞면) */}
      <rect x="17.5" y="41" width="9" height="24" rx="4.5" fill={fillFor(muscles, '이두')} />
      <rect x="73.5" y="41" width="9" height="24" rx="4.5" fill={fillFor(muscles, '이두')} />
      {/* 대퇴사두 (양다리 허벅지 앞면) */}
      <rect x="34" y="99" width="13" height="26" rx="6" fill={fillFor(muscles, '대퇴사두')} />
      <rect x="53" y="99" width="13" height="26" rx="6" fill={fillFor(muscles, '대퇴사두')} />
    </g>
  )
}

function BackMuscles({ muscles }) {
  return (
    <g stroke={LINE} strokeWidth="0.75">
      {/* 어깨 (후면에서도 삼각근 캡 표시) */}
      <ellipse cx="22" cy="42" rx="7" ry="7" fill={fillFor(muscles, '어깨')} />
      <ellipse cx="78" cy="42" rx="7" ry="7" fill={fillFor(muscles, '어깨')} />
      {/* 등 (승모/광배) */}
      <path d="M34,39 C29,44 28,58 33,68 L50,64 L67,68 C72,58 71,44 66,39 C58,35 42,35 34,39 Z" fill={fillFor(muscles, '등')} />
      {/* 삼두 (양팔 위팔 뒷면) */}
      <rect x="17.5" y="41" width="9" height="24" rx="4.5" fill={fillFor(muscles, '삼두')} />
      <rect x="73.5" y="41" width="9" height="24" rx="4.5" fill={fillFor(muscles, '삼두')} />
      {/* 둔근 */}
      <path d="M32,88 C32,82 68,82 68,88 L68,98 C60,102 40,102 32,98 Z" fill={fillFor(muscles, '둔근')} />
      {/* 햄스트링 (양다리 허벅지 뒷면) */}
      <rect x="34" y="99" width="13" height="26" rx="6" fill={fillFor(muscles, '햄스트링')} />
      <rect x="53" y="99" width="13" height="26" rx="6" fill={fillFor(muscles, '햄스트링')} />
      {/* 종아리 */}
      <rect x="34.5" y="130" width="12" height="20" rx="5.5" fill={fillFor(muscles, '종아리')} />
      <rect x="53.5" y="130" width="12" height="20" rx="5.5" fill={fillFor(muscles, '종아리')} />
    </g>
  )
}

export default function MuscleFigure({ muscles = [], size = 140 }) {
  const height = size
  const width = size * (215 / 165)
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 215 165"
      aria-hidden="true"
      style={{ display: 'block', margin: '0 auto' }}
    >
      <g transform="translate(0,0)">
        <BodyOutline />
        <FrontMuscles muscles={muscles} />
        <text x="50" y="163" textAnchor="middle" fontSize="9" fill="#6b6880">앞</text>
      </g>
      <g transform="translate(115,0)">
        <BodyOutline />
        <BackMuscles muscles={muscles} />
        <text x="50" y="163" textAnchor="middle" fontSize="9" fill="#6b6880">뒤</text>
      </g>
    </svg>
  )
}
