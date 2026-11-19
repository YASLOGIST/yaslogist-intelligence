/**
 * UI-only bilingual strings and an evidence export. No translations of original
 * publisher content, no outside APIs, no risk inference or invented incidents.
 */
export const COMMAND_TEXT = Object.freeze({
    en: ['Refresh intelligence wire','Export intelligence snapshot (JSON)',
        'Export analytical brief (Markdown)','Copy link to current view',
        'Switch to Arabic','Open threat map','Toggle full screen',
        'Recalculate analytical brief'],
    ar: ['فحص أحدث تقارير الاستخبارات','تصدير نسخة البيانات (JSON)',
        'تصدير الموجز التحليلي (Markdown)','نسخ رابط القسم الحالي',
        'التبديل إلى الإنجليزية','فتح خريطة التهديدات','تبديل ملء الشاشة',
        'إعادة حساب الموجز التحليلي']
});
const PALETTE_TEXT = Object.freeze({
    en: {
        kicker:'YASLOGIST // OPERATOR CONSOLE',title:'Command palette',
        search:'Search commands…',none:'No matching command',
        close:'Close command palette',hint:'ESC CLOSE · ↑↓ NAVIGATE · ENTER EXECUTE',
        launcher:'Open command palette'
    },
    ar: {
        kicker:'ياسلوجست // وحدة تحكم المحلل',title:'لوحة الأوامر',
        search:'ابحث عن أمر…',none:'لا توجد أوامر مطابقة',
        close:'إغلاق لوحة الأوامر',hint:'ESC إغلاق · ↑↓ تنقّل · ENTER تنفيذ',
        launcher:'فتح لوحة الأوامر'
    }
});
const ATTR_LABELS = Object.freeze({
    en: {
        commandLauncher:'Open command palette',
        langToggleBtn:'Switch to Arabic',
        'refresh-news-btn':'Check public-source updates',
        'news-search':'Search original public reports',
        'actor-search':'Search actor reference profiles',
        'cve-search':'Search observed CVEs',
        'cve-export-btn':'Export filtered CVEs as CSV',
        btnResetMap:'Reset map view'
    },
    ar: {
        commandLauncher:'فتح لوحة الأوامر',
        langToggleBtn:'التبديل إلى الإنجليزية',
        'refresh-news-btn':'فحص تحديثات المصادر العامة',
        'news-search':'البحث في تقارير المصادر العامة',
        'actor-search':'البحث في ملفات المجموعات المرجعية',
        'cve-search':'البحث في الثغرات المرصودة',
        'cve-export-btn':'تصدير الثغرات المصفاة بصيغة CSV',
        btnResetMap:'إعادة ضبط الخريطة'
    }
});
const GROUP_LABELS = Object.freeze({
    en: {
        '.kpi-strip':'Analytical activity indicators',
        '.cve-toolbar':'CVE filtering and export controls',
        '#wire-tags-filter':'Public-report category filters',
        '#wire-source-strip':'Filter reports by original publisher',
        '.tactical-navbar':'Main navigation',
        '#workspace-bar':'Current view actions',
        '#attackVectorChart':'Distribution of observed report categories',
        '#industryChart':'Report signals by infrastructure sector',
        '.chokepoint-status-bar':'Map evidence legend'
    },
    ar: {
        '.kpi-strip':'مؤشرات النشاط التحليلي',
        '.cve-toolbar':'أدوات تصفية الثغرات وتصديرها',
        '#wire-tags-filter':'مرشحات فئات التقارير',
        '#wire-source-strip':'تصفية التقارير حسب المصدر الأصلي',
        '.tactical-navbar':'التنقّل الرئيسي',
        '#workspace-bar':'أدوات القسم الحالي',
        '#attackVectorChart':'توزيع فئات التقارير المرصودة',
        '#industryChart':'الإشارات حسب قطاع البنية التحتية',
        '.chokepoint-status-bar':'مفتاح الرموز المرجعية للخريطة'
    }
});

export function paletteCopy(lang='en') {return PALETTE_TEXT[lang==='ar'?'ar':'en'];}
export function translateCommandLabels(commands,lang='en') {
    const labels=COMMAND_TEXT[lang==='ar'?'ar':'en'];
    return commands.map((entry,i)=>[labels[i] || entry[0],entry[1],entry[2]]);
}
export function localizePalette(doc,lang='en') {
    const t=paletteCopy(lang);
    const palette=doc.getElementById('command-palette');
    if(!palette)return;
    const selectors=[
        ['.command-palette-head .eyebrow',t.kicker],
        ['#command-palette-title',t.title],
        ['.command-hint',t.hint]
    ];
    for(const [query,value] of selectors){
        const el=palette.querySelector(query);
        if(el)el.textContent=value;
    }
    const search=palette.querySelector('#command-search');
    if(search){search.placeholder=t.search;search.setAttribute('aria-label',t.search);}
    const close=palette.querySelector('.command-close');
    if(close)close.setAttribute('aria-label',t.close);
}
export function applySupplementaryLabels(doc,lang='en') {
    const code=lang==='ar'?'ar':'en';
    const labels=ATTR_LABELS[code];
    for(const [id,label] of Object.entries(labels)) {
        const el=doc.getElementById(id);
        if(el)el.setAttribute('aria-label',label);
    }
    for(const [selector,label] of Object.entries(GROUP_LABELS[code])) {
        const el=doc.querySelector(selector);
        if(el)el.setAttribute('aria-label',label);
    }
    const launcher=doc.getElementById('commandLauncher');
    if(launcher)launcher.title=PALETTE_TEXT[code].launcher;
    const pinned=doc.querySelector('[data-tag="PINNED"]');
    if(pinned){
        pinned.setAttribute('aria-label',code==='ar'?'عرض التقارير المثبتة فقط':'Show only pinned reports');
        pinned.title=code==='ar'?'قائمة متابعة المحلل':'Operator watchlist';
    }
    const meta=doc.querySelector('meta[name="description"]');
    if(meta)meta.content=code==='ar'
        ?'ياسلوجست إنتليجنس: رصد تحليلي إقليمي وبحري وسيبراني من مصادر عامة مع توضيح حداثة البيانات.'
        :'YASLOGIST Intelligence: bilingual regional, maritime and cyber signals from public sources.';
    localizePalette(doc,code);
}

