// Service Worker for GoonGames - Offline Support
const CACHE_NAME = 'goongames-v1';

// Cache your main site files
const MAIN_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/favicon.png'
];

// Games you want available offline (add your game URLs)
const GAMES_CACHE = [
  // Add your actual game URLs here
  // Example:
  // '/games/crazy-cattle-3d/index.html',
  // '/games/drive-mad/index.html',
  // '/games/game-name/index.html'
];

// Combine all files to cache
const ALL_CACHE = [...MAIN_CACHE, ...GAMES_CACHE];

// Install event - cache everything
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching main files and games');
        return cache.addAll(ALL_CACHE);
      })
      .catch(err => console.log('Cache failed:', err))
  );
  // Force activate immediately
  self.skipWaiting();
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request).then(networkResponse => {
          // Cache new files as they're loaded
          if (event.request.url.includes('/games/')) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // Offline fallback page (optional)
        return caches.match('/offline.html');
      })
  );
});

// Clean up old caches when updated
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});
