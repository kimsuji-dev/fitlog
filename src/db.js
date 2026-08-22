import { openDB } from 'idb'
import { cloudDB, isTelegram } from './tgcloud'

// 텔레그램 미니앱이면 CloudStorage, 아니면 IndexedDB — 인터페이스가 같아 아래 함수들은 분기 없음.
const dbp = isTelegram() ? Promise.resolve(cloudDB) : openDB('fitlog', 4, {
  upgrade(d, oldVersion) {
    if (oldVersion < 1) {
      d.createObjectStore('profile')
      d.createObjectStore('weights', { keyPath: 'date' })
      d.createObjectStore('sessions', { keyPath: 'date' })
      d.createObjectStore('diet')
      d.createObjectStore('periods', { keyPath: 'start' })
      d.createObjectStore('customExercises', { keyPath: 'name' })
    }
    if (oldVersion < 2) {
      d.createObjectStore('inositol')
    }
    if (oldVersion < 3) {
      d.createObjectStore('restdays')
    }
    if (oldVersion < 4) {
      d.createObjectStore('favorites')
    }
  },
})

export const getProfile = async () => (await dbp).get('profile', 'me')
export const setProfile = async p => (await dbp).put('profile', p, 'me')

export const addWeight = async (date, kg) => (await dbp).put('weights', { date, kg })
export const listWeights = async () => (await dbp).getAll('weights') // keyPath=date라 오름차순

export const saveSession = async s => (await dbp).put('sessions', s)
export const getSession = async date => (await dbp).get('sessions', date)
export const listSessions = async () => (await (await dbp).getAll('sessions')).reverse() // keyPath=date 오름차순 → 뒤집어 최신순

export const setDiet = async (date, rating) => (await dbp).put('diet', rating, date)
export const getDiet = async date => (await dbp).get('diet', date)
export const listDietDates = async () => (await dbp).getAllKeys('diet')

export const startPeriod = async date => (await dbp).put('periods', { start: date, end: null })
export const endPeriod = async date => {
  const d = await dbp
  const open = (await d.getAll('periods')).find(p => !p.end)
  if (open) await d.put('periods', { ...open, end: date })
}
export const listPeriods = async () => (await dbp).getAll('periods')
export const isInPeriod = async date =>
  (await listPeriods()).some(p => p.start <= date && (p.end === null || date <= p.end))

export const addCustomExercise = async e => (await dbp).put('customExercises', e)
export const listCustomExercises = async () => (await dbp).getAll('customExercises')

export const setInositol = async (date, taken) => (await dbp).put('inositol', taken, date)
export const getInositol = async date => Boolean(await (await dbp).get('inositol', date))
export const listInositolDates = async () => (await dbp).getAllKeys('inositol')

export const setRestDay = async (date, resting) => (await dbp).put('restdays', resting, date)
export const getRestDay = async date => Boolean(await (await dbp).get('restdays', date))
export const listRestDays = async () => (await dbp).getAllKeys('restdays')

export const toggleFavorite = async name => {
  const d = await dbp
  const cur = await d.get('favorites', name)
  if (cur) await d.delete('favorites', name)
  else await d.put('favorites', true, name)
}
export const isFavorite = async name => Boolean(await (await dbp).get('favorites', name))
export const listFavorites = async () => (await dbp).getAllKeys('favorites')

export const exportAll = async () => {
  const d = await dbp
  return {
    profile: await d.get('profile', 'me'),
    weights: await d.getAll('weights'),
    sessions: await d.getAll('sessions'),
    diet: await Promise.all((await d.getAllKeys('diet')).map(async k => ({ date: k, rating: await d.get('diet', k) }))),
    periods: await d.getAll('periods'),
    customExercises: await d.getAll('customExercises'),
    inositol: await Promise.all((await d.getAllKeys('inositol')).map(async k => ({ date: k, taken: await d.get('inositol', k) }))),
    restdays: await Promise.all((await d.getAllKeys('restdays')).map(async k => ({ date: k, resting: await d.get('restdays', k) }))),
    favorites: await d.getAllKeys('favorites'),
  }
}
