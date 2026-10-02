/**
 * Integration-level tests for the browser controller (app.js), driven
 * headlessly through a minimal DOM stub. Covers the real user flows:
 * wire fetch/normalize/dedupe/render, filtering and search (incl. Arabic),
 * XSS containment, KPI + model-tier derivation, CVE filtering/sorting.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { installDOM } from './helpers/mini-dom.mjs';

installDOM();

const mod = await import('../app.js');
const { YaslogistThreatRadarApp, escapeHTML, safeURL } = mod;

const makeApp = () => new YaslogistThreatRadarApp({ autoInit: false });

const WIRE_FIXTURE = [
    {
        titleEn: 'Tanker seized near Strait of Hormuz amid GPS jamming',
        titleAr: 'احتجاز ناقلة نفط قرب مضيق هرمز وسط تشويش GPS',
        link: 'https://example.test/hormuz',
        source: 'BBC Middle East',
        pubDate: Date.now() - 3600e3,
        summaryEn: 'Maritime authorities report vessel seizure and navigation interference.',
        summaryAr: 'السلطات البحرية تبلغ عن احتجاز سفينة وتشويش ملاحي.',
        tags: [{ textEn: 'MARITIME', textAr: 'ملاحة بحرية', class: 'tag-urgent' }]
    },
    {
        titleEn: 'Ransomware crew claims breach of telecom operator',
        titleAr: 'عصابة فدية تعلن اختراق مشغل اتصالات',
        link: 'https://example.test/telecom',
        source: 'The Hacker News',
        pubDate: Date.now() - 7200e3,
        summaryEn: 'The group published samples of subscriber data.',
        summaryAr: 'المجموعة نشرت عينات من بيانات المشتركين.',
        tags: [{ textEn: 'RANSOMWARE', textAr: 'برمجيات الفدية', class: 'tag-urgent' }]
    },
    {
        titleEn: 'إسرائيل تطلق منظومة دفاع جديدة',
        titleAr: 'إسرائيل تطلق منظومة دفاع جديدة',
        link: 'https://example.test/defense',
        source: 'Al Jazeera',
        pubDate: Date.now() - 10800e3,
        summaryEn: 'Israel fields new missile defense battery.',
        summaryAr: 'إسرائيل تنشر بطارية دفاع صاروخي جديدة.',
        tags: [{ textEn: 'INTEL', textAr: 'استخبارات', class: '' }]
    }
];

/* ------------------------------------------------------------- helpers */

