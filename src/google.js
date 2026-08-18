const CLIENT_ID = '605479068933-jvj3100oeflrat01r4ka9on2b1qhjnhf.apps.googleusercontent.com'
const SCOPE = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly'

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
  const calendarId = localStorage.getItem('fitlog.calendarId') || 'primary'
  const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
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

export async function listCalendars() {
  if (!accessToken) throw new Error('not_connected')
  const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=writer', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 401) { accessToken = null; sessionStorage.removeItem('gcal_token'); throw new Error('token_expired') }
  if (!res.ok) throw new Error(`calendar_error_${res.status}`)
  const data = await res.json()
  return (data.items || []).map(item => ({ id: item.id, summary: item.summary, primary: !!item.primary }))
}
