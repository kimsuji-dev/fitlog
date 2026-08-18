// 동작 그림 — free-exercise-db 실사진이 있으면 그걸 쓰고, 없으면(또는 로드 실패 시)
// 66개 종목을 12개 움직임 패턴으로 묶은 스틱피겨 폴백을 그린다.
import { useState } from 'react'

const LINE = '#3a3350'
const ACCENT = '#7c6cf0'

// 관절 좌표(옆모습, 0~50 x 0~66)로 한 사람을 그린다.
function Stickman({ j, weight }) {
  const { head, neck, hip, shoulder, elbow, hand, knee, foot } = j
  return (
    <g stroke={LINE} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <circle cx={head[0]} cy={head[1]} r="5" fill="#fff" strokeWidth="2.4" />
      <path d={`M${neck[0]},${neck[1]} L${hip[0]},${hip[1]}`} />
      <path d={`M${hip[0]},${hip[1]} L${knee[0]},${knee[1]} L${foot[0]},${foot[1]}`} />
      <path d={`M${shoulder[0]},${shoulder[1]} L${elbow[0]},${elbow[1]} L${hand[0]},${hand[1]}`} />
      <path d={`M${foot[0] - 4},${foot[1]} L${foot[0] + 5},${foot[1]}`} strokeWidth="3" />
      {weight === 'bar' && (
        <path d={`M${hand[0] - 7},${hand[1]} L${hand[0] + 7},${hand[1]}`} stroke={ACCENT} strokeWidth="3" />
      )}
      {weight === 'dumbbell' && <circle cx={hand[0]} cy={hand[1]} r="3.2" fill={ACCENT} stroke="none" />}
    </g>
  )
}

// 패턴별 시작(a)/끝(b) 관절 좌표. weight: 'bar' | 'dumbbell' | undefined
const POSES = {
  squat: {
    weight: 'bar',
    a: { head: [25, 12], neck: [25, 17], shoulder: [25, 18], elbow: [25, 24], hand: [25, 24], hip: [25, 30], knee: [25, 48], foot: [25, 64] },
    b: { head: [22, 27], neck: [22, 32], shoulder: [22, 33], elbow: [22, 33], hand: [22, 33], hip: [17, 40], knee: [27, 50], foot: [25, 64] },
  },
  hinge: {
    weight: 'bar',
    a: { head: [25, 12], neck: [25, 17], shoulder: [25, 18], elbow: [26, 24], hand: [27, 30], hip: [25, 30], knee: [25, 48], foot: [25, 64] },
    b: { head: [33, 24], neck: [30, 27], shoulder: [30, 27], elbow: [29, 34], hand: [28, 42], hip: [22, 33], knee: [24, 48], foot: [25, 64] },
  },
  lunge: {
    weight: 'dumbbell',
    a: { head: [25, 12], neck: [25, 17], shoulder: [25, 18], elbow: [25, 24], hand: [25, 30], hip: [25, 30], knee: [25, 48], foot: [25, 64] },
    b: { head: [24, 15], neck: [24, 20], shoulder: [24, 21], elbow: [24, 27], hand: [24, 33], hip: [24, 33], knee: [33, 46], foot: [37, 64] },
  },
  horizontalPress: {
    weight: 'bar',
    a: { head: [16, 30], neck: [22, 32], shoulder: [22, 32], elbow: [22, 24], hand: [22, 16], hip: [30, 32], knee: [40, 32], foot: [48, 32] },
    b: { head: [16, 30], neck: [22, 32], shoulder: [22, 32], elbow: [15, 30], hand: [12, 32], hip: [30, 32], knee: [40, 32], foot: [48, 32] },
  },
  verticalPress: {
    weight: 'dumbbell',
    a: { head: [25, 14], neck: [25, 19], shoulder: [25, 20], elbow: [29, 26], hand: [28, 32], hip: [25, 34], knee: [25, 49], foot: [25, 64] },
    b: { head: [25, 14], neck: [25, 19], shoulder: [25, 20], elbow: [23, 12], hand: [22, 6], hip: [25, 34], knee: [25, 49], foot: [25, 64] },
  },
  horizontalPull: {
    weight: 'bar',
    a: { head: [16, 22], neck: [20, 26], shoulder: [20, 26], elbow: [23, 33], hand: [24, 40], hip: [26, 34], knee: [30, 48], foot: [36, 62] },
    b: { head: [16, 22], neck: [20, 26], shoulder: [20, 26], elbow: [15, 30], hand: [12, 32], hip: [26, 34], knee: [30, 48], foot: [36, 62] },
  },
  verticalPull: {
    weight: 'bar',
    a: { head: [25, 14], neck: [25, 19], shoulder: [25, 20], elbow: [21, 12], hand: [19, 6], hip: [25, 34], knee: [25, 49], foot: [25, 64] },
    b: { head: [25, 14], neck: [25, 19], shoulder: [25, 20], elbow: [27, 26], hand: [26, 32], hip: [25, 34], knee: [25, 49], foot: [25, 64] },
  },
  curl: {
    weight: 'dumbbell',
    a: { head: [25, 12], neck: [25, 17], shoulder: [25, 18], elbow: [28, 26], hand: [29, 36], hip: [25, 30], knee: [25, 48], foot: [25, 64] },
    b: { head: [25, 12], neck: [25, 17], shoulder: [25, 18], elbow: [28, 26], hand: [26, 15], hip: [25, 30], knee: [25, 48], foot: [25, 64] },
  },
  extension: {
    weight: 'dumbbell',
    a: { head: [25, 12], neck: [25, 17], shoulder: [25, 18], elbow: [22, 22], hand: [22, 8], hip: [25, 30], knee: [25, 48], foot: [25, 64] },
    b: { head: [25, 12], neck: [25, 17], shoulder: [25, 18], elbow: [22, 22], hand: [24, 33], hip: [25, 30], knee: [25, 48], foot: [25, 64] },
  },
  core: {
    a: { head: [12, 44], neck: [18, 42], shoulder: [18, 42], elbow: [22, 38], hand: [26, 34], hip: [26, 44], knee: [36, 44], foot: [46, 44] },
    b: { head: [16, 30], neck: [21, 34], shoulder: [21, 34], elbow: [24, 32], hand: [27, 30], hip: [26, 44], knee: [34, 40], foot: [42, 34] },
  },
  cardio: {
    a: { head: [22, 12], neck: [23, 17], shoulder: [23, 18], elbow: [29, 22], hand: [32, 16], hip: [25, 30], knee: [32, 40], foot: [28, 52] },
    single: true,
  },
  isolationMachine: {
    weight: 'dumbbell',
    a: { head: [16, 22], neck: [20, 26], shoulder: [20, 26], elbow: [24, 30], hand: [26, 34], hip: [24, 34], knee: [30, 44], foot: [38, 50] },
    b: { head: [16, 22], neck: [20, 26], shoulder: [20, 26], elbow: [24, 30], hand: [30, 26], hip: [24, 34], knee: [30, 44], foot: [38, 50] },
  },
}

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises'

