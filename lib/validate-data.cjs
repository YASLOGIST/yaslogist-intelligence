/**
 * YASLOGIST // COMMITTED-ARTEFACT VALIDATORS
 * Pure, dependency-free schema checks for every file the pipeline commits.
 * Returns a list of issue strings (empty == valid) so both the CLI script
 * (scripts/validate-data.cjs) and the test suite (tests/data-schema.test.cjs)
 * share one source of truth.
 */

'use strict';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isFiniteNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const looksHttp = (v) => v === '#' || /^https?:\/\/.+/i.test(String(v || ''));

function validateWire(data) {
    const issues = [];
    if (!Array.isArray(data)) return ['intel_wire.json: root must be an array'];
    if (data.length > 60) issues.push(`intel_wire.json: ${data.length} items exceeds cap of 60`);
    data.forEach((item, i) => {
        const at = `intel_wire.json[${i}]`;
        if (!isObj(item)) return issues.push(`${at}: not an object`);
        if (typeof item.titleEn !== 'string' || !item.titleEn.trim()) issues.push(`${at}: titleEn missing/empty`);
        if (typeof item.titleAr !== 'string' || !item.titleAr.trim()) issues.push(`${at}: titleAr missing/empty`);
        if (!isFiniteNumber(item.pubDate)) issues.push(`${at}: pubDate must be epoch ms number`);
        if (!looksHttp(item.link)) issues.push(`${at}: link not http(s) allow-listed (${String(item.link).slice(0, 60)})`);
        if (typeof item.source !== 'string' || !item.source.trim()) issues.push(`${at}: source missing`);
        if (!Array.isArray(item.tags)) issues.push(`${at}: tags must be an array`);
        else {
            if (item.tags.length > 3) issues.push(`${at}: more than 3 tags`);
            item.tags.forEach((t, j) => {
                if (!isObj(t) || typeof t.textEn !== 'string' || !t.textEn) issues.push(`${at}.tags[${j}]: textEn missing`);
            });
        }
    });
    return issues;
}

const CVE_SEVERITIES = ['critical', 'high', 'medium', 'low'];
function validateCves(data) {
    const issues = [];
    if (!Array.isArray(data)) return ['middle_east_cves.json: root must be an array'];
    if (data.length > 8) issues.push(`middle_east_cves.json: ${data.length} items exceeds cap of 8`);
    data.forEach((cve, i) => {
        const at = `middle_east_cves.json[${i}]`;
        if (!isObj(cve)) return issues.push(`${at}: not an object`);
        if (!/^CVE-\d{4}-\d{4,7}$/i.test(String(cve.id || ''))) issues.push(`${at}: malformed CVE id "${cve.id}"`);
        if (!CVE_SEVERITIES.includes(String(cve.severity || '').toLowerCase())) issues.push(`${at}: unknown severity "${cve.severity}"`);
        if (cve.cvss !== null && cve.cvss !== undefined) {
            if (!isFiniteNumber(Number(cve.cvss)) || Number(cve.cvss) < 0 || Number(cve.cvss) > 10) {
                issues.push(`${at}: cvss out of range (${cve.cvss})`);
            }
        }
        if (typeof cve.system !== 'string' || !cve.system.trim()) issues.push(`${at}: system missing`);
    });
    return issues;
}

const INTENSITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];
const INTENSITY_CLASSES = ['intensity-high', 'intensity-med', 'intensity-low'];
function validateIntensity(data) {
    const issues = [];
    if (!Array.isArray(data)) return ['target_intensity.json: root must be an array'];
    const seen = new Set();
    data.forEach((row, i) => {
        const at = `target_intensity.json[${i}]`;
        if (!isObj(row)) return issues.push(`${at}: not an object`);
        if (typeof row.country !== 'string' || !row.country.trim()) issues.push(`${at}: country missing`);
        else if (seen.has(row.country)) issues.push(`${at}: duplicate country "${row.country}"`);
        else seen.add(row.country);
        if (!/^\d+$/.test(String(row.attacks))) issues.push(`${at}: attacks must be a numeric string (${row.attacks})`);
        if (row.previous !== undefined && !/^\d+$/.test(String(row.previous))) issues.push(`${at}: previous must be a numeric string (${row.previous})`);
        if (!INTENSITY_LEVELS.includes(row.intensity)) issues.push(`${at}: unknown intensity "${row.intensity}"`);
        if (!INTENSITY_CLASSES.includes(row.class)) issues.push(`${at}: unknown class "${row.class}"`);
        if (row.deltaPct !== undefined && row.deltaPct !== null && !isFiniteNumber(Number(row.deltaPct))) {
            issues.push(`${at}: deltaPct must be number|null`);
        }
    });
    return issues;
}

function validateMeta(data) {
    const issues = [];
    if (!isObj(data)) return ['meta.json: root must be an object'];
    if (typeof data.schemaVersion !== 'number') issues.push('meta.json: schemaVersion must be a number');
    if (isNaN(Date.parse(data.generatedAt))) issues.push('meta.json: generatedAt does not parse as a date');
    if (!['pipeline', 'offline-derivation'].includes(data.source)) issues.push(`meta.json: unknown source "${data.source}"`);
    if (!isObj(data.counts)) issues.push('meta.json: counts missing');
    else ['wire', 'cves', 'countries'].forEach(k => {
        if (!Number.isInteger(data.counts[k]) || data.counts[k] < 0) issues.push(`meta.json: counts.${k} must be a non-negative integer`);
    });
    if (!Array.isArray(data.feeds)) issues.push('meta.json: feeds must be an array');
    else data.feeds.forEach((f, i) => {
        if (!isObj(f) || typeof f.source !== 'string' || typeof f.ok !== 'boolean') {
            issues.push(`meta.json.feeds[${i}]: needs {source:string, ok:boolean}`);
        }
    });
    return issues;
}

function validateTimeline(data) {
    const issues = [];
    if (!isObj(data)) return ['signal_timeline.json: root must be an object'];
    if (!Array.isArray(data.days)) return ['signal_timeline.json: days must be an array'];
    if (data.days.length > 14) issues.push(`signal_timeline.json: ${data.days.length} days > 14`);
    let prev = '';
    data.days.forEach((d, i) => {
        const at = `signal_timeline.json.days[${i}]`;
        if (!isObj(d) || !/^\d{4}-\d{2}-\d{2}$/.test(String(d.date || ''))) return issues.push(`${at}: date must be YYYY-MM-DD`);
        if (!Number.isInteger(d.count) || d.count < 0) issues.push(`${at}: count must be a non-negative integer`);
        if (d.date <= prev) issues.push(`${at}: dates must be strictly increasing`);
        prev = d.date;
    });
    return issues;
}

const VALIDATORS = {
    'intel_wire.json': validateWire,
    'middle_east_cves.json': validateCves,
    'target_intensity.json': validateIntensity,
    'meta.json': validateMeta,
    'signal_timeline.json': validateTimeline
};

module.exports = { VALIDATORS, validateWire, validateCves, validateIntensity, validateMeta, validateTimeline };
