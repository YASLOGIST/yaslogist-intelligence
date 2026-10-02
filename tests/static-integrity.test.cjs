'use strict';
/**
 * Static integrity checks for the shipped shell:
 * asset references resolve, CSP is present, external scripts are pinned+SRI,
 * tab semantics are wired end-to-end, accessibility hooks exist, and no
 * reference to archived/legacy files survives in the live surface.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf-8');
const html = read('index.html');
const css = read('styles.css');

test('every local stylesheet/script/image referenced by index.html exists', () => {
    const refs = [];
    for (const m of html.matchAll(/<link[^>]+href="([^"#]+)"/g)) refs.push(m[1]);
    for (const m of html.matchAll(/<script[^>]+src="([^"#]+)"/g)) refs.push(m[1]);
    for (const m of html.matchAll(/<img[^>]+src="([^"#]+)"/g)) refs.push(m[1]);
    const local = refs
        .filter(r => !r.startsWith('http'))
        .map(r => r.split('?')[0])
        .filter(r => r && !r.startsWith('data:') && !r.startsWith('#'));
    assert.ok(local.length >= 5, `unexpectedly few local refs (${local.length})`);
    for (const ref of local) {
        assert.ok(fs.existsSync(path.join(ROOT, ref)), `missing local asset: ${ref}`);
    }
});

test('ES module imports inside local scripts resolve to existing files', () => {
    for (const script of ['app.js']) {
        const src = read(script);
        for (const m of src.matchAll(/from\s+['"](\.\/?[^'"]+)['"]/g)) {
            const rel = m[1].split('?')[0].replace(/^\.\//, '');
            assert.ok(fs.existsSync(path.join(ROOT, rel)), `${script} imports missing ${rel}`);
        }
    }
});

test('Content-Security-Policy meta is present and restrictive', () => {
    const csp = (html.match(/http-equiv="Content-Security-Policy"\s+content="([\s\S]*?)"/) || [])[1] || '';
    assert.ok(csp, 'CSP meta tag missing');
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /object-src 'none'/);
    assert.match(csp, /script-src[^;]*'self'/);
    assert.match(csp, /worker-src 'self'/);
    assert.ok(!/script-src[^;]*'unsafe-inline'/.test(csp), 'script-src must not allow inline scripts');
    assert.match(csp, /form-action 'none'/);
});

test('offline runtime caches the complete shell and keeps intelligence network-first', () => {
    const worker = read('sw.js');
    assert.match(read('app.js'), /serviceWorker\.register\('\.\/sw\.js'/);
    assert.match(worker, /request\.mode === 'navigate'/);
    assert.match(worker, /url\.pathname\.includes\('\/data\/'\)/);
    assert.match(worker, /fetch\(request\)[\s\S]*caches\.match\(request\)/);
    for (const artifact of ['intel_wire.json', 'middle_east_cves.json', 'target_intensity.json', 'meta.json', 'signal_timeline.json']) {
        assert.ok(worker.includes(`./data/${artifact}`), `offline shell missing ${artifact}`);
    }
});

test('every external <script> is pinned to an exact version and carries SRI', () => {
    const tags = html.match(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>/g) || [];
    assert.ok(tags.length >= 2, 'expected Leaflet + Chart.js CDN scripts');
    for (const tag of tags) {
        assert.match(tag, /integrity="sha(256|384|512)-[A-Za-z0-9+/=]+"/, `missing SRI: ${tag}`);
        assert.match(tag, /crossorigin/, `missing crossorigin: ${tag}`);
        const url = (tag.match(/src="([^"]+)"/) || [])[1];
        assert.match(url, /@\d+\.\d+\.\d+/, `unpinned dependency (exact x.y.z required): ${url}`);
    }
});

test('WAI-ARIA tab wiring is complete (tablist -> tabs -> tabpanels)', () => {
    assert.match(html, /role="tablist"/);
    const tabs = [...html.matchAll(/<button[^>]+class="nav-tab[^"]*"[^>]*>/g)].map(m => m[0]);
    assert.ok(tabs.length >= 5, `expected 5 tabs, found ${tabs.length}`);
    for (const tab of tabs) {
        assert.match(tab, /role="tab"/);
        assert.match(tab, /aria-selected="(true|false)"/);
        const target = (tab.match(/aria-controls="([^"]+)"/) || [])[1];
        assert.ok(target, `tab missing aria-controls: ${tab}`);
        const panel = html.match(new RegExp(`<section[^>]+id="${target}"[^>]*>`));
        assert.ok(panel, `no panel for aria-controls="${target}"`);
        assert.match(panel[0], /role="tabpanel"/, `panel #${target} missing role=tabpanel`);
    }
});

test('images have alt text and inputs have programmatic labels', () => {
    for (const m of html.matchAll(/<img[^>]*>/g)) {
        assert.match(m[0], /alt="[^"]+"/, `image missing alt: ${m[0]}`);
    }
    for (const m of html.matchAll(/<input[^>]*>/g)) {
        const tag = m[0];
        assert.ok(/aria-label="[^"]+"/.test(tag) || /aria-labelledby="[^"]+"/.test(tag) || /<label/.test(tag),
            `input missing accessible name: ${tag}`);
    }
});

test('reduced-motion and reveal motion system hooks exist in CSS', () => {
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(css, /\.reveal[^{]*\{[\s\S]*?transform: translateY/);
    assert.match(css, /\.skip-link/);
    assert.match(css, /@keyframes skeletonShimmer/);
});

test('live surface references no archived legacy artifacts', () => {
    for (const banned of ['dashboard.html', 'v2.html', 'index.html.bak', 'original_index.html', 'data/intel.json', 'data/wire.json', 'data/intelligence.json']) {
        assert.ok(!html.includes(banned), `index.html still references ${banned}`);
        assert.ok(!read('app.js').includes(banned), `app.js still references ${banned}`);
    }
});

test('.gitignore excludes OS noise and dependency folders', () => {
    const gi = read('.gitignore');
    assert.match(gi, /^\.DS_Store$/m);
    assert.match(gi, /^node_modules\/$/m);
});