// 스틱피겨 패턴 그림 — 실사진이 없거나 로드에 실패했을 때의 폴백.
function PatternDiagram({ pattern, size }) {
  const cfg = POSES[pattern] || POSES.core
  const height = size
  const width = size * (140 / 66)

  if (cfg.single) {
    return (
      <svg width={width} height={height} viewBox="0 0 66 66" aria-hidden="true" style={{ display: 'block', margin: '0 auto' }}>
        <Stickman j={cfg.a} weight={cfg.weight} />
      </svg>
    )
  }

  return (
    <svg width={width} height={height} viewBox="0 0 140 66" aria-hidden="true" style={{ display: 'block', margin: '0 auto' }}>
      <g transform="translate(0,0)">
        <Stickman j={cfg.a} weight={cfg.weight} />
      </g>
      {/* 화살표 */}
      <path d="M56,40 L82,40" stroke="#a39fc2" strokeWidth="2" strokeLinecap="round" />
      <path d="M77,35 L83,40 L77,45" stroke="#a39fc2" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(90,0)">
        <Stickman j={cfg.b} weight={cfg.weight} />
      </g>
    </svg>
  )
}

// 실제 운동 사진 — free-exercise-db(퍼블릭 도메인)의 시작/끝 자세 두 장.
function PhotoPair({ photos, pattern, size }) {
  const [broken, setBroken] = useState(false)

  if (broken) return <PatternDiagram pattern={pattern} size={size} />

  return (
    <div className="motion-photo-pair">
      {['0', '1'].map((n, i) => (
        <figure className="motion-photo" key={n}>
          <img
            src={`${CDN_BASE}/${photos}/${n}.jpg`}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
          <figcaption className="text-sm">{i === 0 ? '시작' : '끝'}</figcaption>
        </figure>
      ))}
    </div>
  )
}

export default function MotionDiagram({ pattern, photos, size = 90 }) {
  if (photos) return <PhotoPair photos={photos} pattern={pattern} size={size} />
  return <PatternDiagram pattern={pattern} size={size} />
}
