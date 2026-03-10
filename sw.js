// ════════════════════════════════════════════════════════════════════
//  Heftreng Service Worker v2
//  Cache stratejisi: Stale-While-Revalidate + Offline fallback
// ════════════════════════════════════════════════════════════════════

const CACHE_NAME     = 'heftreng-v2';
const STATIC_CACHE   = 'heftreng-static-v2';
const DYNAMIC_CACHE  = 'heftreng-dynamic-v2';
const OFFLINE_URL    = '/';

// Statik olarak önbelleğe alınacak kaynaklar
const STATIC_ASSETS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons+Round',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
];

// ── Install ──────────────────────────────────────────────────────────
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { mode: 'no-cors' })));
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── Activate ────────────────────────────────────────────────────────
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) {
          return k !== STATIC_CACHE && k !== DYNAMIC_CACHE;
        }).map(function(k) {
          return caches.delete(k);
        })
      );
    }).then(function() {
      // Sayfayı hemen kontrol al
      return self.clients.claim();
    }).then(function() {
      // Güncelleme mesajı gönder
      return self.clients.matchAll({ type: 'window' });
    }).then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({ type: 'SW_UPDATED' });
      });
    })
  );
});

// ── Fetch (Stale-While-Revalidate) ─────────────────────────────────
self.addEventListener('fetch', function(e) {
  var req = e.request;

  // POST vb. istekleri geç
  if (req.method !== 'GET') return;

  // Firebase / Firestore API isteklerini geç (her zaman ağdan al)
  if (req.url.includes('firestore.googleapis.com') ||
      req.url.includes('firebase') ||
      req.url.includes('googleapis.com/identitytoolkit') ||
      req.url.includes('securetoken.google.com')) {
    return;
  }

  // Navigasyon (sayfa yükleme) — Network first, offline fallback
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function(resp) {
        var cloned = resp.clone();
        caches.open(DYNAMIC_CACHE).then(function(cache) {
          cache.put(req, cloned);
        });
        return resp;
      }).catch(function() {
        return caches.match(req).then(function(cached) {
          return cached || caches.match(OFFLINE_URL);
        });
      })
    );
    return;
  }

  // Statik assets (font, icon, CDN) — Cache first, revalidate arka planda
  e.respondWith(
    caches.match(req).then(function(cached) {
      var fetchPromise = fetch(req).then(function(resp) {
        if (resp && resp.status === 200) {
          var cloned = resp.clone();
          caches.open(DYNAMIC_CACHE).then(function(cache) {
            cache.put(req, cloned);
          });
        }
        return resp;
      }).catch(function() { return null; });

      return cached || fetchPromise;
    })
  );
});

// ── Push Notification ────────────────────────────────────────────────
self.addEventListener('push', function(e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch(x) {}

  var title   = data.title   || 'Heftreng';
  var body    = data.body    || 'Yeni bir bildirim var';
  var icon    = data.icon    || 'https://raw.githubusercontent.com/heftreng49/depo/master/icons/icon-192.png';
  var badge   = data.badge   || 'https://raw.githubusercontent.com/heftreng49/depo/master/icons/icon-72.png';
  var url     = data.url     || '/';
  var tag     = data.tag     || 'heftreng-notif';

  e.waitUntil(
    self.registration.showNotification(title, {
      body    : body,
      icon    : icon,
      badge   : badge,
      tag     : tag,
      vibrate : [200, 100, 200],
      data    : { url: url },
      actions : [
        { action: 'open',    title: 'Aç'    },
        { action: 'dismiss', title: 'Kapat' }
      ]
    })
  );
});

// ── Notification Click ───────────────────────────────────────────────
self.addEventListener('notificationclick', function(e) {
  e.notification.close();

  if (e.action === 'dismiss') return;

  var targetUrl = (e.notification.data && e.notification.data.url) || '/';

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
      // Açık sekme varsa odaklan
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].url.includes(targetUrl) && 'focus' in clients[i]) {
          return clients[i].focus();
        }
      }
      // Yoksa yeni sekme aç
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ── Background Sync ─────────────────────────────────────────────────
self.addEventListener('sync', function(e) {
  if (e.tag === 'heftreng-sync') {
    e.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(function(clients) {
        clients.forEach(function(c) {
          c.postMessage({ type: 'BG_SYNC' });
        });
      })
    );
  }
});
