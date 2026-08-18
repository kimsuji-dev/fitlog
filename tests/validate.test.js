import { describe, it, expect } from 'vitest'
import { parseWeight } from '../src/validate.js'

describe('parseWeight', () => {
  it('정상 값을 숫자로 반환', () => {
    expect(parseWeight('58.5')).toBe(58.5)
  })
  it('쉼표 소수점도 받아준다', () => {
    expect(parseWeight('58,5')).toBe(58.5)
  })
  it('범위 밖이면 null', () => {
    expect(parseWeight('19')).toBeNull()
    expect(parseWeight('301')).toBeNull()
  })
  it('숫자가 아니면 null', () => {
    expect(parseWeight('')).toBeNull()
    expect(parseWeight('abc')).toBeNull()
  })
})
