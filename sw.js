/* ═══════════════════════════════════════════════════════
   Heftreng Service Worker — v5
   Blob URL uyumlu — importScripts YOK
   ═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'heftreng-v5';
const ICON_URL   = 'https://raw.githubusercontent.com/heftreng49/depo/master/icons/icon-192.png';
const BADGE_URL  = 'https://raw.githubusercontent.com/heftreng49/depo/master/icons/icon-72.png';
const SITE_URL   = 'https://heft-reng.blogspot.com';

self.addEventListener('install',  e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        var cl = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, cl));
        return res;
      });
    })
  );
});

self.addEventListener('push', e => {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch(x) {}
  const title = d.title || 'Heftreng';
  const url   = d.url   || SITE_URL;
  e.waitUntil(
    self.registration.showNotification(title, {
      body    : d.body  || '',
      icon    : d.icon  || ICON_URL,
      badge   : BADGE_URL,
      tag     : 'heftreng',
      renotify: true,
      vibrate : [200, 100, 200],
      data    : { url }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || SITE_URL;
  e.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      for(var c of list){
        if(c.url === url && 'focus' in c) return c.focus();
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if(e.data && e.data.type === 'SW_CHECK')
    e.source && e.source.postMessage({ type:'SW_UPDATED' });
});
