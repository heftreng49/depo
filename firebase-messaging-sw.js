/* Heftreng — Firebase Cloud Messaging Service Worker
 * Repo: heftreng49/depo → firebase-messaging-sw.js
 * Bu dosya Blogger'da doğrudan serve edilemez.
 * Theme içinde Blob URL yöntemiyle kaydedilir (SW_URL değişkeni).
 */

importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey           : 'AIzaSyCZByW_n4B888Ec4cjNQDoQovU-rVN75gs',
  authDomain       : 'bloggerheftreng.firebaseapp.com',
  projectId        : 'bloggerheftreng',
  storageBucket    : 'bloggerheftreng.firebasestorage.app',
  messagingSenderId: '854520441903',
  appId            : '1:854520441903:web:3972b80e9c97d922cfaada'
});

var messaging = firebase.messaging();

/* Arka planda (sayfa kapalıyken) gelen push bildirimleri */
messaging.onBackgroundMessage(function(payload) {
  var n   = payload.notification || {};
  var d   = payload.data         || {};
  var url = d.url || n.click_action || 'https://heft-reng.blogspot.com';

  return self.registration.showNotification(n.title || 'Heftreng', {
    body             : n.body  || '',
    icon             : n.icon  || 'https://raw.githubusercontent.com/heftreng49/depo/master/icons/icon-192.png',
    badge            : 'https://raw.githubusercontent.com/heftreng49/depo/master/icons/icon-72.png',
    vibrate          : [200, 100, 200],
    tag              : d.tag || 'heftreng',
    requireInteraction: false,
    data             : { url: url }
  });
});

/* Bildirime tıklanınca sayfayı aç veya öne getir */
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || 'https://heft-reng.blogspot.com';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(cls) {
      for (var i = 0; i < cls.length; i++) {
        if (cls[i].url === url && 'focus' in cls[i]) return cls[i].focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
