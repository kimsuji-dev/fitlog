import { describe, it, expect } from 'vitest'
import { sessionMinutes, calories, volume, stars, recentAvgVolume } from '../src/calc.js'

const weightEntry = (kg, reps, n) => ({ name: 'x', met: 5, type: 'weight', sets: Array(n).fill({ reps, kg }) })
const session = (over = {}) => ({ date: '2026-08-17', start: '18:00', end: '19:00', entries: [], memo: '', eventId: null, ...over })

describe('calc', () => {
  it('sessionMinutes', () => {
    expect(sessionMinutes(session())).toBe(60)
    expect(sessionMinutes(session({ start: '18:30', end: '19:10' }))).toBe(40)
  })

  it('calories: 웨이트만 — MET×체중×시간, 균등 분배', () => {
    // 60분, 웨이트 2종목(각 30분), met 5, 체중 60 → 5×60×0.5 ×2 = 300
    const s = session({ entries: [weightEntry(50, 10, 3), weightEntry(40, 10, 3)] })
    expect(calories(s, 60)).toBe(300)
  })

  it('calories: 유산소는 자기 시간, 나머지를 웨이트에', () => {
    // 60분 중 러닝 20분(met 8): 8×60×(20/60)=160. 웨이트 1종목이 남은 40분: 5×60×(40/60)=200. 합 360
    const s = session({ entries: [
      { name: '러닝', met: 8, type: 'cardio', minutes: 20, km: 3 },
      weightEntry(50, 10, 3),
    ] })
    expect(calories(s, 60)).toBe(360)
  })

  it('volume: Σ reps×kg', () => {
    const s = session({ entries: [weightEntry(60, 10, 3)] }) // 3×10×60
    expect(volume(s)).toBe(1800)
  })

  it('stars: 평균 대비 상대 등급', () => {
    expect(stars({ volume: 1000, avgVolume: 1000, kcal: 0, inPeriod: false })).toBe(3) // ratio 1.0
    expect(stars({ volume: 400, avgVolume: 1000, kcal: 0, inPeriod: false })).toBe(1)  // 0.4
    expect(stars({ volume: 1500, avgVolume: 1000, kcal: 0, inPeriod: false })).toBe(5) // 1.5
  })

  it('stars: 생리 기간엔 기준이 85%로 낮아져 후해진다', () => {
    // ratio = 900/1000 = 0.9 → 3성. 생리 중: 900/850 = 1.06 → 3성? 아니 1.06 < 1.1 → 3성. 경계 확인용으로 950 사용
    // 평시: 950/1000 = 0.95 → 3성. 생리: 950/850 ≈ 1.118 → 4성
    expect(stars({ volume: 950, avgVolume: 1000, kcal: 0, inPeriod: false })).toBe(3)
    expect(stars({ volume: 950, avgVolume: 1000, kcal: 0, inPeriod: true })).toBe(4)
  })

  it('stars: 이력 없으면 칼로리 폴백', () => {
    expect(stars({ volume: 0, avgVolume: 0, kcal: 500, inPeriod: false })).toBe(4)
    expect(stars({ volume: 0, avgVolume: 0, kcal: 100, inPeriod: false })).toBe(1)
  })

  it('recentAvgVolume: 28일 내만 평균', () => {
    const sessions = [
      session({ date: '2026-08-10', entries: [weightEntry(50, 10, 2)] }), // vol 1000
      session({ date: '2026-06-01', entries: [weightEntry(99, 10, 9)] }), // 오래됨, 제외
    ]
    expect(recentAvgVolume(sessions, '2026-08-17')).toBe(1000)
  })
})
