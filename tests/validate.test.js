import { describe, it, expect } from 'vitest'
import { parseWeight, parseDeepLink } from '../src/validate.js'

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

describe('parseDeepLink', () => {
  it('부위가 MUSCLES에 있으면 그 부위를 반환', () => {
    expect(parseDeepLink('?muscle=가슴')).toEqual({ muscle: '가슴' })
  })
  it('add=1이면 전체 부위로 연다', () => {
    expect(parseDeepLink('?add=1')).toEqual({ muscle: '전체' })
  })
  it('모르는 부위나 쿼리 없음이면 null', () => {
    expect(parseDeepLink('?muscle=날개')).toBeNull()
    expect(parseDeepLink('')).toBeNull()
  })
})
