/** @format */

const CACHE_NAME = "bingo-card-generator-v29"; // Updated version number
const urlsToCache = [
  "./", // The main index file
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  // Add any other core assets like fonts or small images here
  // e.g., './assets/logo.png', './fonts/lato.woff2'
];

// ----------------------------------------------------
// 1. INSTALLATION (Caching assets)
// ----------------------------------------------------
self.addEventListener("install", (event) => {
  console.log(`[Service Worker V29] Installing and caching shell assets.`);
  // Wait until all files are cached
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  // Tell the installing service worker to activate immediately
  // This helps new users get the app running instantly
  self.skipWaiting();
});

// ----------------------------------------------------
// 2. ACTIVATION (Cleaning up old caches)
// ----------------------------------------------------
self.addEventListener("activate", (event) => {
  console.log(`[Service Worker V29] Activating and cleaning old caches.`);
  // Delete all caches except the current one
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(
              `[Service Worker V29] Deleting old cache: ${cacheName}`
            );
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the service worker takes control of the client page immediately
  return self.clients.claim();
});

// ----------------------------------------------------
// 3. FETCH (Serving content from cache or network)
// ----------------------------------------------------
self.addEventListener("fetch", (event) => {
  // We only intercept requests that are not cross-origin or special
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // No cache hit - fetch from network
        return fetch(event.request).then((networkResponse) => {
          // Check if we received a valid response
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Important: Clone the response. A response is a stream and can only be consumed once.
          const responseToCache = networkResponse.clone();

          // Cache the new response for future use (optional: only for assets outside of urlsToCache)
          // If you want to use the 'stale-while-revalidate' strategy for all assets, uncomment this:
          /*
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          */

          return networkResponse;
        });
      })
    );
  } else {
    // For cross-origin requests (e.g., Google Fonts), just use the network
    event.respondWith(fetch(event.request));
  }
});

// ----------------------------------------------------
// 4. PWA UPDATE LOGIC (Critical Fix)
// ----------------------------------------------------
self.addEventListener("message", (event) => {
  // This listener is used to receive messages from the main page.
  // When the user clicks the "Update Now" button, the main script sends a SKIP_WAITING message.
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log(
      "[Service Worker V29] Received SKIP_WAITING message. Activating immediately."
    );
    self.skipWaiting();
  }
});
