const CACHE_NAME = 'data-collector-offline-cache-v1';

// Initial assets to precache immediately.
// Includes core local files and all external ESM dependencies for absolute offline capability.
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/index.tsx',
  '/vite.svg',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^18.2.0',
  'https://esm.sh/react-dom@^18.2.0/',
  'https://esm.sh/qrcode.react@^3.1.0',
  'https://esm.sh/html-to-image@^1.11.11',
  'https://esm.sh/jspdf@^2.5.1'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache warning during SW install (some assets might be fetched dynamic):', err);
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
      // Background revalidation fetch helper
      const updateCache = () => {
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((err) => console.log('Background cache update failed (fully offline mode):', err));
      };

      if (cachedResponse) {
        // Return from cache immediately, then refresh the cache in the background
        updateCache();
        return cachedResponse;
      }

      // If not in cache, fetch from network and store it
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || (networkResponse.status !== 200 && networkResponse.status !== 0)) {
            return networkResponse;
          }
          
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return networkResponse;
        })
        .catch((error) => {
          console.log('Network request failed, using offline fallback:', error);
          // If offline and navigating, fall back to cached index.html / root
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return null;
        });
    })
  );
});
