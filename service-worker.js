/** @format */

// service-worker.js

// 1. Update the cache version number to v2
const CACHE_NAME = "bingo-generator-cache-v2";

// 2. Updated list of all critical files to pre-cache
const FILES_TO_CACHE = [
  "/", // The root path (important for offline loading)
  "./index.html",
  "./style.css", // <-- NEW: Separate CSS file
  "./script.js", // <-- NEW: Separate JS file
  "./manifest.json",
  "./icon-192.png",
  // Add any other icons, fonts, or assets here
];

// Event: install (pre-cache resources)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching App Shell");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // Forces the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Event: activate (clean up old caches)
self.addEventListener("activate", (event) => {
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
  // We only intercept requests that don't start with a special protocol
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return file from cache if found, otherwise fetch from network
        return response || fetch(event.request);
      })
    );
  }
});
