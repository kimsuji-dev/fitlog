const CACHE_NAME = 'fitlog-v2'
const APP_SHELL = ['/fitlog/']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const req = event.request
  if (req.method !== 'GET' || !req.url.startsWith('http')) return
  const sameOrigin = new URL(req.url).origin === self.location.origin

  // index.html은 network-first: 캐시 우선으로 주면 새 빌드의 해시된 JS를 영영 못 받는다.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()))
          return res
        })
        .catch(() => caches.match(req).then(c => c || caches.match('/fitlog/')))
    )
    return
  }

  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res.ok && sameOrigin) {
          caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()))
        }
        return res
      }).catch(() => cached)
      return cached || network
    })
  )
})
