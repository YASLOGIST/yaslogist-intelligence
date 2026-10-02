/**
 * Operator-feature tests (v1.3): watchlist pinning, search highlighting,
 * shareable wire-state serialization, CVE search + CSV export, and the
 * actor × live-wire fusion chips. All driven headlessly via the DOM stub.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { installDOM } from './helpers/mini-dom.mjs';

installDOM();

const mod = await import('../app.js');
const { YaslogistThreatRadarApp, THREAT_ACTORS_DB } = mod;

const makeApp = () => new YaslogistThreatRadarApp({ autoInit: false });

const ITEMS = [
    {
        titleEn: 'OilRig strikes telecom ministry in Gulf state',
        titleAr: 'أويل ريغ تستهدف وزارة اتصالات',
        link: 'https://example.test/a',
        source: 'The Hacker News',
        pubDate: Date.now() - 1800e3,
        summaryEn: 'APT34-linked intrusion persisted for months.',
        summaryAr: 'اختراق مرتبط بـ APT34.',
        tags: [{ textEn: 'APT', textAr: 'مجموعات متقدمة', class: 'tag-cyan' }]
    },
    {
        titleEn: 'Maritime chokepoint advisory issued for Hormuz',
        titleAr: 'تحذير ملاحي لمضيق هرمز',
        link: 'https://example.test/b',
        source: 'BBC Middle East',
        pubDate: Date.now() - 7200e3,
        summaryEn: 'Tanker traffic re-routed amid GPS jamming.',
        summaryAr: 'تحويل حركة الناقلات وسط تشويش ملاحي.',
        tags: [{ textEn: 'MARITIME', textAr: 'ملاحة بحرية', class: 'tag-urgent' }]
    }
];

/* --------------------------------------------------- wire item identity */

test('wireItemId is stable, link-first, and degrades to title', () => {
    const a = { link: 'https://x.test/1', titleEn: 'Same', titleAr: '' };
    const b = { link: 'https://x.test/1', titleEn: 'Different' };
    const c = { link: '', titleEn: 'Only Title', titleAr: '' };
    const d = { link: '#', titleEn: 'Only Title', titleAr: '' };
    assert.equal(YaslogistThreatRadarApp.wireItemId(a), YaslogistThreatRadarApp.wireItemId(b));
    assert.equal(YaslogistThreatRadarApp.wireItemId(c), YaslogistThreatRadarApp.wireItemId(d));
    assert.notEqual(YaslogistThreatRadarApp.wireItemId(a), YaslogistThreatRadarApp.wireItemId(c));
});

/* --------------------------------------------------------- watchlist */

test('watchlist pin toggles persist through localStorage', () => {
    const app = makeApp();
    app.allWireItems = ITEMS;
    assert.equal(app.isWirePinned(ITEMS[0]), false);
    assert.equal(app.toggleWirePin(ITEMS[0]), true, 'first toggle pins');
    assert.equal(app.isWirePinned(ITEMS[0]), true);
    assert.equal(app.wirePinnedItems().length, 1);
    assert.equal(app.toggleWirePin(ITEMS[0]), false, 'second toggle unpins');
    assert.equal(app.wirePinnedItems().length, 0);
});

test('PINNED filter mode shows only starred intercepts', () => {
    const app = makeApp();
    app.allWireItems = ITEMS;
    app.toggleWirePin(ITEMS[1]);
    app.activeWireTag = 'PINNED';
    app.renderIntelligenceWire();
    const html = document.getElementById('news-container').innerHTML;
    assert.ok(html.includes('Maritime chokepoint'));
    assert.ok(!html.includes('OilRig strikes'), 'unpinned items hidden in PINNED mode');
});

test('pinned items render with pinned styling and pressed star state', () => {
    const app = makeApp();
    app.allWireItems = ITEMS;
    app.toggleWirePin(ITEMS[0]);
    app.activeWireTag = 'ALL';
    app.renderIntelligenceWire();
    const html = document.getElementById('news-container').innerHTML;
    assert.ok(html.includes('wire-item-pinned'));
    assert.ok(html.includes('aria-pressed="true"'));
    assert.ok(html.includes('fa-solid fa-star'));
});

test('loadPinnedIds survives hostile / malformed storage', () => {
    window.localStorage.setItem('yaslogist.pinned', '{"evil":true}');
    const app = makeApp();
    assert.ok(app.pinnedIds instanceof Set);
    assert.equal(app.pinnedIds.size, 0);
});

