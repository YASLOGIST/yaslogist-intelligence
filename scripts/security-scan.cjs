#!/usr/bin/env node
/**
 * YASLOGIST lightweight security gate.
 * Scans tracked source for committed secrets and dangerous patterns.
 * Not a substitute for a full SAST, but it makes the common failure modes
 * (leaked keys, dangerous DOM sinks, broken pinning) CI-enforceable.
 */
'use strict';
const { execSync } = require('child_process');

const SECRET_PATTERNS = [
    { name: 'AWS access key', re: /AKIA[0-9A-Z]{16}/ },
    { name: 'Private key block', re: /-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY/ },
    { name: 'GitHub token', re: /(ghp_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,})/ },
    { name: 'Slack token', re: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
    { name: 'Generic api_key assignment', re: /api[_-]?key\s*[:=]\s*["'][A-Za-z0-9_\-]{20,}["']/i }
];

const DANGEROUS_SINKS = [
    { name: 'eval()', re: /[^a-zA-Z_.]eval\s*\(/, files: ['app.js', 'threat-map.js', 'acid-squares-bg.js', 'update_data.js'] },
    { name: 'new Function()', re: /new\s+Function\s*\(/, files: ['app.js', 'threat-map.js', 'acid-squares-bg.js', 'update_data.js'] },
    { name: 'document.write()', re: /document\.write\s*\(/, files: ['app.js', 'threat-map.js', 'acid-squares-bg.js'] }
];

let failures = 0;
// Tracked AND untracked working-tree files (new files must be scanned too).
const tracked = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf-8' })
    .split('\n')
    .filter((f, i, arr) => f && arr.indexOf(f) === i && !f.startsWith('archive/') && /\.(js|mjs|cjs|html|css|json|yml|yaml|md)$/.test(f));

const fs = require('fs');
for (const file of tracked) {
    const text = fs.readFileSync(file, 'utf-8');
    for (const { name, re } of SECRET_PATTERNS) {
        if (re.test(text)) {
            console.error(`✗ ${file}: possible ${name}`);
            failures++;
        }
    }
}
for (const { name, re, files } of DANGEROUS_SINKS) {
    for (const file of files) {
        if (!fs.existsSync(file)) continue;
        if (re.test(fs.readFileSync(file, 'utf-8'))) {
            console.error(`✗ ${file}: dangerous sink ${name}`);
            failures++;
        }
    }
}

// External script policy: every remote <script> must carry integrity + be allow-listed.
const html = fs.readFileSync('index.html', 'utf-8');
const scriptTags = html.match(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>/g) || [];
const HOST_ALLOWLIST = ['unpkg.com', 'cdn.jsdelivr.net'];
for (const tag of scriptTags) {
    const host = (tag.match(/https?:\/\/([^/"]+)/) || [])[1] || '';
    if (!HOST_ALLOWLIST.some(h => host.endsWith(h))) {
        console.error(`✗ index.html: external script from non-allowlisted host ${host}`);
        failures++;
    }
    if (!/integrity="sha(256|384|512)-/.test(tag)) {
        console.error(`✗ index.html: external script missing SRI integrity -> ${tag.slice(0, 90)}…`);
        failures++;
    }
    if (!/crossorigin/.test(tag)) {
        console.error(`✗ index.html: external script missing crossorigin -> ${tag.slice(0, 90)}…`);
        failures++;
    }
}

if (failures) {
    console.error(`\n${failures} security finding(s).`);
    process.exit(1);
}
console.log(`Security scan clean across ${tracked.length} tracked files.`);
