// @spec [REQ-PWA-001] LLD 03: Service Worker — Cache-First Offline Strategy

var CACHE_NAME = 'comm-board-v1';

// @spec [REQ-PWA-001] Core app shell to cache on install
var CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

// @spec [REQ-PWA-001] Install: pre-cache the core app shell
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CACHE_URLS);
    })
  );
});

// @spec [REQ-PWA-001] Activate: delete outdated caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key !== CACHE_NAME;
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    })
  );
});

// @spec [REQ-PWA-001] Fetch: Cache-First strategy
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
