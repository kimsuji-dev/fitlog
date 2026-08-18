// 남편 + 아기 — 앱 하단에 놓이는 작고 따뜻한 벡터 일러스트.
// 포인트 컬러로만 쓰이며 시선을 끌지 않도록 은은하게.
const LINE = '#3a3350'
const SKIN = '#f2c9a4'
const SHIRT = '#7c6cf0'
const SHIRT_SOFT = '#ece9fc'
const BLUSH = '#f2a6a6'
const BABY_WRAP = '#f7f6fb'

export default function Family({ size = 72 }) {
  return (
    <svg
      className="family-illustration"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block', pointerEvents: 'none' }}
    >
      {/* 남편 다리 */}
      <path d="M46 96 L44 112 M60 98 L64 112" stroke={LINE} strokeWidth="3" strokeLinecap="round" />

      {/* 남편 몸통 (라운드 셔츠) */}
      <rect x="34" y="58" width="34" height="40" rx="14" fill={SHIRT_SOFT} stroke={LINE} strokeWidth="1.5" />

      {/* 남편 팔 (아기를 감싸는 팔) */}
      <path d="M66 66 Q80 70 76 86 Q74 92 64 92" fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <path d="M36 66 Q30 76 34 88" fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round" />

      {/* 남편 목 + 머리 */}
      <rect x="47" y="46" width="8" height="10" rx="3" fill={SKIN} />
      <circle cx="51" cy="36" r="15" fill={SKIN} stroke={LINE} strokeWidth="1.5" />
      {/* 머리카락 */}
      <path d="M36 33 Q38 20 51 20 Q64 20 66 33 Q60 27 51 27 Q42 27 36 33 Z" fill={LINE} />
      {/* 얼굴 */}
      <circle cx="46" cy="37" r="1.6" fill={LINE} />
      <circle cx="56" cy="37" r="1.6" fill={LINE} />
      <path d="M46 43 Q51 47 56 43" stroke={LINE} strokeWidth="1.6" strokeLinecap="round" fill="none" />

      {/* 아기 포대기 (남편 품 안) */}
      <ellipse cx="80" cy="82" rx="16" ry="18" fill={BABY_WRAP} stroke={LINE} strokeWidth="1.5" />

      {/* 아기 머리 */}
      <circle cx="82" cy="70" r="10" fill={SKIN} stroke={LINE} strokeWidth="1.5" />
      {/* 아기 잔머리 */}
      <path d="M77 62 Q82 58 87 62" stroke={LINE} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* 아기 볼 */}
      <circle cx="76" cy="72" r="2" fill={BLUSH} opacity="0.7" />
      <circle cx="88" cy="72" r="2" fill={BLUSH} opacity="0.7" />
      {/* 아기 얼굴 */}
      <circle cx="78" cy="69" r="1.2" fill={LINE} />
      <circle cx="86" cy="69" r="1.2" fill={LINE} />
      <path d="M79 74 Q82 76 85 74" stroke={LINE} strokeWidth="1.3" strokeLinecap="round" fill="none" />

      {/* 남편 셔츠 버튼 포인트 */}
      <circle cx="51" cy="68" r="1.4" fill={SHIRT} />
      <circle cx="51" cy="76" r="1.4" fill={SHIRT} />
    </svg>
  )
}
