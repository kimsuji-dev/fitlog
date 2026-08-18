import { useState, useEffect } from 'react'
import { BUILTIN, MUSCLES, EQUIPMENT } from './exercises'
import ExercisePicker from './ExercisePicker'
import RestTimer from './RestTimer'
import {
  getProfile, addWeight, listWeights, saveSession, getSession, listSessions,
  setDiet, getDiet, startPeriod, endPeriod, isInPeriod, addCustomExercise, listCustomExercises,
  setInositol, getInositol, setRestDay, getRestDay,
} from './db'
import { calories, volume, stars as calcStars, recentAvgVolume } from './calc'
import { buildEvent } from './calendarEvent'
import { connectGoogle, upsertEvent } from './google'
import { parseWeight } from './validate'

const todayStr = () => new Date().toLocaleDateString('sv-SE')
const nowHM = () => new Date().toTimeString().slice(0, 5)
const DIET_OPTS = [
  { rating: 'good', emoji: '🥗', label: '잘 먹음' },
  { rating: 'normal', emoji: '😐', label: '보통' },
  { rating: 'pig', emoji: '🐷', label: '많이 먹음' },
]

function emptyEntry(ex) {
  return ex.type === 'weight'
    ? {
        name: ex.name, met: ex.met, type: 'weight',
        muscles: ex.muscles || [], equipment: ex.equipment || '맨몸',
        sets: [{ reps: 10, kg: 0, done: false }],
      }
    : { name: ex.name, met: ex.met, type: 'cardio', minutes: 20, km: 0 }
}

// 종목 하나의 볼륨(Σ reps×kg) — calc.js의 volume()과 같은 계산을 entry 단위로.
const entryVolume = e => e.sets.reduce((a, s) => a + s.reps * s.kg, 0)

