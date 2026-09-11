/**
 * YASLOGIST // SOVEREIGN CTI INGEST PIPELINE
 * ------------------------------------------------------------------
 * Runs on GitHub Actions every 2 hours. Produces three committed artefacts:
 *   data/intel_wire.json        - live Middle East kinetic + cyber wire
 *   data/middle_east_cves.json  - actively weaponized CVEs seen in the feeds
 *   data/target_intensity.json  - per-country attack intensity for the map
 *
 * Feeds are parsed DIRECTLY from source XML. No third-party RSS proxy,
 * therefore no rate limit and no silent empty payloads.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const WIRE_FILE = path.join(DATA_DIR, 'intel_wire.json');
const CVE_FILE = path.join(DATA_DIR, 'middle_east_cves.json');
const INTENSITY_FILE = path.join(DATA_DIR, 'target_intensity.json');

const FEEDS = [
    { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC Middle East', alwaysRelevant: true },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://www.reutersagency.com/feed/?best-topics=middle-east&post_type=best', source: 'Reuters' },
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

/* ------------------------------------------------------------------ utils */

async function fetchText(url, timeoutMs = 20000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; YASLOGIST-CTI/1.0; +https://github.com/YASLOGIST)',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*'
            }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.text();
    } finally {
        clearTimeout(timer);
    }
}

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
    const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    return m ? decodeEntities(m[1]) : '';
}

function pickLink(block) {
    const rss = pickTag(block, 'link');
    if (rss) return rss;
    const atom = block.match(/<link[^>]*href=["']([^"']+)["']/i);
    return atom ? atom[1] : '#';
}

function stripHtml(str) {
    return decodeEntities(String(str || '').replace(/<[^>]+>/g, ' '));
}

function parseFeed(xml) {
    const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) || [];
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

function buildTags(contentStr) {
    const tags = [];
    if (contentStr.includes('ransomware')) tags.push({ textEn: 'RANSOMWARE', textAr: 'برمجيات الفدية', class: 'tag-urgent' });
    if (contentStr.includes('zero-day') || contentStr.includes('0-day')) tags.push({ textEn: 'ZERO-DAY', textAr: 'يوم-الصفر', class: 'tag-purple' });
    if (['maritime', 'suez', 'red sea', 'houthi', 'vessel', 'tanker', 'hormuz'].some(k => contentStr.includes(k))) {
        tags.push({ textEn: 'MARITIME', textAr: 'ملاحة بحرية', class: 'tag-urgent' });
    }
    if (contentStr.includes('ddos')) tags.push({ textEn: 'DDoS', textAr: 'حجب الخدمة', class: 'tag-warn' });
    if (contentStr.includes('apt') || contentStr.includes('state-sponsored')) tags.push({ textEn: 'APT', textAr: 'مجموعات متقدمة', class: 'tag-cyan' });
    if (tags.length === 0) tags.push({ textEn: 'INTEL', textAr: 'استخبارات', class: '' });
    return tags.slice(0, 3);
}

// Pulls the real CVSS base score / severity published with the record.
// Metrics live under the CNA container or an ADP container (e.g. CISA-ADP),
// and may be CVSS v4.0, v3.1, v3.0 or v2.0 depending on the CNA.
function extractCvss(data) {
    const buckets = [];
    try { if (data.containers.cna.metrics) buckets.push(...data.containers.cna.metrics); } catch (e) {}
    try { (data.containers.adp || []).forEach(a => { if (a.metrics) buckets.push(...a.metrics); }); } catch (e) {}

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

function scoreToSeverity(score) {
    if (score >= 9.0) return 'CRITICAL';
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.0) return 'MEDIUM';
    return 'LOW';
}

function titleCase(str) {
    const s = String(str || 'High').toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
}

async function fetchCVEInfo(cveId) {
    try {
        const res = await fetch(`https://cveawg.mitre.org/api/cve/${cveId}`);
        if (!res.ok) return null;
        const data = await res.json();

        let system = 'Unknown System';
        try {
            const affected = data.containers.cna.affected[0];
            system = affected.product || affected.vendor || 'Unknown System';
            if (String(system).toLowerCase() === 'n/a') system = affected.vendor || 'Unknown System';
        } catch (e) { /* shape varies across CNAs */ }

        const cvss = extractCvss(data);
        const severity = titleCase(cvss ? cvss.severity : 'High');

        return {
            id: cveId,
            system,
            severity,
            cvss: cvss ? cvss.score : null,
            badge: `badge-${severity.toLowerCase()}`
        };
    } catch (e) {
        return null;
    }
}

