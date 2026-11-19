"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const canonical = "https://intelligence.yaslogist.com/";

test("SEO canonical and social images belong to the verified independent domain", () => {
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.ok(html.includes('rel="canonical" href="' + canonical + '"'));
    assert.ok(html.includes('property="og:url" content="' + canonical + '"'));
    assert.ok(html.includes('property="og:site_name" content="YASLOGIST Intelligence"'));
    assert.ok(html.includes('name="robots" content="index, follow, max-image-preview:large"'));
    assert.match(html, /property="og:image" content="https:\/\/intelligence\.yaslogist\.com\/assets\/og-image-animated\.gif"/);
    assert.match(html, /name="twitter:image" content="https:\/\/intelligence\.yaslogist\.com\/assets\/og-image-animated\.gif"/);
});

test("crawler sitemap and robots point to this app, not the company homepage or another project", () => {
    const robots = read("robots.txt");
    const sitemap = read("sitemap.xml");
    assert.ok(robots.includes("Sitemap: " + canonical + "sitemap.xml"));
    assert.ok(sitemap.includes("<loc>" + canonical + "</loc>"));
    assert.ok(!sitemap.includes("disruption-intelligence"));
    assert.ok(!sitemap.includes("founder.yaslogist.com"));
});

test("PWA refresh keeps all existing functionality while replacing stale shell cache", () => {
    const sw = read("sw.js");
    assert.ok(sw.includes("yaslogist-v13-shell"));
    assert.ok(sw.includes("yaslogist-v8-runtime"));
    assert.ok(sw.includes("./app.js?v=24"));
    assert.ok(sw.includes("./threat-map.js?v=22"));
    assert.ok(sw.includes("./styles.css?v=26"));
    assert.ok(html.includes("app.js?v=24") && html.includes("styles.css?v=26"));
    assert.ok(read("app.js").includes("./threat-map.js?v=22"));
});

test("Saudi Arabia becomes a supported source-linked map category without synthetic observations", () => {
    assert.ok(read("update_data.js").includes("'saudi arabia'"));
    assert.ok(read("threat-map.js").includes("'saudi arabia':"));
    assert.ok(!read("threat-map.js").includes("Simulated AIS"));
    assert.match(read("app.js"), /Source text in English · not translated/);
    assert.match(read("index.html"), /data-tag="LOGISTICS"/);
});
