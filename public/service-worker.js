const CACHE_NAME = 'rushbasket-cache-v2';
const DYNAMIC_CACHE_NAME = 'rushbasket-dynamic-v2';

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

// ============================================
// PUSH NOTIFICATION EVENT HANDLERS
// ============================================

// Handle push events (received from server)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);

  let notificationData;
  
  try {
    notificationData = event.data.json();
  } catch (e) {
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
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();

  const notificationData = event.notification.data;
  let targetUrl = notificationData.url || '/admin/orders';
  
  // Handle action buttons
  if (event.action === 'view-order' && notificationData.orderId) {
    targetUrl = `/admin/orders`;
  } else if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            return client.navigate(targetUrl);
          });
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
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
