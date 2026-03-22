const CACHE_NAME = 'rushbasket-cache-v1';
const DYNAMIC_CACHE_NAME = 'rushbasket-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

// Install Event - Cache Static Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First for API, Cache First for Static Assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Exclude API requests and extensions from cache
  if (request.url.includes('/api/') || request.url.startsWith('chrome-extension')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Fallback for API offline (optional)
        return new Response(JSON.stringify({ error: 'Offline', success: false }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Stale-While-Revalidate for other GET requests
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          // Cache the dynamic response
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => null);

        // Return cached or wait for network
        return cachedResponse || fetchPromise.then(res => {
            if(!res) {
                // Return offline fallback if network fails and not in cache
                if(request.headers.get('accept').includes('text/html')){
                    return caches.match('/');
                }
            }
            return res;
        });
      })
    );
  }
});
