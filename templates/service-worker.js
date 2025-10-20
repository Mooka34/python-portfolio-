const CACHE = 'fake-jobs-v1';
const ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/static/styles.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
