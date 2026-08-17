import { describe, it, expect } from 'vitest'
import { buildEvent } from '../src/calendarEvent.js'

const base = {
  session: {
    date: '2026-08-17', start: '18:00', end: '19:10',
    entries: [
      { name: '벤치프레스', met: 5, type: 'weight', sets: [{ reps: 10, kg: 60 }, { reps: 10, kg: 60 }, { reps: 8, kg: 60 }] },
      { name: '러닝', met: 8, type: 'cardio', minutes: 20, km: 3 },
    ],
    memo: '컨디션 좋음', eventId: null,
  },
  stars: 3, kcal: 420, diet: 'good', inPeriod: false,
}

describe('buildEvent', () => {
  it('제목: 별·칼로리·식단 이모지', () => {
    const e = buildEvent(base)
    expect(e.summary).toBe('💪 운동 ★★★☆☆ (~420kcal) 🥗')
  })

  it('생리 기간이면 제목에 🩸, 설명에 보정 문구', () => {
    const e = buildEvent({ ...base, inPeriod: true })
    expect(e.summary).toContain('🩸')
    expect(e.description).toContain('🩸 생리 기간 보정 적용')
  })

  it('식단 없으면 이모지 생략', () => {
    expect(buildEvent({ ...base, diet: null }).summary).toBe('💪 운동 ★★★☆☆ (~420kcal)')
  })

  it('설명: 종목별 한 줄 + 메모', () => {
    const d = buildEvent(base).description
    expect(d).toContain('- 벤치프레스 3세트 ×10,10,8 ×60kg')
    expect(d).toContain('- 러닝 20분 3km')
    expect(d).toContain('메모: 컨디션 좋음')
  })

  it('시작/종료 dateTime + 타임존', () => {
    const e = buildEvent(base)
    expect(e.start).toEqual({ dateTime: '2026-08-17T18:00:00', timeZone: 'Asia/Seoul' })
    expect(e.end).toEqual({ dateTime: '2026-08-17T19:10:00', timeZone: 'Asia/Seoul' })
  })
})
