'use strict';
/* Committed intelligence artefacts must always satisfy the shared schema. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { VALIDATORS } = require('../lib/validate-data.cjs');

const DATA_DIR = path.join(__dirname, '..', 'data');

for (const [file, validate] of Object.entries(VALIDATORS)) {
    test(`data/${file} satisfies its schema`, () => {
        const full = path.join(DATA_DIR, file);
        assert.ok(fs.existsSync(full), `${file} must exist`);
        const parsed = JSON.parse(fs.readFileSync(full, 'utf-8'));
        const issues = validate(parsed);
        assert.deepEqual(issues, [], issues.join('\n'));
    });
}

test('wire items are sorted newest-first and and stay within the cap', () => {
    const wire = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'intel_wire.json'), 'utf-8'));
    if (wire.length > 1) {
        for (let i = 1; i < wire.length; i++) {
            assert.ok(wire[i - 1].pubDate >= wire[i].pubDate,
                `wire not sorted at index ${i}`);
        }
    }
    assert.ok(wire.length <= 45, `wire holds ${wire.length} items (>45 cap)`);
});

test('wire publication dates are timestamps the UI can order on', () => {
    const wire = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'intel_wire.json'), 'utf-8'));
    for (const item of wire) {
        assert.ok(item.pubDate > 946684800000, `implausibly old pubDate on "${item.titleEn.slice(0, 40)}"`);
        assert.ok(item.pubDate <= Date.now() + 86400000, `future pubDate on "${item.titleEn.slice(0, 40)}"`);
    }
});
