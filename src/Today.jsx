import { useState, useEffect } from 'react'
import { BUILTIN, MUSCLES, EQUIPMENT } from './exercises'
import ExercisePicker from './ExercisePicker'
import RestTimer from './RestTimer'
import History from './History'
import { saveSession, getSession, addCustomExercise, listCustomExercises } from './db'
import { calories, volume, stars as calcStars, recentAvgVolume } from './calc'
import { buildEvent } from './calendarEvent'
import { connectGoogle, upsertEvent, isConnected } from './google'
import { parseDeepLink } from './validate'

const todayStr = () => new Date().toLocaleDateString('sv-SE')
const nowHM = () => new Date().toTimeString().slice(0, 5)
const todayLabel = () => new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })

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

// props: sessions(최신순)·weights(오름차순)는 App이 들고 있고, 세션을 저장하면 onSaved()로 다시 읽게 한다.
export default function Today({ sessions, weights, onSaved }) {
  const today = todayStr()
  const [started, setStarted] = useState(false)
  const [start, setStart] = useState(nowHM())
  const [entries, setEntries] = useState([])
  const [memo, setMemo] = useState('')
  const [eventId, setEventId] = useState(null)

  const [exerciseList, setExerciseList] = useState(BUILTIN)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerMuscle, setPickerMuscle] = useState('전체')
  const [customForm, setCustomForm] = useState(null) // {name, met, type, muscle, equipment}

  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | calendar_fail | empty
  const [saveMsg, setSaveMsg] = useState('')

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
        if (s.entries.length > 0 && !s.eventId && isConnected()) {
          setSaveState('calendar_fail')
          setSaveMsg('캘린더 미전송 기록이 있어요')
        }
      }

      // 텔레그램 딥링크(?muscle=가슴 / ?add=1) — 바로 종목 추가 화면을 연다
      const link = parseDeepLink(location.search)
      if (link?.muscle) {
        history.replaceState(null, '', location.pathname)
        setStarted(true)
        setPickerMuscle(link.muscle)
        setPickerOpen(true)
      }
    })()
  }, [])

  // 세션 카드(.lg-heavy)가 생기거나 사라지면 렌즈 재부착
  useEffect(() => { window.LiquidGlass?.apply() }, [started])

  // 텔레그램 미니앱: 내부 화면(종목 선택/직접 추가)에서 BackButton 표시, 최상위에선 숨김
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg?.initData) return
    if (!pickerOpen && !customForm) { tg.BackButton.hide(); return }
    const back = () => { setPickerOpen(false); setCustomForm(null) }
    tg.BackButton.onClick(back)
    tg.BackButton.show()
    return () => tg.BackButton.offClick(back)
  }, [pickerOpen, customForm])

  // 첫 추가면 세션 시작 시각을 지금으로. 저장 뒤 이어서 추가하는 경우(entries 남아 있음)엔 시작 시각 유지.
  function openPicker(muscle = '전체') {
    if (!started) {
      if (entries.length === 0) setStart(nowHM())
      setStarted(true)
    }
    setPickerMuscle(muscle)
    setPickerOpen(true)
  }

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

  async function uploadToCalendar(session) {
    const kcalWeight = weights.length ? weights[weights.length - 1].kg : 60
    const kcal = calories(session, kcalWeight)
    const avgVolume = recentAvgVolume(sessions, today) // 오늘은 제외하는 평균이라 저장 직전 목록으로 충분
    const st = calcStars({ volume: volume(session), avgVolume, kcal, inPeriod: false })
    const event = buildEvent({ session, stars: st, kcal })
    try {
      const newEventId = await upsertEvent(event, session.eventId || null)
      await saveSession({ ...session, eventId: newEventId })
      setEventId(newEventId)
      setSaveState('saved')
      setSaveMsg('캘린더에 올라갔어요 ✓')
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
      setSaveMsg('운동 종목을 먼저 추가해주세요')
      return
    }
    setSaveState('saving')
    let end = nowHM()
    // 자정을 넘긴 세션(예: 23:50 시작)은 저장/캘린더 모두 그날 23:59로 마감한다 (ponytail: 단순 상한, 실제 다음날 종료 시각이 필요해지면 날짜 넘김 지원 추가)
    if (end < start) end = '23:59'
    const session = { date: today, start, end, entries, memo, eventId }
    await saveSession(session)
    setStarted(false)
    onSaved()
    // 캘린더 미연결이면 조용히 로컬 저장만 (연결은 측정 탭 하단 설정에서)
    if (!isConnected()) { setSaveState('saved'); setSaveMsg('저장했어요 ✓'); return }
    await uploadToCalendar(session)
  }

  return (
    <div>
      {pickerOpen && (
        <ExercisePicker
          exercises={exerciseList}
          initialMuscle={pickerMuscle}
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

      {/* 종목 선택 중에도 RestTimer 가 계속 돌아야 하므로 unmount 대신 숨긴다 */}
      <div style={{ display: pickerOpen || customForm ? 'none' : undefined }}>
        <h2>오늘 운동<em>{todayLabel()}</em></h2>
        <button className="big-btn" onClick={() => openPicker()}>＋ 운동 추가</button>

        {started && (
          <div className="card glass lg-heavy">
            <div className="glass-layers" aria-hidden="true">
              <span className="gl-dist" /><span className="gl-tint" /><span className="gl-shine" />
            </div>

            <label className="field">
              시작 시각
              <input type="time" value={start} onChange={e => setStart(e.target.value)} />
            </label>

            {entries.length === 0 && <div className="text-sm">위의 ＋ 운동 추가로 종목을 골라주세요</div>}

            {entries.map((e, i) => (
              <div key={i} className="entry-row">
                <div className="entry-header">
                  <div className="entry-header-info">
                    <strong>{e.name}</strong>
                    {e.type === 'weight' && (
                      <span className="text-sm">
                        볼륨 <span className="num">{entryVolume(e)}</span>
                        {(e.muscles || []).length > 0 && ` · ${e.muscles.join(' · ')}`}
                      </span>
                    )}
                  </div>
                  <button className="icon-btn" onClick={() => removeEntry(i)} aria-label="종목 삭제">🗑️</button>
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
                          <button className="icon-btn danger" onClick={() => removeSet(i, si)} aria-label="세트 삭제">✕</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addSet(i)}>＋ 세트 추가</button>
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

            <label className="field">
              메모
              <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="오늘 컨디션이나 메모" />
            </label>
          </div>
        )}

        {weights.length === 0 && (
          <div className="notice">측정 탭에서 몸무게를 기록하면 칼로리가 정확해져요 (지금은 60kg 기준)</div>
        )}

        {started && (
          <button className="big-btn" onClick={handleFinish} disabled={saveState === 'saving'}>
            운동 종료 · 저장
          </button>
        )}

        {saveState === 'empty' && <div className="notice">{saveMsg}</div>}
        {saveState === 'saved' && <div className="notice success">{saveMsg}</div>}
        {saveState === 'calendar_fail' && (
          <div className="notice error">
            {saveMsg}
            <button onClick={handleRetry}>다시 시도</button>
          </div>
        )}

        <History sessions={sessions} />
      </div>
    </div>
  )
}
