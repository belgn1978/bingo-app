/** @format */

const CACHE_NAME = "bingo-tickets-v1";
// Increment the version number whenever you change the files listed here.
// The new fetch handler will handle daily updates.
const urlsToCache = [
  // IMPORTANT: Use the repository subpath for the root and all files
  "/bingo-app/",
  "/bingo-app/index.html",
  "/bingo-app/manifest.json",
  "/bingo-app/icon-192.png",
  "/bingo-app/icon-512.png",
  // Include any other static assets (CSS, custom fonts, etc.)
  "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap",
];

// 1. Installation: Cache the initial files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      // Force the new service worker to immediately become active
      .then(() => self.skipWaiting())
  );
});

// 2. Activation: Clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      ).then(() => self.clients.claim());
    })
  );
});

// 3. Fetch: Stale-While-Revalidate for Auto-Updates
// This ensures the app loads fast (stale content) but checks the network
// in the background to update the cache (revalidate).
self.addEventListener("fetch", (event) => {
  // Only process GET requests (for static assets)
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      // Check the cache first for the resource.
      return cache.match(event.request).then((cachedResponse) => {
        // Fetch the resource from the network.
        const fetchedResponse = fetch(event.request)
          .then((networkResponse) => {
            // Cache the new response for future use.
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // If both cache and network fail, fall back to cached response (if available)
          });

        // Return cached version immediately if available, otherwise wait for network.
        return cachedResponse || fetchedResponse;
      });
    })
  );
});
