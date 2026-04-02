/* ═══════════════════════════════════════════════════════
   Heftreng Service Worker — v4 (FCM + Cache)
   GitHub: heftreng49/depo/sw.js
   ═══════════════════════════════════════════════════════ */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyCZByW_n4B888Ec4cjNQDoQovU-rVN75gs',
  authDomain:        'bloggerheftreng.firebaseapp.com',
  projectId:         'bloggerheftreng',
  storageBucket:     'bloggerheftreng.firebasestorage.app',
  messagingSenderId: '854520441903',
  appId:             '1:854520441903:web:3972b80e9c97d922cfaada'
});

const messaging = firebase.messaging();

const CACHE_NAME = 'heftreng-v4';
const ICON_URL   = 'https://raw.githubusercontent.com/heftreng49/depo/master/icons/icon-192.png';
const BADGE_URL  = 'https://raw.githubusercontent.com/heftreng49/depo/master/icons/icon-72.png';
const SITE_URL   = 'https://heft-reng.blogspot.com';

/* ── Install & Activate ── */
self.addEventListener('install',  e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

/* ── Fetch (cache) ── */
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

/* ── FCM Arka plan bildirimleri ── */
messaging.onBackgroundMessage(payload => {
  const d     = payload.data || payload.notification || {};
  const title = d.title || 'Heftreng';
  const body  = d.body  || 'Yeni bildirim';
  const url   = d.url   || SITE_URL;

  return self.registration.showNotification(title, {
    body,
    icon    : d.icon  || ICON_URL,
    badge   : BADGE_URL,
    tag     : 'heftreng-' + Date.now(),
    vibrate : [200, 100, 200],
    data    : { url }
  });
});

/* ── Web Push (VAPID fallback) ── */
self.addEventListener('push', e => {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch(x) {}
  const title = d.title || 'Heftreng';
  const url   = d.url   || SITE_URL;
  e.waitUntil(
    self.registration.showNotification(title, {
      body   : d.body  || '',
      icon   : d.icon  || ICON_URL,
      badge  : BADGE_URL,
      data   : { url }
    })
  );
});

/* ── Bildirime tıkla ── */
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

/* ── Tema güncellemesi mesajı ── */
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if(e.data && e.data.type === 'SW_CHECK')
    e.source && e.source.postMessage({ type:'SW_UPDATED' });
});
