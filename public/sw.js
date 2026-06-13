const CACHE_NAME = 'data-collector-offline-cache-v1';

// Initial assets to precache immediately.
// Vite dev server dynamically compiles files like index.tsx, but having these in precache establishes instant boot.
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache warning during SW install:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Helper to determine if a request should be cached
function shouldCache(request) {
  // Only handle GET requests
  if (request.method !== 'GET') return false;

  const url = request.url;
  // Ignore browser extensions (chrome-extension:// etc)
  if (!url.startsWith('http')) return false;

  // Ignore WebSockets (e.g., Vite build websockets or HMR connections)
  if (url.includes('socket.io') || url.includes('ws://') || url.includes('wss://')) return false;

  return true;
}

self.addEventListener('fetch', (event) => {
  if (!shouldCache(event.request)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached object immediately, then update cache in the background (Stale-While-Revalidate)
        if (navigator.onLine) {
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              }
            })
            .catch((err) => console.log('Background fetch failed: ', err));
        }
        return cachedResponse;
      }

      // If not in cache, fetch from network and store it
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return networkResponse;
        })
        .catch((error) => {
          console.log('Network request failed, check offline state:', error);
          // If offline and navigating, fall back to cached index.html / root
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return null;
        });
    })
  );
});
