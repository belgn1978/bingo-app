/** @format */
// CRITICAL: Increment this version number every time you deploy changes
const CACHE_NAME = "bingo-cache-v21"; // <<< INCREMENT THIS ON EACH DEPLOY

const urlsToCache = [
  "/",
  "index.html",
  "styles.css",
  "script.js",
  "manifest.json",
  "icon-512.png",
  "icon-192.png",
  "favicon.ico",
];

// -------------------------------------------------------------
// Installation Logic
// -------------------------------------------------------------
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Installing version:", CACHE_NAME);
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[ServiceWorker] Caching core assets");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("[ServiceWorker] Failed to cache assets:", error);
      })
  );
});

// -------------------------------------------------------------
// Activation Logic
// -------------------------------------------------------------
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activating version:", CACHE_NAME);
  
  event.waitUntil(
    // Clear old caches
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[ServiceWorker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      // Claim all clients immediately
      .then(() => {
        console.log("[ServiceWorker] Claiming clients");
        return self.clients.claim();
      })
  );
});

// -------------------------------------------------------------
// Message Handler (for communication from page)
// -------------------------------------------------------------
self.addEventListener("message", (event) => {
  console.log("[ServiceWorker] Received message:", event.data);
  
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  
  // Respond with current version
  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// -------------------------------------------------------------
// Fetch Strategy (Cache-first with network fallback)
// -------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === "error") {
          return response;
        }
        
        // Optionally cache the new response for future use
        // (only for same-origin requests)
        if (event.request.url.startsWith(self.location.origin)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      });
    }).catch(() => {
      // Return a custom offline page if you have one
      // return caches.match('/offline.html');
    })
  );
});