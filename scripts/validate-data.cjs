#!/usr/bin/env node
/**
 * Validate every committed intelligence artefact against the shared schema.
 * Usage: node scripts/validate-data.cjs   (exit 1 on any issue)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { VALIDATORS } = require('../lib/validate-data.cjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
let failures = 0;

for (const [file, validate] of Object.entries(VALIDATORS)) {
    const full = path.join(DATA_DIR, file);
    if (!fs.existsSync(full)) {
        console.error(`✗ ${file}: missing`);
        failures++;
        continue;
    }
    let parsed;
    try {
        parsed = JSON.parse(fs.readFileSync(full, 'utf-8'));
    } catch (err) {
        console.error(`✗ ${file}: invalid JSON — ${err.message}`);
        failures++;
        continue;
    }
    const issues = validate(parsed);
    if (issues.length) {
        issues.forEach(msg => console.error(`✗ ${msg}`));
        failures += issues.length;
    } else {
        console.log(`✓ ${file}: valid`);
    }
}

if (failures) {
    console.error(`\n${failures} validation issue(s) found.`);
    process.exit(1);
}
console.log('\nAll intelligence artefacts valid.');
