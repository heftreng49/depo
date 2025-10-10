// sw.js - Basit önbellekleme
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('heft-reng-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/favicon.ico'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
