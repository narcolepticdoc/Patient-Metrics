const CACHE = 'patient-metrics-v1.6.1.0';

const STATIC_ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './ref-data.js'
];

// ── Install: pre-cache static assets, activate immediately ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC_ASSETS))
  );
  // Skip waiting immediately — no reason to defer for a solo-dev PWA.
  // The page will reload via controllerchange.
  self.skipWaiting();
});

// ── Activate: delete old caches, claim all clients ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch strategy ───────────────────────────────────
// index.html  → network-first (always try to get the latest,
//               fall back to cache only when offline)
// everything else → cache-first (icons, manifest — rarely change)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  const isHTML = url.pathname === '/' ||
                 url.pathname.endsWith('/index.html') ||
                 url.pathname.endsWith('/');

  if (isHTML) {
    // Network-first for the app shell
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // Cache the fresh copy
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first for static assets
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});

// ── Message handler (kept for compatibility) ──
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
