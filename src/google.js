const CLIENT_ID = 'REPLACE_ME.apps.googleusercontent.com' // 사용자 발급 후 교체
const SCOPE = 'https://www.googleapis.com/auth/calendar.events'

let accessToken = sessionStorage.getItem('gcal_token')

export const isConnected = () => !!accessToken

export function connectGoogle() {
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: resp => {
        if (resp.error) return reject(new Error(resp.error))
        accessToken = resp.access_token
        sessionStorage.setItem('gcal_token', accessToken)
        resolve()
      },
    })
    client.requestAccessToken()
  })
}

export async function upsertEvent(event, eventId) {
  if (!accessToken) throw new Error('not_connected')
  const base = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
  const url = eventId ? `${base}/${eventId}` : base
  const res = await fetch(url, {
    method: eventId ? 'PUT' : 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })
  if (res.status === 401) { accessToken = null; sessionStorage.removeItem('gcal_token'); throw new Error('token_expired') }
  if (!res.ok) throw new Error(`calendar_error_${res.status}`)
  return (await res.json()).id
}
