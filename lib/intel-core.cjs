/**
 * YASLOGIST // SOVEREIGN CTI INGEST PIPELINE — PURE CORE LOGIC
 * ------------------------------------------------------------------
 * Every function in this module is pure (no I/O, no globals) so the
 * pipeline behaviour is fully unit-testable in Node without a browser,
 * a network, or a filesystem. `update_data.js` wires these functions
 * to fetch/fs; `tests/intel-core.test.cjs` pins their behaviour.
 *
 * Data contracts produced (all additive, backward compatible):
 *   data/intel_wire.json       [{ titleEn, titleAr, link, source, pubDate, summaryEn, summaryAr, tags[] }]
 *   data/middle_east_cves.json [{ id, system, severity, cvss, badge, advisoryEn?, advisoryAr? }]
 *   data/target_intensity.json [{ country, attacks, previous, intensity, trend, deltaPct, class }]
 *   data/meta.json             { schemaVersion, generatedAt, source, counts, feeds[], wireAgeHours }
 *   data/signal_timeline.json  { schemaVersion, generatedAt, days: [{ date, count }] }  // last 14 days, UTC
 */

'use strict';

const SCHEMA_VERSION = 2;

/* ------------------------------------------------------------ text utils */

function decodeEntities(str) {
    return String(str || '')
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;|&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
}

function pickTag(block, tag) {
    const m = String(block || '').match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    return m ? decodeEntities(m[1]) : '';
}

function pickLink(block) {
    const rss = pickTag(block, 'link');
    if (rss) return rss;
    const atom = String(block || '').match(/<link[^>]*href=["']([^"']+)["']/i);
    return atom ? atom[1] : '#';
}

function stripHtml(str) {
    return decodeEntities(String(str || '').replace(/<[^>]+>/g, ' '));
}

/** Parse RSS 2.0 `<item>` or Atom `<entry>` blocks from raw feed XML. */
function parseFeed(xml) {
    const blocks = String(xml || '').match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) || [];
    return blocks.map(block => ({
        title: pickTag(block, 'title'),
        link: pickLink(block),
        description: stripHtml(
            pickTag(block, 'description') ||
            pickTag(block, 'content:encoded') ||
            pickTag(block, 'summary') ||
            pickTag(block, 'content')
        ),
        pubDate: pickTag(block, 'pubDate') || pickTag(block, 'published') || pickTag(block, 'updated') || ''
    })).filter(i => i.title);
}

/* ------------------------------------------------------- classification */

/**
 * Deterministic, explainable keyword tagging. Shared vocabulary with the
 * browser-side fallback tagger in app.js — keep the two in sync.
 */
function buildTags(contentStr) {
    const s = String(contentStr || '').toLowerCase();
    const tags = [];
    if (s.includes('ransomware')) tags.push({ textEn: 'RANSOMWARE', textAr: 'برمجيات الفدية', class: 'tag-urgent' });
    if (s.includes('zero-day') || s.includes('0-day')) tags.push({ textEn: 'ZERO-DAY', textAr: 'يوم-الصفر', class: 'tag-purple' });
    if (['maritime', 'suez', 'red sea', 'houthi', 'vessel', 'tanker', 'hormuz'].some(k => s.includes(k))) {
        tags.push({ textEn: 'MARITIME', textAr: 'ملاحة بحرية', class: 'tag-urgent' });
    }
    if (s.includes('ddos')) tags.push({ textEn: 'DDoS', textAr: 'حجب الخدمة', class: 'tag-warn' });
    if (s.includes('apt') || s.includes('state-sponsored')) tags.push({ textEn: 'APT', textAr: 'مجموعات متقدمة', class: 'tag-cyan' });
    if (tags.length === 0) tags.push({ textEn: 'INTEL', textAr: 'استخبارات', class: '' });
    return tags.slice(0, 3);
}

/**
 * Normalized dedupe key: first 80 letters/digits of the lowercase title.
 * Unicode-aware so Arabic-language reports produce a stable non-empty key.
 */
