import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'fitlog.restSeconds'
const MIN_SEC = 10
const MAX_SEC = 600
const STEP_SEC = 10

export const clampSeconds = sec => Math.min(MAX_SEC, Math.max(MIN_SEC, sec))

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    gain.gain.value = 0.15
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
    osc.onended = () => ctx.close()
  } catch {
    // AudioContext 없으면 그냥 조용히 넘어간다
  }
}

export default function RestTimer() {
  const [duration, setDuration] = useState(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY))
    return clampSeconds(saved || 60)
  })
  const [remaining, setRemaining] = useState(duration)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(duration))
  }, [duration])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          setDone(true)
          beep()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  function adjust(delta) {
    const next = clampSeconds(duration + delta)
    setDuration(next)
    if (!running) setRemaining(next)
  }

  function start() {
    setDone(false)
    setRemaining(duration)
    setRunning(true)
  }

  function stop() {
    setRunning(false)
    setDone(false)
    setRemaining(duration)
  }

  return (
    <div className={`card rest-timer ${done ? 'rest-timer-done' : ''}`}>
      <div>⏱️ 휴식 타이머</div>
      <div className="rest-timer-display">
        {done ? '🔔 땡! 다음 세트 가즈아' : `${remaining} 초`}
      </div>
      <div className="rest-timer-controls">
        <button onClick={() => adjust(-STEP_SEC)} disabled={running}>−</button>
        <button onClick={() => adjust(STEP_SEC)} disabled={running}>+</button>
        {!running
          ? <button className="rest-timer-play" onClick={start}>▶</button>
          : <button className="rest-timer-play" onClick={stop}>■</button>}
      </div>
    </div>
  )
}
