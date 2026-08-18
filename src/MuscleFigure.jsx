// 근육 자극 부위 — 앞/뒤 두 인체 도형에 자극 부위를 색으로 겹쳐 그린다.
// 단일 실루엣 방식: 몸 전체를 이음매 없는 하나의 외곽선(path)으로 그리고,
// 근육 부위는 그 위에 stroke 없는 채우기 도형만 얹는다(실루엣 clip으로 밖으로 새지 않게).
const LINE = '#3a3350'
const REST = '#e4e2ee'
const HIT = '#7c6cf0'

function fillFor(muscles, name) {
  return muscles.includes(name) || muscles.includes('전신') ? HIT : REST
}

// 여성 운동 체형 실루엣 — 머리부터 시계방향으로 한 번에 그리는 단일 외곽선.
// 좁은 어깨, 잘록한 허리, 넓은 골반, 긴 다리. 팔은 몸통에서 떨어져 있고
// 다리 사이는 작은 틈으로 갈라져 있어 이음매 없이도 두 다리/두 팔로 읽힌다.
// 좌표 목록(머리 위→왼쪽으로 한 바퀴→가랑이)을 중심선(x=50) 기준으로 대칭 미러링한 뒤
// Catmull-Rom 스플라인을 3차 베지어로 변환해 만든 단일 폐곡선. 관절 이음매 없이
// 매끄럽게 이어지며, 다리 사이는 가랑이 지점(50,86)이 안쪽으로 파고들어 틈을 만든다.
const BODY_D = 'M50,8 C46.3,8.0 41.5,10.0 39,12 C36.5,14.0 35.0,17.7 35,20 C35.0,22.3 37.3,24.7 39,26 ' +
  'C40.7,27.3 46.3,27.2 45,28 C43.7,28.8 34.8,28.3 31,31 C27.2,33.7 23.8,39.5 22,44 C20.2,48.5 20.5,53.7 20,58 ' +
  'C19.5,62.3 19.2,66.7 19,70 C18.8,73.3 18.8,75.7 19,78 C19.2,80.3 19.2,82.8 20,84 C20.8,85.2 23.1,86.0 24,85 ' +
  'C24.9,84.0 25.2,80.5 25.5,78 C25.8,75.5 25.7,73.3 26,70 C26.3,66.7 26.8,62.3 27.5,58 C28.3,53.7 28.9,43.7 30.5,44 ' +
  'C32.1,44.3 36.8,53.3 37,60 C37.3,66.7 32.3,77.8 32,84 C31.7,90.2 34.2,90.7 35,97 C35.8,103.3 36.5,115.2 37,122 ' +
  'C37.5,128.8 38.0,133.5 38,138 C38.0,142.5 37.7,146.7 37,149 C36.3,151.3 34.5,150.7 34,152 C33.5,153.3 32.8,156.0 34,157 ' +
  'C35.2,158.0 39.7,158.7 41,158 C42.3,157.3 42.0,154.5 42,153 C42.0,151.5 40.9,151.8 41,149 C41.1,146.2 42.0,140.5 42.5,136 ' +
  'C43.0,131.5 43.8,128.0 44,122 C44.3,116.0 43.0,106.0 44,100 C45.0,94.0 48.0,86.0 50,86 C52.0,86.0 55.0,94.0 56,100 ' +
  'C57.0,106.0 55.8,116.0 56,122 C56.3,128.0 57.0,131.5 57.5,136 C58.0,140.5 58.9,146.2 59,149 C59.1,151.8 58.0,151.5 58,153 ' +
  'C58.0,154.5 57.7,157.3 59,158 C60.3,158.7 64.8,158.0 66,157 C67.2,156.0 66.5,153.3 66,152 C65.5,150.7 63.7,151.3 63,149 ' +
  'C62.3,146.7 62.0,142.5 62,138 C62.0,133.5 62.5,128.8 63,122 C63.5,115.2 64.2,103.3 65,97 C65.8,90.7 68.3,90.2 68,84 ' +
  'C67.7,77.8 62.8,66.7 63,60 C63.3,53.3 67.9,44.3 69.5,44 C71.1,43.7 71.8,53.7 72.5,58 C73.3,62.3 73.7,66.7 74,70 ' +
  'C74.3,73.3 74.2,75.5 74.5,78 C74.8,80.5 75.1,84.0 76,85 C76.9,86.0 79.2,85.2 80,84 C80.8,82.8 80.8,80.3 81,78 ' +
  'C81.2,75.7 81.2,73.3 81,70 C80.8,66.7 80.5,62.3 80,58 C79.5,53.7 79.8,48.5 78,44 C76.2,39.5 72.8,33.7 69,31 ' +
  'C65.2,28.3 56.3,28.8 55,28 C53.7,27.2 59.3,27.3 61,26 C62.7,24.7 65.0,22.3 65,20 C65.0,17.7 63.5,14.0 61,12 ' +
  'C58.5,10.0 53.7,8.0 50,8 Z'