function dedupeKey(title) {
    return String(title || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').slice(0, 80);
}

/** Dedupe by title key keeping the NEWEST duplicate, sort desc, cap. */
function dedupeAndSort(items, limit = 45) {
    const seen = new Set();
    return [...items]
        .sort((a, b) => (b.pubDate || 0) - (a.pubDate || 0))
        .filter(i => {
            const key = dedupeKey(i && i.titleEn);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, limit);
}

/**
 * Guard rails applied to every wire item before it is persisted.
 * Links are protocol allow-listed (http/https only) — the browser also
 * re-validates at render time, defense in depth.
 */
function sanitizeWireItem(item) {
    if (!item || typeof item !== 'object') return null;
    const titleEn = String(item.titleEn || '').trim();
    if (!titleEn) return null;
    let link = '#';
    try {
        const url = new URL(String(item.link || ''));
        if (url.protocol === 'http:' || url.protocol === 'https:') link = url.href;
    } catch { /* keep '#' */ }
    const pubDate = Number.isFinite(Number(item.pubDate)) ? Number(item.pubDate) : Date.now();
    const summaryEn = String(item.summaryEn || '').slice(0, 400);
    return {
        titleEn,
        titleAr: String(item.titleAr || titleEn),
        link,
        source: String(item.source || 'UNKNOWN').slice(0, 60),
        pubDate,
        summaryEn,
        summaryAr: String(item.summaryAr || summaryEn),
        tags: Array.isArray(item.tags) ? item.tags.slice(0, 3) : []
    };
}

/* ------------------------------------------------------------- CVE math */

function scoreToSeverity(score) {
    if (score >= 9.0) return 'CRITICAL';
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.0) return 'MEDIUM';
    return 'LOW';
}

/**
 * Pull the best available CVSS base score from a MITRE CVE Services record.
 * Metrics may live under the CNA container or ADP containers (e.g. CISA-ADP)
 * and may be CVSS v4.0 / v3.1 / v3.0 / v2.0. Returns {score, severity}|null.
 */
function extractCvss(data) {
    const buckets = [];
    try { if (data.containers.cna.metrics) buckets.push(...data.containers.cna.metrics); } catch { /* shape varies */ }
    try { (data.containers.adp || []).forEach(a => { if (a.metrics) buckets.push(...a.metrics); }); } catch { /* shape varies */ }

    for (const key of ['cvssV4_0', 'cvssV3_1', 'cvssV3_0', 'cvssV2_0']) {
        for (const m of buckets) {
            const v = m && m[key];
            if (v && typeof v.baseScore === 'number') {
                return { score: v.baseScore, severity: v.baseSeverity || scoreToSeverity(v.baseScore) };
            }
        }
    }
    return null;
}

function titleCase(str) {
    const s = String(str || 'High').toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ------------------------------------------------- intensity & timeline */

/**
 * Per-country signal intensity for the tactical map.
 * `recent` = hits in days 0-7, `previous` = hits in days 7-14.
 * `deltaPct` lets the UI render an honest trend figure instead of a
 * hard-coded one: +Infinity (0 -> n>0) renders as "NEW".
 */
function intensityEntry(country, recent, previous) {
    let label = 'Low', cls = 'intensity-low';
    if (recent >= 15) { label = 'Critical'; cls = 'intensity-high'; }
    else if (recent >= 5) { label = 'High'; cls = 'intensity-high'; }
    else if (recent >= 2) { label = 'Medium'; cls = 'intensity-med'; }

    let deltaPct = 0;
    if (previous > 0) deltaPct = Math.round(((recent - previous) / previous) * 1000) / 10;
    else if (recent > 0) deltaPct = null; // null == "new activity, no baseline"

    return {
        country: country.charAt(0).toUpperCase() + country.slice(1),
        attacks: String(recent),
        previous: String(previous),
        intensity: label,
        trend: recent < previous || (recent === 0 && previous === 0) ? 'down' : 'up',
        deltaPct,
        class: cls
    };
}

/**
 * Rolling 14-day daily buckets (UTC) for the signal timeline sparkline.
 * Oldest first, always exactly 14 entries ending today.
 */
function buildTimeline(items, now = Date.now(), days = 14) {
    const dayMs = 86400000;
    const buckets = new Map();
    (items || []).forEach(item => {
        const ts = Number(item && item.pubDate);
        if (!Number.isFinite(ts)) return;
        const day = new Date(ts - (ts % dayMs)).toISOString().slice(0, 10);
        buckets.set(day, (buckets.get(day) || 0) + 1);
    });
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
        const dayStart = now - (now % dayMs) - i * dayMs;
        const day = new Date(dayStart).toISOString().slice(0, 10);
        out.push({ date: day, count: buckets.get(day) || 0 });
    }
    return out;
}

/**
 * Merge a freshly computed timeline with the previously committed one so a
 * quiet cycle (all feeds failed) never erases history. Fresh values win.
 */
function mergeTimelines(previousDays, freshDays, days = 14) {
    const merged = new Map();
    (previousDays || []).forEach(d => { if (d && d.date) merged.set(d.date, Number(d.count) || 0); });
    (freshDays || []).forEach(d => { if (d && d.date) merged.set(d.date, Number(d.count) || 0); });
    return [...merged.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-days)
        .map(([date, count]) => ({ date, count }));
}

/** Provenance manifest consumed by the dashboard footer / telemetry strip. */
function buildMeta({ feedReports, counts, source = 'pipeline', now = Date.now(), newestWireTs = null }) {
    return {
        schemaVersion: SCHEMA_VERSION,
        generatedAt: new Date(now).toISOString(),
        source,
        counts,
        wireNewestAt: newestWireTs ? new Date(newestWireTs).toISOString() : null,
        feeds: (feedReports || []).map(f => ({
            source: String(f.source || 'UNKNOWN'),
            ok: Boolean(f.ok),
            items: Number(f.items) || 0,
            error: f.error ? String(f.error).slice(0, 120) : null
        }))
    };
}

/* ---------------------------------------------------------- async utils */

/** Minimal worker pool — caps concurrency AND preserves input order. */
async function mapPool(items, limit, worker) {
    const list = Array.isArray(items) ? items : [];
    const out = new Array(list.length);
    let cursor = 0;
    const lanes = Array.from({ length: Math.max(1, limit) }, async () => {
        while (cursor < list.length) {
            const i = cursor++;
            out[i] = await worker(list[i]);
        }
    });
    await Promise.all(lanes);
    return out;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * fetch() with timeout + bounded retries and exponential backoff + jitter.
 * Only transient failures (network errors, 429, 5xx) are retried.
 */
async function fetchWithRetry(url, { timeoutMs = 20000, retries = 2, headers = {} } = {}) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        let res;
        try {
            res = await fetch(url, { signal: controller.signal, headers });
        } catch (err) {
            // Network error / abort: transient, retriable if attempts remain.
            clearTimeout(timer);
            lastError = err;
            if (attempt === retries) throw lastError;
            await sleep(800 * Math.pow(2, attempt) + Math.floor(Math.random() * 250));
            continue;
        }
        clearTimeout(timer);
        if (res.ok) return res;
        // HTTP error: only 429/5xx are retried; permanent failures fail fast.
        lastError = new Error(`HTTP ${res.status}`);
        const retriable = res.status === 429 || res.status >= 500;
        if (!retriable || attempt === retries) throw lastError;
        await sleep(800 * Math.pow(2, attempt) + Math.floor(Math.random() * 250));
    }
    throw lastError;
}

module.exports = {
    SCHEMA_VERSION,
    decodeEntities,
    pickTag,
    pickLink,
    stripHtml,
    parseFeed,
    buildTags,
    dedupeKey,
    dedupeAndSort,
    sanitizeWireItem,
    scoreToSeverity,
    extractCvss,
    titleCase,
    intensityEntry,
    buildTimeline,
    mergeTimelines,
    buildMeta,
    mapPool,
    sleep,
    fetchWithRetry
};
