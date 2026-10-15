// KancilCode Service Worker for 100% Offline-First PWA & Background Sync
const CACHE_NAME = 'kancilcode-pwa-v3.0';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://unpkg.com/blockly/media/click.mp3',
  'https://unpkg.com/blockly/media/delete.mp3',
];

// Install Event: Pre-cache essential offline shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[KancilCode SW] Pre-caching offline shell and assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[KancilCode SW] Pre-cache partial warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[KancilCode SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network-First with Offline Cache Fallback for rock-solid stability
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Don't intercept POST requests, API routes, or HMR dev sockets
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('webpack-hmr')
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // When network is unavailable (100% Offline Mode), serve from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fallback for HTML page navigation when offline
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/');
        }
      })
  );
});

// Background Sync Event: triggers when device regains connectivity
self.addEventListener('sync', (event) => {
  if (event.tag === 'kancilcode-sync-progress') {
    console.log('[KancilCode SW] Background sync event triggered for student progress!');
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'KANCILCODE_TRIGGER_BACKGROUND_SYNC' });
        });
      })
    );
  }
});
