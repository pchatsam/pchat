// PChat Service Worker — offline cache
const BASE = self.location.pathname.replace(/\/[^/]*$/, ''); // base path, e.g. /pchat or ''
const CACHE = 'pchat-v2026051722';
const FILES = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/logo.svg',
  BASE + '/dist/pchat.js',
  BASE + '/dist/chat.css',
  BASE + '/dist/peerjs.min.js',
  BASE + '/dist/crypto-js.js',
  BASE + '/dist/forge.min.js',
  BASE + '/dist/qrcode.min.js',
  BASE + '/dist/jsqr.min.js',
  BASE + '/dist/ice-test.html',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
  BASE + '/sw.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(response => {
      // Network success: update cache with fresh copy
      const clone = response.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return response;
    }).catch(() => {
      // Network fail: fallback to cache
      return caches.match(e.request);
    })
  );
});
