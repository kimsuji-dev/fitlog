import { useState, useEffect } from 'react'
import { getProfile, setProfile, addWeight, listWeights, exportAll } from './db'
import { connectGoogle, isConnected } from './google'

const todayStr = () => new Date().toLocaleDateString('sv-SE')

export default function Settings({ active } = {}) {
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [lastWeight, setLastWeight] = useState(null) // {date, kg}
  const [connected, setConnected] = useState(isConnected())
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!active) return
    (async () => {
      const profile = await getProfile()
      if (profile?.heightCm) setHeightCm(String(profile.heightCm))
      const weights = await listWeights()
      if (weights.length) setLastWeight(weights[weights.length - 1])
    })()
  }, [active])

  // 쉼표 소수점('58,5')도 받아주고, 빈 문자열/NaN을 걸러낸다 (Number('')는 0이라 그냥 두면 0이 저장됨)
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
    setMsg('키 저장했어요 📏')
  }

  async function saveWeight() {
    const kg = parseNum(weightKg)
    if (!Number.isFinite(kg) || kg < 20 || kg > 300) {
      setMsg('올바른 값을 입력해주세요')
      return
    }
    const today = todayStr()
    await addWeight(today, kg)
    setLastWeight({ date: today, kg })
    setWeightKg('')
    setMsg('오늘 몸무게 기록했어요 ⚖️')
  }

  async function handleConnect() {
    try {
      await connectGoogle()
      setConnected(true)
      setMsg('구글 캘린더 연결됐어요 🔗')
    } catch {
      setMsg('구글 연결 실패')
    }
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
    <div className="settings-screen">
      <h2>⚙️ 설정</h2>

      <div className="card">
        <div>📏 키</div>
        <div className="set-row">
          <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="cm" />
          <span>cm</span>
          <button onClick={saveHeight}>저장</button>
        </div>
      </div>

      <div className="card">
        <div>⚖️ 몸무게</div>
        <div className="set-row">
          <input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="kg" />
          <span>kg</span>
          <button onClick={saveWeight}>오늘 기록</button>
        </div>
        {lastWeight && <div className="notice">마지막 기록: {lastWeight.date} · {lastWeight.kg}kg</div>}
      </div>

      <div className="card">
        <div>🔗 구글 캘린더</div>
        {connected
          ? <div className="notice success">연결됨 ✅</div>
          : <button onClick={handleConnect}>구글 캘린더 연결</button>}
      </div>

      <div className="card">
        <div>💾 백업</div>
        <button onClick={handleExport}>데이터 내보내기 (JSON)</button>
      </div>

      {msg && <div className="notice">{msg}</div>}

      <div className="card">
        <div>📚 건강 정보 출처</div>
        <div className="text-sm">
          2023 International Evidence-based Guideline for the Assessment and Management of PCOS (Monash University / ASRM)
          <br />
          Diabetes Care (2013): Three 15-min bouts of post-meal walking improve 24-h glycemic control
          <br />
          JCEM (2024): Inositol for PCOS — systematic review informing the 2023 PCOS guideline update
          <br />
          CDC: Folic Acid — About / Clinical overview (400 mcg daily, start ≥1 month before conception)
          <br />
          Fertility & Sterility (2022): Preconception weight reduction in women and men with obesity and infertility
          <br />
          운동 사진: free-exercise-db (퍼블릭 도메인)
        </div>
        <div className="text-sm">이 앱의 건강 문구는 일반적인 정보이며, 진료를 대신하지 않아요.</div>
      </div>
    </div>
  )
}
