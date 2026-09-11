// MyDopa Service Worker
// Version 1.0 — Push Notifications

const CACHE_NAME = 'dopamine-v46';

// Install — activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Activate — delete all old caches, then claim all clients immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch — network-first for index.html, no cache
self.addEventListener('fetch', event => {
  if (event.request.url.endsWith('/') || event.request.url.includes('index.html') || event.request.url.includes('app.html')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
});

// Push — fires when a notification arrives from the server
self.addEventListener('push', event => {
  let data = {
    title: 'MyDopa',
    body: 'Your 3 good things are waiting. What just made you smile?',
    url: 'https://mydopa.app'
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    tag: 'dopamine-daily',        // Replaces previous if user hasn't tapped
    requireInteraction: false,
    silent: false,
    data: { url: data.url || 'https://mydopa.app' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click — open the app
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : 'https://mydopa.app';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        // If app is already open, focus it
        for (const client of clients) {
          if (client.url.includes('mydopa.app') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// Notification close — log for future analytics
self.addEventListener('notificationclose', event => {
  // Future: log dismissal to Supabase for engagement tracking
  console.log('MyDopa notification dismissed');
});
