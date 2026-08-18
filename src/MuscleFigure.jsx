// 근육 자극 부위 — 앞/뒤 두 인체 도형에 자극 부위를 색으로 겹쳐 그린다.
// 여성 운동 체형 마네킹: 좁은 어깨/넓은 골반의 여성 비율 + 탄탄한 근육 윤곽선.
const LINE = '#3a3350'
const REST = '#e4e2ee'
const HIT = '#7c6cf0'
const CLOTH = '#c9c5dc' // 스포츠 브라·숏츠 실루엣 (중립 톤)

function fillFor(muscles, name) {
  return muscles.includes(name) || muscles.includes('전신') ? HIT : REST
}

// 한 인체(정면 또는 후면)의 외곽선 — 여성 비율: 좁은 어깨, 뚜렷한 허리, 넓은 골반, 긴 다리.
function BodyOutline() {
  return (
    <g stroke={LINE} strokeWidth="1.5" fill="none" strokeLinejoin="round">
      {/* 머리 */}
      <circle cx="50" cy="15" r="9.5" fill="#fff" />
      {/* 목 */}
      <rect x="45.5" y="23" width="9" height="7" rx="2.5" fill="#fff" />
      {/* 몸통 (좁은 어깨 → 가슴 → 잘록한 허리 → 넓은 골반) */}
      <path
        d="M36,30 C29,32 27,40 29,48 C25,56 25,63 30,68 C27,76 28,84 34,90 L66,90 C72,84 73,76 70,68 C75,63 75,56 71,48 C73,40 71,32 64,30 C56,27 44,27 36,30 Z"
        fill="#fff"
      />
      {/* 왼팔 (위팔+팔꿈치+아래팔, 가는 편) */}
      <rect x="21" y="32" width="8" height="26" rx="4" fill="#fff" />
      <circle cx="25" cy="60" r="4.2" fill="#fff" />
      <rect x="21.5" y="60" width="7" height="23" rx="3.5" fill="#fff" />
      {/* 오른팔 */}
      <rect x="71" y="32" width="8" height="26" rx="4" fill="#fff" />
      <circle cx="75" cy="60" r="4.2" fill="#fff" />
      <rect x="71.5" y="60" width="7" height="23" rx="3.5" fill="#fff" />
      {/* 왼다리 (허벅지+무릎+종아리+발, 길고 매끈) */}
      <rect x="35" y="90" width="14" height="36" rx="7" fill="#fff" />
      <circle cx="42" cy="128" r="5.5" fill="#fff" />
      <rect x="36.5" y="128" width="11" height="28" rx="5.5" fill="#fff" />
      <ellipse cx="42" cy="158" rx="7" ry="3.4" fill="#fff" />
      {/* 오른다리 */}
      <rect x="51" y="90" width="14" height="36" rx="7" fill="#fff" />
      <circle cx="58" cy="128" r="5.5" fill="#fff" />
      <rect x="52.5" y="128" width="11" height="28" rx="5.5" fill="#fff" />
      <ellipse cx="58" cy="158" rx="7" ry="3.4" fill="#fff" />
    </g>
  )
}

function FrontMuscles({ muscles }) {
  return (
    <g stroke={LINE} strokeWidth="0.75">
      {/* 어깨 (삼각근 캡, 여성 비율에 맞춰 갸름하게) */}
      <ellipse cx="25" cy="35" rx="6" ry="6.5" fill={fillFor(muscles, '어깨')} />
      <ellipse cx="75" cy="35" rx="6" ry="6.5" fill={fillFor(muscles, '어깨')} />
      {/* 가슴 (스포츠 브라 실루엣, 중앙 분리선으로 탄탄함 표현) */}
      <path d="M37,33 C32,37 32,44 36,48 L50,45.5 L64,48 C68,44 68,37 63,33 C56,29.5 44,29.5 37,33 Z" fill={fillFor(muscles, '가슴')} stroke={LINE} />
      <line x1="50" y1="31" x2="50" y2="46" stroke={LINE} strokeWidth="0.6" />
      {/* 복근 (세그먼트 표현) */}
      <g fill={fillFor(muscles, '복근')}>
        <rect x="42" y="49" width="16" height="27" rx="3.5" />
      </g>
      <g stroke={LINE} strokeWidth="0.5" fill="none">
        <line x1="50" y1="49" x2="50" y2="76" />
        <line x1="42.5" y1="55.5" x2="57.5" y2="55.5" />
        <line x1="42.5" y1="62" x2="57.5" y2="62" />
        <line x1="42.5" y1="68.5" x2="57.5" y2="68.5" />
      </g>
      {/* 허리 라인 (몸통 잘록함 강조) */}
      <path d="M30,64 C28,60 28,54 30,49" stroke={LINE} strokeWidth="0.5" fill="none" />
      <path d="M70,64 C72,60 72,54 70,49" stroke={LINE} strokeWidth="0.5" fill="none" />
      {/* 이두 (양팔 위팔 앞면) */}
      <rect x="21.5" y="34" width="7" height="22" rx="3.5" fill={fillFor(muscles, '이두')} />
      <rect x="71.5" y="34" width="7" height="22" rx="3.5" fill={fillFor(muscles, '이두')} />
      {/* 숏츠 실루엣 (골반~상단 허벅지) */}
      <path d="M34,88 C34,84 66,84 66,88 L67,97 C60,101 40,101 33,97 Z" fill={CLOTH} stroke={LINE} strokeWidth="0.75" />
      {/* 대퇴사두 (양다리 허벅지 앞면, 세로 분리선으로 정의감) */}
      <rect x="36" y="92" width="12" height="32" rx="6" fill={fillFor(muscles, '대퇴사두')} />
      <line x1="42" y1="94" x2="42" y2="122" stroke={LINE} strokeWidth="0.5" />
      <rect x="52" y="92" width="12" height="32" rx="6" fill={fillFor(muscles, '대퇴사두')} />
      <line x1="58" y1="94" x2="58" y2="122" stroke={LINE} strokeWidth="0.5" />
    </g>
  )
}

