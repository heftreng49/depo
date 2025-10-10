// notifications.js
(function() {
  'use strict';

  console.log('🔔 Heft Reng Bildirim Sistemi Yüklendi');

  // === Bildirim İzni ===
  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
          console.log('✅ Bildirim izni verildi');
          showToast('🔔 Bildirimler aktif!');
        }
      });
    }
  }

  // === Küçük Toast Mesajı ===
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'pwa-toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // === Gönderi Sayısını Kaydet / Getir ===
  function saveLastPostCount(count) {
    localStorage.setItem('heft-reng-last-post-count', count);
  }

  function getLastPostCount() {
    return parseInt(localStorage.getItem('heft-reng-last-post-count')) || 0;
  }

  // === Yeni Gönderi Kontrolü ===
  function checkForNewPosts() {
    const feedUrl = window.location.origin + '/feeds/posts/default?alt=json&max-results=1';
    fetch(feedUrl)
      .then(response => response.json())
      .then(data => {
        if (data.feed && data.feed.entry) {
          const latestPost = data.feed.entry[0];
          const postTitle = latestPost.title.$t;
          const postUrl = latestPost.link.find(l => l.rel === 'alternate').href;

          const totalPosts = parseInt(data.feed.openSearch$totalResults.$t);
          const lastKnownCount = getLastPostCount();

          if (lastKnownCount > 0 && totalPosts > lastKnownCount) {
            showNewPostNotification(postTitle, postUrl);
            showToast('🎉 Yeni içerik: ' + postTitle);
          }
          saveLastPostCount(totalPosts);
        }
      })
      .catch(err => console.log('❌ Feed kontrol hatası:', err));
  }

  // === Bildirim Göster ===
  function showNewPostNotification(title, url) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🎨 Heft Reng - Yeni İçerik!', {
        body: title,
        icon: 'https://heft-reng.blogspot.com/favicon.ico',
        badge: 'https://heft-reng.blogspot.com/favicon.ico',
        tag: 'new-post',
        vibrate: [200, 100, 200]
      });

      notification.onclick = function() {
        window.open(url, '_blank');
        notification.close();
      };

      setTimeout(() => notification.close(), 10000);
    }
  }

  // === Çalışma Akışı ===
  setTimeout(requestNotificationPermission, 3000);
  if (getLastPostCount() === 0) checkForNewPosts();
  setInterval(checkForNewPosts, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForNewPosts();
  });

})();
