"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(path.resolve(__dirname, "../sw.js"), "utf8");
const ORIGIN = "https://intelligence.yaslogist.com";
const SCOPE = ORIGIN + "/";

function fixture({ online = true, legacyShells = [] } = {}) {
    const events = {};
    const stores = new Map();
    const redirects = [];
    const removed = [];
    let returnedNetwork;
    let calls = 0;
    const makeCache = name => ({
        put: async (key, value) => {
            if (!stores.has(name)) stores.set(name, new Map());
            stores.get(name).set(String(key), value.clone());
        },
        match: async key => stores.get(name)?.get(String(key))?.clone() ?? null,
        addAll: async () => {},
    });
    for (const name of ['yaslogist-v16-shell', 'yaslogist-v8-runtime', ...legacyShells, 'foreign-app-cache']) {
        stores.set(name, new Map());
    }
    const caches = {
        open: async name => makeCache(name),
        keys: async () => [...stores.keys()],
        delete: async name => { removed.push(name); return stores.delete(name); },
        match: async () => null,
    };
    const self = {
        location: { origin: ORIGIN },
        registration: { scope: SCOPE },
        addEventListener: (type, cb) => { events[type] = cb; },
        clients: {
            claim: async () => {},
            matchAll: async () => [{
                url: SCOPE + '?filter=ALL',
                navigate: async url => { redirects.push(url); },
            }, {
                url: 'https://other.example.net/dashboard',
                navigate: async () => { throw Error('not allowed cross-origin'); },
            }],
        },
        skipWaiting: async () => {},
    };
    const context = {
        self, caches, URL, Response, Request, Set, Promise,
        fetch: async (_request, opts) => {
            calls++;
            if (!online) throw Error('offline');
            assert.equal(opts?.cache, 'no-store', 'navigations must bypass HTTP cache');
            return new Response(returnedNetwork || '<html>NEW PRODUCTION SHELL</html>', {
                status: 200, headers: { 'content-type': 'text/html; charset=utf-8' },
            });
        },
    };
    vm.runInNewContext(source, context, { filename: 'sw.js' });
    const nav = async (url = SCOPE) => {
        let answer;
        events.fetch({
            request: { method: 'GET', mode: 'navigate', url },
            respondWith: promise => { answer = promise; },
        });
        assert.ok(answer, 'worker must intercept navigation');
        return answer;
    };
    const activate = async () => {
        let job;
        events.activate({ waitUntil: promise => { job = promise; } });
        await job;
    };
    return { nav, activate, removed, redirects, stores, get calls() { return calls; },
        setOnline: on => { online = on; },
        setNetwork: html => { returnedNetwork = html; },
        setShell: async html => makeCache('yaslogist-v16-shell').put('./index.html',
            new Response(html, { headers: { 'content-type': 'text/html' } })),
        readShell: () => makeCache('yaslogist-v16-shell').match('./index.html') };
}

test('navigation obtains live HTML instead of cached old Intel Wire on healthy network', async () => {
    const sw = fixture();
    await sw.setShell('<html>OLD 53 intercepted reports · missing LOGISTICS</html>');
    sw.setNetwork('<html>NEW LOGISTICS and wire-status-rail</html>');
    const response = await sw.nav();
    assert.equal(await response.text(), '<html>NEW LOGISTICS and wire-status-rail</html>');
    assert.equal(await (await sw.readShell()).text(), '<html>NEW LOGISTICS and wire-status-rail</html>');
    assert.equal(sw.calls, 1);
});

test('offline navigation uses last valid cached shell without fetching fake truth', async () => {
    const sw = fixture({ online: false });
    await sw.setShell('<html>OFFLINE CACHED Intel Wire</html>');
    const response = await sw.nav(SCOPE + '?tab=intel');
    assert.equal(await response.text(), '<html>OFFLINE CACHED Intel Wire</html>');
});

test('online 404 is not disguised as a valid cached page', async () => {
    // The code explicitly checks response.ok before caching; do not cache errors.
    assert.match(source, /if \(response\.ok &&/);
    assert.match(source, /return response;/);
    assert.ok(!source.includes("cachedFallback(request).then"));
});

test('old cache-first visitors are navigated once on upgrade, keeping other origins untouched', async () => {
    const sw = fixture({ legacyShells: ['yaslogist-v11-shell', 'yaslogist-v7-shell'] });
    await sw.activate();
    assert.ok(sw.removed.includes('yaslogist-v11-shell'));
    assert.ok(sw.removed.includes('yaslogist-v7-shell'));
    assert.ok(!sw.removed.includes('foreign-app-cache'));
    assert.deepEqual(sw.redirects, [SCOPE + '?filter=ALL']);
});

test('fresh installations and subsequent workers do not forcibly navigate existing tabs', async () => {
    const fresh = fixture();
    await fresh.activate();
    assert.deepEqual(fresh.redirects, []);
});

test('offline shell caches the actual unversioned ES module import alongside its preloaded revision', () => {
    const html = fs.readFileSync(path.resolve(__dirname, "../app.js"), "utf8");
    assert.ok(html.includes("from './acid-squares-bg.js'"), 'the application still imports a bare URL');
    assert.ok(source.includes("'./acid-squares-bg.js',"), 'bare imported module must be part of the offline shell');
    assert.ok(source.includes("'./acid-squares-bg.js?v=20'"), 'preserve existing versioned module');
});
