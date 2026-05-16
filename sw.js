// PChat Service Worker — offline cache
const CACHE = 'pchat-v20260517';
const FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  '/dist/pchat.js',
  '/dist/chat.css',
  '/dist/peerjs.min.js',
  '/dist/crypto-js.js',
  '/dist/forge.min.js',
  '/dist/qrcode.min.js',
  '/dist/jsqr.min.js',
  '/dist/ice-test.html',
  '/icon-192.png',
  '/icon-512.png',
  '/sw.js',
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
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