/** A deterministic, local evidence handoff, never a claim of verified attacks. */
export function evidenceBrief({tab='dashboard',lang='en',app=null,documentRef=null}={}) {
    const ar=lang==='ar';
    const meta=app?.pipelineMeta;
    const stamp=meta?.generatedAt;
    const published=stamp && Number.isFinite(Date.parse(stamp))
        ? new Intl.DateTimeFormat(ar?'ar-EG':'en-GB',{
            dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Cairo'
          }).format(new Date(stamp))+(ar?' (توقيت القاهرة)':' (Cairo time)')
        : (ar?'غير متاح':'Unavailable');
    const count=Array.isArray(app?.allWireItems)?app.allWireItems.length:null;
    const cves=Array.isArray(app?.cveData)?app.cveData.length:null;
    const actorCards=documentRef?.querySelectorAll?.('#actors-grid .actor-dossier-card')?.length ?? null;
    const visible=documentRef?.querySelectorAll?.('#news-container .wire-item')?.length ?? null;
    const health=app?.feedHealth;
    const overlay=health && Number.isFinite(health.total) && health.total>0
        ? (health.ok||0)+'/'+health.total
        : (ar?'لم يُفحص':'Not checked');
    const value=(x)=>x===null?(ar?'غير متاح':'Unavailable'):String(x);
    const view={
        dashboard:ar?'العمليات':'Operations',
        'threat-map-view':ar?'خريطة التهديدات':'Threat map',
        'intel-wire':ar?'شريط الاستخبارات':'Intelligence wire',
        'cve-matrix':ar?'مصفوفة الثغرات':'CVE matrix',
        'apt-dossiers':ar?'ملفات الجهات المرجعية':'APT dossiers'
    }[tab] || tab;
    return ar
      ? 'ياسلوجست إنتليجنس — ملخص الأدلة\nالقسم: '+view+
        '\nآخر نشر لبيانات المصادر: '+published+
        '\nإجمالي التقارير المحفوظة: '+value(count)+
        '\nالتقارير المطابقة للتصفية: '+value(visible)+
        '\nالثغرات المرصودة: '+value(cves)+
        '\nالملفات المرجعية المعروضة: '+value(actorCards)+
        '\nاستجابة المصادر الاختيارية: '+overlay+
        '\nملاحظة: هذه بيانات رصد من مصادر عامة وليست تأكيدًا لحادث أو تأخر شحنة. تحقق من المصدر الأولي.'
      : 'YASLOGIST Intelligence — evidence brief\nView: '+view+
        '\nPublished data timestamp: '+published+
        '\nCommitted reports: '+value(count)+
        '\nReports matching active filter: '+value(visible)+
        '\nObserved CVEs: '+value(cves)+
        '\nDisplayed reference profiles: '+value(actorCards)+
        '\nOptional source responses: '+overlay+
        '\nNote: Public-source signals only; not confirmation of an incident or delayed shipment. Check primary sources.';
}
export async function copyText(text,windowRef,documentRef) {
    try{
        if(windowRef?.navigator?.clipboard?.writeText) {
            await windowRef.navigator.clipboard.writeText(text);
            return true;
        }
    }catch{}
    try{
        const el=documentRef.createElement('textarea');
        el.value=text;el.style.position='fixed';el.style.opacity='0';
        documentRef.body.appendChild(el);el.select();
        const ok=documentRef.execCommand('copy');
        el.remove();return !!ok;
    }catch{return false;}
}

/** Explicitly distinguish publisher prose from localized interface controls. */
export function hasUntranslatedSource(...parts) {
    return parts.some(part => {
        const text=String(part||'');
        return /[a-zA-Z]/.test(text) && !/[\u0600-\u06FF]/.test(text);
    });
}

const BRIEF_BUTTON_TEXT = Object.freeze({
  en: { normal:'Copy evidence brief', copied:'Evidence brief copied', failed:'Copy unavailable' },
  ar: { normal:'نسخ موجز الأدلة', copied:'تم نسخ موجز الأدلة', failed:'تعذّر النسخ' }
});
/** One actionable, local-only evidence handoff for whichever tab is active. */
export function mountEvidenceAction(doc,win,getView,getLanguage) {
    const btn=doc.getElementById('workspace-evidence-brief');
    const label=doc.getElementById('workspace-evidence-label');
    if(!btn || !label)return {sync(){},dispose(){}};
    let timer, status='normal';
    const sync=()=>{
        const t=BRIEF_BUTTON_TEXT[getLanguage()==='ar'?'ar':'en'];
        label.textContent=t[status];
        btn.setAttribute('aria-label',t.normal);
        btn.title=t.normal;
    };
    btn.addEventListener('click',async()=>{
        const report=evidenceBrief({
            tab:getView(),lang:getLanguage(),app:win.yaslogistRadar,
            documentRef:doc
        });
        status=await copyText(report,win,doc)?'copied':'failed';
        sync();
        win.clearTimeout(timer);
        timer=win.setTimeout(()=>{status='normal';sync();},1700);
    });
    sync();
    return {sync,dispose:()=>win.clearTimeout(timer)};
}
