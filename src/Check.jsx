import { useState } from 'react'

// 오늘 체크 — 스트레칭·이노시톨·스쿼트를 앱 안에서 체크한다 (2026-09-24, 개별 리마인더 폐지).
// Telegram.WebApp.sendData 는 하단 키보드의 web_app 버튼으로 연 개인 대화에서만 동작한다.
// 브리지(fit_loop)가 web_app_data 를 받아 습관-기록.md 에 쓴다. 앱은 보내고 닫힌다.
const ITEMS = [
  { id: 'stretch', label: '🧘 아침 스트레칭' },
  { id: 'inositol', label: '💊 이노시톨' },
  { id: 'stretch_pm', label: '🌙 저녁 스트레칭' },
]

export default function Check() {
  const [on, setOn] = useState({})
  const [squat, setSquat] = useState(0)
  const tg = window.Telegram?.WebApp
  const canSend = Boolean(tg?.initData)
  const any = ITEMS.some(i => on[i.id]) || squat > 0

  const send = () => {
    tg.sendData(JSON.stringify({ check: { ...on, squat } }))
  }

  return (
    <div className="card glass">
      <h2>오늘 체크</h2>
      <div className="chip-row">
        {ITEMS.map(i => (
          <button key={i.id} className={`chip${on[i.id] ? ' active' : ''}`}
            onClick={() => setOn(o => ({ ...o, [i.id]: !o[i.id] }))}>{i.label}</button>
        ))}
      </div>
      <div className="chip-row" style={{ marginTop: 12 }}>
        <button className="chip" onClick={() => setSquat(s => Math.max(0, s - 50))}>−50</button>
        <span style={{ alignSelf: 'center' }}>🏋️ 스쿼트 +{squat}</span>
        <button className="chip" onClick={() => setSquat(s => s + 50)}>+50</button>
      </div>
      <button className="big-btn" style={{ marginTop: 16 }} disabled={!canSend || !any} onClick={send}>
        {canSend ? '클로이한테 보내기' : '텔레그램 키보드의 ✅ 버튼으로 열어야 보낼 수 있어'}
      </button>
    </div>
  )
}
