import test from 'node:test';
import assert from 'node:assert/strict';
import { installDOM, El } from './helpers/mini-dom.mjs';
import {
    snapshotAge, overlayHealth, wireViewState, wireStatusModel,
    paintWireVisualState, matchesLogisticsKeywords, orderWireItems,
} from '../lib/wire-visual-state.js';

const { byId, selectors } = installDOM();
const NOW = Date.parse('2026-11-19T14:00:00Z');
const at = h => ({ generatedAt: new Date(NOW - h * 3600000).toISOString() });
const app = extra => ({
    currentLang: 'en', pipelineMeta: at(2), feedHealth: { ok: 7, total: 7 },
    networkOnline: true, activeWireTag: 'ALL', wireSearchTerm: '',
    allWireItems: [{ titleEn: 'One' }, { titleEn: 'Two' }],
    ...extra,
});

test('snapshot health uses real publication time and never implies event truth', () => {
    assert.equal(snapshotAge(at(2), NOW).status, 'recent');
    assert.equal(snapshotAge(at(4.99), NOW).status, 'recent');
    assert.equal(snapshotAge(at(5), NOW).status, 'delayed');
    assert.equal(snapshotAge(at(23.99), NOW).status, 'delayed');
    assert.equal(snapshotAge(at(24), NOW).status, 'stale');
    assert.equal(snapshotAge({ generatedAt: 'not-a-date' }, NOW).status, 'unknown');
    assert.equal(snapshotAge(null, NOW).status, 'unknown');
    assert.equal(snapshotAge({ generatedAt: new Date(NOW + 3600000).toISOString() }, NOW).status, 'unknown');
    assert.equal(snapshotAge({ generatedAt: new Date(NOW + 120000).toISOString() }, NOW).status, 'recent');
});

test('optional source checks distinguish unanswered, partial, all, offline and never mean verified reports', () => {
    assert.equal(overlayHealth(null).status, 'unchecked');
    assert.equal(overlayHealth({ ok: 0, total: 7 }).status, 'unavailable');
    assert.equal(overlayHealth({ ok: 3, total: 7 }).status, 'partial');
    assert.equal(overlayHealth({ ok: 7, total: 7 }).status, 'responsive');
    assert.equal(overlayHealth({ ok: 7, total: 7 }, false).status, 'offline');
    assert.equal(overlayHealth({ ok: 40, total: 7 }).ok, 7);
    assert.equal(overlayHealth({ ok: 1, total: 0 }).status, 'unchecked');
});

test('status chips are derived from source metadata and user view, not a fabricated risk score', () => {
    const a = wireStatusModel(app(), 2, NOW);
    assert.equal(a.snapshot.status, 'recent');
    assert.equal(a.overlay.status, 'responsive');
    assert.equal(a.view.status, 'all');
    assert.match(a.snapshot.value, /Published 2h ago/);
    assert.match(a.overlay.value, /Responding 7\/7/);
    assert.match(a.snapshot.hint, /not incident time or truth/);
    assert.match(a.overlay.hint, /not independent news verification/);

    const degraded = wireStatusModel(app({
        pipelineMeta: at(30), feedHealth: { ok: 0, total: 7 },
        activeWireTag: 'LOGISTICS',
    }), 1, NOW);
    assert.equal(degraded.snapshot.status, 'stale');
    assert.equal(degraded.overlay.status, 'unavailable');
    assert.equal(degraded.view.status, 'filtered');
    assert.match(degraded.view.value, /1\/2/);

    const ar = wireStatusModel(app({
        currentLang: 'ar', activeWireTag: 'PINNED',
        pipelineMeta: { generatedAt: 'invalid' }, networkOnline: false,
    }), 0, NOW);
    assert.equal(ar.snapshot.status, 'unknown');
    assert.equal(ar.overlay.status, 'offline');
    assert.equal(ar.view.status, 'watchlist');
    assert.match(ar.snapshot.value, /غير معروف/);
    assert.match(ar.overlay.value, /غير متصل/);
});

test('wire filter visual states are independent of article verification', () => {
    assert.equal(wireViewState('ALL', ''), 'all');
    assert.equal(wireViewState('ALL', 'suez'), 'filtered');
    assert.equal(wireViewState('MARITIME', ''), 'filtered');
    assert.equal(wireViewState('PINNED', ''), 'watchlist');
    assert.equal(matchesLogisticsKeywords({ titleEn: 'Port cargo announcement' }), true);
    assert.equal(matchesLogisticsKeywords({ titleEn: 'Support centre update' }), false);
    const source = [{ pubDate: 200 }, { pubDate: 100 }];
    assert.deepEqual(orderWireItems(source, 'oldest').map(x => x.pubDate), [100, 200]);
    assert.deepEqual(source.map(x => x.pubDate), [200, 100]);
});

test('painter updates accessible state text and source-chip pressed state without DOM injection', () => {
    const handles = {};
    for (const key of ['snapshot', 'overlay', 'view']) {
        const el = byId('wire-state-' + key);
        const label = new El('span'), value = new El('span');
        el.querySelector = selector => selector === '.wire-state-label' ? label
            : selector === '.wire-state-value' ? value : null;
        handles[key] = { el, label, value };
    }
    const source = new El('button');
    source.setAttribute('data-source-filter', 'BBC Middle East');
    const other = new El('button');
    other.setAttribute('data-source-filter', 'Al Jazeera');
    selectors.set('#wire-source-strip .source-chip', [source, other]);
    const a = app({ wireSearchTerm: 'BBC Middle East' });
    paintWireVisualState(a, 1);
    assert.equal(handles.overlay.el.dataset.status, 'responsive');
    assert.equal(handles.view.el.dataset.status, 'filtered');
    assert.match(handles.view.value.textContent, /Filtered: 1\/2/);
    assert.match(handles.snapshot.el.getAttribute('title'), /Age of committed publication/);
    assert.equal(source.getAttribute('aria-pressed'), 'true');
    assert.equal(other.getAttribute('aria-pressed'), 'false');
    a.networkOnline = false;
    a.currentLang = 'ar';
    a.wireSearchTerm = '';
    paintWireVisualState(a, 2);
    assert.equal(handles.overlay.el.dataset.status, 'offline');
    assert.equal(handles.view.el.dataset.status, 'all');
    assert.match(handles.view.value.textContent, /كل التقارير/);
    assert.equal(source.getAttribute('aria-pressed'), 'false');
});
