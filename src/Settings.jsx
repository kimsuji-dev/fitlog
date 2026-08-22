import { useState, useEffect } from 'react'
import { getProfile, setProfile, exportAll } from './db'
import { connectGoogle, isConnected, listCalendars } from './google'

const todayStr = () => new Date().toLocaleDateString('sv-SE')

// 측정 탭 하단의 접이식 '프로필 · 설정'. 키는 현재 계산에 안 쓰여 참고용으로만 저장한다.
export default function Settings() {
  const [heightCm, setHeightCm] = useState('')
  const [connected, setConnected] = useState(isConnected())
  const [msg, setMsg] = useState('')
  const [calendars, setCalendars] = useState(null) // [{id, summary, primary}] | null
  const [calendarId, setCalendarId] = useState(localStorage.getItem('fitlog.calendarId') || 'primary')
  const [calendarMsg, setCalendarMsg] = useState('')

  useEffect(() => {
    getProfile().then(profile => { if (profile?.heightCm) setHeightCm(String(profile.heightCm)) })
  }, [])

  // 쉼표 소수점('165,5')도 받아주고, 빈 문자열/NaN을 걸러낸다 (Number('')는 0이라 그냥 두면 0이 저장됨)
  function parseNum(raw) {
    const n = Number(String(raw).trim().replace(',', '.'))
    return Number.isFinite(n) ? n : NaN
  }

  async function saveHeight() {
    const cm = parseNum(heightCm)
    if (!Number.isFinite(cm) || cm < 100 || cm > 250) {
      setMsg('올바른 값을 입력해주세요')
      return
    }
    await setProfile({ heightCm: cm })
    setMsg('키 저장했어요')
  }

  async function handleConnect() {
    try {
      await connectGoogle()
      setConnected(true)
      setMsg('구글 캘린더 연결됐어요')
    } catch {
      setMsg('구글 연결 실패')
    }
  }

  async function handleLoadCalendars() {
    try {
      const list = await listCalendars()
      setCalendars(list)
      setCalendarMsg('')
    } catch {
      setCalendars(null)
      setCalendarMsg('권한이 추가로 필요해요 — 구글 연결을 다시 눌러주세요')
    }
  }

  function handleSelectCalendar(id) {
    setCalendarId(id)
    localStorage.setItem('fitlog.calendarId', id)
    const cal = calendars?.find(c => c.id === id)
    setCalendarMsg(cal ? `이제 '${cal.summary}' 캘린더에 올라가요 ♪` : '')
  }

  async function handleExport() {
    const data = await exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fitlog-backup-${todayStr()}.json`
    a.click()
  }

  return (
    <details>
      <summary className="settings-summary">프로필 · 설정</summary>
      <div className="card">
        <div>키</div>
        <div className="set-row">
          <input type="text" inputMode="decimal" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="cm" />
          <span>cm</span>
          <button onClick={saveHeight}>저장</button>
        </div>

        <div>구글 캘린더 <span className="text-sm">(운동 저장 시 일정으로 올라가요)</span></div>
        {connected
          ? <div className="notice success">연결됨 ✓</div>
          : <button onClick={handleConnect}>구글 캘린더 연결</button>}
        {connected && (
          <>
            <button onClick={handleLoadCalendars}>캘린더 목록 불러오기</button>
            {calendars && (
              <select value={calendarId} onChange={e => handleSelectCalendar(e.target.value)}>
                {calendars.map(c => (
                  <option key={c.id} value={c.id}>{c.summary}{c.primary ? ' (기본)' : ''}</option>
                ))}
              </select>
            )}
            {calendarMsg && (
              <div className={`notice ${calendars ? 'success' : 'error'}`}>
                {calendarMsg}
                {!calendars && <button onClick={handleConnect}>구글 캘린더 연결</button>}
              </div>
            )}
          </>
        )}

        <div>백업</div>
        <button onClick={handleExport}>데이터 내보내기 (JSON)</button>

        {msg && <div className="notice">{msg}</div>}

        <div className="text-sm">운동 사진: free-exercise-db (퍼블릭 도메인)</div>
      </div>
    </details>
  )
}
