const CACHE_NAME = 'frog-music-cache-v2';
const OFFLINE_URL = '/';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Cache-first for static resources, network-only for api calls and audio streams
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strictly skip API searches and Googlevideo streams
  if (
    url.pathname.startsWith('/api') || 
    url.hostname.includes('googlevideo.com') || 
    url.pathname.includes('/stream/') ||
    url.pathname.includes('/lyrics/') ||
    url.pathname.includes('/related/')
  ) {
    return;
  }

  // Only handle local page assets (scripts, styles, layouts, local images)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch new version in background to update cache dynamically
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Cache static assets on the fly
        if (
          response.status === 200 && 
          (event.request.destination === 'script' || 
           event.request.destination === 'style' || 
           event.request.destination === 'image' || 
           event.request.destination === 'font')
        ) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
