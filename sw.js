/* YASLOGIST offline runtime
 * App-shell assets are versioned atomically. Intelligence JSON remains
 * network-first so an installed cockpit never hides a fresher common picture.
 */
'use strict';

// Shell-generation counter: bump when any precached asset changes. Kept
// decoupled from the app release version so a new shell always replaces the
// stale one atomically.
const CACHE_VERSION = 'yaslogist-v6-shell';
// Precache URLs match the exact requests index.html makes (cache keys are
// query-sensitive), otherwise the versioned assets bypass the offline shell.
const APP_SHELL = [
    './',
    './index.html',
    './styles.css?v=22',
    './smart-operations.css?v=4',
    './app.js?v=21',
    './threat-map.js?v=21',
    './acid-squares-bg.js?v=20',
    './manifest.webmanifest',
    './assets/yaslogist-logo-128.png',
    './assets/yaslogist-icon-192.png',
    './assets/yaslogist-icon-512.png',
    './data/intel_wire.json',
    './data/middle_east_cves.json',
    './data/target_intensity.json',
    './data/meta.json',
    './data/signal_timeline.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys
                .filter((key) => key.startsWith('yaslogist-') && key !== CACHE_VERSION)
                .map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

const cachedFallback = async (request, fallback = './index.html') => {
    const cached = await caches.match(request, { ignoreSearch: false });
    return cached || caches.match(fallback);
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(fetch(request)
            .then((response) => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put('./index.html', copy));
                }
                return response;
            })
            .catch(() => cachedFallback(request)));
        return;
    }

    if (url.pathname.includes('/data/') && url.pathname.endsWith('.json')) {
        event.respondWith(fetch(request)
            .then((response) => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
                }
                return response;
            })
            .catch(async () => (await caches.match(request)) || new Response(
                JSON.stringify({ error: 'offline-cache-miss' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
            )));
        return;
    }

    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
