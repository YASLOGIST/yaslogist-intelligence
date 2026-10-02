/**
 * YASLOGIST // SOVEREIGN CTI INGEST PIPELINE
 * ------------------------------------------------------------------
 * Runs on GitHub Actions every 2 hours (`npm run ingest`). Produces five
 * committed artefacts (see lib/intel-core.cjs for the exact contracts):
 *
 *   data/intel_wire.json        - live Middle East kinetic + cyber wire
 *   data/middle_east_cves.json  - actively weaponized CVEs seen in the feeds
 *   data/target_intensity.json  - per-country attack intensity for the map
 *   data/meta.json              - provenance manifest (freshness, feed health)
 *   data/signal_timeline.json   - rolling 14-day daily signal buckets
 *
 * Feeds are parsed DIRECTLY from source XML — no third-party RSS proxy,
 * therefore no rate limit and no silent empty payloads. All parsing and
 * scoring logic lives in ./lib/intel-core.cjs and is unit tested.
 *
 * Failure contract:
 *   - one dead feed never fails the cycle (per-feed isolation);
 *   - an empty wire never overwrites the committed wire;
 *   - writes are schema-checked before they hit disk;
 *   - meta.json is ALWAYS written so the UI can display honest freshness.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const core = require('./lib/intel-core.cjs');

const DATA_DIR = path.join(__dirname, 'data');
const WIRE_FILE = path.join(DATA_DIR, 'intel_wire.json');
const CVE_FILE = path.join(DATA_DIR, 'middle_east_cves.json');
const INTENSITY_FILE = path.join(DATA_DIR, 'target_intensity.json');
const META_FILE = path.join(DATA_DIR, 'meta.json');
const TIMELINE_FILE = path.join(DATA_DIR, 'signal_timeline.json');

const FEEDS = [
    { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC Middle East', alwaysRelevant: true },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    // Reuters retired their public RSS in 2024 (the legacy agency feed now
    // returns HTTP 404 every cycle). Mirror their Middle East coverage via
    // the stable Google News RSS search endpoint instead; per-feed isolation
    // keeps the cycle safe if this endpoint ever degrades too.
    { url: 'https://news.google.com/rss/search?q=Reuters+Middle+East+when:2d&hl=en-US&gl=US&ceid=US:en', source: 'Reuters (Google News)' },
    { url: 'https://www.bleepingcomputer.com/feed/', source: 'BleepingComputer' },
    { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News' },
    { url: 'https://www.darkreading.com/rss.xml', source: 'Dark Reading' },
    { url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', source: 'CISA Advisories' }
];

const KEYWORDS = [
    'israel', 'gaza', 'palestin', 'iran', 'lebanon', 'syria', 'yemen', 'houthi',
    'middle east', 'hamas', 'hezbollah', 'idf', 'suez', 'red sea', 'bab el-mandeb',
    'hormuz', 'maritime', 'vessel', 'tanker', 'drone', 'missile', 'airstrike', 'strike',
    'apt33', 'apt34', 'apt35', 'muddywater', 'charming kitten', 'phosphorus',
    'state-sponsored', 'cyberwarfare', 'anonymous sudan', 'ransomware', 'zero-day',
    'wiper', 'scada', 'cve-'
];

const TARGET_COUNTRIES = ['israel', 'iran', 'lebanon', 'syria', 'yemen', 'jordan', 'egypt'];

const MAX_WIRE_ITEMS = 45;
const MAX_CVES = 8;
const CVE_CONCURRENCY = 3;

const REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; YASLOGIST-CTI/1.1; +https://github.com/YASLOGIST)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
};

/* -------------------------------------------------------------- helpers */

const readJsonSafe = (file, fallback) => {
    try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return fallback; }
};

const writeJson = (file, value) => {
    fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};

async function fetchText(url, timeoutMs = 20000) {
    const res = await core.fetchWithRetry(url, { timeoutMs, retries: 2, headers: REQUEST_HEADERS });
    return res.text();
}

async function fetchCVEInfo(cveId) {
    try {
        const res = await core.fetchWithRetry(`https://cveawg.mitre.org/api/cve/${encodeURIComponent(cveId)}`, {
            timeoutMs: 15000, retries: 1, headers: REQUEST_HEADERS
        });
        const data = await res.json();

        let system = 'Unknown System';
        try {
            const affected = data.containers.cna.affected[0];
            system = affected.product || affected.vendor || 'Unknown System';
            if (String(system).toLowerCase() === 'n/a') system = affected.vendor || 'Unknown System';
        } catch { /* shape varies across CNAs */ }

        const cvss = core.extractCvss(data);
        const severity = core.titleCase(cvss ? cvss.severity : 'High');

        return {
            id: cveId,
            system,
            severity,
            cvss: cvss ? cvss.score : null,
            badge: `badge-${severity.toLowerCase()}`
        };
    } catch {
        return null;
    }
}

/* ------------------------------------------------------------------ main */

