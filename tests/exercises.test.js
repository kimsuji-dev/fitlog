import { describe, it, expect } from 'vitest'
import { BUILTIN, MUSCLES, EQUIPMENT } from '../src/exercises.js'

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

  it('종목 이름은 중복되지 않는다', () => {
    const names = BUILTIN.map(e => e.name)
    expect(new Set(names).size).toBe(names.length)
  })
})
