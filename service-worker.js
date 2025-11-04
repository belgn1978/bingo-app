// service-worker.js
// Update the cache version number whenever you make changes
const CACHE_NAME = "bingo-generator-cache-v4";

// IMPORTANT: Files are in root directory
// If your repo is at https://username.github.io/ (root)
// then BASE_PATH should be empty string
const BASE_PATH = "";

// List of all critical files to pre-cache
const FILES_TO_CACHE = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/style.css`,
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
        // Log which files failed
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

// Event: activate (clean up old caches)
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: Deleting old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Immediately claims all clients (pages) so they start using the new worker
  self.clients.claim();
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