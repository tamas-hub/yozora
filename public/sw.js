const CACHE_VERSION = 'yozora-v1'
const APP_CACHE = `${CACHE_VERSION}-app`
const DATA_CACHE = `${CACHE_VERSION}-data`
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/yozora-192.png',
  './icons/yozora-512.png',
  './icons/yozora-maskable-512.png',
  './icons/apple-touch-icon.png',
]

function sameOriginUrl(path, base) {
  if (!path || path.startsWith('data:')) return null
  const url = new URL(path, base)
  return url.origin === self.location.origin ? url.href : null
}

async function discoverBuildAssets() {
  const indexUrl = new URL('./index.html', self.location.href)
  const indexResponse = await fetch(indexUrl)
  if (!indexResponse.ok) throw new Error('Could not fetch the app shell')

  const html = await indexResponse.text()
  const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => sameOriginUrl(match[1], indexUrl))
    .filter(Boolean)

  const cssUrls = assets.filter((url) => new URL(url).pathname.endsWith('.css'))
  for (const cssUrl of cssUrls) {
    const cssResponse = await fetch(cssUrl)
    if (!cssResponse.ok) continue
    const css = await cssResponse.text()
    for (const match of css.matchAll(/url\((?:['"]?)([^)'"\s]+)(?:['"]?)\)/g)) {
      const asset = sameOriginUrl(match[1], cssUrl)
      if (asset) assets.push(asset)
    }
  }

  return [...new Set([...APP_SHELL, ...assets])]
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then(async (cache) => cache.addAll(await discoverBuildAssets())),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('yozora-') && key !== APP_CACHE && key !== DATA_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) await cache.put(request, response.clone()).catch(() => undefined)
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    throw new Error('Network unavailable and no cached response exists')
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(APP_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) await cache.put(request, response.clone()).catch(() => undefined)
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, APP_CACHE).catch(() => caches.match('./')),
    )
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request))
    return
  }

  if (
    url.hostname === 'api.open-meteo.com' ||
    url.hostname === 'api.wheretheiss.at' ||
    url.hostname === 'celestrak.org'
  ) {
    event.respondWith(networkFirst(request, DATA_CACHE))
  }
})
