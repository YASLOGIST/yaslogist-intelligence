'use strict';
/* Unit tests for the pipeline's pure core logic (lib/intel-core.cjs). */
const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../lib/intel-core.cjs');

/* ------------------------------------------------------------ text utils */

test('decodeEntities unwraps CDATA and common entities', () => {
    assert.equal(core.decodeEntities('<![CDATA[Tom &amp; Jerry]]>'), 'Tom & Jerry');
    assert.equal(core.decodeEntities('&lt;b&gt;bold&lt;/b&gt; &#39;q&#39;'), "<b>bold</b> 'q'");
    assert.equal(core.decodeEntities('a&nbsp;b  c'), 'a b c');
});

test('parseFeed parses RSS <item> blocks', () => {
    const xml = `<rss><channel>
        <item><title>First &amp; Foremost</title><link>https://a.test/1</link>
        <description><![CDATA[<p>Hello <b>world</b></p>]]></description>
        <pubDate>Mon, 29 Sep 2026 10:00:00 GMT</pubDate></item>
        <item><title>Second</title><link>https://a.test/2</link>
        <description>Plain</description><pubDate>bad-date</pubDate></item>
    </channel></rss>`;
    const items = core.parseFeed(xml);
    assert.equal(items.length, 2);
    assert.equal(items[0].title, 'First & Foremost');
    assert.equal(items[0].link, 'https://a.test/1');
    assert.equal(items[0].description, 'Hello world');
    assert.equal(items[1].title, 'Second');
});

test('parseFeed parses Atom <entry> blocks with href links', () => {
    const xml = `<feed><entry><title>Atom One</title>
        <link rel="alternate" href="https://atom.test/x"/>
        <summary>Summary text</summary><updated>2026-09-30T08:00:00Z</updated></entry></feed>`;
    const items = core.parseFeed(xml);
    assert.equal(items.length, 1);
    assert.equal(items[0].link, 'https://atom.test/x');
    assert.equal(items[0].description, 'Summary text');
});

test('parseFeed drops entries without a title', () => {
    const xml = '<rss><channel><item><link>https://x.test</link><description>no title</description></item></channel></rss>';
    assert.equal(core.parseFeed(xml).length, 0);
});

/* ------------------------------------------------------- classification */

test('buildTags assigns expected tactical tags and caps at 3', () => {
    const tags = core.buildTags('ransomware gang used a zero-day against maritime vessel in the red sea');
    const names = tags.map(t => t.textEn);
    assert.ok(names.includes('RANSOMWARE'));
    assert.ok(names.includes('ZERO-DAY'));
    assert.ok(names.includes('MARITIME'));
    assert.ok(tags.length <= 3);
});

test('buildTags falls back to INTEL when nothing matches', () => {
    const tags = core.buildTags('ordinary headline about weather');
    assert.deepEqual(tags.map(t => t.textEn), ['INTEL']);
});

test('buildTags detects APT and DDoS', () => {
    assert.ok(core.buildTags('state-sponsored apt group').some(t => t.textEn === 'APT'));
    assert.ok(core.buildTags('massive ddos attack').some(t => t.textEn === 'DDoS'));
});

test('dedupeKey normalizes titles deterministically', () => {
    assert.equal(core.dedupeKey('Hello, World! 2026'), 'helloworld2026');
    assert.equal(core.dedupeKey(''), '');
    assert.ok(core.dedupeKey('x'.repeat(200)).length <= 80);
});

test('dedupeAndSort dedupes, sorts newest first, and caps', () => {
    const items = [
        { titleEn: 'Same story', pubDate: 100 },
        { titleEn: 'Same story!', pubDate: 300 },
        { titleEn: 'Different', pubDate: 200 }
    ];
    const out = core.dedupeAndSort(items, 10);
    assert.equal(out.length, 2);
    assert.equal(out[0].pubDate, 300);
    assert.equal(out[1].pubDate, 200);
});

test('sanitizeWireItem enforces schema and URL allow-list', () => {
    assert.equal(core.sanitizeWireItem(null), null);
    assert.equal(core.sanitizeWireItem({ titleEn: '  ' }), null);
    const jsLink = core.sanitizeWireItem({ titleEn: 't', link: 'javascript:alert(1)' });
    assert.equal(jsLink.link, '#');
    const ok = core.sanitizeWireItem({ titleEn: 't', link: 'https://ok.test/x', pubDate: '123' });
    assert.equal(ok.link, 'https://ok.test/x');
    assert.equal(ok.pubDate, 123);
    assert.equal(ok.titleAr, 't'); // fallback mirrors EN
});

/* ------------------------------------------------------------- CVE math */

test('scoreToSeverity bands follow CVSS v3 guidance', () => {
    assert.equal(core.scoreToSeverity(9.8), 'CRITICAL');
    assert.equal(core.scoreToSeverity(9.0), 'CRITICAL');
    assert.equal(core.scoreToSeverity(7.4), 'HIGH');
    assert.equal(core.scoreToSeverity(4.0), 'MEDIUM');
    assert.equal(core.scoreToSeverity(3.9), 'LOW');
});

test('extractCvss prefers CNA v3.1 metrics and reads ADP too', () => {
    const cna = { containers: { cna: { metrics: [{ cvssV3_1: { baseScore: 7.5, baseSeverity: 'HIGH' } }] } } };
    assert.deepEqual(core.extractCvss(cna), { score: 7.5, severity: 'HIGH' });

    const adpOnly = { containers: { cna: {}, adp: [{ metrics: [{ cvssV4_0: { baseScore: 9.1, baseSeverity: 'CRITICAL' } }] }] } };
    assert.deepEqual(core.extractCvss(adpOnly), { score: 9.1, severity: 'CRITICAL' });

    assert.equal(core.extractCvss({ containers: { cna: {} } }), null);
    assert.equal(core.extractCvss({}), null);
});

