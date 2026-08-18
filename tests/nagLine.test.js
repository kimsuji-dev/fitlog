import { describe, it, expect } from 'vitest'
import { INFO_LINES } from '../src/NagLine.jsx'

describe('NagLine', () => {
  it('건강 정보 문구는 정확히 60개', () => {
    expect(INFO_LINES.length).toBe(60)
  })
})
