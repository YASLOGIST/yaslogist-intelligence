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
    assert.match(sw, /yaslogist-v9-shell/);
    assert.ok(sw.includes("styles.css?v=24"));
});
