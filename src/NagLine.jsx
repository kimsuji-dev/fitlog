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

function pickLine(prev) {
  if (LINES.length <= 1) return LINES[0]
  let next
  do {
    next = LINES[Math.floor(Math.random() * LINES.length)]
  } while (next === prev)
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
    <div className="nag-line">🧔 {line}</div>
  )
}
