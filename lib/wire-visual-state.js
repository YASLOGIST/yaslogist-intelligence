/**
 * State-first Intel Wire presentation; all statuses are based on committed
 * timestamp metadata or observed browser fetch attempts, never fabricated
 * shipment risk, event verification or guaranteed source coverage.
 * Pure classifiers plus one optional DOM painter; no network/timers.
 */
export function matchesLogisticsKeywords(item) {
    const text = [item?.titleEn, item?.summaryEn, item?.titleAr, item?.summaryAr]
        .filter(Boolean).join(' ').toLowerCase();
    return /\b(?:maritime|shipping|shipment|freight|container|containers|cargo|logistics|supply[ -]chain|vessel|vessels|tanker|tankers|port|ports|airport|airspace|aviation|suez|hormuz|red[ -]sea|bab[ -]el[ -]mandeb|customs|transit)\b|ملاحة|ميناء|موانئ|الشحن|الشحنات|النقل|الجمارك|السويس|البحر الأحمر|هرمز/.test(text);
}

export function orderWireItems(items, order = 'newest') {
    const stamp = item => { const n = Number(item?.pubDate); return n > 0 && Number.isFinite(n) ? n : null; };
    return [...(items || [])].sort((a, b) => {
        const x = stamp(a), y = stamp(b);
        if (x === null || y === null) return x === null ? (y === null ? 0 : 1) : -1;
        return (order === 'oldest' ? 1 : -1) * (x - y);
    });
}

/** The publishing cadence is 2h; 5h is delayed and 24h is stale. */
export function snapshotAge(meta, now = Date.now()) {
    const stamp = Date.parse(String(meta?.generatedAt || ''));
    if (!Number.isFinite(stamp) || stamp <= 0 || stamp > now + 300000) {
        return { status: 'unknown', hours: null };
    }
    const hours = Math.max(0, (now - stamp) / 3600000);
    return { status: hours >= 24 ? 'stale' : hours >= 5 ? 'delayed' : 'recent', hours };
}

export function overlayHealth(feedHealth, networkOnline = true) {
    if (networkOnline === false) return { status: 'offline', ok: null, total: null };
    if (!feedHealth || !Number.isFinite(feedHealth.total) || feedHealth.total <= 0) {
        return { status: 'unchecked', ok: null, total: null };
    }
    const total = Math.trunc(feedHealth.total);
    const ok = Math.max(0, Math.min(total, Math.trunc(Number(feedHealth.ok) || 0)));
    return { status: ok === total ? 'responsive' : ok > 0 ? 'partial' : 'unavailable', ok, total };
}

export function wireViewState(tag = 'ALL', query = '') {
    return tag === 'PINNED' ? 'watchlist' : tag !== 'ALL' || !!String(query).trim() ? 'filtered' : 'all';
}

/** Bilingual copy is explicit: a successful fetch is not an incident verification. */
export function wireStatusModel(app, shown = null, now = Date.now()) {
    const ar = app?.currentLang === 'ar';
    const snapshot = snapshotAge(app?.pipelineMeta, now);
    const overlay = overlayHealth(app?.feedHealth, app?.networkOnline);
    const total = app?.allWireItems?.length || 0;
    const visible = shown === null ? app?.wireVisibleCount ?? total : shown;
    const view = wireViewState(app?.activeWireTag, app?.wireSearchTerm);
    const ageHours = snapshot.hours === null ? null : Math.floor(snapshot.hours);
    const ageText = snapshot.hours === null ? '' : snapshot.hours < 1
        ? ar ? 'أقل من ساعة' : 'under 1h' : ar ? ageHours + ' ساعة' : ageHours + 'h';
    const snapshotValue = snapshot.status === 'unknown'
        ? (ar ? 'وقت النشر غير معروف' : 'Publication time unknown')
        : (ar ? 'عمر النسخة ' + ageText : 'Published ' + ageText + ' ago');
    const overlayValue = overlay.ok === null
        ? overlay.status === 'offline'
            ? (ar ? 'غير متصل · الفحص متوقف' : 'Offline · no current check')
            : (ar ? 'لم يبدأ الفحص بعد' : 'Not checked yet')
        : (ar ? 'استجابة ' : 'Responding ') + overlay.ok + '/' + overlay.total;
    const viewValue = view === 'watchlist'
        ? (ar ? 'قائمة المتابعة: ' : 'Watchlist: ') + visible
        : view === 'filtered'
            ? (ar ? 'مصفّى: ' : 'Filtered: ') + visible + '/' + total
            : (ar ? 'كل التقارير: ' : 'All reports: ') + total;
    return {
        snapshot: { status: snapshot.status, label: ar ? 'نسخة البيانات' : 'Published snapshot',
            value: snapshotValue,
            hint: ar ? 'التاريخ من بيانات النشر؛ ليس وقت وقوع الحدث أو تأكيد صحته'
                : 'Age of committed publication; not incident time or truth' },
        overlay: { status: overlay.status, label: ar ? 'فحص المصادر الاختيارية' : 'Optional source check',
            value: overlayValue,
            hint: ar ? 'استجابات فحص RSS في المتصفح؛ لا تعني التحقق من صحة الأخبار'
                : 'Browser RSS fetch responses; not independent news verification' },
        view: { status: view, label: ar ? 'وضع عرض الأخبار' : 'Wire reading mode',
            value: viewValue,
            hint: ar ? 'حالة تصفية الواجهة فقط؛ لا تغيّر مصدر الأخبار'
                : 'Local viewing filter only; underlying reports are unchanged' },
    };
}

/** Safe text-only DOM update. Avoids animation loops and duplicated announcements. */
export function paintWireVisualState(app, shown = null) {
    if (typeof document === 'undefined') return;
    const model = wireStatusModel(app, shown);
    for (const [key, item] of Object.entries(model)) {
        const el = document.getElementById('wire-state-' + key);
        if (!el) continue;
        el.dataset.status = item.status;
        el.setAttribute('title', item.hint);
        const label = el.querySelector('.wire-state-label');
        const value = el.querySelector('.wire-state-value');
        if (label && label.textContent !== item.label) label.textContent = item.label;
        if (value && value.textContent !== item.value) value.textContent = item.value;
    }
    const activeSource = String(app?.wireSearchTerm || '');
    document.querySelectorAll('#wire-source-strip .source-chip').forEach(chip => {
        const isSelected = !!activeSource && chip.getAttribute('data-source-filter') === activeSource;
        chip.setAttribute('aria-pressed', String(isSelected));
    });
}