function BackMuscles({ muscles }) {
  return (
    <g stroke={LINE} strokeWidth="0.75">
      {/* 어깨 (후면에서도 삼각근 캡 표시) */}
      <ellipse cx="25" cy="35" rx="6" ry="6.5" fill={fillFor(muscles, '어깨')} />
      <ellipse cx="75" cy="35" rx="6" ry="6.5" fill={fillFor(muscles, '어깨')} />
      {/* 등 (승모/광배, 브라 스트랩 실루엣 위로 표시) */}
      <path d="M37,32 C31,37 30,50 34,58 L50,54.5 L66,58 C70,50 69,37 63,32 C56,28.5 44,28.5 37,32 Z" fill={fillFor(muscles, '등')} />
      <line x1="50" y1="30" x2="50" y2="55" stroke={LINE} strokeWidth="0.5" />
      <path d="M40,33.5 C43.5,36 43.5,45 41,52" stroke={LINE} strokeWidth="0.4" fill="none" />
      <path d="M60,33.5 C56.5,36 56.5,45 59,52" stroke={LINE} strokeWidth="0.4" fill="none" />
      {/* 브라 스트랩 실루엣 */}
      <path d="M40,29 L43,36 M60,29 L57,36" stroke={CLOTH} strokeWidth="3" strokeLinecap="round" />
      {/* 허리 라인 */}
      <path d="M30,64 C28,60 28,54 30,49" stroke={LINE} strokeWidth="0.5" fill="none" />
      <path d="M70,64 C72,60 72,54 70,49" stroke={LINE} strokeWidth="0.5" fill="none" />
      {/* 삼두 (양팔 위팔 뒷면) */}
      <rect x="21.5" y="34" width="7" height="22" rx="3.5" fill={fillFor(muscles, '삼두')} />
      <rect x="71.5" y="34" width="7" height="22" rx="3.5" fill={fillFor(muscles, '삼두')} />
      {/* 숏츠 실루엣 (골반~상단 허벅지) */}
      <path d="M33,79 C33,75 67,75 67,79 L68,88 C60,93 40,93 32,88 Z" fill={CLOTH} stroke={LINE} strokeWidth="0.75" />
      {/* 둔근 (숏츠 아래 살짝 드러나는 라인, 넓은 골반 강조) */}
      <path d="M35,90 C35,86 65,86 65,90 L65,95 C58,98 42,98 35,95 Z" fill={fillFor(muscles, '둔근')} />
      <line x1="50" y1="88" x2="50" y2="95" stroke={LINE} strokeWidth="0.5" />
      {/* 햄스트링 (양다리 허벅지 뒷면) */}
      <rect x="36" y="92" width="12" height="32" rx="6" fill={fillFor(muscles, '햄스트링')} />
      <rect x="52" y="92" width="12" height="32" rx="6" fill={fillFor(muscles, '햄스트링')} />
      {/* 종아리 (알통 형태로 볼륨감) */}
      <path d="M36.5,128 C35,133 35,140 36.5,145 C39,148 45,148 47.5,145 C49,140 49,133 47.5,128 C44.5,126 39.5,126 36.5,128 Z" fill={fillFor(muscles, '종아리')} />
      <path d="M52.5,128 C51,133 51,140 52.5,145 C55,148 61,148 63.5,145 C65,140 65,133 63.5,128 C60.5,126 55.5,126 52.5,128 Z" fill={fillFor(muscles, '종아리')} />
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