/* ------------------------------------------------ search highlighting */

test('highlightHTML wraps Latin matches case-insensitively and escapes the rest', () => {
    const out = YaslogistThreatRadarApp.highlightHTML('Hormuz Tanker <b>alert</b>', 'hormuz');
    assert.ok(out.includes('<mark class="wire-hl">Hormuz</mark>'));
    assert.ok(!out.includes('<b>'), 'non-match content stays escaped');
    assert.ok(out.includes('&lt;b&gt;'));
});

test('highlightHTML handles Arabic terms and hostile needles', () => {
    const ar = YaslogistThreatRadarApp.highlightHTML('تحويل حركة الناقلات وسط تشويش ملاحي', 'ناقلات');
    assert.ok(ar.includes('<mark class="wire-hl">ناقلات</mark>'));
    const hostile = YaslogistThreatRadarApp.highlightHTML('safe <img src=x onerror=1> text', 'safe');
    assert.ok(!hostile.includes('<img'));
    assert.ok(hostile.includes('&lt;img'));
});

test('highlightHTML ignores needles shorter than 2 chars', () => {
    const out = YaslogistThreatRadarApp.highlightHTML('CVSS 9.8 exposure', 'c');
    assert.equal(out, 'CVSS 9.8 exposure');
});

/* --------------------------------------------------- shareable state */

test('wire state serializes and parses round-trip', () => {
    const query = YaslogistThreatRadarApp.serializeWireState({ tag: 'APT', q: 'hormuz strait' });
    assert.equal(query, 'tag=APT&q=hormuz%20strait');
    const state = YaslogistThreatRadarApp.parseWireState(query);
    assert.deepEqual(state, { tag: 'APT', q: 'hormuz strait' });
});

test('wire state defaults to ALL / empty and clamps hostile input', () => {
    assert.deepEqual(YaslogistThreatRadarApp.parseWireState(''), { tag: 'ALL', q: '' });
    const hostile = YaslogistThreatRadarApp.parseWireState('tag=<script>&q=' + 'x'.repeat(200));
    assert.ok(!hostile.tag.includes('<'));
    assert.ok(hostile.q.length <= 80);
    const upper = YaslogistThreatRadarApp.parseWireState('tag=maritime');
    assert.equal(upper.tag, 'MARITIME', 'tags normalize to upper case');
});

test('applyWireState syncs pills, search input, and storage', () => {
    const app = makeApp();
    app.applyWireState({ tag: 'MARITIME', q: 'tanker' });
    assert.equal(app.activeWireTag, 'MARITIME');
    assert.equal(app.wireSearchTerm, 'tanker');
    assert.equal(window.localStorage.getItem('yaslogist.wireTag'), 'MARITIME');
});

/* ------------------------------------------------------ CVE tooling */

test('CVE search filter matches id, vendor, and advisory (EN + AR)', () => {
    const app = makeApp();
    app.cveData = [
        { id: 'CVE-2024-3400', system: 'Palo Alto PAN-OS', severity: 'critical', cvss: 10 },
        { id: 'CVE-2023-34362', system: 'MOVEit Transfer', severity: 'critical', cvss: 9.8 },
        { id: 'CVE-2024-21412', system: 'Windows Defender', severity: 'high', cvss: 8.1 }
    ];
    app.cveFilter = 'ALL';
    app.cveSort = 'cvss';
    app.cveSearchTerm = 'moveit';
    assert.equal(app.filteredCVEs().length, 1);
    app.cveSearchTerm = 'CVE-2024';
    assert.equal(app.filteredCVEs().length, 2);
    app.cveSearchTerm = '';
    assert.equal(app.filteredCVEs().length, 3);
});

test('buildCveCSV emits RFC-4180-safe rows', () => {
    const csv = YaslogistThreatRadarApp.buildCveCSV([
        { id: 'CVE-2024-3400', system: 'Palo Alto "PAN-OS"', severity: 'critical', cvss: 10, advisory: 'Patch now, isolate edge' },
        { id: 'CVE-2023-34362', system: 'MOVEit', severity: 'critical', cvss: 9.8, advisory: undefined }
    ]);
    const lines = csv.split('\r\n');
    assert.equal(lines[0], 'cve_id,affected_system,severity,cvss,advisory');
    assert.ok(lines[1].includes('"Palo Alto ""PAN-OS"""'), 'embedded quotes doubled');
    assert.ok(lines[1].includes('10.0'));
    assert.ok(lines[2].endsWith(','));
});

