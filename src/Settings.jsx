import { useState, useEffect } from 'react'
import { getProfile, setProfile, addWeight, listWeights, exportAll } from './db'
import { connectGoogle, isConnected } from './google'

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function Settings() {
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [lastWeight, setLastWeight] = useState(null) // {date, kg}
  const [connected, setConnected] = useState(isConnected())
  const [msg, setMsg] = useState('')

  useEffect(() => {
    (async () => {
      const profile = await getProfile()
      if (profile?.heightCm) setHeightCm(String(profile.heightCm))
      const weights = await listWeights()
      if (weights.length) setLastWeight(weights[weights.length - 1])
    })()
  }, [])

  async function saveHeight() {
    if (!heightCm) return
    await setProfile({ heightCm: Number(heightCm) })
    setMsg('키 저장했어요 📏')
  }

  async function saveWeight() {
    if (!weightKg) return
    const today = todayStr()
    await addWeight(today, Number(weightKg))
    setLastWeight({ date: today, kg: Number(weightKg) })
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
    </div>
  )
}
