/**
 * YASLOGIST Intelligence: tiny, independent cross-panel view controls.
 * No external calls, data modification, analytics, polling or new dependencies.
 */
export const TAB_IDS = Object.freeze(['dashboard', 'threat-map-view', 'intel-wire', 'cve-matrix', 'apt-dossiers']);
export const UI_TEXT = Object.freeze({
    en: {
        comfortable: 'Comfort view', compact: 'Compact view',
        copy: 'Copy view link', copied: 'Link copied', unavailable: 'Copy unavailable',
        profiles: 'reference profiles', cves: 'observed CVEs',
    },
    ar: {
        comfortable: 'عرض مريح', compact: 'عرض مضغوط',
        copy: 'نسخ رابط التبويب', copied: 'تم نسخ الرابط', unavailable: 'تعذّر نسخ الرابط',
        profiles: 'ملفات مرجعية', cves: 'ثغرات مرصودة',
    },
});

/** Context belongs to the active panel, never to unverified incident status. */
export const VIEW_CONTEXT = Object.freeze({
    en: {
        dashboard: 'Committed signals · analytical overview, not confirmed incidents',
        'threat-map-view': 'Country-linked reports · reference markers are not live positions',
        'intel-wire': 'Original public reports · independently verify before action',
        'cve-matrix': 'Observed CVEs · confirm product applicability before remediation',
        'apt-dossiers': 'Reference actor profiles · alias matching is not attribution',
    },
    ar: {
        dashboard: 'إشارات منشورة · نظرة تحليلية وليست حوادث مؤكدة',
        'threat-map-view': 'تقارير مرتبطة بالدول · العلامات المرجعية ليست مواقع حية',
        'intel-wire': 'تقارير من مصادر عامة · تحقق مستقل قبل اتخاذ إجراء',
        'cve-matrix': 'ثغرات مرصودة · تحقق من انطباقها قبل المعالجة',
        'apt-dossiers': 'ملفات مرجعية للجهات · تطابق الأسماء ليس إثباتًا للهوية',
    },
});

export function workspaceContext(tabId, language = 'en') {
    const localized = VIEW_CONTEXT[language === 'ar' ? 'ar' : 'en'];
    return localized[tabId] || localized.dashboard;
}

export function activeWorkspace(tabs) {
    const index = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
    return index < 0 ? 0 : index;
}

export function resultCount(tabId, documentRef) {
    if (tabId === 'cve-matrix') {
        const rows = [...documentRef.querySelectorAll('#cve-table tbody tr')];
        return { value: rows.filter(row => !row.querySelector('.cve-empty-cell')).length, kind: 'cves' };
    }
    if (tabId === 'apt-dossiers') {
        return { value: documentRef.querySelectorAll('#actors-grid .actor-dossier-card').length, kind: 'profiles' };
    }
    return null;
}

export function mountSitewideUI(documentRef = document, windowRef = window) {
    const nav = [...documentRef.querySelectorAll('.tactical-navbar .nav-tab')];
    const densityButton = documentRef.getElementById('workspace-density');
    const copyButton = documentRef.getElementById('workspace-copy-link');
    if (nav.length !== TAB_IDS.length || !densityButton || !copyButton) return null;
    const indexEl = documentRef.getElementById('workspace-index');
    const nameEl = documentRef.getElementById('workspace-name');
    const countEl = documentRef.getElementById('workspace-results');
    const densityText = documentRef.getElementById('workspace-density-label');
    const copyText = documentRef.getElementById('workspace-copy-label');
    const descEn = documentRef.getElementById('workspace-desc-en');
    const descAr = documentRef.getElementById('workspace-desc-ar');
    const workspaceBar = documentRef.getElementById('workspace-bar');
    const lang = () => documentRef.documentElement.lang === 'ar' ? 'ar' : 'en';
    let compact = false;
    try { compact = windowRef.localStorage.getItem('yaslogist.viewDensity') === 'compact'; } catch {}
    let feedbackTimer;
    function sync() {
        const idx = activeWorkspace(nav);
        indexEl.textContent = String(idx + 1).padStart(2, '0') + ' / 05';
        nameEl.textContent = nav[idx].textContent.trim();
        const panel = nav[idx].getAttribute('data-target');
        const contextEn = workspaceContext(panel, 'en');
        const contextAr = workspaceContext(panel, 'ar');
        if (descEn && descEn.textContent !== contextEn) descEn.textContent = contextEn;
        if (descAr && descAr.textContent !== contextAr) descAr.textContent = contextAr;
        workspaceBar?.setAttribute('aria-description', lang() === 'ar' ? contextAr : contextEn);
        const count = resultCount(panel, documentRef);
        countEl.hidden = !count;
        if (count) countEl.textContent = count.value + ' ' + UI_TEXT[lang()][count.kind];
        documentRef.body.dataset.viewDensity = compact ? 'compact' : 'comfortable';
        densityButton.setAttribute('aria-pressed', String(compact));
        densityText.textContent = UI_TEXT[lang()][compact ? 'compact' : 'comfortable'];
        densityButton.setAttribute('aria-label', lang() === 'ar' ? 'تبديل كثافة العرض' : 'Toggle reading density');
        densityButton.title = lang() === 'ar' ? 'عرض مريح أو مضغوط' : 'Comfortable or compact layout';
        copyText.textContent = UI_TEXT[lang()][copyButton.dataset.feedback || 'copy'];
        copyButton.title = UI_TEXT[lang()].copy;
        copyButton.setAttribute('aria-label', UI_TEXT[lang()].copy);
    }
    densityButton.addEventListener('click', () => {
        compact = !compact;
        try { windowRef.localStorage.setItem('yaslogist.viewDensity', compact ? 'compact' : 'comfortable'); } catch {}
        sync();
    });
    copyButton.addEventListener('click', async () => {
        const text = windowRef.location.href;
        let ok = false;
        try {
            if (windowRef.navigator.clipboard?.writeText) {
                await windowRef.navigator.clipboard.writeText(text);
                ok = true;
            }
        } catch {}
        copyButton.dataset.feedback = ok ? 'copied' : 'unavailable';
        sync();
        windowRef.clearTimeout(feedbackTimer);
        feedbackTimer = windowRef.setTimeout(() => {
            delete copyButton.dataset.feedback;
            sync();
        }, 1700);
    });
    const observer = new MutationObserver(sync);
    nav.forEach(tab => observer.observe(tab, { attributes: true, attributeFilter: ['aria-selected'] }));
    const roots = [documentRef.querySelector('#cve-table tbody'), documentRef.getElementById('actors-grid')];
    roots.filter(Boolean).forEach(root => observer.observe(root, { childList: true }));
    const languageObserver = new MutationObserver(sync);
    languageObserver.observe(documentRef.documentElement, { attributes: true, attributeFilter: ['lang'] });
    windowRef.addEventListener('hashchange', sync);
    sync();
    return {
        sync,
        dispose: () => {
            observer.disconnect();
            languageObserver.disconnect();
            windowRef.removeEventListener('hashchange', sync);
            windowRef.clearTimeout(feedbackTimer);
        },
    };
}
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => mountSitewideUI(), { once: true });
    } else {
        mountSitewideUI();
    }
}
