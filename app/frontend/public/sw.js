const CACHE_NAME = 'cleanfix-harish-v7-mobile-install-recovery';
const LEGACY_RENDER_HOST = 'cleanfixharish-web.onrender.com';
const OFFICIAL_ORIGIN = 'https://www.cleanfixharish.co.il';
const IS_LEGACY_RENDER_ORIGIN = self.location.hostname === LEGACY_RENDER_HOST;
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

function hasAuthHeader(request) {
  return request.headers.has('Authorization');
}

function isStaticAsset(url) {
  return STATIC_ASSETS.includes(url.pathname)
    || url.pathname.startsWith('/icons/')
    || url.pathname.startsWith('/assets/');
}

function shouldNeverCache(request) {
  const url = new URL(request.url);

  if (request.method !== 'GET') return true;
  if (!isSameOrigin(url)) return true;
  if (isApiRequest(url)) return true;
  if (hasAuthHeader(request)) return true;
  if (request.mode === 'navigate') return true;
  if (!isStaticAsset(url)) return true;

  return false;
}

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

// Fetch - never cache API, authenticated, navigation, or non-static responses
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (IS_LEGACY_RENDER_ORIGIN && event.request.mode === 'navigate') {
    const url = new URL(event.request.url);
    event.respondWith(Response.redirect(`${OFFICIAL_ORIGIN}${url.pathname}${url.search}`, 308));
    return;
  }

  if (shouldNeverCache(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(event.request).then((response) => {
          const responseUrl = new URL(response.url);
          if (response.ok && isSameOrigin(responseUrl)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
      .catch(() => caches.match(event.request))
  );
});
