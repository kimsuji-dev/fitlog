import { useState, useEffect, useRef } from 'react'

const LINES = [
  '물 한 잔 마셨어? 오늘도 잘 챙기자 💧',
  '이노시톨 챙겨 먹었어? 내가 물어볼 거야 😉',
  '오늘 20분만 걸어볼까? 같이 나가자 🚶',
  '근력운동은 꾸준함이 답이래. 오늘도 화이팅 💪',
  '단 거 땡길 땐 견과류 어때? 같이 먹자 🥜',
  '잠 푹 자는 것도 관리야. 오늘은 일찍 자자 😴',
  '계단 한 번 더 올라가기, 오늘의 미션 🪜',
  '밥 천천히 먹기! 내가 옆에서 지켜본다 🍚',
  '오늘 몸무게 쟀어? 숫자보다 흐름이 중요해 ⚖️',
  '스트레스 받으면 나한테 말해. 같이 걷자 🌿',
  '아침 거르지 말기! 챙겨줄게 🍳',
  '우리 페이스대로 가자. 조급해하지 말고 🌱',
  '오늘도 잘하고 있어. 진짜로 💖',
  '산책 후 커피 한 잔? 같이 가자 ☕',
  '이노시톨이랑 물, 세트로 기억하기 💊💧',
  '몸이 힘든 날은 쉬는 것도 관리야 🛌',
  '야식 대신 따뜻한 차 어때? 🍵',
  '우리 둘 다 건강해야 셋이 되지 🕊️',
  '무리하지 마. 오늘 컨디션이 제일 중요해 🍀',
  '같이 장 보러 갈까? 좋은 거 많이 사자 🥬',
]

const INFO_LINES = [
  '일주일에 중강도 운동 150분이 국제 다낭성 가이드라인 권고예요 🚶',
  '체중이 그대로여도 운동만으로 대사 지표가 좋아진대요 🌱',
  '밥 먹고 10~20분 걷기가 식후 혈당을 낮춰줘요 🍚',
  '앉아있는 시간을 줄이는 것만으로도 도움이 돼요 🪑',
  '가벼운 강도의 활동도 안 하는 것보다 이로워요 🍃',
  '식후에 3분 정도 계단을 오르내리는 것도 도움이 돼요 🪜',
  '운동 종류에 정답은 없대요. 계속할 수 있는 걸 고르는 게 중요해요 🎯',
  '이노시톨은 아직 근거가 확실하지 않대요. 기록해두고 주치의와 얘기해봐요 💊',
  '수치나 약에 대한 판단은 주치의와 상의하는 게 가장 정확해요 🩺',
  '목표는 같이 정하는 거래요. 무리한 계획보다 지킬 수 있는 계획으로 🤝',
]

const ALL_LINES = [
  ...LINES.map(text => ({ text, prefix: '🧔', info: false })),
  ...INFO_LINES.map(text => ({ text, prefix: '🩺', info: true })),
]

function pickLine(prev) {
  if (ALL_LINES.length <= 1) return ALL_LINES[0]
  let next
  do {
    next = ALL_LINES[Math.floor(Math.random() * ALL_LINES.length)]
  } while (next.text === prev?.text)
  return next
}

export default function NagLine({ trigger }) {
  const [line, setLine] = useState(null)
  const prevRef = useRef(null)

  useEffect(() => {
    const next = pickLine(prevRef.current)
    prevRef.current = next
    setLine(next)
  }, [trigger])

  if (!line) return null

  return (
    <div className={`nag-line${line.info ? ' info' : ''}`}>{line.prefix} {line.text}</div>
  )
}