test('extractCvss chooses version order v4 > v3.1 > v3.0 > v2', () => {
    const both = { containers: { cna: { metrics: [
        { cvssV3_1: { baseScore: 6.0 } },
        { cvssV4_0: { baseScore: 8.0 } }
    ] } } };
    assert.equal(core.extractCvss(both).score, 8.0);
});

/* ------------------------------------------------- intensity & timeline */

test('intensityEntry labels and delta math are evidence-based', () => {
    const crit = core.intensityEntry('iran', 16, 8);
    assert.equal(crit.intensity, 'Critical');
    assert.equal(crit.deltaPct, 100);
    assert.equal(crit.trend, 'up');

    const drop = core.intensityEntry('syria', 5, 10);
    assert.equal(drop.intensity, 'High');
    assert.equal(drop.trend, 'down');
    assert.equal(drop.deltaPct, -50);

    const fresh = core.intensityEntry('egypt', 3, 0);
    assert.equal(fresh.deltaPct, null); // new activity has no honest percentage
    assert.equal(fresh.trend, 'up');

    const quiet = core.intensityEntry('jordan', 0, 0);
    assert.equal(quiet.intensity, 'Low');
    assert.equal(quiet.trend, 'down');
});

test('buildTimeline buckets items into 14 UTC days ending today', () => {
    const now = Date.UTC(2026, 9, 1, 12, 0, 0);
    const dayMs = 86400000;
    const items = [
        { pubDate: now - 1 * 3600000 },          // today
        { pubDate: now - 1 * 86400000 },          // yesterday
        { pubDate: now - 2 * 86400000 },          // 2 days ago
        { pubDate: now - 30 * dayMs }             // outside window
    ];
    const days = core.buildTimeline(items, now, 14);
    assert.equal(days.length, 14);
    assert.equal(days[13].date, new Date(now - (now % dayMs)).toISOString().slice(0, 10));
    assert.equal(days[13].count, 1);
    assert.equal(days[12].count, 1);
    assert.equal(days[11].count, 1);
    assert.equal(days.reduce((s, d) => s + d.count, 0), 3);
});

test('mergeTimelines keeps history and lets fresh values win', () => {
    const prev = [{ date: '2026-09-28', count: 5 }, { date: '2026-09-29', count: 2 }];
    const fresh = [{ date: '2026-09-29', count: 9 }, { date: '2026-09-30', count: 1 }];
    const merged = core.mergeTimelines(prev, fresh, 14);
    assert.deepEqual(merged, [
        { date: '2026-09-28', count: 5 },
        { date: '2026-09-29', count: 9 },
        { date: '2026-09-30', count: 1 }
    ]);
    const trimmed = core.mergeTimelines(
        Array.from({ length: 20 }, (_, i) => ({ date: `2026-09-${String(i + 1).padStart(2, '0')}`, count: i })),
        [], 14);
    assert.equal(trimmed.length, 14);
});

test('buildMeta produces a complete provenance manifest', () => {
    const meta = core.buildMeta({
        feedReports: [{ source: 'BBC Middle East', ok: true, items: 12, error: null }],
        counts: { wire: 45, cves: 8, countries: 7 },
        now: Date.UTC(2026, 9, 1, 0, 0, 0),
        newestWireTs: Date.UTC(2026, 8, 30, 23, 0, 0)
    });
    assert.equal(meta.schemaVersion, 2);
    assert.equal(meta.generatedAt, '2026-10-01T00:00:00.000Z');
    assert.equal(meta.source, 'pipeline');
    assert.equal(meta.feeds[0].source, 'BBC Middle East');
    assert.equal(meta.wireNewestAt, '2026-09-30T23:00:00.000Z');
});

/* ---------------------------------------------------------- async utils */

test('mapPool preserves order and caps concurrency', async () => {
    let active = 0, peak = 0;
    const result = await core.mapPool([1, 2, 3, 4, 5, 6], 2, async (n) => {
        active++; peak = Math.max(peak, active);
        await core.sleep(5 + (6 - n)); // later items resolve first if unbounded
        active--;
        return n * 10;
    });
    assert.deepEqual(result, [10, 20, 30, 40, 50, 60]);
    assert.ok(peak <= 2, `peak concurrency ${peak} exceeded 2`);
});

test('fetchWithRetry retries transient failures then succeeds', async () => {
    const realFetch = global.fetch;
    let calls = 0;
    global.fetch = async () => {
        calls++;
        if (calls < 3) return { ok: false, status: 500 };
        return { ok: true, status: 200, text: async () => 'payload' };
    };
    try {
        const res = await core.fetchWithRetry('https://example.test/feed', { retries: 2, timeoutMs: 5000 });
        assert.equal(await res.text(), 'payload');
        assert.equal(calls, 3);
    } finally {
        global.fetch = realFetch;
    }
});

test('fetchWithRetry does not retry permanent client errors', async () => {
    const realFetch = global.fetch;
    let calls = 0;
    global.fetch = async () => { calls++; return { ok: false, status: 404 }; };
    try {
        await assert.rejects(() => core.fetchWithRetry('https://example.test/missing', { retries: 2, timeoutMs: 5000 }), /HTTP 404/);
        assert.equal(calls, 1);
    } finally {
        global.fetch = realFetch;
    }
});
