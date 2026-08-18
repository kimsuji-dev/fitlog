const toMin = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }

// 자정을 넘긴 세션(예: 23:50~00:30)은 차이가 음수로 나오므로 하루(1440분)를 더해 보정한다.
export const sessionMinutes = s => {
  const diff = toMin(s.end) - toMin(s.start)
  return diff < 0 ? diff + 1440 : diff
}

export function calories(s, bodyKg) {
  const total = sessionMinutes(s)
  const cardio = s.entries.filter(e => e.type === 'cardio')
  const weights = s.entries.filter(e => e.type === 'weight')
  const cardioMin = cardio.reduce((a, e) => a + e.minutes, 0)
  const perWeight = weights.length ? Math.max(0, total - cardioMin) / weights.length : 0
  let kcal = 0
  for (const e of cardio) kcal += e.met * bodyKg * (e.minutes / 60)
  for (const e of weights) kcal += e.met * bodyKg * (perWeight / 60)
  return Math.round(kcal)
}

export const volume = s =>
  s.entries.filter(e => e.type === 'weight')
    .reduce((a, e) => a + e.sets.reduce((b, set) => b + set.reps * set.kg, 0), 0)

export function stars({ volume: v, avgVolume, kcal, inPeriod }) {
  if (!avgVolume) {
    if (kcal < 150) return 1
    if (kcal < 300) return 2
    if (kcal < 450) return 3
    if (kcal < 600) return 4
    return 5
  }
  const ratio = v / (avgVolume * (inPeriod ? 0.85 : 1))
  if (ratio < 0.5) return 1
  if (ratio < 0.8) return 2
  if (ratio < 1.1) return 3
  if (ratio < 1.4) return 4
  return 5
}

export function recentAvgVolume(sessions, todayDate) {
  const cutoff = new Date(new Date(todayDate) - 28 * 86400e3).toISOString().slice(0, 10)
  const recent = sessions.filter(s => s.date >= cutoff && s.date < todayDate)
  if (!recent.length) return 0
  return recent.reduce((a, s) => a + volume(s), 0) / recent.length
}