test('escapeHTML neutralizes markup injection', () => {
    assert.equal(escapeHTML('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
    assert.equal(escapeHTML('a & "b" \''), 'a &amp; &quot;b&quot; &#39;');
    assert.equal(escapeHTML(null), '');
});

test('safeURL allow-lists http(s) and rejects javascript: URLs', () => {
    assert.equal(safeURL('javascript:alert(1)'), '#');
    assert.equal(safeURL('data:text/html,<script>1</script>'), '#');
    assert.equal(safeURL('https://ok.test/x?y=1'), 'https://ok.test/x?y=1');
    assert.equal(safeURL(''), '#');
});

test('renderIntelligenceWire escapes hostile feed content (XSS containment)', () => {
    const app = makeApp();
    app.allWireItems = [{
        titleEn: '<script>window.pwned=true</script>',
        titleAr: '<script>window.pwned=true</script>',
        link: 'https://safe.test',
        source: '<b>evil</b>',
        pubDate: Date.now(),
        summaryEn: 'safe summary',
        summaryAr: 'آمن',
        tags: []
    }];
    app.renderIntelligenceWire();
    const html = document.getElementById('news-container').innerHTML;
    assert.ok(!html.includes('<script>'), 'raw script tag must not survive rendering');
    assert.ok(html.includes('&lt;script&gt;'), 'payload should appear escaped');
    assert.ok(!html.includes('<b>evil</b>'), 'source markup must be escaped');
});

/* ------------------------------------------------- wire data pipeline */

test('normalizeWireItems coerces legacy and pipeline shapes', () => {
    const app = makeApp();
    const out = app.normalizeWireItems([
        { title: 'Legacy shape', summary: 'cve-2024-3400 zero-day', timestamp: '2026-09-30T10:00:00Z' },
        { titleEn: 'Pipeline shape', pubDate: 1234567890000, tags: [{ textEn: 'APT', textAr: 'x', class: 'c' }] },
        null,
        'garbage',
        { summaryEn: 'no title anywhere' }
    ]);
    assert.equal(out.length, 2);
    assert.equal(out[0].source, 'YASLOGIST CTI');
    assert.ok(out[0].tags.some(t => t.textEn === 'ZERO-DAY'));
    assert.deepEqual(out[1].tags.map(t => t.textEn), ['APT']);
});

test('dedupeWireItems dedupes and sorts newest first', () => {
    const app = makeApp();
    const out = app.dedupeWireItems([
        { titleEn: 'Story A', pubDate: 1 },
        { titleEn: 'Story A!', pubDate: 3 },
        { titleEn: 'Story B', pubDate: 2 }
    ]);
    assert.equal(out.length, 2);
    assert.equal(out[0].pubDate, 3);
});

test('fetchWire full flow: committed wire -> render -> KPIs -> feed health', async (t) => {
    const app = makeApp();
    const realFetch = global.fetch;
    global.fetch = async (url) => {
        const u = String(url);
        if (u.includes('rss2json')) throw new Error('offline overlay');
        if (u.includes('intel_wire.json')) return { ok: true, json: async () => WIRE_FIXTURE };
        return { ok: true, json: async () => [] };
    };
    t.after(() => { global.fetch = realFetch; });

    await app.fetchWire();

    // Stage-1 items rendered and sorted, count painted
    assert.equal(app.allWireItems.length, 3);
    assert.ok(app.allWireItems[0].pubDate >= app.allWireItems[1].pubDate);
    const container = document.getElementById('news-container');
    assert.ok(container.innerHTML.includes('Tanker seized near Strait of Hormuz'));
    assert.ok(container.innerHTML.includes('wire-item'), 'wire items rendered as cards');

    // Feed health reflects the failed overlay honestly
    assert.deepEqual(app.feedHealth, { ok: 0, total: 5, syncedAt: app.feedHealth.syncedAt });

    // KPIs derived from data
    assert.equal(document.getElementById('kpi-logistics-count').textContent, '1'); // one MARITIME tag
    assert.equal(document.getElementById('kpi-campaigns-count').textContent, '0');
});

/* --------------------------------------------------- filtering flows */

test('tag filter narrows the rendered wire', () => {
    const app = makeApp();
    app.allWireItems = WIRE_FIXTURE;
    app.activeWireTag = 'MARITIME';
    app.renderIntelligenceWire();
    const html = document.getElementById('news-container').innerHTML;
    assert.ok(html.includes('Hormuz'));
    assert.ok(!html.includes('Ransomware crew'));
});

test('search matches Arabic titles and summaries (RTL operator parity)', () => {
    const app = makeApp();
    app.currentLang = 'ar';
    app.allWireItems = WIRE_FIXTURE;
    app.activeWireTag = 'ALL';
    app.wireSearchTerm = 'إسرائيل';
    app.renderIntelligenceWire();
    const html = document.getElementById('news-container').innerHTML;
    // Search highlighting wraps matches in <mark>; compare on tag-stripped text.
    const text = html.replace(/<[^>]+>/g, '');
    assert.ok(text.includes('إسرائيل تطلق منظومة دفاع جديدة'));
    assert.ok(html.includes('mark class="wire-hl"'), 'Arabic match is highlighted');
    assert.ok(!html.includes('Hormuz'), 'non-matching items filtered out');
});

test('empty filter result renders the localized empty state', () => {
    const app = makeApp();
    app.allWireItems = WIRE_FIXTURE;
    app.wireSearchTerm = 'zzz-no-match-zzz';
    app.renderIntelligenceWire();
    const html = document.getElementById('news-container').innerHTML;
    assert.ok(html.includes('No intelligence reports match'));
});

/* ---------------------------------------------------- derived metrics */

test('countWireTag and distributions trace to wire content', () => {
    const app = makeApp();
    app.allWireItems = WIRE_FIXTURE;
    assert.equal(app.countWireTag('MARITIME'), 1);
    assert.equal(app.countWireTag('APT'), 0);
    const tags = app.wireTagDistribution().map(([k]) => k);
    assert.deepEqual(tags, ['MARITIME', 'RANSOMWARE', 'INTEL']);
    const sectors = app.wireSectorDistribution();
    assert.ok(sectors.length >= 3);
    assert.ok(sectors[0] >= 1, 'maritime sector must register the Hormuz item');
});

test('updateKPIs computes model tier from real CVE mix and honest trends', () => {
    const app = makeApp();
    app.cveData = [
        { id: 'CVE-1', severity: 'Critical', cvss: 9.8 },
        { id: 'CVE-2', severity: 'Critical', cvss: 9.1 },
        { id: 'CVE-3', severity: 'Critical', cvss: 9.4 }
    ];
    app.intensityData = [
        { country: 'Iran', attacks: '10', previous: '5', intensity: 'High', trend: 'up' },
        { country: 'Israel', attacks: '2', previous: '8', intensity: 'Medium', trend: 'down' }
    ];
    app.allWireItems = [];
    app.updateKPIs();
    const readout = document.getElementById('defcon-readout-text');
    assert.ok(readout.innerHTML.includes('MODEL TIER 2'), `expected model tier 2, got: ${readout.innerHTML}`);
    // 12 current vs 13 previous -> honest negative delta
    const trendHtml = document.getElementById('kpi-attacks-trend').innerHTML;
    assert.ok(trendHtml.includes('%'), 'renders a computed percentage');
    assert.ok(trendHtml.includes('-'), 'downward delta must render negative, not a hardcoded +14.2%');
    assert.equal(document.getElementById('kpi-attacks-count').textContent, '12');
    assert.equal(document.getElementById('kpi-cves-count').textContent, '3');
});

test('setDefconLevel resolves localized model strings for every level 1..5', () => {
    const app = makeApp();
    document.querySelectorAll = () => [];
    for (const lvl of [1, 2, 3, 4, 5]) {
        app.setDefconLevel(lvl);
        assert.ok(document.getElementById('defcon-readout-text').innerHTML.includes(`MODEL TIER ${lvl}`));
    }
    app.currentLang = 'ar';
    app.setDefconLevel(4);
    assert.ok(document.getElementById('defcon-readout-text').innerHTML.includes('محترس'));
    app.currentLang = 'en';
});

/* ---------------------------------------------------------- CVE matrix */

test('renderCVEs sorts by CVSS and filters severity', () => {
    const app = makeApp();
    const tbody = { innerHTML: '' };
    document.querySelector = (sel) => (sel === '#cve-table tbody' ? tbody : null);
    app.cveData = [
        { id: 'CVE-2026-1', system: 'A', severity: 'High', cvss: 7.1, badge: 'badge-high' },
        { id: 'CVE-2026-2', system: 'B', severity: 'Critical', cvss: 9.9, badge: 'badge-critical' },
        { id: 'CVE-2026-3', system: 'C', severity: 'Medium', cvss: 5.0, badge: 'badge-medium' }
    ];
    app.cveFilter = 'ALL';
    app.cveSort = 'cvss';
    app.renderCVEs();
    assert.ok(tbody.innerHTML.indexOf('CVE-2026-2') < tbody.innerHTML.indexOf('CVE-2026-1'), 'CVSS 9.9 must rank above 7.1');
    app.cveFilter = 'critical';
    app.renderCVEs();
    assert.ok(tbody.innerHTML.includes('CVE-2026-2'));
    assert.ok(!tbody.innerHTML.includes('CVE-2026-1'));
    assert.ok(!tbody.innerHTML.includes('CVE-2026-3'));
    app.cveFilter = 'low';
    app.renderCVEs();
    assert.ok(tbody.innerHTML.includes('cve-empty-cell'), 'empty filter renders empty state, never a silent table');
});

/* ------------------------------------------------------ briefing math */

test('formatTimeAgo localizes EN/AR', () => {
    const app = makeApp();
    assert.equal(app.formatTimeAgo(Date.now() - 90e3), '1m ago');
    app.currentLang = 'ar';
    assert.equal(app.formatTimeAgo(Date.now() - 3600e3), 'منذ 1 س');
});
