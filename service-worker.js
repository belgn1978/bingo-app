/** @format */

// A critical change: You MUST update the CACHE_NAME version every time you deploy changes.
const CACHE_NAME = "bingo-cache-v16"; // <<< SET YOUR STARTING VERSION HERE

const urlsToCache = [
  "/",
  "index.html",
  "styles.css",
  "script.js",
  "manifest.json",
  // Add all your icon files and any other assets here:
  "icon-512.png",
  "icon-192.png",
  "favicon.ico",
  // Example other files:
  // '404.html',
  // 'generate-icons.html',
];

// -------------------------------------------------------------
// Installation Logic
// -------------------------------------------------------------

self.addEventListener("install", (event) => {
  // Force the new service worker to install and activate immediately,
  // skipping the "waiting" phase to ensure quicker updates.
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache. Caching core assets.");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("Failed to cache assets during install:", error);
      })
  );
});

// -------------------------------------------------------------
// Activation Logic (Handles Cache Clearing and Update Messaging)
// -------------------------------------------------------------

self.addEventListener("activate", (event) => {
  event.waitUntil(
    // 1. Clear old caches
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      // 2. Claim clients and send update message
      .then(() => {
        // Take control of all current pages/tabs controlled by the old Service Worker
        return self.clients.claim().then(() => {
          console.log("Service Worker activated and claimed clients.");

          // Check if an existing client is still running the old version
          // This is the core logic for the 'update available' notification
          return self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              // Send a message to the client script (e.g., script.js)
              client.postMessage({ type: "UPDATE_AVAILABLE" });
            });
          });
        });
      })
  );
});

// -------------------------------------------------------------
// Fetch Strategy (Cache-first)
// -------------------------------------------------------------

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      // If not in cache, fetch from network
      return fetch(event.request);
    })
  );
});