test('CVSS cell renders a meter proportional to the base score', () => {
    const app = makeApp();
    const tbody = { innerHTML: '' };
    const originalQuerySelector = document.querySelector;
    document.querySelector = (sel) => (sel === '#cve-table tbody' ? tbody : originalQuerySelector(sel));
    try {
        app.cveData = [{ id: 'CVE-2024-3400', system: 'Palo Alto PAN-OS', severity: 'critical', cvss: 10 }];
        app.renderCVEs();
    } finally {
        document.querySelector = originalQuerySelector;
    }
    assert.ok(tbody.innerHTML.includes('cvss-meter-fill critical'));
    assert.ok(tbody.innerHTML.includes('width:100%'));
});

/* ------------------------------------------------- actor × wire fusion */

test('actorWireActivity counts wire items matching actor aliases', () => {
    const oilrig = THREAT_ACTORS_DB.find(a => a.name.includes('APT34'));
    assert.ok(oilrig, 'APT34 present in enriched DB');
    // One matching ITEM counts once, even when title and summary both hit.
    assert.equal(YaslogistThreatRadarApp.actorWireActivity(oilrig, ITEMS), 1);
    // Counting spans items: a second OilRig report raises the tally.
    const secondItem = [{ titleEn: 'New OilRig campaign documented', summaryEn: '', titleAr: '' }];
    assert.equal(YaslogistThreatRadarApp.actorWireActivity(oilrig, ITEMS.concat(secondItem)), 2);
    const maritimeOnly = [{ titleEn: 'Hormuz advisory', summaryEn: '', titleAr: '' }];
    assert.equal(YaslogistThreatRadarApp.actorWireActivity(oilrig, maritimeOnly), 0);
});

test('actor DB enrichment: every actor has aliases and a bounded level', () => {
    THREAT_ACTORS_DB.forEach(actor => {
        assert.ok(Array.isArray(actor.aliases) && actor.aliases.length, `${actor.name} has aliases`);
        assert.ok(Number.isInteger(actor.level) && actor.level >= 1 && actor.level <= 5, `${actor.name} level bounded`);
    });
});

test('actorMitreHref uses the group page when known, search otherwise', () => {
    const oilrig = THREAT_ACTORS_DB.find(a => a.name.includes('APT34'));
    assert.equal(YaslogistThreatRadarApp.actorMitreHref(oilrig), 'https://attack.mitre.org/groups/G0049/');
    const unknown = { name: 'Handala Hack', mitreUrl: null };
    assert.ok(YaslogistThreatRadarApp.actorMitreHref(unknown).startsWith('https://attack.mitre.org/search/?q='));
});

test('renderThreatActors surfaces activity chips and level meters', () => {
    const app = makeApp();
    app.allWireItems = ITEMS;
    app.renderThreatActors();
    const html = document.getElementById('actors-grid').innerHTML;
    assert.ok(html.includes('actor-activity-chip'), 'activity chip rendered');
    assert.ok(html.includes('actor-level-meter'), 'level meter rendered');
    assert.ok(html.includes('attack.mitre.org'), 'ATT&CK link rendered');
    assert.ok(html.includes('actor-card-live'), 'live actor card highlighted');
});

test('actor default ordering puts live actors first', () => {
    const app = makeApp();
    app.allWireItems = ITEMS; // OilRig echoes on this wire
    app.renderThreatActors();
    const html = document.getElementById('actors-grid').innerHTML;
    const oilrigPos = html.indexOf('OilRig');
    const anonPos = html.indexOf('AnonGhost');
    assert.ok(oilrigPos > -1 && anonPos > -1);
    assert.ok(oilrigPos < anonPos, 'APT34 (live on wire) sorts before dormant actors');
});

/* ------------------------------------------------------------- misc */

test('NEW badge appears only for intercepts younger than 3 hours', () => {
    const app = makeApp();
    app.allWireItems = [
        { ...ITEMS[0], pubDate: Date.now() - 60e3 },
        { ...ITEMS[1], pubDate: Date.now() - 8 * 3600e3 }
    ];
    app.activeWireTag = 'ALL';
    app.renderIntelligenceWire();
    const html = document.getElementById('news-container').innerHTML;
    assert.ok(html.includes('wire-new-badge'));
    assert.ok(!html.includes('wire-new-badge') === false);
    // Exactly one occurrence (the fresh item only).
    assert.equal((html.match(/wire-new-badge/g) || []).length, 1);
});
