/* YASLOGIST offline runtime
 * Navigation fetches the current HTML when online and falls back to the
 * offline shell only if that fetch fails. Committed intelligence data remains
 * network-first with the last saved snapshot for offline continuity.
 */
'use strict';

const CACHE_VERSION = 'yaslogist-v13-shell';
const RUNTIME_CACHE = 'yaslogist-v8-runtime';
const APP_SHELL = [
    './',
    './index.html',
    './styles.css?v=26',
    './smart-operations.css?v=4',
    './wire-design.css?v=1',
    './app.js?v=24',
    './lib/wire-visual-state.js',
    './threat-map.js?v=22',
    './acid-squares-bg.js?v=20',
    './acid-squares-bg.js', // app.js imports this exact queryless module offline
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
    event.waitUntil((async () => {
        const keys = await caches.keys();
        // One-time migration for old cache-first shells.
        const legacyShell = keys.some(key => /^yaslogist-v(?:[1-9]|10|11)-shell$/.test(key));
        await Promise.all(keys
            .filter(key => key.startsWith('yaslogist-') && !keep.has(key))
            .map(key => caches.delete(key)));
        await self.clients.claim();
        if (legacyShell) {
            const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
            await Promise.all(windows
                .filter(client => client.url.startsWith(self.registration.scope))
                .map(client => typeof client.navigate === 'function'
                    ? client.navigate(client.url).catch(() => null) : Promise.resolve()));
        }
    })());
});

const currentNavigation = async (request) => {
    const shell = await caches.open(CACHE_VERSION);
    try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response.ok && (response.headers.get('content-type') || '').includes('text/html')) {
            // Ignore cache write failures.
            try { await shell.put('./index.html', response.clone()); } catch (_) { /* quota/private mode */ }
        }
        return response;
    } catch (_) {
        return (await shell.match('./index.html'))
            || (await shell.match('./', { ignoreSearch: true }))
            || Response.error();
    }
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
        event.respondWith(currentNavigation(request));
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
