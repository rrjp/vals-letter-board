// @spec [REQ-PWA-001] LLD 03: Service Worker — Cache-First Offline Strategy

var CACHE_NAME = "vals-letter-board-v1";

// @spec [REQ-PWA-001] Core app shell to cache on install
var CACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./favicon.ico",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
];

// @spec [REQ-PWA-001] Install: pre-cache the core app shell
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CACHE_URLS);
    }),
  );
});

// @spec [REQ-PWA-001] Activate: delete outdated caches
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_NAME;
          })
          .map(function (key) {
            return caches.delete(key);
          }),
      );
    }),
  );
});

// @spec [REQ-PWA-001] Fetch: Stale-While-Revalidate Strategy
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request).then(function (cached) {
        var fetched = fetch(event.request)
          .then(function (networkResponse) {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(function () {
            // Fall back gracefully when offline
          });
        return cached || fetched;
      });
    }),
  );
});

// @spec [REQ-ACC-005] Message event: Skip Waiting when requested
self.addEventListener("message", function (event) {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
