import { describe, it, expect } from 'vitest'
import { clampSeconds } from '../src/RestTimer.jsx'

describe('clampSeconds', () => {
  it('floors at 10', () => {
    expect(clampSeconds(0)).toBe(10)
    expect(clampSeconds(-50)).toBe(10)
  })

  it('caps at 600', () => {
    expect(clampSeconds(1000)).toBe(600)
  })

  it('passes through in-range values', () => {
    expect(clampSeconds(60)).toBe(60)
    expect(clampSeconds(10)).toBe(10)
    expect(clampSeconds(600)).toBe(600)
  })
})
