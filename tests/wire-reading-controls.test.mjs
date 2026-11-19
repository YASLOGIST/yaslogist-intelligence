import test from 'node:test';
import assert from 'node:assert/strict';
import { installDOM } from './helpers/mini-dom.mjs';

installDOM();
const { YaslogistThreatRadarApp, I18N } = await import('../app.js');
const make = (id, time, summary = 'Public source excerpt') => ({
    link: 'https://example.test/' + id,
    titleEn: 'Report ' + id,
    titleAr: 'تقرير ' + id,
    summaryEn: summary, summaryAr: summary,
    source: 'Recorded public source',
    pubDate: time,
    tags: [{ textEn: 'INTEL', textAr: 'أخبار', class: 'tag-cyan' }]
});
const app = () => new YaslogistThreatRadarApp({ autoInit: false });

test('newest and oldest sorts are deterministic, input-preserving and independent of confidence', () => {
    const source = [make('older', 1000), make('invalid', NaN), make('newer', 3000)];
    const snapshot = [...source];
    assert.deepEqual(YaslogistThreatRadarApp.orderWireItems(source, 'newest').map(x => x.titleEn),
        ['Report newer', 'Report older', 'Report invalid']);
    assert.deepEqual(YaslogistThreatRadarApp.orderWireItems(source, 'oldest').map(x => x.titleEn),
        ['Report older', 'Report newer', 'Report invalid']);
    assert.deepEqual(source, snapshot, 'sorting must not mutate the ingest or its timeline');
});

test('sort state is an allowlist, with bad stored values falling back to newest', () => {
    window.localStorage.setItem('yaslogist.wireSortOrder', 'javascript:unsafe');
    assert.equal(app().wireSortOrder, 'newest');
    window.localStorage.setItem('yaslogist.wireSortOrder', 'oldest');
    assert.equal(app().wireSortOrder, 'oldest');
    window.localStorage.removeItem('yaslogist.wireSortOrder');
});

test('visible count is bilingual and reports filtered values without changing source data', () => {
    const a = app();
    a.currentLang = 'en';
    a.allWireItems = [make('first', 1000), make('second', 2000)];
    a.activeWireTag = 'ALL';
    a.wireSortOrder = 'newest';
    a.renderIntelligenceWire();
    assert.equal(document.getElementById('wire-results-count').textContent, '2 of 2 reports');
    assert.ok(document.getElementById('news-container').innerHTML.indexOf('Report second') <
        document.getElementById('news-container').innerHTML.indexOf('Report first'));
    a.wireSearchTerm = 'first';
    a.renderIntelligenceWire();
    assert.equal(document.getElementById('wire-results-count').textContent, '1 of 2 reports');
    assert.deepEqual(a.allWireItems.map(x => x.titleEn), ['Report first', 'Report second']);
    a.wireSearchTerm = 'no match';
    a.renderIntelligenceWire();
    assert.equal(document.getElementById('wire-results-count').textContent, '0 of 2 reports');
    a.currentLang = 'ar';
    a.renderIntelligenceWire();
    assert.equal(document.getElementById('wire-results-count').textContent, 'عرض 0 من 2 تقارير');
});

test('long source excerpt is accessible and never falsely claims to be a full publisher article', () => {
    const a = app();
    a.currentLang = 'en';
    a.wireSortOrder = 'newest';
    a.allWireItems = [make('long', 2000, 'Long source excerpt. '.repeat(16))];
    a.wireSearchTerm = '';
    a.activeWireTag = 'ALL';
    a.renderIntelligenceWire();
    const rendered = document.getElementById('news-container').innerHTML;
    assert.match(rendered, /class="wire-excerpt-toggle"/);
    assert.match(rendered, /aria-expanded="false"/);
    assert.match(rendered, /aria-controls="wire-excerpt-0"/);
    assert.ok(rendered.includes(I18N.en.wireShowExcerpt));
    a.currentLang = 'ar';
    a.renderIntelligenceWire();
    assert.ok(document.getElementById('news-container').innerHTML.includes(I18N.ar.wireShowExcerpt));
});

test('short summaries avoid adding unnecessary visible controls', () => {
    const a = app();
    a.allWireItems = [make('short', 1500, 'Short public-source summary.')];
    a.wireSortOrder = 'newest';
    a.activeWireTag = 'ALL';
    a.wireSearchTerm = '';
    a.renderIntelligenceWire();
    assert.ok(!document.getElementById('news-container').innerHTML.includes('wire-excerpt-toggle'));
});