export default function Today() {
  const today = todayStr()
  const [started, setStarted] = useState(false)
  const [start, setStart] = useState(nowHM())
  const [entries, setEntries] = useState([])
  const [memo, setMemo] = useState('')
  const [eventId, setEventId] = useState(null)

  const [exerciseList, setExerciseList] = useState(BUILTIN)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [customForm, setCustomForm] = useState(null) // {name, met, type, muscle, equipment}

  const [diet, setDietState] = useState(null)
  const [inPeriod, setInPeriod] = useState(false)
  const [inositol, setInositolState] = useState(false)
  const [resting, setRestingState] = useState(false)

  const [weightAvailable, setWeightAvailable] = useState(true)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | calendar_fail
  const [saveMsg, setSaveMsg] = useState('')

  const [todayWeight, setTodayWeight] = useState(null) // 오늘 기록된 kg, 없으면 null
  const [weightInput, setWeightInput] = useState('')
  const [weightEditing, setWeightEditing] = useState(false)
  const [weightMsg, setWeightMsg] = useState('')

  useEffect(() => {
    (async () => {
      const custom = await listCustomExercises()
      setExerciseList([...BUILTIN, ...custom])

      const s = await getSession(today)
      if (s) {
        setStarted(true)
        setStart(s.start)
        setEntries(s.entries)
        setMemo(s.memo || '')
        setEventId(s.eventId || null)
        if (s.entries.length > 0 && !s.eventId) {
          setSaveState('calendar_fail')
          setSaveMsg('캘린더 미전송 기록이 있어요')
        }
      }
      const d = await getDiet(today)
      if (d) setDietState(d)
      setInPeriod(await isInPeriod(today))
      setInositolState(await getInositol(today))
      setRestingState(await getRestDay(today))

      const weights = await listWeights()
      setWeightAvailable(weights.length > 0)
      const todayEntry = weights.find(w => w.date === today)
      if (todayEntry) setTodayWeight(todayEntry.kg)
    })()
  }, [])

  function addExercise(ex) {
    setEntries(prev => [...prev, emptyEntry(ex)])
    setPickerOpen(false)
  }

  async function saveCustomExercise() {
    if (!customForm?.name || !customForm?.met) return
    const ex = {
      name: customForm.name,
      met: Number(customForm.met),
      type: customForm.type,
      muscles: customForm.muscle ? [customForm.muscle] : [],
      equipment: customForm.equipment || '맨몸',
    }
    await addCustomExercise(ex)
    setExerciseList(prev => [...prev, ex])
    setCustomForm(null)
    addExercise(ex)
  }

  function updateEntry(i, patch) {
    setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, ...patch } : e))
  }
  function removeEntry(i) {
    setEntries(prev => prev.filter((_, idx) => idx !== i))
  }
  function addSet(i) {
    setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, sets: [...e.sets, { reps: 10, kg: 0, done: false }] } : e))
  }
  function updateSet(i, si, patch) {
    setEntries(prev => prev.map((e, idx) =>
      idx === i ? { ...e, sets: e.sets.map((s, sidx) => sidx === si ? { ...s, ...patch } : s) } : e))
  }
  function removeSet(i, si) {
    setEntries(prev => prev.map((e, idx) =>
      idx === i ? { ...e, sets: e.sets.filter((_, sidx) => sidx !== si) } : e))
  }

  async function handleDiet(rating) {
    await setDiet(today, rating)
    setDietState(rating)
  }

  async function handleInositolToggle() {
    const next = !inositol
    await setInositol(today, next)
    setInositolState(next)
  }

  async function handleSaveWeight() {
    const kg = parseWeight(weightInput)
    if (kg === null) {
      setWeightMsg('올바른 값을 입력해주세요')
      return
    }
    await addWeight(today, kg)
    setTodayWeight(kg)
    setWeightInput('')
    setWeightEditing(false)
    setWeightMsg('')
    setWeightAvailable(true)
  }

  function openWeightEdit() {
    setWeightInput(todayWeight !== null ? String(todayWeight) : '')
    setWeightMsg('')
    setWeightEditing(true)
  }

  async function handleRestToggle() {
    const next = !resting
    await setRestDay(today, next)
    setRestingState(next)
  }

  async function handlePeriodToggle() {
    if (inPeriod) await endPeriod(today)
    else await startPeriod(today)
    setInPeriod(!inPeriod)
  }

  async function uploadToCalendar(session) {
    let kcalWeight = 60
    const weights = await listWeights()
    if (weights.length) kcalWeight = weights[weights.length - 1].kg
    const kcal = calories(session, kcalWeight)
    const sessions = await listSessions()
    const avgVolume = recentAvgVolume(sessions, today)
    const st = calcStars({ volume: volume(session), avgVolume, kcal, inPeriod })
    const event = buildEvent({ session, stars: st, kcal, diet, inPeriod, inositol: await getInositol(today) })
    try {
      const newEventId = await upsertEvent(event, session.eventId || null)
      await saveSession({ ...session, eventId: newEventId })
      setEventId(newEventId)
      setSaveState('saved')
      setSaveMsg('캘린더에 올라갔어요 ✅')
    } catch (err) {
      setSaveState('calendar_fail')
      setSaveMsg('캘린더 업로드 실패 — ' + err.message)
    }
  }

  async function handleRetry() {
    const session = await getSession(today)
    if (!session) return
    if (['not_connected', 'token_expired'].some(m => saveMsg.includes(m))) {
      try { await connectGoogle() } catch { setSaveMsg('구글 연결 실패'); return }
    }
    await uploadToCalendar(session)
  }

  async function handleFinish() {
    if (entries.length === 0) {
      setSaveState('empty')
      setSaveMsg('운동 종목을 추가하거나, 쉬는 날이면 😴 버튼을 눌러주세요')
      return
    }
    setSaveState('saving')
    let end = nowHM()
    // 자정을 넘긴 세션(예: 23:50 시작)은 저장/캘린더 모두 그날 23:59로 마감한다 (ponytail: 단순 상한, 실제 다음날 종료 시각이 필요해지면 날짜 넘김 지원 추가)
    if (end < start) end = '23:59'
    const session = { date: today, start, end, entries, memo, eventId }
    await saveSession(session)
    setStarted(false)
    await uploadToCalendar(session)
  }

  return (
    <div className="today-screen">
      <h2>💪 오늘 기록</h2>

      <div className="card">
        <div>식단</div>
        <div className="diet-row">
          {DIET_OPTS.map(o => (
            <button
              key={o.rating}
              onClick={() => handleDiet(o.rating)}
              className={diet === o.rating ? 'selected' : ''}
              title={o.label}
            >
              {o.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div>💊 이노시톨</div>
        <button className={`big-btn ${inositol ? 'done' : 'off'}`} onClick={handleInositolToggle}>
          {inositol ? '오늘 먹었어요 ✅' : '아직이에요'}
        </button>
      </div>

      {!started && (
        <button className="big-btn" onClick={() => { setStart(nowHM()); setStarted(true) }}>
          🏋️ 운동 시작
        </button>
      )}

      {!started && (
        <div className="card">
          <div>😴 오늘은 쉬어요</div>
          <button className={`big-btn ${resting ? 'done' : 'off'}`} onClick={handleRestToggle}>
            {resting ? '오늘은 쉬는 날 😴' : '😴 오늘은 쉬어요'}
          </button>
        </div>
      )}

      {started && (
        <div className="card">
          <label>
            시작 시각
            <input type="time" value={start} onChange={e => setStart(e.target.value)} />
          </label>

          {entries.map((e, i) => (
            <div key={i} className="entry-row">
              <div className="entry-header">
                <div className="entry-header-info">
                  <strong>{e.name}</strong>
                  {e.type === 'weight' && (
                    <span className="text-sm">
                      볼륨 {entryVolume(e)}
                      {(e.muscles || []).length > 0 && ` · ${e.muscles.join(' · ')}`}
                    </span>
                  )}
                </div>
                <button className="icon-btn" onClick={() => removeEntry(i)}>🗑️</button>
              </div>
              {e.type === 'weight' ? (
                <>
                  <div className="set-table">
                    <div className="set-table-header">
                      <span>세트</span>
                      <span>KG</span>
                      <span>회</span>
                      <span>완료</span>
                      <span></span>
                    </div>
                    {e.sets.map((s, si) => (
                      <div key={si} className="set-table-row">
                        <span className="set-num">{si + 1}</span>
                        <input
                          type="number" inputMode="numeric" min="0" value={s.kg}
                          onChange={ev => updateSet(i, si, { kg: Math.max(0, Number(ev.target.value)) })}
                          placeholder="무게"
                        />
                        <input
                          type="number" inputMode="numeric" min="0" value={s.reps}
                          onChange={ev => updateSet(i, si, { reps: Math.max(0, Number(ev.target.value)) })}
                          placeholder="횟수"
                        />
                        <button
                          className={`set-done-btn ${s.done ? 'done' : ''}`}
                          onClick={() => updateSet(i, si, { done: !s.done })}
                          aria-label="세트 완료"
                        >
                          {s.done ? '✅' : '⬜'}
                        </button>
                        <button className="icon-btn" onClick={() => removeSet(i, si)}>✕</button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => addSet(i)}>➕ 세트 추가</button>
                </>
              ) : (
                <div className="set-row">
                  <input type="number" min="0" value={e.minutes} onChange={ev => updateEntry(i, { minutes: Math.max(0, Number(ev.target.value)) })} placeholder="분" />
                  <span>분</span>
                  <input type="number" min="0" value={e.km} onChange={ev => updateEntry(i, { km: Math.max(0, Number(ev.target.value)) })} placeholder="km" />
                  <span>km</span>
                </div>
              )}
            </div>
          ))}

          <RestTimer />

          {!pickerOpen && !customForm && (
            <button onClick={() => setPickerOpen(true)}>➕ 종목 추가</button>
          )}

          {pickerOpen && (
            <ExercisePicker
              exercises={exerciseList}
              onSelect={addExercise}
              onAddCustom={() => { setPickerOpen(false); setCustomForm({ name: '', met: '', type: 'weight', muscle: '', equipment: '맨몸' }) }}
              onClose={() => setPickerOpen(false)}
            />
          )}

          {customForm && (
            <div className="card">
              <input placeholder="종목명" value={customForm.name} onChange={e => setCustomForm({ ...customForm, name: e.target.value })} />
              <input placeholder="MET" type="number" value={customForm.met} onChange={e => setCustomForm({ ...customForm, met: e.target.value })} />
              <select value={customForm.type} onChange={e => setCustomForm({ ...customForm, type: e.target.value })}>
                <option value="weight">웨이트</option>
                <option value="cardio">유산소</option>
              </select>
              <select value={customForm.muscle} onChange={e => setCustomForm({ ...customForm, muscle: e.target.value })}>
                <option value="">부위 선택 안 함</option>
                {MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={customForm.equipment} onChange={e => setCustomForm({ ...customForm, equipment: e.target.value })}>
                {EQUIPMENT.map(eq => <option key={eq} value={eq}>{eq}</option>)}
              </select>
              <button onClick={saveCustomExercise}>저장</button>
              <button onClick={() => setCustomForm(null)}>취소</button>
            </div>
          )}

          <label>
            메모
            <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="오늘 컨디션이나 메모" />
          </label>
        </div>
      )}

      {!weightAvailable && (
        <div className="notice">⚖️ 설정에서 몸무게를 입력하세요 (기본 60kg로 계산)</div>
      )}

      {started && (
        <button className="big-btn" onClick={handleFinish} disabled={saveState === 'saving'}>
          ✅ 운동 종료 & 저장 💰
        </button>
      )}

      {saveState === 'empty' && <div className="notice">{saveMsg}</div>}
      {saveState === 'saved' && <div className="notice success">{saveMsg}</div>}
      {saveState === 'calendar_fail' && (
        <div className="notice error">
          {saveMsg}
          <button onClick={handleRetry}>🔄 다시 시도</button>
        </div>
      )}

      <div className="card">
        <button onClick={handlePeriodToggle}>
          {inPeriod ? '생리 끝! ✅' : '생리터졋슴 🩸'}
        </button>
      </div>

      <div className="card">
        <div>⚖️ 몸무게 <span className="text-sm">(2주에 한 번이면 충분해요)</span></div>
        {todayWeight !== null && !weightEditing ? (
          <div className="set-row">
            <span>오늘 {todayWeight}kg ✅</span>
            <button className="icon-btn" onClick={openWeightEdit}>수정</button>
          </div>
        ) : (
          <div className="set-row">
            <input
              type="text" inputMode="decimal" value={weightInput}
              onChange={e => setWeightInput(e.target.value)} placeholder="kg"
            />
            <span>kg</span>
            <button onClick={handleSaveWeight}>기록</button>
          </div>
        )}
        {weightMsg && <div className="notice">{weightMsg}</div>}
      </div>
    </div>
  )
}
