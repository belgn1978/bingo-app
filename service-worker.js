// service-worker.js
// Update the cache version number whenever you make changes
const CACHE_NAME = "bingo-generator-cache-v12";
const BASE_PATH = "/bingo-app";

// List of all critical files to pre-cache
const FILES_TO_CACHE = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/404.html`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/styles.css`,
  `${BASE_PATH}/script.js`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/icon-512.png`,
];

// Event: install (pre-cache resources)
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching App Shell");
      return cache.addAll(FILES_TO_CACHE).catch((err) => {
        console.error("Service Worker: Cache addAll failed:", err);
        FILES_TO_CACHE.forEach((file) => {
          fetch(file).catch((fetchErr) => {
            console.error(`Failed to fetch: ${file}`, fetchErr);
          });
        });
      });
    })
  );
  // Forces the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Event: activate (clean up old caches and notify about updates)
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const deletionPromises = cacheNames.map((cacheName) => {
        if (cacheName !== CACHE_NAME) {
          console.log("Service Worker: Deleting old cache", cacheName);
          return caches.delete(cacheName);
        }
      });
      
      // After cleaning up old caches, send notification about update
      return Promise.all(deletionPromises).then(() => {
        // Check if this is an update (not first install)
        return self.clients.matchAll().then((clients) => {
          if (clients.length > 0) {
            // This is an update, show notification
            return self.registration.showNotification("Bingo App Updated! 🎉", {
              body: "New features are available! Open the app to see what's new.",
              icon: `${BASE_PATH}/icon-192.png`,
              badge: `${BASE_PATH}/icon-192.png`,
              tag: "app-update",
              requireInteraction: false,
              vibrate: [200, 100, 200],
              data: {
                url: `${BASE_PATH}/`
              }
            });
          }
        });
      });
    }).then(() => {
      // Immediately claims all clients (pages) so they start using the new worker
      return self.clients.claim();
    })
  );
});

// Event: notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (let client of clientList) {
        if (client.url.includes(BASE_PATH) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not open, open it
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Event: fetch (serve files from cache or network)
self.addEventListener("fetch", (event) => {
  // Only intercept requests to our own domain
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return file from cache if found, otherwise fetch from network
        return (
          response ||
          fetch(event.request).catch((err) => {
            console.error("Fetch failed:", event.request.url, err);
          })
        );
      })
    );
  }
});

// Event: message (listen for skip waiting messages)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});