import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const tg = window.Telegram?.WebApp
if (tg) { tg.ready(); tg.expand() }

createRoot(document.getElementById('root')).render(<App />)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js')
}