/* ------------------------------------------------------------------- main */

async function run() {
    const now = Date.now();
    const wireItems = [];
    const foundCves = new Set();
    const countryStats = {};
    TARGET_COUNTRIES.forEach(c => { countryStats[c] = { recent: 0, previous: 0 }; });

    const results = await Promise.allSettled(FEEDS.map(async feed => {
        const xml = await fetchText(feed.url);
        return { feed, items: parseFeed(xml) };
    }));

    results.forEach((result, idx) => {
        if (result.status !== 'fulfilled') {
            console.warn(`[SKIP] ${FEEDS[idx].source}: ${result.reason && result.reason.message}`);
            return;
        }
        const { feed, items } = result.value;
        console.log(`[OK]   ${feed.source}: ${items.length} items`);

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
                tags: buildTags(contentStr)
            });

            (contentStr.match(/cve-\d{4}-\d{4,7}/gi) || []).forEach(m => foundCves.add(m.toUpperCase()));

            if (daysOld <= 7) {
                TARGET_COUNTRIES.forEach(c => { if (contentStr.includes(c)) countryStats[c].recent++; });
            } else if (daysOld <= 14) {
                TARGET_COUNTRIES.forEach(c => { if (contentStr.includes(c)) countryStats[c].previous++; });
            }
        });
    });

    /* ---- intel wire ---- */
    const seen = new Set();
    const wire = wireItems
        .filter(i => {
            const key = i.titleEn.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => b.pubDate - a.pubDate)
        .slice(0, MAX_WIRE_ITEMS);

    if (wire.length > 0) {
        fs.writeFileSync(WIRE_FILE, JSON.stringify(wire, null, 2));
        console.log(`Wrote ${wire.length} wire items -> data/intel_wire.json`);
    } else {
        console.warn('No wire items resolved; keeping previous intel_wire.json intact.');
    }

    /* ---- CVEs ---- */
    let cves = [];
    if (fs.existsSync(CVE_FILE)) {
        try { cves = JSON.parse(fs.readFileSync(CVE_FILE, 'utf-8')); } catch (e) { cves = []; }
    }
    // Backfill CVSS for records stored before severity was read from MITRE.
    for (let i = 0; i < cves.length; i++) {
        if (cves[i] && cves[i].cvss === undefined) {
            const fresh = await fetchCVEInfo(cves[i].id);
            if (fresh) cves[i] = fresh;
            else cves[i].cvss = null;
        }
    }

    const knownIds = new Set(cves.map(c => c.id));
    let added = 0;
    for (const cveId of foundCves) {
        if (knownIds.has(cveId)) continue;
        const info = await fetchCVEInfo(cveId);
        cves.unshift(info || { id: cveId, system: 'Unknown (Active Exploit)', severity: 'High', badge: 'badge-high' });
        knownIds.add(cveId);
        added++;
    }
    cves = cves.slice(0, MAX_CVES);
    fs.writeFileSync(CVE_FILE, JSON.stringify(cves, null, 4));
    console.log(`CVE set: ${cves.length} tracked (${added} new), avg CVSS ` +
        (cves.filter(c => c.cvss).reduce((a, c) => a + c.cvss, 0) /
         Math.max(cves.filter(c => c.cvss).length, 1)).toFixed(1));

    /* ---- target intensity ---- */
    const intensity = TARGET_COUNTRIES.map(country => {
        const { recent, previous } = countryStats[country];
        let label = 'Low', cls = 'intensity-low';
        if (recent >= 15) { label = 'Critical'; cls = 'intensity-high'; }
        else if (recent >= 5) { label = 'High'; cls = 'intensity-high'; }
        else if (recent >= 2) { label = 'Medium'; cls = 'intensity-med'; }

        return {
            country: country.charAt(0).toUpperCase() + country.slice(1),
            attacks: String(recent),
            intensity: label,
            trend: recent < previous || (recent === 0 && previous === 0) ? 'down' : 'up',
            class: cls
        };
    }).sort((a, b) => parseInt(b.attacks, 10) - parseInt(a.attacks, 10));

    fs.writeFileSync(INTENSITY_FILE, JSON.stringify(intensity, null, 4));
    console.log('Wrote data/target_intensity.json');
}

run().catch(err => {
    console.error('Pipeline failed:', err);
    process.exit(1);
});
