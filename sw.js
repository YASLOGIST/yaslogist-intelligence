/* YASLOGIST offline runtime
 * The shell is cache-first for instant startup. Committed intelligence is
 * network-first while online, then served from the last successful snapshot.
 */
'use strict';

const CACHE_VERSION = 'yaslogist-v7-shell';
const RUNTIME_CACHE = 'yaslogist-v7-runtime';
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
const RUNTIME_HOSTS = new Set([
    'unpkg.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com',
    'fonts.googleapis.com', 'fonts.gstatic.com'
]);

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    const keep = new Set([CACHE_VERSION, RUNTIME_CACHE]);
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys
                .filter((key) => key.startsWith('yaslogist-') && !keep.has(key))
                .map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

const cachedFallback = async (request, fallback = './index.html') => {
    const cached = await caches.match(request, { ignoreSearch: true });
    return cached || caches.match(fallback, { ignoreSearch: true });
};

const dataCacheKey = (url) => new Request(`${url.origin}${url.pathname}`);
const cachedData = async (request) => caches.match(request, { ignoreSearch: true });
const cacheData = async (request, response) => {
    const url = new URL(request.url);
    const cache = await caches.open(CACHE_VERSION);
    await cache.put(dataCacheKey(url), response);
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) {
        // CDN assets are optional enhancements, but cache them after the first
        // online visit so icons, fonts, charts, and Leaflet survive offline.
        if (!RUNTIME_HOSTS.has(url.hostname)) return;
        event.respondWith(caches.open(RUNTIME_CACHE).then(async (cache) => {
            const hit = await cache.match(request);
            if (hit) return hit;
            const response = await fetch(request);
            if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
            return response;
        }));
        return;
    }

    if (request.mode === 'navigate') {
        // Cache-first is intentional: the installed shell paints immediately
        // while every data artifact below independently resolves from cache.
        event.respondWith(cachedFallback(request).then((cached) => cached || fetch(request)));
        return;
    }

    if (url.pathname.includes('/data/') && url.pathname.endsWith('.json')) {
        event.respondWith(fetch(request)
            .then(async (response) => {
                if (response.ok) await cacheData(request, response.clone());
                return response;
            })
            .catch(async () => (await cachedData(request)) || new Response(
                JSON.stringify({ error: 'offline-cache-miss' }),
                { status: 503, headers: { 'Content-Type': 'application/json', 'X-YASLOGIST-Cache': 'miss' } }
            )));
        return;
    }

    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