function BodySilhouette({ id }) {
  return <path id={id} d={BODY_D} fill={REST} stroke={LINE} strokeWidth="1.5" strokeLinejoin="round" />
}

function FrontMuscles({ muscles, clip }) {
  return (
    <g clipPath={`url(#${clip})`} stroke="none">
      {/* 어깨 */}
      <ellipse cx="27" cy="32" rx="7" ry="7.5" fill={fillFor(muscles, '어깨')} />
      <ellipse cx="73" cy="32" rx="7" ry="7.5" fill={fillFor(muscles, '어깨')} />
      {/* 가슴 */}
      <ellipse cx="41" cy="38" rx="9" ry="7" fill={fillFor(muscles, '가슴')} />
      <ellipse cx="59" cy="38" rx="9" ry="7" fill={fillFor(muscles, '가슴')} />
      {/* 이두 */}
      <rect x="20" y="38" width="9" height="20" rx="4.5" fill={fillFor(muscles, '이두')} />
      <rect x="71" y="38" width="9" height="20" rx="4.5" fill={fillFor(muscles, '이두')} />
      {/* 복근 */}
      <rect x="41" y="47" width="18" height="30" rx="6" fill={fillFor(muscles, '복근')} />
      {/* 대퇴사두 */}
      <rect x="35" y="96" width="14" height="34" rx="7" fill={fillFor(muscles, '대퇴사두')} />
      <rect x="51" y="96" width="14" height="34" rx="7" fill={fillFor(muscles, '대퇴사두')} />
    </g>
  )
}

function BackMuscles({ muscles, clip }) {
  return (
    <g clipPath={`url(#${clip})`} stroke="none">
      {/* 어깨 */}
      <ellipse cx="27" cy="32" rx="7" ry="7.5" fill={fillFor(muscles, '어깨')} />
      <ellipse cx="73" cy="32" rx="7" ry="7.5" fill={fillFor(muscles, '어깨')} />
      {/* 등 */}
      <path d="M33,28 C30,40 30,54 36,62 L50,57 L64,62 C70,54 70,40 67,28 C58,24 42,24 33,28 Z" fill={fillFor(muscles, '등')} />
      {/* 삼두 */}
      <rect x="20" y="38" width="9" height="20" rx="4.5" fill={fillFor(muscles, '삼두')} />
      <rect x="71" y="38" width="9" height="20" rx="4.5" fill={fillFor(muscles, '삼두')} />
      {/* 둔근 */}
      <path d="M34,82 C34,90 40,95 50,95 C60,95 66,90 66,82 C66,76 60,74 50,74 C40,74 34,76 34,82 Z" fill={fillFor(muscles, '둔근')} />
      {/* 햄스트링 */}
      <rect x="35" y="96" width="14" height="34" rx="7" fill={fillFor(muscles, '햄스트링')} />
      <rect x="51" y="96" width="14" height="34" rx="7" fill={fillFor(muscles, '햄스트링')} />
      {/* 종아리 */}
      <ellipse cx="42" cy="140" rx="8" ry="12" fill={fillFor(muscles, '종아리')} />
      <ellipse cx="58" cy="140" rx="8" ry="12" fill={fillFor(muscles, '종아리')} />
    </g>
  )
}

function Figure({ side, muscles, label }) {
  const bodyId = `mf-body-${side}`
  const clipId = `mf-clip-${side}`
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <use href={`#${bodyId}`} />
        </clipPath>
      </defs>
      <BodySilhouette id={bodyId} />
      {side === 'front'
        ? <FrontMuscles muscles={muscles} clip={clipId} />
        : <BackMuscles muscles={muscles} clip={clipId} />}
      <text x="50" y="163" textAnchor="middle" fontSize="9" fill="#6b6880">{label}</text>
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
        <Figure side="front" muscles={muscles} label="앞" />
      </g>
      <g transform="translate(115,0)">
        <Figure side="back" muscles={muscles} label="뒤" />
      </g>
    </svg>
  )
}
