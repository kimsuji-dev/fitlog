import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import * as db from '../src/db.js'

describe('db', () => {
  it('profile 저장/조회', async () => {
    await db.setProfile({ heightCm: 165 })
    expect(await db.getProfile()).toEqual({ heightCm: 165 })
  })

  it('몸무게는 날짜 오름차순으로 나온다', async () => {
    await db.addWeight('2026-08-15', 60)
    await db.addWeight('2026-08-01', 61)
    const w = await db.listWeights()
    expect(w.map(x => x.date)).toEqual(['2026-08-01', '2026-08-15'])
  })

  it('사이즈(가슴/허리/엉덩이)는 선택 입력이고, 다시 몸무게만 저장해도 기존 사이즈가 유지된다', async () => {
    await db.addWeight('2026-08-20', 58, { chest: 90, waist: 70 })
    let w = (await db.listWeights()).find(x => x.date === '2026-08-20')
    expect(w).toMatchObject({ kg: 58, chest: 90, waist: 70 })
    expect(w.hip).toBeUndefined()

    await db.addWeight('2026-08-20', 58.5) // 사이즈 없이 재저장 — 기존 사이즈 안 지워져야 함
    w = (await db.listWeights()).find(x => x.date === '2026-08-20')
    expect(w).toMatchObject({ kg: 58.5, chest: 90, waist: 70 })
  })

  it('세션 저장/조회, 목록은 최신순', async () => {
    await db.saveSession({ date: '2026-08-10', start: '18:00', end: '19:00', entries: [], memo: '', eventId: null })
    await db.saveSession({ date: '2026-08-17', start: '18:00', end: '19:00', entries: [], memo: '', eventId: null })
    expect((await db.getSession('2026-08-10')).date).toBe('2026-08-10')
    expect((await db.listSessions()).map(s => s.date)).toEqual(['2026-08-17', '2026-08-10'])
  })

  it('식단 평가 저장/조회', async () => {
    await db.setDiet('2026-08-17', 'pig')
    expect(await db.getDiet('2026-08-17')).toBe('pig')
  })

  it('생리 기간: 시작→진행중, 종료→범위 판정', async () => {
    await db.startPeriod('2026-08-10')
    expect(await db.isInPeriod('2026-08-12')).toBe(true)   // 진행 중 (end null)
    await db.endPeriod('2026-08-14')
    expect(await db.isInPeriod('2026-08-12')).toBe(true)   // 범위 내
    expect(await db.isInPeriod('2026-08-16')).toBe(false)  // 범위 밖
  })

  it('exportAll은 모든 스토어를 담는다', async () => {
    const all = await db.exportAll()
    for (const k of ['profile', 'weights', 'sessions', 'diet', 'periods', 'customExercises', 'inositol', 'restdays'])
      expect(all).toHaveProperty(k)
  })

  it('쉬는 날 저장/조회', async () => {
    await db.setRestDay('2026-08-18', true)
    expect(await db.getRestDay('2026-08-18')).toBe(true)
    expect(await db.listRestDays()).toContain('2026-08-18')
  })
})
