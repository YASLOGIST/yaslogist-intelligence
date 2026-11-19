"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const style = fs.readFileSync(path.resolve(__dirname, "../styles.css"), "utf8");
const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");

test("intel wire cards cannot flex-shrink into clipped 20px strips", () => {
    const finalSection = style.slice(style.indexOf(".intel-feed-scroller { gap: 7px"));
    const cardRules = finalSection.match(/\.wire-item\s*\{([^}]+)\}/)?.[1] || "";
    assert.match(cardRules, /flex:\s*0\s+0\s+auto\s*;/);
    assert.match(cardRules, /min-height:\s*max-content\s*;/);
    assert.match(finalSection, /\.wire-title\s*\{\s*font-size:\s*13\.5px/);
    assert.match(finalSection, /\.wire-summary\s*\{\s*font-size:\s*12px/);
});

test("layout fix only replaces the stylesheet cache and preserves scroll, tags, and accessibility", () => {
    assert.match(style, /\.intel-feed-scroller\s*\{[^}]*overflow-y:\s*auto/);
    assert.match(html, /id="news-container"[^>]+aria-live="polite"/);
    for (const tag of ["ALL", "MARITIME", "LOGISTICS", "PINNED", "RANSOMWARE", "APT"]) {
        assert.ok(html.includes('data-tag="' + tag + '"'), "lost filter: " + tag);
    }
    const sw = fs.readFileSync(path.resolve(__dirname, "../sw.js"), "utf8");
    assert.match(sw, /yaslogist-v14-shell/);
    assert.ok(sw.includes("styles.css?v=26"));
});

test("wire order and excerpt controls never re-enable shrinking or remove the source scroller", () => {
    assert.ok(html.includes('id="wire-results-count"'));
    assert.ok(html.includes('id="wire-sort-order"'));
    assert.ok(html.includes('data-i18n="wireEvidenceHint"'));
    const app = fs.readFileSync(path.resolve(__dirname, "../app.js"), "utf8");
    assert.ok(app.includes("wire-excerpt-toggle"));
    assert.ok(style.includes(".wire-item.wire-expanded .wire-summary"));
    assert.ok(style.includes(".wire-sort-wrap select:focus-visible"));
    assert.ok(style.includes("flex: 0 0 auto;"));
});

test("snapshot/overlay/filter source status rail is semantic, calm and fully cached offline", () => {
    for (const id of ['wire-state-snapshot', 'wire-state-overlay', 'wire-state-view']) {
        assert.ok(html.includes('id="' + id + '"'));
    }
    assert.ok(html.includes('data-i18n-aria-label="wireRailAria"'));
    assert.ok(style.includes('.wire-status-rail'));
    assert.ok(style.includes('.wire-state-card[data-status="stale"]'));
    assert.ok(style.includes('.source-chip[aria-pressed="true"]'));
    assert.ok(style.includes('@media (prefers-reduced-motion: reduce)'));
    const sw = fs.readFileSync(path.resolve(__dirname, '../sw.js'), 'utf8');
    assert.ok(sw.includes("./lib/wire-visual-state.js"), 'offline PWA must cache the dynamically imported local module');
});
