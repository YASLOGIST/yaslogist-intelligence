/**
 * i18n integrity: the Arabic and English dictionaries must be complete
 * mirrors, and every translatable attribute used in index.html must
 * resolve to a real dictionary key in BOTH languages.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Extract the I18N object literal from app.js without executing the module. */
function extractI18N(source) {
    const startToken = 'const I18N = ';
    const start = source.indexOf(startToken);
    assert.notEqual(start, -1, 'I18N dictionary not found in app.js');
    const braceStart = source.indexOf('{', start);
    let depth = 0, end = -1;
    for (let i = braceStart; i < source.length; i++) {
        const ch = source[i];
        if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0) { end = i; break; }
        }
    }
    assert.notEqual(end, -1, 'unbalanced braces in I18N dictionary');
    const literal = source.slice(braceStart, end + 1);
    return vm.runInNewContext(`(${literal})`, {}, { timeout: 1000 });
}

const appSource = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf-8');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
const I18N = extractI18N(appSource);

test('I18N has en and ar dictionaries with identical key sets', () => {
    const enKeys = Object.keys(I18N.en).sort();
    const arKeys = Object.keys(I18N.ar).sort();
    assert.deepEqual(arKeys, enKeys, 'Arabic dictionary is missing keys (or has extras) vs English');
    assert.ok(enKeys.length >= 80, `dictionary shrank unexpectedly (${enKeys.length} keys)`);
});

test('every dictionary value is a non-empty string in both languages', () => {
    for (const lang of ['en', 'ar']) {
        for (const [key, value] of Object.entries(I18N[lang])) {
            assert.equal(typeof value, 'string', `${lang}.${key} must be a string`);
            assert.ok(value.trim().length > 0, `${lang}.${key} must not be empty`);
        }
    }
});

test('every data-i18n key used in index.html exists in both dictionaries', () => {
    const keys = new Set([...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]));
    assert.ok(keys.size >= 50, `expected 50+ translated nodes, found ${keys.size}`);
    for (const key of keys) {
        assert.ok(I18N.en[key], `data-i18n="${key}" missing from en dictionary`);
        assert.ok(I18N.ar[key], `data-i18n="${key}" missing from ar dictionary`);
    }
});

test('every data-i18n-placeholder key exists in both dictionaries', () => {
    const keys = new Set([...html.matchAll(/data-i18n-placeholder="([^"]+)"/g)].map(m => m[1]));
    assert.ok(keys.size >= 2);
    for (const key of keys) {
        assert.ok(I18N.en[key] && I18N.ar[key], `placeholder key "${key}" missing`);
    }
});

test('every data-i18n-aria-label key exists in both dictionaries', () => {
    const keys = new Set([...html.matchAll(/data-i18n-aria-label="([^"]+)"/g)].map(m => m[1]));
    assert.ok(keys.size >= 1, 'nav aria-label translation hook expected');
    for (const key of keys) {
        assert.ok(I18N.en[key] && I18N.ar[key], `aria-label key "${key}" missing`);
    }
});

test('no dictionary key is used before definition drift (json round-trip safe)', () => {
    // Dictionaries feed innerHTML/textContent only as plain strings — ensure
    // they contain no element-breaking markup.
    for (const lang of ['en', 'ar']) {
        for (const [key, value] of Object.entries(I18N[lang])) {
            assert.ok(!/<\s*script/i.test(value), `${lang}.${key} contains script markup`);
        }
    }
});
