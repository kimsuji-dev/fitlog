import { describe, it, expect, beforeAll } from 'vitest'
import { cloudDB, cloudKey, isTelegram } from '../src/tgcloud.js'

// CloudStorage 콜백 시그니처 (error, result) 그대로 흉내낸 인메모리 목
function mockCS() {
  const m = new Map()
  return {
    setItem: (k, v, cb) => { m.set(k, String(v)); cb(null, true) },
    getItem: (k, cb) => cb(null, m.get(k) ?? ''),
    getItems: (ks, cb) => cb(null, Object.fromEntries(ks.map(k => [k, m.get(k) ?? '']))),
    getKeys: cb => cb(null, [...m.keys()]),
    removeItem: (k, cb) => { m.delete(k); cb(null, true) },
  }
}

beforeAll(() => {
  globalThis.window = { Telegram: { WebApp: { initData: 'query_id=x', CloudStorage: mockCS() } } }
})

describe('tgcloud 키 설계', () => {
  it('키는 CloudStorage 허용 문자(A-Za-z0-9_-)만 쓴다 — 한글 하위 키 포함', () => {
    for (const k of [cloudKey('weights', '2026-08-22'), cloudKey('favorites', '데드리프트'), cloudKey('profile', 'me')])
      expect(k).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('put/get/getAll — keyPath 추출, 스토어 프리픽스 분리, 키 오름차순', async () => {
    await cloudDB.put('weights', { date: '2026-08-15', kg: 60 })
    await cloudDB.put('weights', { date: '2026-08-01', kg: 61 })
    await cloudDB.put('favorites', true, '데드리프트')
    expect(await cloudDB.get('weights', '2026-08-15')).toEqual({ date: '2026-08-15', kg: 60 })
    expect((await cloudDB.getAll('weights')).map(w => w.date)).toEqual(['2026-08-01', '2026-08-15'])
    expect(await cloudDB.getAllKeys('favorites')).toEqual(['데드리프트'])
    await cloudDB.delete('favorites', '데드리프트')
    expect(await cloudDB.get('favorites', '데드리프트')).toBeUndefined()
  })

  it('initData가 비면 텔레그램 아님', () => {
    expect(isTelegram()).toBe(true)
    globalThis.window.Telegram.WebApp.initData = ''
    expect(isTelegram()).toBe(false)
    globalThis.window.Telegram.WebApp.initData = 'query_id=x'
  })
})