async function run() {
    const now = Date.now();
    const wireItems = [];
    const foundCves = new Set();
    const countryStats = {};
    TARGET_COUNTRIES.forEach(c => { countryStats[c] = { recent: 0, previous: 0 }; });

    const feedReports = [];
    const results = await core.mapPool(FEEDS, 4, async feed => {
        try {
            const xml = await fetchText(feed.url);
            return { feed, items: core.parseFeed(xml), error: null };
        } catch (err) {
            return { feed, items: [], error: err && err.message ? err.message : String(err) };
        }
    });

    results.forEach(({ feed, items, error }) => {
        if (error) {
            console.warn(`[SKIP] ${feed.source}: ${error}`);
            feedReports.push({ source: feed.source, ok: false, items: 0, error });
            return;
        }
        console.log(`[OK]   ${feed.source}: ${items.length} items`);
        feedReports.push({ source: feed.source, ok: true, items: items.length, error: null });

        items.forEach(item => {
            const contentStr = `${item.title} ${item.description}`.toLowerCase();
            const relevant = feed.alwaysRelevant || KEYWORDS.some(kw => contentStr.includes(kw));
            if (!relevant) return;

            const parsed = Date.parse(item.pubDate);
            const ts = isNaN(parsed) ? now : parsed;
            const daysOld = (now - ts) / 86400000;

            wireItems.push({
                titleEn: item.title,
                titleAr: item.title,
                link: item.link,
                source: feed.source,
                pubDate: ts,
                summaryEn: item.description.slice(0, 180) + (item.description.length > 180 ? '…' : ''),
                summaryAr: item.description.slice(0, 180) + (item.description.length > 180 ? '…' : ''),
                tags: core.buildTags(contentStr)
            });

            (contentStr.match(/cve-\d{4}-\d{4,7}/gi) || []).forEach(m => foundCves.add(m.toUpperCase()));

            if (daysOld <= 7) {
                TARGET_COUNTRIES.forEach(c => { if (contentStr.includes(c)) countryStats[c].recent++; });
            } else if (daysOld <= 14) {
                TARGET_COUNTRIES.forEach(c => { if (contentStr.includes(c)) countryStats[c].previous++; });
            }
        });
    });

    /* ---- intel wire (schema-checked; empty cycle keeps previous wire) ---- */
    const wire = core.dedupeAndSort(wireItems, MAX_WIRE_ITEMS)
        .map(core.sanitizeWireItem)
        .filter(Boolean);
    const invalid = core.dedupeAndSort(wireItems, MAX_WIRE_ITEMS).length - wire.length;
    if (invalid > 0) console.warn(`[GUARD] dropped ${invalid} wire items failing schema/URL checks`);

    if (wire.length > 0) {
        writeJson(WIRE_FILE, wire);
        console.log(`Wrote ${wire.length} wire items -> data/intel_wire.json`);
    } else {
        console.warn('No wire items resolved; keeping previous intel_wire.json intact.');
    }

    /* ---- CVEs (keep history, cap enrichment concurrency) ---- */
    let cves = readJsonSafe(CVE_FILE, []);
    if (!Array.isArray(cves)) cves = [];

    // Backfill CVSS for records stored before severity was read from MITRE.
    for (let i = 0; i < cves.length; i++) {
        if (cves[i] && cves[i].cvss === undefined) {
            const fresh = await fetchCVEInfo(cves[i].id);
            if (fresh) cves[i] = fresh;
            else cves[i].cvss = null;
        }
    }

    const knownIds = new Set(cves.map(c => c.id));
    const newIds = [...foundCves].filter(id => !knownIds.has(id));
    const enriched = await core.mapPool(newIds, CVE_CONCURRENCY, id => fetchCVEInfo(id));
    let added = 0;
    newIds.forEach((id, i) => {
        cves.unshift(enriched[i] || { id, system: 'Unknown (Active Exploit)', severity: 'High', cvss: null, badge: 'badge-high' });
        added++;
    });
    cves = cves.slice(0, MAX_CVES);
    writeJson(CVE_FILE, cves);
    const scored = cves.filter(c => typeof c.cvss === 'number');
    console.log(`CVE set: ${cves.length} tracked (${added} new), avg CVSS ` +
        (scored.reduce((a, c) => a + c.cvss, 0) / Math.max(scored.length, 1)).toFixed(1));

    /* ---- target intensity (now with previous-window deltas) ---- */
    const intensity = TARGET_COUNTRIES
        .map(country => core.intensityEntry(country, countryStats[country].recent, countryStats[country].previous))
        .sort((a, b) => parseInt(b.attacks, 10) - parseInt(a.attacks, 10));
    writeJson(INTENSITY_FILE, intensity);
    console.log('Wrote data/target_intensity.json');

    /* ---- signal timeline (merge with committed history, never erase) ---- */
    const previousTimeline = readJsonSafe(TIMELINE_FILE, { days: [] });
    const freshTimeline = core.buildTimeline(wire, now, 14);
    const mergedTimeline = core.mergeTimelines(previousTimeline.days, freshTimeline, 14);
    writeJson(TIMELINE_FILE, {
        schemaVersion: core.SCHEMA_VERSION,
        generatedAt: new Date(now).toISOString(),
        days: mergedTimeline
    });
    console.log('Wrote data/signal_timeline.json');

    /* ---- provenance manifest (always written, even on a quiet cycle) ---- */
    const meta = core.buildMeta({
        feedReports,
        counts: { wire: wire.length, cves: cves.length, countries: intensity.length },
        source: 'pipeline',
        now,
        newestWireTs: wire.length ? wire[0].pubDate : null
    });
    writeJson(META_FILE, meta);
    console.log(`Wrote data/meta.json (feeds OK: ${feedReports.filter(f => f.ok).length}/${feedReports.length})`);
}

run().catch(err => {
    console.error('Pipeline failed:', err);
    process.exit(1);
});
