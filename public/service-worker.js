const CACHE_NAME = 'rushbasket-cache-v6';
const DYNAMIC_CACHE_NAME = 'rushbasket-dynamic-v6';
const STATIC_CACHE_NAME = 'rushbasket-static-v6';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event - Cache Static Assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Failed to cache some assets:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that don't match current version
          if (cacheName !== CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch Event - Network First for API, Cache First for Static Assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Exclude API requests and extensions from cache
  if (request.url.includes('/api/') || request.url.startsWith('chrome-extension')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline', success: false }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Network-first for JS/CSS files (to prevent MIME type errors on new builds)
  if (url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // If the server returns HTML instead of JS/CSS, it means the Vercel rewrite caught it
          // This happens when an old JS chunk is requested after a new deployment.
          const contentType = networkResponse.headers.get('content-type') || '';
          if (contentType.includes('text/html')) {
            throw new Error('Server returned HTML fallback for a static asset');
          }

          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache if network fails or returned HTML
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            
            // If it's a JS file and it's missing from BOTH network and cache, the app is fundamentally broken
            // Return a script that clears caches and forces a hard reload to get the new index.html
            if (url.pathname.endsWith('.js')) {
               return new Response(
                 "caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => window.location.reload(true));",
                 { headers: { 'Content-Type': 'application/javascript' } }
               );
            }
            return new Response('Not found', { status: 404 });
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

// ============================================
// PUSH NOTIFICATION EVENT HANDLERS
// ============================================

// Handle push events (received from server)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);

  if (!event.data) {
    console.warn('[SW] Push event has no data');
    return;
  }

  let notificationData;
  
  try {
    notificationData = event.data.json();
    console.log('[SW] Push data:', notificationData);
  } catch (e) {
    console.warn('[SW] Failed to parse push data as JSON:', e);
    notificationData = {
      title: 'New Notification',
      body: event.data.text() || 'You have a new notification',
      icon: '/icon-192x192.png'
    };
  }

  const options = {
    body: notificationData.body || '',
    icon: notificationData.icon || '/icon-192x192.png',
    badge: notificationData.badge || '/badge-72x72.png',
    tag: notificationData.tag || `notification-${Date.now()}`,
    requireInteraction: notificationData.requireInteraction !== false,
    actions: notificationData.actions || [],
    data: notificationData.data || {},
    timestamp: notificationData.timestamp || Date.now(),
    vibrate: [200, 100, 200],
    renotify: true,
    silent: false,
    // Ensure notification shows even when tab is not active
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'New Notification', options)
      .catch(err => {
        console.error('[SW] Failed to show notification:', err);
      })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();

  const notificationData = event.notification.data || {};
  let targetUrl = notificationData.url || '/';
  
  // Handle action buttons
  if (event.action === 'view-order') {
    targetUrl = '/admin/orders';
  } else if (event.action === 'dismiss') {
    return;
  }

  // Ensure target URL is absolute
  if (!targetUrl.startsWith('http')) {
    targetUrl = self.location.origin + (targetUrl.startsWith('/') ? targetUrl : '/' + targetUrl);
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url && client.url.includes(self.location.origin)) {
          console.log('[SW] Focusing existing client:', client.url);
          return client.focus().then(() => {
            return client.navigate(targetUrl);
          }).catch(err => {
            console.warn('[SW] Failed to focus/navigate client:', err);
            // Open new window if navigation fails
            if (clients.openWindow) {
              return clients.openWindow(targetUrl);
            }
          });
        }
      }
      
      // Otherwise, open a new window
      console.log('[SW] Opening new window:', targetUrl);
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }).catch(err => {
      console.error('[SW] Error handling notification click:', err);
    })
  );
});

// Handle notification close (dismissed by user)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// Sync event for background sync (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    console.log('[SW] Background sync triggered');
    // Handle background sync if needed
  }
});
