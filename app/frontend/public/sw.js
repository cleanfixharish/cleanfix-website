const CACHE_NAME = 'cleanfix-harish-v3-cf-gold';
const LEGACY_RENDER_HOST = 'cleanfixharish-web.onrender.com';
const OFFICIAL_ORIGIN = 'https://www.cleanfixharish.co.il';
const IS_LEGACY_RENDER_ORIGIN = self.location.hostname === LEGACY_RENDER_HOST;
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  if (IS_LEGACY_RENDER_ORIGIN) {
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => IS_LEGACY_RENDER_ORIGIN || key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (IS_LEGACY_RENDER_ORIGIN && event.request.mode === 'navigate') {
    const url = new URL(event.request.url);
    event.respondWith(Response.redirect(`${OFFICIAL_ORIGIN}${url.pathname}${url.search}`, 308));
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
