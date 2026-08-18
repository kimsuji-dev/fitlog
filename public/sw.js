const CACHE_NAME = 'fitlog-v1'
const APP_SHELL = ['/fitlog/']

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)))
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
})

self.addEventListener('fetch', event => {
  const req = event.request
  if (req.method !== 'GET' || !req.url.startsWith('http')) return
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res.ok && new URL(req.url).origin === self.location.origin) {
          caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()))
        }
        return res
      }).catch(() => cached)
      return cached || network
    })
  )
})
