// NexoCRM Service Worker — offline cache + background sync
// Strategy: Cache-first for static assets, Network-first for API calls

const CACHE_NAME = 'nexocrm-v2';
const STATIC_ASSETS = [
    '/manifest.json',
    '/themes/lara-light-indigo/theme.css',
    '/themes/lara-dark-indigo/theme.css',
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: serve from cache when offline, network-first for API
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and Chrome extensions
    if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

    // API calls: network-first, fallback to offline page
    if (url.pathname.startsWith('/api/') || url.port === '8080') {
        event.respondWith(
            fetch(request)
                .then((response) => response)
                .catch(() =>
                    new Response(
                        JSON.stringify({ error: 'Offline — verifique sua conexão' }),
                        { status: 503, headers: { 'Content-Type': 'application/json' } }
                    )
                )
        );
        return;
    }

    // Never cache Next.js build/runtime assets to avoid stale chunk references
    if (url.pathname.startsWith('/_next/')) {
        event.respondWith(fetch(request));
        return;
    }

    // Navigations: network-first (fresh HTML), fallback to cache
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match(request))
        );
        return;
    }

    // Static assets: cache-first
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                // Cache successful responses for static-like paths
                if (
                    response.ok &&
                    (url.pathname.startsWith('/themes/') ||
                        url.pathname.startsWith('/layout/') ||
                        url.pathname.startsWith('/icons/') ||
                        url.pathname.match(/\.(css|js|woff2?|png|svg|ico)$/))
                ) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            });
        })
    );
});
