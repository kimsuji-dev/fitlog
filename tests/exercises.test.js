import { describe, it, expect } from 'vitest'
import { BUILTIN, MUSCLES, EQUIPMENT, MOTION_PATTERNS, matchesSearch } from '../src/exercises.js'

describe('exercises', () => {
  it('약 65종을 포함한다', () => {
    expect(BUILTIN.length).toBeGreaterThanOrEqual(60)
    expect(BUILTIN.length).toBeLessThanOrEqual(70)
  })

  it('모든 종목은 유효한 muscles/equipment를 가진다', () => {
    for (const ex of BUILTIN) {
      expect(Array.isArray(ex.muscles)).toBe(true)
      expect(ex.muscles.length).toBeGreaterThanOrEqual(1)
      expect(ex.muscles.length).toBeLessThanOrEqual(3)
      for (const m of ex.muscles) expect(MUSCLES).toContain(m)
      expect(EQUIPMENT).toContain(ex.equipment)
      expect(['weight', 'cardio']).toContain(ex.type)
    }
  })

  it('모든 종목은 유효한 pattern을 가진다', () => {
    for (const ex of BUILTIN) {
      expect(MOTION_PATTERNS).toContain(ex.pattern)
    }
  })

  it('종목 이름은 중복되지 않는다', () => {
    const names = BUILTIN.map(e => e.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('모든 종목의 photos는 null이거나 비어있지 않은 문자열이다', () => {
    for (const ex of BUILTIN) {
      expect(ex.photos === null || (typeof ex.photos === 'string' && ex.photos.length > 0)).toBe(true)
    }
  })
})

describe('matchesSearch — 검색은 공백·대소문자를 무시한다', () => {
  it('띄어쓰기 없이 쳐도 찾는다', () => {
    expect(matchesSearch('몬스터 글루트', '몬스터글루트')).toBe(true)
    expect(matchesSearch('힙 어브덕션(아웃 싸이 머신)', '힙어브덕션')).toBe(true)
  })
  it('띄어쓰기를 넣어 쳐도 찾는다', () => {
    expect(matchesSearch('랫풀다운', '랫 풀다운')).toBe(true)
  })
  it('영문 대소문자를 가리지 않는다', () => {
    expect(matchesSearch('V-bar 랫 풀 다운', 'v-bar')).toBe(true)
  })
  it('관계없는 검색어는 안 걸린다', () => {
    expect(matchesSearch('몬스터 글루트', '벤치')).toBe(false)
  })
})
