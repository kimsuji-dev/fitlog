// 쉼표 소수점('58,5')도 받아주고, 20~300kg 범위를 벗어나거나 숫자가 아니면 null.
export function parseWeight(raw) {
  const n = Number(String(raw).trim().replace(',', '.'))
  if (!Number.isFinite(n) || n < 20 || n > 300) return null
  return n
}
