/** @format */
// CRITICAL: Increment this version number every time you deploy changes
const CACHE_NAME = "bingo-cache-v28"; // <<< UPDATED TO v26

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

  // Force immediate activation
  self.skipWaiting();

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[ServiceWorker] Caching core assets");
        // Add cache-busting query params to force fresh downloads
        const cacheBustedUrls = urlsToCache.map((url) => {
          if (url === "/" || url.includes("manifest") || url.includes("icon")) {
            return url;
          }
          return `${url}?v=26`;
        });
        return cache.addAll(cacheBustedUrls);
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
    // Clear ALL old caches
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
    // DON'T force reload - let the update banner handle it
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
// Fetch Strategy (Network-first for HTML/JS/CSS, cache-first for assets)
// -------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // For HTML, JS, CSS files - use network-first strategy
  if (
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname === "/"
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the new version
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fall back to cache if network fails
          return caches.match(event.request);
        })
    );
  } else {
    // For images and other assets - use cache-first
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }

          if (event.request.url.startsWith(self.location.origin)) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        });
      })
    );
  }
});
