import { MUSCLES } from './exercises'

// 딥링크 쿼리(?muscle=가슴 / ?add=1) → { muscle } 또는 null(평소대로 열기).
export function parseDeepLink(search) {
  const p = new URLSearchParams(search)
  const muscle = p.get('muscle')
  if (MUSCLES.includes(muscle)) return { muscle }
  if (p.get('add') === '1') return { muscle: '전체' }
  return null
}

// 쉼표 소수점('58,5')도 받아주고, 20~300kg 범위를 벗어나거나 숫자가 아니면 null.
export function parseWeight(raw) {
  const n = Number(String(raw).trim().replace(',', '.'))
  if (!Number.isFinite(n) || n < 20 || n > 300) return null
  return n
}

// 가슴/허리/엉덩이 둘레(cm) — 쉼표 소수점 허용, 20~200cm 범위를 벗어나거나 숫자가 아니면 null.
// 선택 입력이라 빈 문자열 처리는 호출부에서(빈 값이면 이 함수를 안 부르고 그냥 생략).
export function parseSize(raw) {
  const n = Number(String(raw).trim().replace(',', '.'))
  if (!Number.isFinite(n) || n < 20 || n > 200) return null
  return n
}
