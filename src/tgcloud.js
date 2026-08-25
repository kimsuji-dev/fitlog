// Telegram CloudStorage를 idb 인터페이스(get/put/delete/getAll/getAllKeys)로 감싼 어댑터.
// CloudStorage 키는 A-Za-z0-9_- 만 허용(128자) → 하위 키를 base64url로 인코딩해 `{store}_{b64url(key)}`로 저장.
const KEYPATH = { weights: 'date', sessions: 'date', periods: 'start', customExercises: 'name' }

export const isTelegram = () =>
  typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp?.initData)

const enc = k => btoa(String.fromCharCode(...new TextEncoder().encode(String(k))))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const dec = s => new TextDecoder().decode(
  Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)))

export const cloudKey = (store, key) => `${store}_${enc(key)}`

// CloudStorage 콜백은 (error, result) — 성공 시 error가 null.
const call = (fn, ...args) => new Promise((resolve, reject) =>
  window.Telegram.WebApp.CloudStorage[fn](...args, (err, result) =>
    err ? reject(new Error(String(err))) : resolve(result)))

const storeKeys = async store => {
  const prefix = store + '_'
  return (await call('getKeys'))
    .filter(k => k.startsWith(prefix))
    .map(k => ({ raw: k, key: dec(k.slice(prefix.length)) }))
    .sort((a, b) => (a.key < b.key ? -1 : 1)) // idb처럼 키 오름차순
}

export const cloudDB = {
  async get(store, key) {
    const v = await call('getItem', cloudKey(store, key))
    return v ? JSON.parse(v) : undefined
  },
  async put(store, value, key) {
    const k = key ?? value[KEYPATH[store]]
    const s = JSON.stringify(value)
    if (s.length > 4096)
      console.warn(`fitlog: ${store}/${k} 값 ${s.length}자 — CloudStorage 4096자 제한 초과, 저장 실패 가능`) // ponytail: 청킹 없음, 실제로 넘치면 그때 분할 저장
    await call('setItem', cloudKey(store, k), s)
    return k
  },
  async delete(store, key) {
    await call('removeItem', cloudKey(store, key))
  },
  async getAllKeys(store) {
    return (await storeKeys(store)).map(e => e.key)
  },
  async getAll(store) {
    const entries = await storeKeys(store)
    if (entries.length === 0) return []
    const items = await call('getItems', entries.map(e => e.raw))
    // 읽히지 않는 항목 하나 때문에 목록 전체가 깨지지 않게 건너뛴다.
    // (JSON.parse(undefined)는 예외를 던져서, 키 하나만 비어도 기록이 통째로 안 보였다)
    return entries.reduce((acc, e) => {
      try {
        acc.push(JSON.parse(items[e.raw]))
      } catch {
        console.warn(`fitlog: ${store}/${e.key} 를 읽지 못해 건너뜀`)
      }
      return acc
    }, [])
  },
}
