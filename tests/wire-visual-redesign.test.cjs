"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const html = read("index.html");
const css = read("wire-design.css");
const worker = read("sw.js");

test("visual reading design is independently scoped to Intel Wire, not other tabs", () => {
    assert.match(css, /#intel-wire #news-container\.intel-feed-scroller\s*\{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
    assert.match(css, /#intel-wire #news-container \.wire-item:first-child\s*\{[^}]*grid-column: 1 \/ -1/);
    assert.match(css, /@media \(max-width: 1050px\)\s*\{[\s\S]*?#intel-wire #news-container\.intel-feed-scroller\s*\{ grid-template-columns: 1fr/);
    assert.match(css, /#intel-wire #news-container \.wire-item\s*\{[^}]*min-height: 205px/);
    assert.ok(!css.includes("!important; animation:"));
    assert.ok(css.includes("prefers-reduced-motion"));
});

test("editorial labels state that recency is not event severity and work in Arabic", () => {
    assert.ok(html.includes('class="wire-feed-title"'));
    assert.ok(html.includes('Published source reports'));
    assert.ok(html.includes('تقارير المصادر المنشورة'));
    assert.ok(html.includes('First card follows your sort order, not incident severity'));
    assert.ok(html.includes('وليست تصنيفًا لخطورة الحادث'));
    assert.match(css, /html\[lang="ar"\] #intel-wire \.wire-ar/);
    assert.match(css, /html\[lang="ar"\] #intel-wire \.search-ic/);
});

test("redesign preserves source filters, original source links and dated status semantics", () => {
    for (const tag of ["ALL", "RANSOMWARE", "MARITIME", "LOGISTICS", "APT", "PINNED"]) {
        assert.ok(html.includes('data-tag="' + tag + '"'), "missing filter "+tag);
    }
    for (const id of ["news-container", "wire-state-snapshot", "wire-state-overlay", "wire-state-view", "wire-source-strip", "wire-sort-order"]) {
        assert.ok(html.includes('id="' + id + '"'));
    }
    assert.ok(read("app.js").includes("target=\"_blank\" rel=\"noopener noreferrer\""));
    assert.ok(read("app.js").includes('paintWireVisualState'));
});

test("versioned stylesheet is in HTML, performance budget and complete offline PWA shell", () => {
    assert.ok(html.includes('href="wire-design.css?v=1"'));
    assert.ok(worker.includes("'./wire-design.css?v=1'"));
    assert.ok(worker.includes("yaslogist-v13-shell"));
    const budget = JSON.parse(read("perf-budget.json"));
    assert.ok(budget.localSurface.includes("wire-design.css"));
    assert.ok(fs.statSync(path.join(root,"wire-design.css")).size <= budget.maxFileBytes["wire-design.css"]);
});
