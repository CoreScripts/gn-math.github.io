const CACHE_NAME = 'goongames-v3';

// Only cache the main files, NOT images
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/favicon.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  // Let images load normally from network (don't cache them)
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|ico)$/)) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For everything else, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});
