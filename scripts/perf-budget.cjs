#!/usr/bin/env node
/**
 * YASLOGIST performance budget gate.
 * Verifies the static surface stays inside the published budget so visual
 * richness can never silently consume the load budget. CI fails the build
 * on any breach; run locally with `npm run budget`.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BUDGET = JSON.parse(fs.readFileSync(path.join(ROOT, 'perf-budget.json'), 'utf-8'));

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
let failures = 0;
const rows = [];

function sizeOf(rel) {
    const full = path.join(ROOT, rel);
    return fs.existsSync(full) ? fs.statSync(full).size : 0;
}

// 1) Per-file budgets
for (const [file, maxBytes] of Object.entries(BUDGET.maxFileBytes || {})) {
    const size = sizeOf(file);
    const pass = size > 0 && size <= maxBytes;
    if (!pass) failures++;
    rows.push({ scope: file, size: kb(size), budget: kb(maxBytes), pass });
}

// 2) Aggregate local surface (everything the browser downloads from origin)
const localFiles = BUDGET.localSurface || [];
const totalLocal = localFiles.reduce((sum, f) => sum + sizeOf(f), 0);
{
    const pass = totalLocal <= BUDGET.maxTotalLocalBytes;
    if (!pass) failures++;
    rows.push({ scope: 'TOTAL local surface', size: kb(totalLocal), budget: kb(BUDGET.maxTotalLocalBytes), pass });
}

// 3) Third-party dependency counts parsed from index.html.
// Stylesheets are render-blocking and budgeted; preconnect hints are
// near-zero-cost and budgeted separately (they measurably improve LCP).
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
const externalScripts = (html.match(/<script[^>]+src="https?:\/\//g) || []).length;
const linkTags = html.match(/<link\b[^>]*>/g) || [];
const externalStyles = linkTags.filter(t => /rel="stylesheet"/.test(t) && /href="https?:\/\//.test(t)).length;
const externalPreconnects = linkTags.filter(t => /rel="preconnect"/.test(t) && /href="https?:\/\//.test(t)).length;
for (const [label, count, max] of [
    ['external <script> tags', externalScripts, BUDGET.maxExternalScripts],
    ['external stylesheets', externalStyles, BUDGET.maxExternalStylesheets],
    ['external preconnect hints', externalPreconnects, BUDGET.maxExternalPreconnects]
]) {
    const pass = count <= max;
    if (!pass) failures++;
    rows.push({ scope: label, size: String(count), budget: `<= ${max}`, pass });
}

console.log('\nYASLOGIST // PERFORMANCE BUDGET REPORT');
console.log('─'.repeat(64));
rows.forEach(r => console.log(`${r.pass ? '✓' : '✗'} ${r.scope.padEnd(34)} ${String(r.size).padStart(10)}  (budget ${r.budget})`));
console.log('─'.repeat(64));
if (failures) {
    console.error(`${failures} budget breach(es).`);
    process.exit(1);
}
console.log('All budgets green.');
