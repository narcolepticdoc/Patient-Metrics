// Bump this string whenever you deploy a new version.
// The install event will fire, the new SW will wait, and the page
// will receive 'updatefound', post SKIP_WAITING, then reload.
const CACHE = 'patient-metrics-v1.2.0';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// ── Install: cache all assets ──────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      // Do NOT call skipWaiting() here — the page does it via postMessage
      // so we have a chance to notify the user if desired in future.
  );
});

// ── Activate: delete old caches ────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for our assets ──────────────
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// ── Message: page asks us to activate immediately ──
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
