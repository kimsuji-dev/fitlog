import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const tg = window.Telegram?.WebApp
if (tg) {
  tg.ready()
  tg.expand()
  // 먹빛 유리 UI에 맞춰 텔레그램 헤더·배경도 같은 먹빛으로 (hex 헤더색은 6.9+, 그 아래 버전은 warn/throw 하므로 건너뜀)
  if (tg.isVersionAtLeast?.('6.9')) { tg.setHeaderColor('#0a0a0c'); tg.setBackgroundColor('#0a0a0c') }
}

createRoot(document.getElementById('root')).render(<App />)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js')
}
