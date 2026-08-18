const DIET_EMOJI = { good: '🥗', normal: '😐', pig: '🐷' }

function entryLine(e) {
  if (e.type === 'cardio') {
    return `- ${e.name} ${e.minutes}분${e.km ? ` ${e.km}km` : ''}`
  }
  const reps = e.sets.map(s => s.reps).join(',')
  const kgs = [...new Set(e.sets.map(s => s.kg))]
  const kgStr = kgs.length === 1 ? `×${kgs[0]}kg` : `×${e.sets.map(s => s.kg).join(',')}kg`
  return `- ${e.name} ${e.sets.length}세트 ×${reps} ${kgStr}`
}

export function buildEvent({ session, stars, kcal, diet, inPeriod, inositol }) {
  const starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars)
  let summary = `💪 운동 ${starStr} (~${kcal}kcal)`
  if (diet) summary += ` ${DIET_EMOJI[diet]}`
  if (inositol) summary += ' 💊'
  if (inPeriod) summary += ' 🩸'

  const lines = session.entries.map(entryLine)
  if (inPeriod) lines.push('🩸 생리 기간 보정 적용')
  if (session.memo) lines.push(`메모: ${session.memo}`)

  return {
    summary,
    description: lines.join('\n'),
    start: { dateTime: `${session.date}T${session.start}:00`, timeZone: 'Asia/Seoul' },
    end: { dateTime: `${session.date}T${session.end}:00`, timeZone: 'Asia/Seoul' },
  }
}
