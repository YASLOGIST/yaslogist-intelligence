/**
 * YASLOGIST CYBER & SUPPLY CHAIN THREAT RADAR
 * Master Application Controller & CTI Telemetry Hub
 * Sovereign Military-Grade Frontend Architecture
 * Zero-Build Vanilla JS with 100% Bilingual Arabic/English Coverage
 *
 * Integrity contract (v1.1):
 *   - Every number rendered by this controller is derived from committed
 *     pipeline artefacts (data/*.json) or from the live feed overlay.
 *     No hard-coded telemetry is presented as live.
 *   - All external text is HTML-escaped before insertion; outbound links
 *     are protocol allow-listed (http/https).
 *   - The module exports its class and dictionaries so tests can drive
 *     the full data flow headlessly; the browser bootstrap is skipped
 *     when window.__YASLOGIST_NO_AUTOBOOT__ is set.
 */

import { initAcidSquares } from './acid-squares-bg.js';
import { initThreatMap } from './threat-map.js';

// ===================================================================
// Runtime safety helpers
// ===================================================================
// Feed data is external input. All values inserted into HTML are escaped and
// outbound links are allow-listed before rendering. This keeps the static app
// safe even when an upstream feed is compromised.
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const safeURL = (value, fallback = '#', base) => {
    const raw = String(value || '').trim();
    if (!raw) return fallback; // empty input must not resolve to the page itself
    const resolvedBase = base || (typeof window !== 'undefined' && window.location ? window.location.href : 'https://localhost/');
    try {
        const url = new URL(raw, resolvedBase);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : fallback;
    } catch {
        return fallback;
    }
};

async function fetchJSONWithTimeout(url, options = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}

/* Resilient localStorage (private mode / disabled storage must never throw). */
const storage = {
    get(key, fallback = null) {
        try { const v = window.localStorage.getItem(key); return v === null ? fallback : v; } catch { return fallback; }
    },
    set(key, value) {
        try { window.localStorage.setItem(key, value); } catch { /* storage unavailable */ }
    }
};

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===================================================================
// 1. 100% COMPLETE BILINGUAL DICTIONARY SYSTEM (EN / AR)
// ===================================================================
const I18N = {
    en: {
        commandKicker: 'SOVEREIGN CTI & LOGISTICS INFRASTRUCTURE',
        titleBrand: 'YASLOGIST DEFENSE SYSTEMS',
        navDashboard: 'DASHBOARD',
        navThreatMap: 'THREAT MAP',
        navIntelWire: 'INTEL WIRE',
        navCveMatrix: 'CVE MATRIX',
        navAptDossiers: 'APT DOSSIERS',
        threatRadarTitle: 'YASLOGIST COMMAND INTEL GRID',
        arabicSubtext: '[ SOVEREIGN CYBER & MARITIME THREAT INTELLIGENCE SYSTEM ]',
        threatConditionLabel: 'DEFCON THREAT STATUS',
        defconLow: 'NORMAL',
        defconGuarded: 'GUARDED',
        defconElevated: 'ELEVATED',
        defconHigh: 'HIGH',
        defconCritical: 'CRITICAL',
        defconReadout: 'DEFCON 2 // SEVERE REGIONAL TARGETING',
        utcClockLabel: 'UTC',
        cairoClockLabel: 'CAIRO (EEST)',
        statusLiveFeed: 'FEED: LIVE ENCRYPTED',
        statusOfflineCached: 'FEED: OFFLINE / CACHED',
        langBtnText: 'العربية',
        kpiAttacksLabel: 'REGIONAL SIGNAL VOLUME (7D)',
        kpiAttacksSub: 'Country-linked reports across monitored OSINT feeds',
        kpiCampaignsLabel: 'APT / STATE-LINKED REPORTS',
        kpiCampaignsSub: 'Wire items tagged APT or state-sponsored activity',
        kpiCveLabel: 'WEAPONIZED CVEs TRACKED',
        kpiCveSub: 'Extracted from feeds, enriched via MITRE CVE API',
        kpiLogisticsLabel: 'MARITIME CHOKEPOINT ALERTS',
        kpiLogisticsSub: 'Suez · Bab el-Mandeb · Strait of Hormuz',
        kpiCveTrend: 'MITRE',
        kpiLogisticsTrend: 'LIVE',
        cveSocStandards: 'CVSS / SOC',
        refreshFeedsTitle: 'Refresh Live Feeds',
        switchLangTitle: 'تبديل إلى العربية',
        cockpitTitle: 'SOVEREIGN DEFENSE GRID // LIVE TELEMETRY & THREAT MITIGATION ENGINE',
        cockpitLiveTag: 'LIVE 24/7 STREAM',
        cockpitEngineMeta: 'INGEST PIPELINE // 7 OSINT FEEDS // AUTO-REFRESH 2H',
        progGridName: 'INGEST FEED INTEGRITY',
        progInterceptName: 'WIRE FRESHNESS (24H)',
        progTransitName: 'MARITIME ALERT LOAD',
        progAiName: 'CVE EXPOSURE INDEX',
        mapTitle: 'GEOPOLITICAL & MARITIME THREAT RADAR',
        mapSubtitle: 'Tactical telemetry: Middle East & Global Maritime Trade Chokepoints',
        legendCritical: 'Critical',
        legendHigh: 'High',
        legendMed: 'Medium',
        legendLow: 'Low',
        resetView: 'RESET',
        cpSuez: 'SUEZ CANAL (EGY)',
        cpSuezState: '[WATCH]',
        cpMandeb: 'BAB EL-MANDEB (RED SEA)',
        cpMandebState: '[INTERDICTED]',
        cpHormuz: 'STRAIT OF HORMUZ',
        cpHormuzState: '[ESCORT_REC]',
        vectorChartTitle: 'ATTACK VECTORS DISTRIBUTION',
        sectorChartTitle: 'TARGETED INFRASTRUCTURE SECTORS',
        liveTelemetry: 'LIVE 24H',
        wireTitle: 'LIVE INTELLIGENCE WIRE',
        wireSubtitle: 'Real-time CTI & kinetic conflict intercepts',
        searchWirePlaceholder: 'Filter wire by keyword, CVE, or region...',
        tagAll: 'ALL',
        tagRansomware: 'RANSOMWARE',
        tagZeroday: 'ZERO-DAY',
        tagMaritime: 'MARITIME',
        tagDdos: 'DDoS',
        tagApt: 'APT',
        loadingWire: 'Establishing secure telemetry to intelligence feeds...',
        cveMatrixTitle: 'ACTIVELY EXPLOITED CVE DEFENSE MATRIX',
        cveMatrixSubtitle: 'Weaponized zero-days & known exploited vulnerabilities (KEV)',
        mitreCveSync: 'CISA KEV / MITRE',
        thCveId: 'CVE IDENTIFIER',
        thSystem: 'AFFECTED SYSTEM / VENDOR',
        thSeverity: 'SEVERITY',
        thCvss: 'CVSS',
        thAdvisory: 'TACTICAL ADVISORY',
        cveFilterAll: 'ALL',
        cveSortCvss: 'SORT: CVSS',
        cveEmptyState: 'No CVEs match the current severity filter.',
        smartTimelineLabel: 'SIGNAL VOLUME // 14 DAYS',
        skipToContent: 'Skip to main dashboard',
        navAriaLabel: 'Primary tactical navigation',
        actorsTitle: 'THREAT ACTOR DOSSIERS (APTs & PROXIES)',
        actorsSubtitle: 'State-backed clusters, wiper collectives & hacktivists',
        searchActorsPlaceholder: 'Search actor by alias, origin, target...',
        footerBrand: '◤ YASLOGIST SOVEREIGN DEFENSE SYSTEMS',
        footerDesc: 'Real-Time Threat Intelligence & Maritime Supply Chain Radar',
        footerSync: 'SYSTEM SYNC: ACTIVE',
        footerConfidential: 'CONFIDENTIAL // TACTICAL DISTRIBUTION ONLY',
        advisoryImmediate: 'Immediate Patch / Restrict C2 Gateways',
        advisoryIsolate: 'Isolate Edge Device / Enforce WAF Filters',
        advisoryMonitor: 'Zero-Trust Telemetry & Continuous Auditing',
        sevCritical: 'CRITICAL',
        sevHigh: 'HIGH',
        sevMedium: 'MEDIUM',
        sevLow: 'LOW',
        tagPinned: 'PINNED',
        pinItem: 'Pin to operator watchlist',
        unpinItem: 'Remove from operator watchlist',
        newBadge: 'NEW',
        pinnedEmptyState: 'No pinned reports yet. Star intercepts on the wire to build your personal watchlist.',
        cveSearchPlaceholder: 'Filter CVEs by id, vendor, advisory...',
        cveExportCsvTitle: 'Export the filtered CVE matrix as CSV',
        cveExportToast: 'CVE matrix exported as CSV',
        actorLevelLabel: 'THREAT LEVEL',
        actorActivityLabel: 'ACTIVE ON WIRE',
        actorNoActivity: 'NO LIVE SIGNAL',
        actorMitreLink: 'MITRE ATT&CK',
        sourceBreakdownLabel: 'SOURCE BREAKDOWN',
        sourceFilterTitle: 'Click to filter the wire by this source',
        wireSyncIdle: 'AUTO SYNC · 10M',
        wireSyncedAt: 'OVERLAY SYNCED',
        kpiBarCountries: 'Monitored countries currently reporting signals',
        kpiBarAptShare: 'Share of the live wire tagged APT / state-linked',
        kpiBarPeakCvss: 'Peak CVSS base score of tracked CVEs',
        kpiBarMaritimeShare: 'Share of the live wire tagged maritime'
    },
    ar: {
        commandKicker: 'البنية السيادية لاستخبارات التهديدات وسلاسل الإمداد',
        titleBrand: 'أنظمة دفاع ياسلوجست',
        navDashboard: 'لوحة القيادة',
        navThreatMap: 'خريطة التهديدات',
        navIntelWire: 'شريط الاستخبارات',
        navCveMatrix: 'مصفوفة الثغرات',
        navAptDossiers: 'ملفات المجموعات',
        threatRadarTitle: 'شبكة استخبارات القيادة السيادية - ياسلوجست',
        arabicSubtext: '[نظام الاستخبارات والإنذار المبكر للتهديدات]',
        threatConditionLabel: 'حالة التأهب والجاهزية DEFCON',
        defconLow: 'عادي',
        defconGuarded: 'محترس',
        defconElevated: 'مرتفع',
        defconHigh: 'حرج',
        defconCritical: 'طوارئ قصوى',
        defconReadout: 'DEFCON 2 // استهداف إقليمي حرج لمنشآت الطاقة والنقل',
        utcClockLabel: 'توقيت عالمي UTC',
        cairoClockLabel: 'القاهرة (EEST)',
        statusLiveFeed: 'البث: مشفر ومباشر',
        statusOfflineCached: 'البث: غير متصل / مخزن مؤقت',
        langBtnText: 'ENGLISH',
        kpiAttacksLabel: 'حجم الإشارة الإقليمية (7 أيام)',
        kpiAttacksSub: 'تقارير مرتبطة بالدول عبر مصادر OSINT المرصودة',
        kpiCampaignsLabel: 'تقارير APT ومدعومة من دول',
        kpiCampaignsSub: 'أخبار موسومة كنشاط APT أو مدعوم من دولة',
        kpiCveLabel: 'ثغرات CVE مستغلة مرصودة',
        kpiCveSub: 'مستخرجة من المصادر ومُثراة عبر MITRE CVE API',
        kpiLogisticsLabel: 'إنذارات المضائق البحرية',
        kpiLogisticsSub: 'السويس · باب المندب · مضيق هرمز',
        kpiCveTrend: 'MITRE',
        kpiLogisticsTrend: 'مباشر',
        cveSocStandards: 'معايير CVSS / SOC',
        refreshFeedsTitle: 'تحديث البث الحي',
        switchLangTitle: 'Switch to English',
        cockpitTitle: 'منظومة الدفاع السيادي // بث القياس الآني ومحرك تحييد التهديدات',
        cockpitLiveTag: 'بث حي 24/7',
        cockpitEngineMeta: 'خط المعالجة // 7 مصادر OSINT // تحديث كل ساعتين',
        progGridName: 'سلامة مصادر التغذية',
        progInterceptName: 'حداثة البث (24 ساعة)',
        progTransitName: 'كثافة الإنذارات البحرية',
        progAiName: 'مؤشر التعرض للثغرات',
        mapTitle: 'رادار التهديدات الجيوسياسية والممرات الملاحية',
        mapSubtitle: 'قياس آني: الشرق الأوسط ومضائق التجارة الدولية الحيوية',
        legendCritical: 'حرج جداً',
        legendHigh: 'مرتفع',
        legendMed: 'متوسط',
        legendLow: 'منخفض',
        resetView: 'إعادة الضبط',
        cpSuez: 'قناة السويس (مصر)',
        cpSuezState: '[مراقبة]',
        cpMandeb: 'باب المندب (البحر الأحمر)',
        cpMandebState: '[تهديد ملاحي مباشر]',
        cpHormuz: 'مضيق هرمز',
        cpHormuzState: '[توصية بمرافقة أمنية]',
        vectorChartTitle: 'توزيع نواقل الهجمات السيبرانية',
        sectorChartTitle: 'القطاعات التحتية المستهدفة',
        liveTelemetry: 'بث حي (24س)',
        wireTitle: 'شريط الاستخبارات المباشر',
        wireSubtitle: 'اعتراضات وتحليلات فورية للتهديدات السيبرانية والحركية',
        searchWirePlaceholder: 'ابحث بالكلمة المفتاحية، رمز الثغرة أو الإقليم...',
        tagAll: 'الكل',
        tagRansomware: 'برمجيات الفدية',
        tagZeroday: 'يوم-الصفر',
        tagMaritime: 'ملاحة بحرية',
        tagDdos: 'حجب الخدمة',
        tagApt: 'مجموعات متقدمة',
        loadingWire: 'جاري الاتصال الآمن بالأقمار ومصادر التغذية الاستخباراتية...',
        cveMatrixTitle: 'مصفوفة الدفاع ضد الثغرات المستغلة (CVEs)',
        cveMatrixSubtitle: 'ثغرات يوم-الصفر المستغلة والمسجلة بقوائم CISA KEV',
        mitreCveSync: 'مزامنة CISA KEV / MITRE',
        thCveId: 'رمز الثغرة CVE',
        thSystem: 'النظام المتأثر / الشركة المصنعة',
        thSeverity: 'مستوى الخطورة',
        thCvss: 'الدرجة CVSS',
        thAdvisory: 'التوجيه التكتيكي الفوري',
        cveFilterAll: 'الكل',
        cveSortCvss: 'ترتيب: CVSS',
        cveEmptyState: 'لا توجد ثغرات تطابق مرشح الخطورة الحالي.',
        smartTimelineLabel: 'حجم الإشارة // 14 يوماً',
        skipToContent: 'تخطي إلى لوحة القيادة الرئيسية',
        navAriaLabel: 'التنقل التكتيكي الرئيسي',
        actorsTitle: 'ملفات الفاعلين والمجموعات المهددة (APTs)',
        actorsSubtitle: 'مجموعات برعاية دول، خلايا تخريب، ومجموعات ناشطين',
        searchActorsPlaceholder: 'ابحث عن فاعل، دولة المنشأ، أو قطاع...',
        footerBrand: '◤ منظومة ياسلوجست للدفاع السيادي',
        footerDesc: 'رادار استخبارات التهديدات وسلاسل الإمداد اللوجستية البحرية والبرية',
        footerSync: 'مزامنة النظام: نشطة',
        footerConfidential: 'سري للغاية // للاستخدام التكتيكي الداخلي فقط',
        advisoryImmediate: 'تحديث فوري عاجل / قطع خوادم C2 فوراً',
        advisoryIsolate: 'عزل أجهزة الحافة / تفعيل جدار الحماية WAF',
        advisoryMonitor: 'تفعيل المراقبة الصارمة لبيئة الثقة الصفرية Zero-Trust',
        sevCritical: 'حرجة جداً',
        sevHigh: 'مرتفعة',
        sevMedium: 'متوسطة',
        sevLow: 'منخفضة',
        tagPinned: 'المثبتة',
        pinItem: 'تثبيت في قائمة مراقبة المحلل',
        unpinItem: 'إزالة من قائمة المراقبة',
        newBadge: 'جديد',
        pinnedEmptyState: 'لا توجد تقارير مثبتة بعد. قم بتمييز الاعتراضات بنجمة لبناء قائمة مراقبتك الشخصية.',
        cveSearchPlaceholder: 'تصفية الثغرات بالرمز، الشركة، أو التوجيه...',
        cveExportCsvTitle: 'تصدير مصفوفة الثغرات المصفاة بصيغة CSV',
        cveExportToast: 'تم تصدير مصفوفة الثغرات بصيغة CSV',
        actorLevelLabel: 'مستوى التهديد',
        actorActivityLabel: 'نشط على الشريط',
        actorNoActivity: 'لا إشارة حية',
        actorMitreLink: 'MITRE ATT&CK',
        sourceBreakdownLabel: 'توزيع المصادر',
        sourceFilterTitle: 'انقر لتصفية الشريط حسب هذا المصدر',
        wireSyncIdle: 'مزامنة تلقائية · 10 د',
        wireSyncedAt: 'آخر مزامنة للبث الحي',
        kpiBarCountries: 'الدول المرصودة التي ترسل إشارات حالياً',
        kpiBarAptShare: 'نسبة الشريط الحي الموسومة كنشاط APT أو مدعوم من دولة',
        kpiBarPeakCvss: 'أعلى درجة CVSS أساسية بين الثغرات المرصودة',
        kpiBarMaritimeShare: 'نسبة الشريط الحي الموسومة كإشارات بحرية'
    }
};

// ===================================================================
// 2. THREAT ACTOR DATABASE (WITH COMPLETE ARABIC LOCALIZATION)
// ===================================================================
const THREAT_ACTORS_DB = [
    {
        name: "Handala Hack",
        originEn: "Iran (MOIS Aligned)",
        originAr: "إيران (تابعة لوزارة الاستخبارات MOIS)",
        motivationEn: "Wiper payloads, critical infrastructure extortion, and logistics sabotage",
        motivationAr: "برمجيات مسح البيانات، ابتزاز البنية التحتية، وتخريب الموانئ واللوجستيات",
        targetsEn: ["Port Systems", "Fuel Supply", "Defense Tech"],
        targetsAr: ["أنظمة الموانئ", "إمدادات الوقود", "التكنولوجيا الدفاعية"],
        aliases: ["handala hack", "handala"],
        level: 4,
        mitreUrl: null
    },
    {
        name: "APT33 (Elfin)",
        originEn: "Iran (IRGC Aligned)",
        originAr: "إيران (تابعة للحرس الثوري IRGC)",
        motivationEn: "Aerospace, petrochemical facilities, and supply chain espionage",
        motivationAr: "تجسس استراتيجي على قطاعات الطيران، البتروكيماويات، وسلاسل الإمداد",
        targetsEn: ["Aerospace", "Energy", "Maritime Logistics"],
        targetsAr: ["صناعة الطيران", "قطاع الطاقة", "اللوجستيات البحرية"],
        aliases: ["apt33", "apt 33", "elfin", "refined kitten"],
        level: 5,
        mitreUrl: "https://attack.mitre.org/groups/G0064/"
    },
    {
        name: "APT34 (OilRig)",
        originEn: "Iran",
        originAr: "إيران",
        motivationEn: "Long-term persistent cyber espionage across telecommunications and state ministries",
        motivationAr: "تجسس سيبراني متقدم ومستمر على قطاعات الاتصالات والوزارات الحكومية",
        targetsEn: ["Telecom", "Finance", "Government"],
        targetsAr: ["الاتصالات", "القطاع المالي", "الوزارات السيادية"],
        aliases: ["apt34", "apt 34", "oilrig", "oil rig", "cobalt gypsy", "helix kitten"],
        level: 5,
        mitreUrl: "https://attack.mitre.org/groups/G0049/"
    },
    {
        name: "Cyber Av3ngers",
        originEn: "Axis of Resistance",
        originAr: "محور المقاومة الإقليمي",
        motivationEn: "Targeting programmable logic controllers (PLCs) in municipal and water infrastructure",
        motivationAr: "استهداف وحدات التحكم المنطقي PLC في شبكات المياه والخدمات العامة",
        targetsEn: ["Water Utilities", "ICS/SCADA", "Pipelines"],
        targetsAr: ["محطات المياه", "أنظمة SCADA/ICS", "خطوط الأنابيب"],
        aliases: ["cyber av3ngers", "cyberavengers"],
        level: 4,
        mitreUrl: "https://attack.mitre.org/groups/G1011/"
    },
    {
        name: "Predatory Sparrow",
        originEn: "Israel Aligned",
        originAr: "مرتبطة بإسرائيل",
        motivationEn: "Precision destructive wiper attacks targeting industrial and financial networks",
        motivationAr: "هجمات مسح تخريبية دقيقة تستهدف مصانع الصلب والبنوك ومحطات الوقود",
        targetsEn: ["Steel Industry", "Fuel Distribution", "Banking"],
        targetsAr: ["صناعة الصلب", "توزيع الوقود", "القطاع المصرفي"],
        aliases: ["predatory sparrow"],
        level: 4,
        mitreUrl: "https://attack.mitre.org/groups/G1033/"
    },
    {
        name: "MuddyWater",
        originEn: "Iran (MOIS)",
        originAr: "إيران (وزارة الاستخبارات)",
        motivationEn: "Espionage, credential harvesting, and destructive wipers across Middle East and Med",
        motivationAr: "سرقة الاعتمادات، التجسس الحكومي، ونشر برمجيات المسح التخريبي",
        targetsEn: ["Government", "Maritime Logistics", "Telecom"],
        targetsAr: ["المقرات الحكومية", "الشحن البحري", "الاتصالات"],
        aliases: ["muddywater", "muddy water", "mercury", "static kitten", "powerstats"],
        level: 5,
        mitreUrl: "https://attack.mitre.org/groups/G0059/"
    },
    {
        name: "Fox Kitten (Parisite)",
        originEn: "Iran",
        originAr: "إيران",
        motivationEn: "Weaponizing edge VPN appliances and selling access to ransomware operators",
        motivationAr: "استغلال ثغرات بوابات VPN وبيع الوصول الأولي لمشغلي الفدية",
        targetsEn: ["Enterprise Gateways", "Defense Contractors"],
        targetsAr: ["بوابات الحافة المؤسسية", "متعاقدو الدفاع"],
        aliases: ["fox kitten", "parisite", "temp.zagros", "pioneer kitten"],
        level: 4,
        mitreUrl: "https://attack.mitre.org/groups/G0117/"
    },
    {
        name: "Moses Staff",
        originEn: "Iran",
        originAr: "إيران",
        motivationEn: "Politically motivated hack-and-leak, disk wiper deployments, zero financial ransom",
        motivationAr: "اختراق وتسريب بهوافع سياسية، مسح الأقراص، بدون أي مطالب مالية",
        targetsEn: ["Infrastructure", "Defense Contractors", "Aviation"],
        targetsAr: ["البنية التحتية", "شركات الدفاع", "الملاحة الجوية"],
        aliases: ["moses staff"],
        level: 3,
        mitreUrl: "https://attack.mitre.org/groups/G1009/"
    },
    {
        name: "DarkStorm Team",
        originEn: "Pro-Palestine Collective",
        originAr: "تجمع نشطاء مؤيد لفلسطين",
        motivationEn: "Volumetric DDoS floods against maritime navigation portals, banks, and media",
        motivationAr: "هجمات حجب خدمة الحجمية على بوابات الموانئ والمصارف والمؤسسات الإعلامية",
        targetsEn: ["Port Authorities", "Banks", "Gov Portals"],
        targetsAr: ["إدارات الموانئ", "البنوك", "البوابات الرسمية"],
        aliases: ["darkstorm"],
        level: 3,
        mitreUrl: null
    },
    {
        name: "NoName057(16)",
        originEn: "Russia Aligned",
        originAr: "موالية لروسيا",
        motivationEn: "DDoS swarm targeting Mediterranean shipping corridors, logistics, and allied portals",
        motivationAr: "هجمات حجب خدمة مكثفة على مسارات الشحن في المتوسط واللوجستيات",
        targetsEn: ["Maritime Shipping", "Logistics Hubs", "Telecom"],
        targetsAr: ["الشحن الملاحي", "المراكز اللوجستية", "شبكات الاتصال"],
        aliases: ["noname057", "noname 057", "noname"],
        level: 3,
        mitreUrl: "https://attack.mitre.org/groups/G0115/"
    },
    {
        name: "Moroccan Black Cyber Army",
        originEn: "Regional Hacktivist",
        originAr: "تجمع نشطاء إقليمي",
        motivationEn: "Subsea cable telemetry, telecom-layer targeting, and state defacements",
        motivationAr: "استهداف قياسات الكابلات البحرية والاتصالات وتشويه المواقع الحكومية",
        targetsEn: ["Telecom Infrastructure", "Airports"],
        targetsAr: ["بنية الاتصالات", "المطارات والمنافذ"],
        aliases: ["moroccan black cyber army"],
        level: 2,
        mitreUrl: null
    },
    {
        name: "AnonGhost",
        originEn: "Hacktivist Cluster",
        originAr: "تكتل ناشطين عالمي",
        motivationEn: "Automated vulnerability scanning, ICS reconnaissance, and SCADA probes",
        motivationAr: "فحص آلي للثغرات، استطلاع لمنظومات التحكم الصناعي ICS والشبكات الذكية",
        targetsEn: ["Industrial Routers", "Utilities"],
        targetsAr: ["الموجهات الصناعية", "شبكات المرافق"],
        aliases: ["anonghost"],
        level: 2,
        mitreUrl: null
    }
];

// Fallback CVE Data with Complete Arabic Support.
// CVSS values are the publicly published NVD/MITRE base scores, kept as an
// offline floor only; live pipeline records always take precedence.
const DEFAULT_CVES = [
    {
        id: "CVE-2024-3400",
        system: "Palo Alto PAN-OS",
        systemAr: "بالو ألتو PAN-OS (بوابات الحافة)",
        severity: "Critical",
        cvss: 10.0,
        badge: "badge-critical",
        advisoryEn: "Patch PAN-OS GlobalProtect Gateway immediately.",
        advisoryAr: "تحديث عاجل وفوري لبوابات GlobalProtect وسد ثغرة الحقن."
    },
    {
        id: "CVE-2023-34362",
        system: "MOVEit Transfer",
        systemAr: "نظام نقل الملفات MOVEit Transfer",
        severity: "Critical",
        cvss: 9.8,
        badge: "badge-critical",
        advisoryEn: "Apply vendor SQLi mitigations and isolate storage endpoints.",
        advisoryAr: "تطبيق معالجة ثغرة SQLi وعزل نقاط التخزين عن الإنترنت العام."
    },
    {
        id: "CVE-2024-21412",
        system: "Windows Defender SmartScreen",
        systemAr: "نظام الحماية Windows Defender",
        severity: "High",
        cvss: 8.1,
        badge: "badge-high",
        advisoryEn: "Enforce MSFT security patch to halt zero-day shortcut execution.",
        advisoryAr: "تطبيق حزمة تحديث مايكروسوفت لوقف تنفيذ ملفات الاختصار الخبيثة."
    },
    {
        id: "CVE-2023-46805",
        system: "Ivanti Connect Secure (ICS)",
        systemAr: "بوابات إيفانتي Ivanti Connect Secure",
        severity: "High",
        cvss: 8.2,
        badge: "badge-high",
        advisoryEn: "Run external integrity verification tool; revoke all API tokens.",
        advisoryAr: "تشغيل أداة التحقق من النزاهة الخارجية وإلغاء كافة مفاتيح API."
    },
    {
        id: "CVE-2023-4966",
        system: "Citrix NetScaler ADC",
        systemAr: "موزع الأحمال Citrix NetScaler ADC",
        severity: "High",
        cvss: 9.4,
        badge: "badge-high",
        advisoryEn: "Clear persistent session tokens and deploy firmware update.",
        advisoryAr: "تطهير كافة رموز الجلسات النشطة وتحديث البرنامج الثابت فوراً."
    }
];

// Fallback Intensity Data (previous window included for honest trends)
const DEFAULT_INTENSITY = [
    { country: "Iran", attacks: "14", previous: "11", intensity: "Critical", trend: "up", deltaPct: 27.3, class: "intensity-high" },
    { country: "Israel", attacks: "11", previous: "9", intensity: "High", trend: "up", deltaPct: 22.2, class: "intensity-high" },
    { country: "Lebanon", attacks: "5", previous: "3", intensity: "High", trend: "up", deltaPct: 66.7, class: "intensity-high" },
    { country: "Egypt", attacks: "3", previous: "4", intensity: "Medium", trend: "down", deltaPct: -25.0, class: "intensity-med" },
    { country: "Syria", attacks: "1", previous: "2", intensity: "Low", trend: "down", deltaPct: -50.0, class: "intensity-low" },
    { country: "Jordan", attacks: "1", previous: "1", intensity: "Low", trend: "down", deltaPct: 0, class: "intensity-low" }
];

// Fallback Live Wire News with Full Arabic Localization
const FALLBACK_WIRE_ITEMS = [
    {
        titleEn: "Houthis Threaten Renewed Drone Interdictions Near Bab el-Mandeb Chokepoint",
        titleAr: "تهديدات متجددة باعتراض الملاحة واستخدام المسيرات قرب مضيق باب المندب",
        source: "Maritime Executive",
        link: "https://maritime-executive.com",
        pubDate: Date.now() - 1000 * 60 * 35,
        summaryEn: "Naval task force reports anomalous GPS spoofing and AIS telemetry interference affecting commercial cargo vessels transiting the southern Red Sea corridor.",
        summaryAr: "رصد تشويش إلكتروني على إشارات GPS ونظام التعرف الآلي AIS يؤثر على سفن الحاويات التجارية في الممر الجنوبي للبحر الأحمر.",
        tags: [{ textEn: "MARITIME", textAr: "ملاحة بحرية", class: "tag-urgent" }, { textEn: "ZERO-DAY", textAr: "يوم-الصفر", class: "tag-urgent" }]
    },
    {
        titleEn: "State-Sponsored Wiper Campaign Detected Targeting Gulf Petrochemical SCADA Systems",
        titleAr: "رصد حملة برمجيات مسح موجهة تستهدف أنظمة التحكم SCADA لقطاع البتروكيماويات بالخليج",
        source: "Dark Reading",
        link: "https://darkreading.com",
        pubDate: Date.now() - 1000 * 60 * 75,
        summaryEn: "Threat intelligence analysts observe weaponized payloads utilizing novel living-off-the-land techniques to compromise industrial telemetry sensors.",
        summaryAr: "اكتشاف برمجيات خبيثة تستخدم أدوات النظام الأصلية لتعطيل وحدات القياس الصناعية وأجهزة الاستشعار عن بعد في معامل الغاز.",
        tags: [{ textEn: "APT", textAr: "مجموعات متقدمة", class: "tag-warn" }, { textEn: "RANSOMWARE", textAr: "برمجيات الفدية", class: "tag-urgent" }]
    },
    {
        titleEn: "Massive Volumetric DDoS Barrage Hits Mediterranean Seaport Cargo Logistics Network",
        titleAr: "هجوم حجب خدمة هائل (DDoS) يضرب شبكات الشحن واللوجستيات في موانئ البحر المتوسط",
        source: "BleepingComputer",
        link: "https://bleepingcomputer.com",
        pubDate: Date.now() - 1000 * 60 * 140,
        summaryEn: "Automated botnet floods exceed 1.2 Tbps against regional container dispatch platforms, triggering automated failover protocols.",
        summaryAr: "سيل هجمات حجب خدمة يفوق 1.2 تيرابت في الثانية يستهدف منصات تفريغ الحاويات، مما استدعى تفعيل خطط الطوارئ.",
        tags: [{ textEn: "DDoS", textAr: "حجب الخدمة", class: "tag-warn" }, { textEn: "MARITIME", textAr: "ملاحة بحرية", class: "tag-urgent" }]
    },
    {
        titleEn: "CISA Flags Exploitation of Edge VPN Gateway Zero-Day in Middle East Telecom",
        titleAr: "وكالة CISA تحذر من استغلال ثغرة يوم-الصفر في بوابات VPN بقطاع الاتصالات الإقليمي",
        source: "The Hacker News",
        link: "https://thehackernews.com",
        pubDate: Date.now() - 1000 * 60 * 220,
        summaryEn: "Advisory warns that nation-state operators have bypassed multi-factor authentication on unpatched appliances to maintain persistent backdoors.",
        summaryAr: "تحذير استخباري رسمي يفيد بتجاوز المصادقة الثنائية عبر بوابات غير محدثة لزرع أبواب خلفية مستمرة في شبكات التوجيه.",
        tags: [{ textEn: "ZERO-DAY", textAr: "يوم-الصفر", class: "tag-urgent" }, { textEn: "APT", textAr: "مجموعات متقدمة", class: "tag-warn" }]
    }
];

// ===================================================================
// 2b. TARGETED SECTOR CLASSIFIER (deterministic, explainable)
// Each bucket is a keyword set matched against an item's normalized text;
// an item may signal several sectors. Feeds the sector bar chart with
// REAL wire-derived data instead of a static placeholder.
// ===================================================================
const SECTOR_BUCKETS = [
    { key: 'Ports & Maritime', ar: 'الموانئ والملاحة', keywords: ['maritime', 'suez', 'red sea', 'hormuz', 'vessel', 'tanker', 'houthi', 'shipping', 'seaport', ' cargo '] },
    { key: 'Energy & Petro', ar: 'الطاقة والبتروكيماويات', keywords: ['oil', 'gas', 'energy', 'petro', 'refinery', 'lng', 'pipeline'] },
    { key: 'Defense & Kinetic', ar: 'الدفاع والعمليات الحركية', keywords: ['defense', 'defence', 'missile', 'drone', 'idf', 'military', 'airstrike', 'strike', 'rocket'] },
    { key: 'Gov & Diplomatic', ar: 'الحكومة والدبلوماسية', keywords: ['government', 'ministry', 'embassy', 'diplomat', 'parliament', 'sanction', 'president'] },
    { key: 'Telecom & Subsea', ar: 'الاتصالات والكابلات', keywords: ['telecom', 'cable', 'subsea', 'isp', '5g', 'internet'] },
    { key: 'Finance & Banking', ar: 'المالية والمصارف', keywords: ['bank', 'finance', 'swift', 'payment', 'crypto', 'currency'] }
];

// Deterministic brand palette for wire tag visualisation.
const TAG_COLORS = {
    RANSOMWARE: '#EF4444',
    'ZERO-DAY': '#A855F7',
    MARITIME: '#06B6D4',
    DDOS: '#EAB308',
    APT: '#F97316',
    INTEL: '#64748B'
};
const SECTOR_COLORS = ['#EAB308', '#06B6D4', '#EF4444', '#A855F7', '#10B981', '#D97706'];

// ===================================================================
// 3. MASTER CONTROLLER CLASS
// ===================================================================
class YaslogistThreatRadarApp {
    constructor(options = {}) {
        this.options = Object.assign({ autoInit: true }, options);
        this.currentLang = storage.get('yaslogist.lang', 'en') === 'ar' ? 'ar' : 'en';
        this.threatMap = null;
        this.acidSquares = null;
        this.intensityData = [];
        this.cveData = [];
        this.allWireItems = [];
        this.activeWireTag = storage.get('yaslogist.wireTag', 'ALL');
        this.wireSearchTerm = '';
        this.cveFilter = 'ALL';
        this.cveSort = 'cvss';
        this.cveSearchTerm = '';
        this.pipelineMeta = null;
        this.timelineData = null;
        this.pinnedIds = this.loadPinnedIds();
        this.lastWireSyncAt = 0;
        this.liveSyncTimer = null;
        this.charts = {
            vectors: null,
            industry: null
        };

        if (this.options.autoInit) this.init();
    }

    async init() {
        console.log('[YASLOGIST] Sovereign Command OS initializing...');

        // Every subsystem boots in isolation. A single failing dependency
        // (dead CDN, blocked feed, missing DOM node) degrades ONE module
        // and can never abort the boot chain again.
        const safe = async (label, fn) => {
            try {
                await fn();
            } catch (err) {
                console.error(`[YASLOGIST] Subsystem "${label}" degraded (non-fatal):`, err);
            }
        };

        await safe('smart-operations', () => this.initSmartOperations());
        await safe('shader',       () => this.initShader());
        await safe('tactical-map', () => this.initMap());
        await safe('clocks',       () => this.startDualClocks());
        await safe('i18n',         () => this.initLanguageSwitcher());
        await safe('charts',       () => this.initCharts());
        await safe('tabs',         () => this.bindTabs());
        await safe('interactions', () => this.bindInteractions());
        await safe('hotkeys',      () => this.bindGlobalHotkeys());
        await safe('cti-data',     () => this.loadData());
        await safe('intel-wire',   () => this.fetchWire());
        await safe('dossiers',     () => this.renderThreatActors());
        await safe('telemetry',    () => this.startLiveProgressTelemetry());
        await safe('live-sync',    () => this.startLiveSync());
        await safe('motion',       () => this.initMotionSystem());

        console.log('[YASLOGIST] Sovereign Threat Radar online.');
    }

    /* ------------------------------------------------ smart operations */

    updateNetworkBadge() {
        const badge = document.getElementById('live-connection-badge');
        if (!badge) return;
        const online = this.networkOnline !== false;
        badge.classList.toggle('offline', !online);
        badge.setAttribute('aria-label', online ? 'Network online' : 'Network offline; showing cached intelligence');
        const text = badge.querySelector('.status-pill-text');
        if (text) text.textContent = online
            ? I18N[this.currentLang].statusLiveFeed
            : (I18N[this.currentLang].statusOfflineCached || 'FEED: OFFLINE / CACHED');
        document.documentElement.dataset.network = online ? 'online' : 'offline';
    }

    initSmartOperations() {
        this.networkOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
        window.addEventListener('online', () => { this.networkOnline = true; this.updateNetworkBadge(); }, { passive: true });
        window.addEventListener('offline', () => { this.networkOnline = false; this.updateNetworkBadge(); }, { passive: true });
        this.updateNetworkBadge();

        const palette = document.createElement('div');
        palette.className = 'command-palette';
        palette.id = 'command-palette';
        palette.hidden = true;
        palette.innerHTML = `
            <div class="command-palette-backdrop" data-command-close></div>
            <section class="command-palette-dialog" role="dialog" aria-modal="true" aria-labelledby="command-palette-title">
                <div class="command-palette-head">
                    <div><span class="eyebrow">YASLOGIST // OPERATOR CONSOLE</span><h2 id="command-palette-title">Command Palette</h2></div>
                    <button type="button" class="command-close" data-command-close aria-label="Close command palette">×</button>
                </div>
                <input class="command-search" id="command-search" type="search" autocomplete="off" placeholder="Search commands…" aria-label="Search commands">
                <div class="command-list" id="command-list" role="menu"></div>
                <div class="command-hint mono">ESC CLOSE · ↑↓ NAVIGATE · ENTER EXECUTE</div>
            </section>`;
        document.body.appendChild(palette);

        const commands = this.buildCommandList();
        const list = palette.querySelector('#command-list');
        const search = palette.querySelector('#command-search');
        let selected = 0;
        const renderCommands = () => {
            const query = search.value.trim().toLowerCase();
            const visible = [];
            commands.forEach((cmd, idx) => {
                if (cmd[0].toLowerCase().includes(query)) visible.push([cmd[0], cmd[1], idx]);
            });
            selected = Math.min(selected, Math.max(visible.length - 1, 0));
            list.innerHTML = visible.map(([label, key, idx], i) =>
                `<button type="button" class="command-item ${i === selected ? 'selected' : ''}" role="menuitem" data-command-index="${idx}"><span>${escapeHTML(label)}</span><kbd>${key}</kbd></button>`
            ).join('') || '<div class="command-empty">No matching command</div>';
        };
        const close = () => { palette.hidden = true; search.value = ''; };
        const open = () => { palette.hidden = false; renderCommands(); requestAnimationFrame(() => search.focus()); };
        palette.addEventListener('click', (event) => {
            if (event.target.closest('[data-command-close]')) return close();
            const item = event.target.closest('[data-command-index]');
            if (!item) return;
            const command = commands[Number(item.dataset.commandIndex)];
            close(); command?.[2]();
        });
        search.addEventListener('input', renderCommands);
        search.addEventListener('keydown', (event) => {
            const items = [...list.querySelectorAll('.command-item')];
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault(); selected = (selected + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % Math.max(items.length, 1); renderCommands();
            } else if (event.key === 'Enter' && items[selected]) items[selected].click();
            else if (event.key === 'Escape') close();
        });
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); open(); }
            else if (event.key === 'Escape' && !palette.hidden) close();
        });
        document.getElementById('commandLauncher')?.addEventListener('click', open);
        this.initSmartBriefingPanel();
        window.yaslogistCommands = { open, close };
    }

    buildCommandList() {
        return [
            ['Refresh intelligence wire', 'R', () => this.fetchWire()],
            ['Export intelligence snapshot (JSON)', 'E', () => this.exportSnapshot()],
            ['Export smart briefing (Markdown)', 'D', () => this.exportMarkdownBriefing()],
            ['Copy deep link to current view', 'C', () => this.copyDeepLink()],
            ['Toggle Arabic / English', 'L', () => document.getElementById('langToggleBtn')?.click()],
            ['Open threat map', 'M', () => this.activateTab('threat-map-view', { focus: true })],
            ['Full screen command center', 'F', () => this.toggleFullscreen()],
            ['Recalculate smart threat briefing', 'B', () => { this.renderSmartBriefing(); this.showToast(this.currentLang === 'ar' ? 'تم تحديث الموجز الذكي' : 'Smart briefing recalculated'); }]
        ];
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
        else document.exitFullscreen?.().catch(() => {});
    }

    /* ------------------------------------------------- operator watchlist */

    /** Stable per-item id: link is unique across feeds; title is the floor. */
    static wireItemId(item) {
        const link = String(item?.link || '').trim();
        if (link && link !== '#') return `l:${link}`;
        return `t:${String(item?.titleEn || item?.titleAr || '').trim().toLowerCase()}`;
    }

    loadPinnedIds() {
        try {
            const raw = storage.get('yaslogist.pinned', '[]');
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? new Set(parsed.filter(x => typeof x === 'string').slice(0, 200)) : new Set();
        } catch { return new Set(); }
    }

    persistPinnedIds() {
        try { storage.set('yaslogist.pinned', JSON.stringify([...this.pinnedIds])); } catch { /* storage unavailable */ }
    }

    isWirePinned(item) { return this.pinnedIds.has(YaslogistThreatRadarApp.wireItemId(item)); }

    toggleWirePin(item) {
        const id = YaslogistThreatRadarApp.wireItemId(item);
        const pinned = this.pinnedIds.has(id);
        if (pinned) this.pinnedIds.delete(id); else this.pinnedIds.add(id);
        this.persistPinnedIds();
        return !pinned;
    }

    wirePinnedItems() {
        return (this.allWireItems || []).filter(i => this.pinnedIds.has(YaslogistThreatRadarApp.wireItemId(i)));
    }

    /* ------------------------------------------------ pure text utilities */

    /**
     * Escape `text`, then wrap case-insensitive matches of `term` in
     * <mark class="wire-hl">. Matches are located on the RAW string so offsets
     * stay byte-stable between locating and escaping (Arabic needs no case fold;
     * Latin folds via toLowerCase on both sides).
     */
    static highlightHTML(text, term) {
        const raw = String(text ?? '');
        const needle = String(term || '').trim().toLowerCase();
        if (!needle || needle.length < 2) return escapeHTML(raw);
        const lower = raw.toLowerCase();
        const ranges = [];
        let idx = lower.indexOf(needle);
        while (idx !== -1 && ranges.length < 24) {
            ranges.push([idx, idx + needle.length]);
            idx = lower.indexOf(needle, idx + needle.length);
        }
        if (!ranges.length) return escapeHTML(raw);
        let out = '', cursor = 0;
        for (const [start, end] of ranges) {
            if (start < cursor) continue; // overlap guard
            out += escapeHTML(raw.slice(cursor, start));
            out += `<mark class="wire-hl">${escapeHTML(raw.slice(start, end))}</mark>`;
            cursor = end;
        }
        out += escapeHTML(raw.slice(cursor));
        return out;
    }

    /* ---------------------------------------------- shareable wire state */

    /** Serialize the wire filter into a compact hash query: `tag=APT&q=hormuz`. */
    static serializeWireState({ tag = 'ALL', q = '' } = {}) {
        const params = [];
        if (tag && tag !== 'ALL') params.push(`tag=${encodeURIComponent(tag)}`);
        if (q) params.push(`q=${encodeURIComponent(q)}`);
        return params.join('&');
    }

    /** Parse a hash query string back into wire filter state. */
    static parseWireState(query) {
        const state = { tag: 'ALL', q: '' };
        String(query || '').split('&').forEach(pair => {
            const [rawKey, ...rest] = pair.split('=');
            let key = '', value = '';
            try {
                key = decodeURIComponent(rawKey || '').toLowerCase();
                value = decodeURIComponent(rest.join('=') || '');
            } catch { return; /* malformed percent-encoding — ignore pair */ }
            if (key === 'tag' && value) {
                // Tags only ever compare against A-Z0-9 literals; keep them that way.
                const clean = value.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24);
                state.tag = clean || 'ALL';
            } else if (key === 'q') {
                state.q = value.replace(/[<>"'`]/g, '').slice(0, 80);
            }
        });
        return state;
    }

    /** Push current wire filter into the URL hash without spamming history. */
    syncWireHash() {
        if (typeof window === 'undefined' || !window.history?.replaceState) return;
        const target = document.querySelector('.nav-tab.active');
        const tabId = target ? target.getAttribute('data-target') : 'dashboard';
        const slug = YaslogistThreatRadarApp.TAB_SLUGS[tabId] || 'dashboard';
        const query = YaslogistThreatRadarApp.serializeWireState({ tag: this.activeWireTag, q: this.wireSearchTerm });
        const hash = `#${slug}${query ? `?${query}` : ''}`;
        try {
            if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
        } catch { /* file:// */ }
    }

    /* -------------------------------------------------- CVE CSV export */

    /** RFC-4180-safe CSV of the CVE matrix (filter applied by the caller). */
    static buildCveCSV(cves) {
        const esc = (v) => {
            const s = String(v ?? '');
            return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const header = ['cve_id', 'affected_system', 'severity', 'cvss', 'advisory'];
        const rows = (cves || []).map(c => [
            esc(c.id), esc(c.systemEn || c.system), esc(String(c.severity || '').toUpperCase()),
            Number.isFinite(Number(c.cvss)) ? Number(c.cvss).toFixed(1) : 'N/A',
            esc(c.advisoryEn || c.advisory || '')
        ].join(','));
        return [header.join(','), ...rows].join('\r\n');
    }

    exportCveCSV() {
        const rows = this.filteredCVEs();
        this.downloadBlob(YaslogistThreatRadarApp.buildCveCSV(rows), 'text/csv', `yaslogist-cve-matrix-${new Date().toISOString().slice(0, 10)}.csv`);
        this.showToast(I18N[this.currentLang].cveExportToast);
    }

    /* ---------------------------------------------- actor × wire fusion */

    /** Count live wire items whose text matches any actor alias. */
    static actorWireActivity(actor, items) {
        const aliases = Array.isArray(actor?.aliases)
            ? actor.aliases.map(a => String(a).toLowerCase()).filter(Boolean)
            : [];
        if (!aliases.length) return 0;
        return (items || []).reduce((count, item) => {
            const text = `${item?.titleEn || ''} ${item?.summaryEn || ''} ${item?.titleAr || ''}`.toLowerCase();
            return aliases.some(a => text.includes(a)) ? count + 1 : count;
        }, 0);
    }

    /** Actor card ATT&CK link: known group page, else a MITRE search fallback. */
    static actorMitreHref(actor) {
        if (actor?.mitreUrl) return actor.mitreUrl;
        return `https://attack.mitre.org/search/?q=${encodeURIComponent(actor?.name || '')}`;
    }

    /* ------------------------------------------------------- live sync */

    /**
     * Background wire refresh every 10 minutes while the console is visible.
     * Hidden tabs skip the cycle (no wasted quota); returning to a stale tab
     * (>= 10 minutes since last sync) triggers an immediate refresh. New
     * intercepts surface as an operator toast, never a modal.
     */
    startLiveSync(intervalMs = 10 * 60 * 1000) {
        if (typeof window === 'undefined' || this.liveSyncTimer) return;
        this.liveSyncInterval = intervalMs;
        this.liveSyncTimer = setInterval(() => {
            if (document.hidden || this.networkOnline === false) return;
            this.fetchWire({ background: true });
        }, intervalMs);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden || this.lastWireSyncAt === 0 || this.networkOnline === false) return;
            if (Date.now() - this.lastWireSyncAt >= this.liveSyncInterval) {
                this.fetchWire({ background: true });
            }
        }, { passive: true });
        this.updateWireSyncChip();
    }

    stopLiveSync() {
        if (this.liveSyncTimer) clearInterval(this.liveSyncTimer);
        this.liveSyncTimer = null;
    }

    updateWireSyncChip(synced = false) {
        const chip = document.getElementById('wire-sync-chip');
        if (!chip) return;
        const dict = I18N[this.currentLang];
        const time = this.lastWireSyncAt
            ? new Date(this.lastWireSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : null;
        chip.textContent = synced && time
            ? `${dict.wireSyncedAt} ${time}`
            : dict.wireSyncIdle;
        chip.dataset.state = synced ? 'synced' : 'idle';
    }

    /** Source contribution strip: one chip per top feed, click filters by it. */
    updateSourceBreakdown() {
        const wrap = document.getElementById('wire-source-strip');
        if (!wrap) return;
        const dist = this.wireSourceDistribution();
        const dict = I18N[this.currentLang];
        if (!dist.length) { wrap.innerHTML = ''; wrap.hidden = true; return; }
        wrap.hidden = false;
        const max = dist[0][1] || 1;
        wrap.innerHTML = dist.map(([source, count]) =>
            `<button type="button" class="source-chip" data-source-filter="${escapeHTML(source)}" title="${escapeHTML(dict.sourceFilterTitle)}" aria-label="${escapeHTML(dict.sourceFilterTitle)}: ${escapeHTML(source)}">` +
            `<span class="source-chip-name">${escapeHTML(source)}</span>` +
            `<span class="source-chip-count mono">${count}</span>` +
            `<span class="source-chip-bar" style="width:${Math.max(8, Math.round((count / max) * 100))}%"></span>` +
            `</button>`
        ).join('');
    }

    downloadBlob(content, mimeType, filename) {
        const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }

    exportSnapshot() {
        const payload = {
            exportedAt: new Date().toISOString(),
            language: this.currentLang,
            pipelineSync: this.pipelineMeta ? this.pipelineMeta.generatedAt : null,
            wire: this.allWireItems || [],
            cves: this.cveData || [],
            intensity: this.intensityData || []
        };
        this.downloadBlob(JSON.stringify(payload, null, 2), 'application/json', `yaslogist-intelligence-${new Date().toISOString().slice(0, 10)}.json`);
        this.showToast(this.currentLang === 'ar' ? 'تم تصدير لقطة الاستخبارات' : 'Intelligence snapshot exported');
    }

    /** Operator handoff: human-readable Markdown briefing, 100% data-derived. */
    exportMarkdownBriefing() {
        const isAr = this.currentLang === 'ar';
        const now = new Date();
        const items = this.allWireItems || [];
        const cves = [...(this.cveData || [])].sort((a, b) => (Number(b.cvss) || 0) - (Number(a.cvss) || 0));
        const pinned = this.wirePinnedItems();
        const activeActors = THREAT_ACTORS_DB
            .map(actor => [actor.name, YaslogistThreatRadarApp.actorWireActivity(actor, items)])
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]);
        const score = document.getElementById('smart-risk-score')?.textContent || '--';
        const trend = document.getElementById('smart-risk-trend')?.textContent || '--';
        const action = document.getElementById('smart-action')?.textContent || '--';
        const defcon = document.getElementById('defcon-readout-text')?.textContent.trim() || '--';
        const sync = document.getElementById('last-updated-footer')?.textContent.trim() || '--';

        const lines = [
            `# YASLOGIST SMART THREAT BRIEFING — ${now.toISOString()}`,
            '',
            `> RISK INDEX: ${score} (${trend}) · DEFCON: ${defcon}`,
            `> PIPELINE: ${sync}`,
            `> METHOD: explainable heuristics over committed artefacts (CVE severity · wire velocity · maritime exposure · feed health). Not automated attribution.`,
            '',
            '## PRIORITY ACTION',
            action,
            '',
            '## TOP TRACKED CVEs (by CVSS base score)',
            ...cves.slice(0, 8).map(c => `- **${c.id}** — ${c.system} · ${c.severity}${typeof c.cvss === 'number' ? ` · CVSS ${c.cvss.toFixed(1)}` : ''}`),
            '',
            '## WIRE SNAPSHOT (10 most recent)',
            ...items.slice(0, 10).map(i => `- [${i.titleEn}](${safeURL(i.link, '#', 'https://localhost/')}) — ${i.source}, ${this.formatTimeAgo(i.pubDate)}`),
            '',
            ...(pinned.length ? [
                '## OPERATOR WATCHLIST (pinned intercepts)',
                ...pinned.map(i => `- [${i.titleEn}](${safeURL(i.link, '#', 'https://localhost/')}) — ${i.source}, ${this.formatTimeAgo(i.pubDate)}`),
                ''
            ] : []),
            ...(activeActors.length ? [
                '## THREAT ACTORS CURRENTLY ACTIVE ON THE WIRE',
                ...activeActors.map(([name, count]) => `- **${name}** — ${count} matching wire report${count === 1 ? '' : 's'}`),
                ''
            ] : []),
            '## COUNTRY SIGNAL INTENSITY (7D)',
            ...(this.intensityData || []).map(d => `- ${d.country}: ${d.attacks} reports (prior window ${d.previous ?? 'n/a'}) → ${d.intensity}`),
            '',
            isAr ? '_أُنشئ بواسطة منظومة ياسلوجست — تحقق من القرارات المصيرية عبر مصادر أولية._'
                 : '_Generated by YASLOGIST. Validate consequential decisions against authoritative primary sources._'
        ];
        this.downloadBlob(lines.join('\n'), 'text/markdown', `yaslogist-briefing-${now.toISOString().slice(0, 10)}.md`);
        this.showToast(isAr ? 'تم تصدير الموجز الذكي' : 'Markdown briefing exported');
    }

    copyDeepLink() {
        const active = document.querySelector('.nav-tab.active');
        const target = active ? active.getAttribute('data-target') : 'dashboard';
        const slug = YaslogistThreatRadarApp.TAB_SLUGS[target] || 'dashboard';
        const query = YaslogistThreatRadarApp.serializeWireState({ tag: this.activeWireTag, q: this.wireSearchTerm });
        const url = `${window.location.origin}${window.location.pathname}#${slug}${query ? `?${query}` : ''}`;
        const done = () => this.showToast(this.currentLang === 'ar' ? 'تم نسخ الرابط المباشر' : 'Deep link copied to clipboard');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done).catch(() => this.fallbackCopy(url, done));
        } else {
            this.fallbackCopy(url, done);
        }
    }

    fallbackCopy(text, done) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch { /* clipboard unavailable */ }
        ta.remove();
    }

    initSmartBriefingPanel() {
        const dashboard = document.getElementById('dashboard');
        const kpis = dashboard?.querySelector('.kpi-strip');
        if (!dashboard || !kpis || document.getElementById('smart-briefing')) return;
        const panel = document.createElement('section');
        panel.id = 'smart-briefing';
        panel.className = 'smart-briefing-panel reveal';
        panel.setAttribute('aria-live', 'polite');
        panel.innerHTML = `
            <div class="smart-briefing-head">
                <div><span class="eyebrow">NEURAL-CTI // EXPLAINABLE ANALYSIS</span><h2 data-smart-title>Smart Threat Briefing</h2></div>
                <div class="smart-score-wrap"><span class="smart-score-label">RISK INDEX</span><strong id="smart-risk-score">--</strong><span id="smart-risk-trend" class="mono">CALCULATING</span></div>
            </div>
            <div class="smart-briefing-grid">
                <div class="smart-signal-list" id="smart-signals"></div>
                <div class="smart-recommendation"><span class="smart-section-label">PRIORITY ACTION</span><p id="smart-action">Waiting for telemetry…</p><span id="smart-confidence" class="mono smart-confidence">CONFIDENCE --</span></div>
            </div>
            <div class="smart-timeline">
                <div class="smart-timeline-head">
                    <span class="smart-section-label" data-smart-timeline-label>SIGNAL VOLUME // 14 DAYS</span>
                    <span id="smart-timeline-delta" class="mono">--</span>
                </div>
                <canvas id="smart-sparkline" role="img" aria-label="14 day signal volume trend"></canvas>
            </div>
            <div class="smart-briefing-foot"><span id="smart-method">Signals: CVE severity · wire velocity · maritime exposure · feed health</span><span id="smart-updated" class="mono">NOT YET SYNCED</span></div>`;
        kpis.insertAdjacentElement('afterend', panel);
        this.renderSmartBriefing();
    }

    renderSmartBriefing() {
        const panel = document.getElementById('smart-briefing');
        if (!panel) return;
        const items = this.allWireItems || [];
        const cves = this.cveData || [];
        const intensity = this.intensityData || [];
        const critical = cves.filter(c => String(c.severity).toLowerCase() === 'critical').length;
        const high = cves.filter(c => String(c.severity).toLowerCase() === 'high').length;
        const maritime = this.countWireTag('MARITIME');
        const apt = this.countWireTag('APT');
        const fresh = items.filter(i => Date.now() - Number(i.pubDate || 0) < 86400000).length;
        const avgCvss = cves.filter(c => Number.isFinite(Number(c.cvss))).reduce((sum, c) => sum + Number(c.cvss), 0) / Math.max(cves.filter(c => Number.isFinite(Number(c.cvss))).length, 1);
        const intensityScore = intensity.reduce((sum, item) => sum + (Number(item.attacks) || 0), 0);
        const risk = Math.max(0, Math.min(100, Math.round(critical * 9 + high * 3 + Math.min(maritime * 2, 16) + Math.min(apt * 2, 14) + Math.min(avgCvss * 2, 20) + Math.min(intensityScore / 15, 14))));
        const confidence = Math.round(Math.min(99, 45 + (items.length ? 20 : 0) + (cves.length ? 20 : 0) + (this.feedHealth?.ok || 0) * 3));
        const ar = this.currentLang === 'ar';
        const signals = [
            [risk >= 70 ? 'critical' : risk >= 45 ? 'high' : 'stable', ar ? `${critical} ثغرات حرجة · ${high} مرتفعة` : `${critical} critical CVEs · ${high} high severity`],
            [maritime >= 4 ? 'critical' : 'high', ar ? `${maritime} إنذارات بحرية · ${apt} تقارير APT` : `${maritime} maritime alerts · ${apt} APT reports`],
            [fresh >= Math.max(3, items.length * .35) ? 'stable' : 'high', ar ? `${fresh} تقارير حديثة خلال 24 ساعة` : `${fresh} reports observed in the last 24 hours`]
        ];
        const signalEl = document.getElementById('smart-signals');
        if (signalEl) signalEl.innerHTML = signals.map(([level, text]) => `<div class="smart-signal"><span class="smart-signal-dot ${level}"></span><span>${escapeHTML(text)}</span></div>`).join('');
        const scoreEl = document.getElementById('smart-risk-score');
        if (scoreEl) scoreEl.textContent = `${risk}/100`;
        const trendEl = document.getElementById('smart-risk-trend');
        if (trendEl) { trendEl.textContent = risk >= 70 ? (ar ? 'تصعيد' : 'ESCALATING') : risk >= 45 ? (ar ? 'مراقبة' : 'WATCH') : (ar ? 'مستقر' : 'STABLE'); trendEl.dataset.level = risk >= 70 ? 'critical' : risk >= 45 ? 'high' : 'stable'; }
        const action = critical > 0 ? (ar ? 'تحديد وعزل الأصول المتأثرة بالثغرات الحرجة فوراً.' : 'Prioritize isolation and emergency patching of critical CVE exposure.') : maritime >= 3 ? (ar ? 'رفع مراقبة الممرات البحرية وتحقق من إشارات AIS.' : 'Elevate maritime corridor monitoring and validate AIS anomalies.') : (ar ? 'استمرار المراقبة وجمع الأدلة من المصادر.' : 'Maintain continuous monitoring and preserve collection coverage.');
        const actionEl = document.getElementById('smart-action'); if (actionEl) actionEl.textContent = action;
        const confEl = document.getElementById('smart-confidence'); if (confEl) confEl.textContent = `${ar ? 'الثقة' : 'CONFIDENCE'} ${confidence}%`;
        const updated = document.getElementById('smart-updated'); if (updated) updated.textContent = `${ar ? 'مزامنة' : 'UPDATED'} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const title = panel.querySelector('[data-smart-title]'); if (title) title.textContent = ar ? 'الموجز الذكي للتهديدات' : 'Smart Threat Briefing';
        const timelineLabel = panel.querySelector('[data-smart-timeline-label]');
        if (timelineLabel) timelineLabel.textContent = I18N[this.currentLang].smartTimelineLabel;
        this.renderSignalTimeline();
    }

    /** 14-day signal sparkline: brand-styled 2D canvas, zero extra deps. */
    renderSignalTimeline() {
        const canvas = document.getElementById('smart-sparkline');
        if (!canvas || typeof canvas.getContext !== 'function') return;
        const deltaEl = document.getElementById('smart-timeline-delta');
        const days = this.timelineData && Array.isArray(this.timelineData.days) ? this.timelineData.days : null;
        const isAr = this.currentLang === 'ar';

        if (!days || days.length < 2) {
            if (deltaEl) deltaEl.textContent = isAr ? 'بانتظار بيانات المخطط الزمني' : 'AWAITING TIMELINE DATA';
            return;
        }

        // Honest 7d-vs-prior-7d delta from the same artefact that draws the chart.
        const last7 = days.slice(-7).reduce((s, d) => s + (d.count || 0), 0);
        const prev7 = days.slice(-14, -7).reduce((s, d) => s + (d.count || 0), 0);
        if (deltaEl) {
            if (prev7 === 0 && last7 === 0) deltaEl.textContent = isAr ? 'لا إشارات' : 'NO SIGNALS';
            else if (prev7 === 0) deltaEl.textContent = isAr ? `▲ نشاط جديد (${last7})` : `▲ NEW ACTIVITY (${last7})`;
            else {
                const pct = Math.round(((last7 - prev7) / prev7) * 100);
                deltaEl.textContent = `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct)}% ${isAr ? 'مقابل الأسبوع السابق' : 'VS PRIOR 7D'}`;
                deltaEl.dataset.direction = pct >= 0 ? 'up' : 'down';
            }
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.clientWidth || 260;
        const h = canvas.clientHeight || 56;
        if (canvas.width !== Math.round(w * dpr)) canvas.width = Math.round(w * dpr);
        if (canvas.height !== Math.round(h * dpr)) canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const max = Math.max(...days.map(d => d.count || 0), 1);
        const padX = 4, padTop = 8, padBottom = 6;
        const stepX = (w - padX * 2) / (days.length - 1);
        const points = days.map((d, i) => [
            padX + i * stepX,
            padTop + (1 - (d.count || 0) / max) * (h - padTop - padBottom)
        ]);

        // Area fill
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(234, 179, 8, 0.30)');
        grad.addColorStop(1, 'rgba(234, 179, 8, 0.02)');
        ctx.beginPath();
        points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.lineTo(points[points.length - 1][0], h - padBottom);
        ctx.lineTo(points[0][0], h - padBottom);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.strokeStyle = '#EAB308';
        ctx.lineWidth = 1.6;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Baseline grid
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, h - padBottom + 0.5);
        ctx.lineTo(w - padX, h - padBottom + 0.5);
        ctx.stroke();

        // Terminal point
        const [lx, ly] = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(lx, ly, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = '#F1F5F9';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lx, ly, 4.6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(241, 245, 249, 0.35)';
        ctx.stroke();

        // Hover cursor overlay (see bindSparklineHover) — drawn on top.
        const hoverIdx = this._sparklineHoverIdx;
        if (Number.isInteger(hoverIdx) && hoverIdx >= 0 && hoverIdx < points.length) {
            const [cx, cy] = points[hoverIdx];
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(cx, 4);
            ctx.lineTo(cx, h - 6);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
            ctx.fillStyle = '#06B6D4';
            ctx.fill();
        }

        // Persist geometry for the hover readout (see bindSparklineHover).
        this._sparkline = { canvas, days, points, padX, stepX, w, h };
        this.bindSparklineHover();
    }

    /** Hover readout on the 14-day sparkline: exact date + count per day. */
    bindSparklineHover() {
        const first = this._sparkline;
        if (!first || !first.canvas || first.canvas.dataset.hoverBound === '1') return;
        first.canvas.dataset.hoverBound = '1';
        let hintEl = null;
        first.canvas.addEventListener('mousemove', (event) => {
            const s = this._sparkline; // always the freshest geometry
            if (!s) return;
            const rect = s.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const idx = Math.max(0, Math.min(s.days.length - 1, Math.round((x - s.padX) / s.stepX)));
            const day = s.days[idx];
            if (!day) return;
            const isAr = this.currentLang === 'ar';
            const label = isAr ? `${day.date} · ${day.count || 0} إشارة` : `${day.date} · ${day.count || 0} signal${(day.count || 0) === 1 ? '' : 's'}`;
            if (!hintEl || !hintEl.isConnected) {
                hintEl = document.createElement('div');
                hintEl.id = 'sparkline-hint';
                hintEl.className = 'sparkline-hint mono';
                hintEl.hidden = true;
                s.canvas.parentElement?.appendChild?.(hintEl);
            }
            hintEl.textContent = label;
            hintEl.hidden = false;
            hintEl.style.left = `${Math.max(0, Math.min((s.w || 260) - 140, x - 65))}px`;
            this._sparklineHoverIdx = idx;
            this.renderSignalTimeline(); // full redraw incl. cursor (14 points — trivial cost)
        }, { passive: true });
        first.canvas.addEventListener('mouseleave', () => {
            if (hintEl) hintEl.hidden = true;
            this._sparklineHoverIdx = -1;
            this.renderSignalTimeline();
        }, { passive: true });
    }

    showToast(message) {
        let toast = document.getElementById('yaslogist-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'yaslogist-toast';
            toast.className = 'operator-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        toast.textContent = message; toast.classList.add('visible'); clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
    }

    initShader() {
        try {
            this.acidSquares = initAcidSquares({
                color1: '#06B6D4',
                color2: '#F97316',
                color3: '#A855F7',
                speed: 0.7,
                waveDepth: 1.0,
                zoom: 1.3,
                density: 10.0,
                glow: 1.0,
                exposure: 2700.0,
                spread: 0.3,
                stepSize: 0.002,
                grain: 1.0,
                grainIntensity: 0.05,
                steps: 32
            });
        } catch (e) {
            console.warn('[YASLOGIST] Shader bootstrap note:', e);
        }
    }

    initMap() {
        try {
            this.threatMap = initThreatMap('threat-map', {
                center: [28.5, 40.0],
                zoom: 4,
                minZoom: 2,
                maxZoom: 18
            });

            const btnReset = document.getElementById('btnResetMap');
            if (btnReset) {
                btnReset.addEventListener('click', () => {
                    if (this.threatMap && this.threatMap.map) {
                        this.threatMap.map.flyTo([28.5, 40.0], 4, { duration: 1.2 });
                    }
                });
            }
        } catch (e) {
            console.error('[YASLOGIST] Map initialization error:', e);
        }
    }

    startDualClocks() {
        const utcEl = document.getElementById('clock-utc');
        const cairoEl = document.getElementById('clock-cairo');

        const tick = () => {
            const now = new Date();

            if (utcEl) {
                const uH = String(now.getUTCHours()).padStart(2, '0');
                const uM = String(now.getUTCMinutes()).padStart(2, '0');
                const uS = String(now.getUTCSeconds()).padStart(2, '0');
                utcEl.textContent = `${uH}:${uM}:${uS}`;
            }

            if (cairoEl) {
                try {
                    const cairoFormatter = new Intl.DateTimeFormat('en-GB', {
                        timeZone: 'Africa/Cairo',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });
                    cairoEl.textContent = cairoFormatter.format(now);
                } catch (e) {
                    const cDate = new Date(now.getTime() + (2 * 3600 * 1000));
                    const cH = String(cDate.getUTCHours()).padStart(2, '0');
                    const cM = String(cDate.getUTCMinutes()).padStart(2, '0');
                    const cS = String(cDate.getUTCSeconds()).padStart(2, '0');
                    cairoEl.textContent = `${cH}:${cM}:${cS}`;
                }
            }
        };

        tick();
        setInterval(tick, 1000);
    }

    updateRealTelemetry() {
        const isAr = this.currentLang === 'ar';
        const items = this.allWireItems || [];
        const now = Date.now();

        const paint = (key, pct, foot1, foot2) => {
            const val = document.getElementById(`prog-${key}-val`);
            const bar = document.getElementById(`prog-${key}-bar`);
            const f1 = document.getElementById(`foot-${key}-1`);
            const f2 = document.getElementById(`foot-${key}-2`);
            const clamped = Math.max(0, Math.min(100, pct));
            if (val) val.textContent = `${clamped.toFixed(1)}%`;
            if (bar) bar.style.width = `${clamped}%`;
            if (f1) f1.textContent = foot1;
            if (f2) f2.textContent = foot2;
        };

        // 1) INGEST FEED INTEGRITY - share of configured feeds that returned items.
        const fh = this.feedHealth || { ok: 0, total: YaslogistThreatRadarApp.WIRE_FEEDS.length, syncedAt: now };
        const ageMin = Math.max(0, Math.round((now - fh.syncedAt) / 60000));
        paint('grid', fh.total ? (fh.ok / fh.total) * 100 : 0,
            isAr ? `${fh.ok} من ${fh.total} مصادر مستجيبة` : `${fh.ok}/${fh.total} SOURCES RESPONDING`,
            isAr ? `آخر مزامنة: ${ageMin} د` : `LAST SYNC: ${ageMin}m AGO`);

        // 2) WIRE FRESHNESS - share of wire items published in the last 24h.
        const fresh = items.filter(i => now - i.pubDate <= 86400000).length;
        const newestMin = items.length
            ? Math.max(0, Math.round((now - Math.max(...items.map(i => i.pubDate))) / 60000))
            : 0;
        paint('intercept', items.length ? (fresh / items.length) * 100 : 0,
            isAr ? `${fresh} من ${items.length} خبر خلال 24 ساعة` : `${fresh}/${items.length} ITEMS < 24H`,
            isAr ? `أحدث خبر: ${newestMin} د` : `NEWEST: ${newestMin}m AGO`);

        // 3) MARITIME ALERT LOAD - share of the wire tagged MARITIME.
        const maritime = this.countWireTag('MARITIME');
        paint('transit', items.length ? (maritime / items.length) * 100 : 0,
            isAr ? `${maritime} تقرير بحري نشط` : `${maritime} MARITIME REPORTS`,
            isAr ? 'السويس · باب المندب · هرمز' : 'SUEZ · MANDEB · HORMUZ');

        // 4) CVE EXPOSURE INDEX - mean CVSS base score across tracked CVEs, x10.
        const cves = this.cveData || [];
        const scored = cves.filter(c => typeof c.cvss === 'number');
        const avg = scored.length ? scored.reduce((a, c) => a + c.cvss, 0) / scored.length : 0;
        const crit = cves.filter(c => (c.severity || '').toLowerCase() === 'critical').length;
        paint('ai', avg * 10,
            isAr ? `متوسط CVSS ${avg.toFixed(1)} · ${scored.length} مقيّمة` : `AVG CVSS ${avg.toFixed(1)} · ${scored.length} SCORED`,
            isAr ? `${crit} حرجة من ${cves.length}` : `${crit} CRITICAL / ${cves.length} TRACKED`);

        // Engine meta strip: honest, localized pipeline status.
        const engineMeta = document.getElementById('cockpit-engine-meta');
        if (engineMeta) {
            engineMeta.textContent = isAr
                ? `خط المعالجة // ${fh.ok} من ${fh.total} مصادر نشطة // تحديث تلقائي كل ساعتين`
                : `INGEST PIPELINE // ${fh.ok}/${fh.total} SOURCES LIVE // AUTO-REFRESH 2H`;
        }
    }

    startLiveProgressTelemetry() {
        this.updateRealTelemetry();
        // Freshness genuinely decays with time, so recompute on a slow tick.
        setInterval(() => this.updateRealTelemetry(), 30000);
    }

    updateChartsFromData() {
        const isAr = this.currentLang === 'ar';

        if (this.charts.vectors) {
            const dist = this.wireTagDistribution();
            const AR = { RANSOMWARE: 'برمجيات الفدية', 'ZERO-DAY': 'ثغرات يوم-الصفر', MARITIME: 'ملاحة بحرية',
                         DDOS: 'حجب الخدمة', APT: 'مجموعات APT', INTEL: 'استخبارات عامة' };
            this.charts.vectors.data.labels = dist.map(([k]) => isAr ? (AR[k] || k) : k);
            this.charts.vectors.data.datasets[0].data = dist.map(([, v]) => v);
            this.charts.vectors.data.datasets[0].backgroundColor = dist.map(([k]) => TAG_COLORS[k] || '#334155');
            if (dist.length) this.charts.vectors.data.datasets[0].isLive = true;
            this.charts.vectors.update();
        }

        if (this.charts.industry) {
            const dist = this.wireSectorDistribution();
            this.charts.industry.data.labels = dist.map((b, i) => isAr ? SECTOR_BUCKETS[i].ar : SECTOR_BUCKETS[i].key);
            this.charts.industry.data.datasets[0].data = dist;
            this.charts.industry.update();
        }
    }

    initLanguageSwitcher() {
        const toggleBtn = document.getElementById('langToggleBtn');
        const langText = document.getElementById('langBtnText');
        const applyShell = () => {
            const isAr = this.currentLang === 'ar';
            document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
            document.documentElement.setAttribute('lang', this.currentLang);
            if (langText) langText.textContent = isAr ? 'ENGLISH' : 'العربية';
            this.applyTranslations();
            this.updateNetworkBadge();
        };

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
                storage.set('yaslogist.lang', this.currentLang);
                applyShell();

                if (this.threatMap) {
                    this.threatMap.setLanguage(this.currentLang);
                }

                this.renderCVEs();
                this.renderThreatActors();
                this.renderIntelligenceWire();
                this.updateWireCount();
                this.updateSourceBreakdown();
                this.updateWireSyncChip();
                this.updateChartsLanguage();
                this.updateKPIs();
                this.updateFooterSync();
                this.renderSmartBriefing();
            });
        }

        // Restore the operator's last language without requiring a click.
        applyShell();
    }

    applyTranslations() {
        const dict = I18N[this.currentLang];
        const isAr = this.currentLang === 'ar';

        // Traverse all text nodes and update them if they match a key
        const walkDOM = (node) => {
            if (node.nodeType === 1) { // Element node
                const key = node.getAttribute('data-i18n');
                if (key && dict[key]) {
                    let foundText = false;
                    for (let child of node.childNodes) {
                        if (child.nodeType === 3 && child.nodeValue.trim().length > 0) {
                            child.nodeValue = dict[key];
                            foundText = true;
                            break; // Update first text node
                        }
                    }
                    if (!foundText) {
                        // Ensure we just append a text node if none with text was found
                        node.appendChild(document.createTextNode(dict[key]));
                    }
                }

                const phKey = node.getAttribute('data-i18n-placeholder');
                if (phKey && dict[phKey]) {
                    node.placeholder = dict[phKey];
                }

                const ariaKey = node.getAttribute('data-i18n-aria-label');
                if (ariaKey && dict[ariaKey]) {
                    node.setAttribute('aria-label', dict[ariaKey]);
                }

                const titleKey = node.getAttribute('data-i18n-title');
                if (titleKey && dict[titleKey] && typeof dict[titleKey] === 'string') {
                    node.setAttribute('title', dict[titleKey]);
                }

                // Need to convert to array before iterating since we might modify childNodes
                Array.from(node.childNodes).forEach(walkDOM);
            }
        };
        walkDOM(document.body);

        // Update browser document title
        document.title = isAr
            ? "أنظمة دفاع ياسلوجست // رادار الاستخبارات السيادية وسلاسل الإمداد"
            : "YASLOGIST DEFENSE SYSTEMS // SOVEREIGN CTI & LOGISTICS RADAR";

        // Update DEFCON tooltips
        const defconTitles = {
            en: {
                5: "DEFCON 5: Normal Readiness",
                4: "DEFCON 4: Guarded Readiness",
                3: "DEFCON 3: Elevated Readiness",
                2: "DEFCON 2: High Threat Readiness",
                1: "DEFCON 1: Maximum Threat Readiness"
            },
            ar: {
                5: "DEFCON 5: جاهزية عادية",
                4: "DEFCON 4: جاهزية محترسة",
                3: "DEFCON 3: جاهزية مرتفعة",
                2: "DEFCON 2: تأهب أمني حرج",
                1: "DEFCON 1: طوارئ قصوى"
            }
        };
        document.querySelectorAll('.defcon-tier').forEach(tier => {
            const lvl = tier.getAttribute('data-level');
            if (lvl && defconTitles[this.currentLang] && defconTitles[this.currentLang][lvl]) {
                tier.setAttribute('title', defconTitles[this.currentLang][lvl]);
            }
        });

        // Update button tooltips
        const langToggleBtn = document.getElementById('langToggleBtn');
        if (langToggleBtn) {
            langToggleBtn.setAttribute('title', dict.switchLangTitle || (isAr ? 'Switch to English' : 'تبديل إلى العربية'));
        }
        const refreshBtn2 = document.getElementById('refresh-news-btn');
        if (refreshBtn2) {
            refreshBtn2.setAttribute('title', dict.refreshFeedsTitle || (isAr ? 'تحديث البث الحي' : 'Refresh Live Feeds'));
        }

        // Update dynamic report count (+ watchlist count) in wire subtitle
        if (this.allWireItems && this.allWireItems.length > 0) {
            this.updateWireCount();
        }

        // DEFCON readout uses level-resolved localized strings.
        const activeTier = document.querySelector('.defcon-tier.active');
        if (activeTier) this.setDefconLevel(parseInt(activeTier.getAttribute('data-level'), 10) || 4);
    }

    async loadData() {
        // Load target intensity data
        try {
            const data = await fetchJSONWithTimeout('./data/target_intensity.json', { cache: 'no-store' });
            this.intensityData = Array.isArray(data) ? data : DEFAULT_INTENSITY;
        } catch (e) {
            this.intensityData = DEFAULT_INTENSITY;
        }

        // Load CVE data
        try {
            const data = await fetchJSONWithTimeout('./data/middle_east_cves.json', { cache: 'no-store' });
            this.cveData = Array.isArray(data) ? data : DEFAULT_CVES;
        } catch (e) {
            this.cveData = DEFAULT_CVES;
        }

        // Load pipeline provenance manifest + signal timeline (additive artefacts).
        try {
            const meta = await fetchJSONWithTimeout('./data/meta.json', { cache: 'no-store' });
            if (meta && typeof meta === 'object') this.pipelineMeta = meta;
        } catch (e) {
            this.pipelineMeta = null;
        }
        try {
            const timeline = await fetchJSONWithTimeout('./data/signal_timeline.json', { cache: 'no-store' });
            if (timeline && Array.isArray(timeline.days)) this.timelineData = timeline;
        } catch (e) {
            this.timelineData = null;
        }

        // Update Map with Intensity
        if (this.threatMap) {
            this.threatMap.updateData(this.intensityData, this.currentLang);
        }

        // Render CVE Table
        this.renderCVEs();

        // Update KPIs & DEFCON & pipeline freshness
        this.updateKPIs();
        this.updateFooterSync();
        this.renderSmartBriefing();
    }

    /** Footer sync chip: honest pipeline age, stale-state colouring. */
    updateFooterSync() {
        const el = document.getElementById('last-updated-footer');
        if (!el) return;
        const isAr = this.currentLang === 'ar';
        if (!this.pipelineMeta || !this.pipelineMeta.generatedAt) {
            el.textContent = isAr ? 'مزامنة النظام: بانتظار البيانات' : 'SYSTEM SYNC: AWAITING MANIFEST';
            el.dataset.stale = 'unknown';
            el.removeAttribute('title');
            return;
        }
        const syncedAt = Date.parse(this.pipelineMeta.generatedAt);
        const ageMin = Math.max(0, Math.round((Date.now() - (isNaN(syncedAt) ? Date.now() : syncedAt)) / 60000));
        const ageH = Math.floor(ageMin / 60);
        const ageText = ageMin < 60
            ? (isAr ? `منذ ${Math.max(ageMin, 1)} د` : `${Math.max(ageMin, 1)}m AGO`)
            : (isAr ? `منذ ${ageH} س` : `${ageH}h AGO`);
        const feedsOk = Array.isArray(this.pipelineMeta.feeds) && this.pipelineMeta.feeds.length
            ? this.pipelineMeta.feeds.filter(f => f && f.ok).length : null;
        const feedsTotal = Array.isArray(this.pipelineMeta.feeds) ? this.pipelineMeta.feeds.length : null;
        const feedText = feedsOk !== null ? (isAr ? ` · المصادر ${feedsOk}/${feedsTotal}` : ` · FEEDS ${feedsOk}/${feedsTotal}`) : '';
        el.textContent = (isAr ? `آخر مزامنة: ${ageText}` : `PIPELINE SYNC: ${ageText}`) + feedText;
        el.dataset.stale = ageH >= 24 ? 'critical' : ageH >= 5 ? 'warn' : 'fresh';
        const source = this.pipelineMeta.source === 'offline-derivation'
            ? (isAr ? 'مشتق محلياً من السلك الملتزم' : 'derived offline from committed wire')
            : (isAr ? `أُنتج في ${this.pipelineMeta.generatedAt}` : `generated ${this.pipelineMeta.generatedAt}`);
        el.setAttribute('title', source);
    }

    /* Animated KPI counter — rAF, integer-exact at rest, reduced-motion aware. */
    animateKpiValue(id, target) {
        const el = document.getElementById(id);
        if (!el) return;
        const value = Math.round(Number(target) || 0);
        if (this._kpiAnims && this._kpiAnims[id]) cancelAnimationFrame(this._kpiAnims[id]);
        this._kpiAnims = this._kpiAnims || {};
        if (prefersReducedMotion() || typeof requestAnimationFrame !== 'function') {
            el.textContent = String(value);
            return;
        }
        const from = parseInt(el.dataset.kpiValue || '0', 10) || 0;
        const start = performance.now();
        const duration = 750;
        const step = (t) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = String(Math.round(from + (value - from) * eased));
            if (p < 1) this._kpiAnims[id] = requestAnimationFrame(step);
            else { el.textContent = String(value); el.dataset.kpiValue = String(value); }
        };
        this._kpiAnims[id] = requestAnimationFrame(step);
    }

    updateKPIs() {
        const isAr = this.currentLang === 'ar';
        const set = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        // Regional signal volume: sum of country-linked reports over the 7d window,
        // with an HONEST trend computed against the preceding 7d window.
        const data = this.intensityData || [];
        const signalVolume = data.reduce((sum, item) => sum + (parseInt(item.attacks || '0', 10) || 0), 0);
        const hasBaseline = data.some(item => item.previous !== undefined);
        const priorVolume = data.reduce((sum, item) => sum + (parseInt(item.previous ?? item.attacks, 10) || 0), 0);
        this.animateKpiValue('kpi-attacks-count', signalVolume);
        const attacksTrend = document.getElementById('kpi-attacks-trend');
        if (attacksTrend) {
            let label, cls;
            if (!hasBaseline) { label = isAr ? 'جاري بناء خط الأساس' : 'BASELINE SYNCING'; cls = 'trend-flat'; }
            else if (priorVolume === 0 && signalVolume === 0) { label = isAr ? 'لا إشارة' : 'NO SIGNAL'; cls = 'trend-flat'; }
            else if (priorVolume === 0) { label = isAr ? 'نشاط جديد' : 'NEW ACTIVITY'; cls = 'trend-up'; }
            else {
                const pct = Math.round(((signalVolume - priorVolume) / priorVolume) * 100);
                label = `${pct >= 0 ? '+' : ''}${pct}%`;
                cls = pct > 0 ? 'trend-up' : pct < 0 ? 'trend-down' : 'trend-flat';
            }
            attacksTrend.innerHTML = `<i class="fa-solid ${cls === 'trend-down' ? 'fa-arrow-trend-down' : 'fa-arrow-trend-up'}"></i> ${escapeHTML(label)}`;
            attacksTrend.className = `kpi-trend mono ${cls}`;
            attacksTrend.title = isAr ? 'مقارنة نافذة 7 أيام بالنافذة السابقة' : '7-day window vs preceding 7-day window';
        }

        // APT / state-linked reports currently on the wire (+ honest share of wire).
        const aptCount = this.countWireTag('APT');
        this.animateKpiValue('kpi-campaigns-count', aptCount);
        const campaignsTrend = document.getElementById('kpi-campaigns-trend');
        if (campaignsTrend) {
            const wireN = (this.allWireItems || []).length;
            const share = wireN ? Math.round((aptCount / wireN) * 100) : 0;
            campaignsTrend.innerHTML = `<span class="dot-pulse-gold"></span> ${isAr ? `${share}% من الشريط` : `${share}% OF WIRE`}`;
            campaignsTrend.className = 'kpi-trend trend-gold mono';
        }

        // Weaponized CVEs actually tracked (+ peak base score, from data).
        this.animateKpiValue('kpi-cves-count', (this.cveData || []).length);
        const cveTrend = document.getElementById('kpi-cve-trend');
        if (cveTrend) {
            const scores = (this.cveData || []).map(c => Number(c.cvss)).filter(Number.isFinite);
            const peak = scores.length ? Math.max(...scores).toFixed(1) : null;
            cveTrend.innerHTML = peak
                ? `<i class="fa-solid fa-circle-exclamation"></i> ${isAr ? `الذروة CVSS ${peak}` : `PEAK CVSS ${peak}`}`
                : `<i class="fa-solid fa-circle-exclamation"></i> ${escapeHTML(I18N[this.currentLang].kpiCveTrend)}`;
        }

        // Maritime chokepoint alerts currently on the wire (+ thresholded posture).
        const maritimeCount = this.countWireTag('MARITIME');
        this.animateKpiValue('kpi-logistics-count', maritimeCount);
        const logisticsTrend = document.getElementById('kpi-logistics-trend');
        if (logisticsTrend) {
            const level = maritimeCount >= 4 ? ['HIGH RISK', 'خطر مرتفع', 'trend-warn']
                        : maritimeCount >= 1 ? ['ELEVATED', 'مرتفع', 'trend-gold']
                        : ['NOMINAL', 'اعتيادي', 'trend-flat'];
            logisticsTrend.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${isAr ? level[1] : level[0]}`;
            logisticsTrend.className = `kpi-trend mono ${level[2]}`;
        }

        // KPI progress bars are telemetry, not decoration: every width below
        // is derived from the same committed artefacts that feed the counters.
        const dict = I18N[this.currentLang];
        const setKpiBar = (cardId, pct, tooltip) => {
            const card = document.getElementById(cardId);
            const bar = card?.querySelector?.('.kpi-progress-bar');
            if (!bar) return;
            const width = Math.max(2, Math.min(100, Math.round(pct)));
            bar.style.width = `${width}%`;
            bar.setAttribute('role', 'progressbar');
            bar.setAttribute('aria-valuenow', String(width));
            bar.setAttribute('aria-valuemin', '0');
            bar.setAttribute('aria-valuemax', '100');
            bar.setAttribute('aria-label', tooltip);
            card.setAttribute('title', `${tooltip} — ${width}%`);
        };
        const countries = this.intensityData || [];
        const activeCountries = countries.filter(c => (parseInt(c.attacks || '0', 10) || 0) > 0).length;
        setKpiBar('kpi-attacks-card', countries.length ? (activeCountries / countries.length) * 100 : 0, dict.kpiBarCountries);
        const wireN = (this.allWireItems || []).length;
        setKpiBar('kpi-campaigns-card', wireN ? (aptCount / wireN) * 100 : 0, dict.kpiBarAptShare);
        const cvssScores = (this.cveData || []).map(c => Number(c.cvss)).filter(Number.isFinite);
        setKpiBar('kpi-cve-card', cvssScores.length ? Math.max(...cvssScores) * 10 : 0, dict.kpiBarPeakCvss);
        setKpiBar('kpi-logistics-card', wireN ? (maritimeCount / wireN) * 100 : 0, dict.kpiBarMaritimeShare);

        // DEFCON from the real severity mix of tracked CVEs.
        const sev = (this.cveData || []).map(c => (c.severity || '').toLowerCase());
        const criticalCount = sev.filter(x => x === 'critical').length;
        const highCount = sev.filter(x => x === 'high').length;
        let defcon = 4;
        if (criticalCount >= 3) defcon = 2;
        else if (criticalCount >= 1 || highCount >= 5) defcon = 3;
        this.setDefconLevel(defcon);
    }

    /** Full 1..5 DEFCON readout — every level resolves its own localized string. */
    setDefconLevel(level = 2) {
        document.querySelectorAll('.defcon-tier').forEach(tier => {
            const tierLevel = parseInt(tier.getAttribute('data-level'), 10);
            tier.classList.toggle('active', tierLevel === level);
        });

        const readoutEl = document.getElementById('defcon-readout-text');
        if (!readoutEl) return;
        const isAr = this.currentLang === 'ar';
        const READOUTS = {
            1: { en: 'DEFCON 1 // IMMINENT KINETIC / CYBER ESCALATION', ar: 'DEFCON 1 // تصعيد عسكري وسيبراني وشيك', color: 'var(--yas-crimson)' },
            2: { en: 'DEFCON 2 // SEVERE REGIONAL TARGETING', ar: 'DEFCON 2 // استهداف إقليمي حرج لمنشآت الطاقة والنقل', color: '#F97316' },
            3: { en: 'DEFCON 3 // ELEVATED MILITARY READINESS', ar: 'DEFCON 3 // جاهزية أمنية واستخباراتية مرتفعة', color: 'var(--yas-gold)' },
            4: { en: 'DEFCON 4 // GUARDED REGIONAL POSTURE', ar: 'DEFCON 4 // وضع إقليمي محترس ومراقبة مستمرة', color: 'var(--yas-cyan)' },
            5: { en: 'DEFCON 5 // ROUTINE MONITORING', ar: 'DEFCON 5 // مراقبة روتينية اعتيادية', color: 'var(--yas-green)' }
        };
        const r = READOUTS[level] || READOUTS[4];
        const label = isAr ? r.ar : r.en;
        const [code, ...rest] = label.split('//');
        readoutEl.innerHTML = `<span class="mono">${escapeHTML(code.trim())}</span> // ${escapeHTML(rest.join('//').trim())}`;
        readoutEl.style.color = r.color;
    }

    /** Severity + search + sort pipeline shared by the table and the CSV export. */
    filteredCVEs() {
        const RANK = { critical: 0, high: 1, medium: 2, low: 3 };
        let rows = [...(this.cveData || [])];
        if (this.cveFilter !== 'ALL') {
            rows = rows.filter(c => String(c.severity || '').toLowerCase() === this.cveFilter.toLowerCase());
        }
        if (this.cveSearchTerm) {
            const term = this.cveSearchTerm.toLowerCase();
            rows = rows.filter(c =>
                (c.id && String(c.id).toLowerCase().includes(term)) ||
                (c.system && String(c.system).toLowerCase().includes(term)) ||
                (c.systemEn && String(c.systemEn).toLowerCase().includes(term)) ||
                (c.systemAr && String(c.systemAr).includes(term)) ||
                (c.advisoryEn && String(c.advisoryEn).toLowerCase().includes(term)) ||
                (c.advisoryAr && String(c.advisoryAr).includes(term))
            );
        }
        if (this.cveSort === 'cvss') {
            rows.sort((a, b) => (Number(b.cvss) || -1) - (Number(a.cvss) || -1));
        } else {
            rows.sort((a, b) => (RANK[String(a.severity).toLowerCase()] ?? 4) - (RANK[String(b.severity).toLowerCase()] ?? 4));
        }
        return rows;
    }

    renderCVEs() {
        const tbody = document.querySelector('#cve-table tbody');
        if (!tbody) return;

        const isAr = this.currentLang === 'ar';
        const dict = I18N[this.currentLang];
        const rows = this.filteredCVEs();

        if (!rows.length) {
            tbody.innerHTML = `<tr><td colspan="5" class="cve-empty-cell">${escapeHTML(dict.cveEmptyState)}</td></tr>`;
            return;
        }

        tbody.innerHTML = rows.map(cve => {
            const severity = (cve.severity || 'High').toLowerCase();
            let badgeClass = 'badge-high';
            let sevText = dict.sevHigh;

            if (severity === 'critical') {
                badgeClass = 'badge-critical';
                sevText = dict.sevCritical;
            } else if (severity === 'medium') {
                badgeClass = 'badge-medium';
                sevText = dict.sevMedium;
            } else if (severity === 'low') {
                badgeClass = 'badge-low';
                sevText = dict.sevLow;
            }

            const sysName = isAr ? (cve.systemAr || cve.system) : (cve.systemEn || cve.system);
            const advisory = isAr ? (cve.advisoryAr || dict.advisoryImmediate) : (cve.advisoryEn || dict.advisoryImmediate);
            const cveId = escapeHTML(String(cve.id || ''));
            const cvss = Number.isFinite(Number(cve.cvss)) ? Number(cve.cvss).toFixed(1) : 'N/A';
            const cvssClass = Number(cve.cvss) >= 9 ? 'cvss-critical' : Number(cve.cvss) >= 7 ? 'cvss-high' : 'cvss-muted';

            return `
                <tr>
                    <td class="cve-id-cell mono">
                        <a href="https://nvd.nist.gov/vuln/detail/${encodeURIComponent(String(cve.id || ''))}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">
                            <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px; opacity: 0.6; margin-inline-end: 4px;"></i>${cveId}
                        </a>
                    </td>
                    <td><strong style="color: #FFFFFF;">${escapeHTML(sysName)}</strong></td>
                    <td><span class="cve-badge ${badgeClass}">${sevText}</span></td>
                    <td class="mono cvss-cell ${cvssClass}">
                        <span class="cvss-value">${cvss}</span>
                        <span class="cvss-meter" role="img" aria-label="CVSS ${cvss} of 10"><span class="cvss-meter-fill ${severity}" style="width:${Math.max(0, Math.min(100, (Number(cve.cvss) || 0) * 10))}%"></span></span>
                    </td>
                    <td style="font-size: 11.5px; color: var(--text-secondary);">${escapeHTML(advisory)}</td>
                </tr>
            `;
        }).join('');
    }

    renderThreatActors(filteredList = null) {
        const container = document.getElementById('actors-grid');
        if (!container) return;

        const isAr = this.currentLang === 'ar';
        const dict = I18N[this.currentLang];
        let actors;
        if (filteredList) {
            actors = filteredList;
        } else {
            // Default ordering: actors actually echoing on the live wire come
            // first (activity desc), then by assessed threat level.
            actors = [...THREAT_ACTORS_DB].map(actor => ({
                actor,
                activity: YaslogistThreatRadarApp.actorWireActivity(actor, this.allWireItems)
            })).sort((a, b) =>
                (b.activity > 0) - (a.activity > 0) || b.activity - a.activity ||
                (b.actor.level || 0) - (a.actor.level || 0)
            ).map(entry => entry.actor);
        }

        container.innerHTML = actors.map(actor => {
            const origin = isAr ? actor.originAr : actor.originEn;
            const motivation = isAr ? actor.motivationAr : actor.motivationEn;
            const targets = isAr ? actor.targetsAr : actor.targetsEn;
            const activity = YaslogistThreatRadarApp.actorWireActivity(actor, this.allWireItems);
            const level = Math.max(1, Math.min(5, Number(actor.level) || 3));

            return `
                <div class="actor-dossier-card ${activity ? 'actor-card-live' : ''}">
                    <div class="actor-head-row">
                        <span class="actor-title">${escapeHTML(actor.name)}</span>
                        <span class="actor-origin-badge">${escapeHTML(origin)}</span>
                    </div>
                    <div class="actor-signal-row">
                        <span class="actor-activity-chip ${activity ? 'live' : ''}" title="${escapeHTML(dict.actorActivityLabel)}">
                            <i class="fa-solid ${activity ? 'fa-tower-broadcast' : 'fa-slash'}" aria-hidden="true"></i>
                            ${activity
                                ? `${escapeHTML(dict.actorActivityLabel)}: <strong>${activity}</strong>`
                                : escapeHTML(dict.actorNoActivity)}
                        </span>
                        <a class="actor-mitre-link mono" href="${safeURL(YaslogistThreatRadarApp.actorMitreHref(actor))}" target="_blank" rel="noopener noreferrer">
                            <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> ${escapeHTML(dict.actorMitreLink)}
                        </a>
                    </div>
                    <p class="actor-motivation">${escapeHTML(motivation)}</p>
                    <div class="actor-level-row" title="${escapeHTML(dict.actorLevelLabel)}">
                        <span class="actor-level-label mono">${escapeHTML(dict.actorLevelLabel)}</span>
                        <span class="actor-level-meter" role="img" aria-label="${escapeHTML(dict.actorLevelLabel)} ${level}/5">
                            ${[1, 2, 3, 4, 5].map(seg => `<span class="level-seg ${seg <= level ? `on lvl-${level}` : ''}"></span>`).join('')}
                        </span>
                    </div>
                    <div class="actor-target-tags">
                        ${targets.map(t => `<span class="actor-target-pill">${escapeHTML(t)}</span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Feeds used for the live browser-side overlay.
    static get WIRE_FEEDS() {
        return [
            { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC Middle East' },
            { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
            { url: 'https://www.bleepingcomputer.com/feed/', source: 'BleepingComputer' },
            { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News' },
            { url: 'https://www.darkreading.com/rss.xml', source: 'Dark Reading' }
        ];
    }

    static get WIRE_KEYWORDS() {
        return ['israel', 'gaza', 'palestin', 'iran', 'lebanon', 'syria', 'yemen', 'houthi',
                'middle east', 'suez', 'red sea', 'hormuz', 'maritime', 'cve', 'zero-day',
                'ransomware', 'wiper', 'apt33', 'apt34', 'scada', 'telecom', 'hezbollah',
                'idf', 'strike', 'drone', 'missile'];
    }

    buildWireTags(contentStr) {
        const tags = [];
        if (contentStr.includes('ransomware')) tags.push({ textEn: 'RANSOMWARE', textAr: 'برمجيات الفدية', class: 'tag-urgent' });
        if (contentStr.includes('zero-day') || contentStr.includes('0-day')) tags.push({ textEn: 'ZERO-DAY', textAr: 'يوم-الصفر', class: 'tag-purple' });
        if (contentStr.includes('maritime') || contentStr.includes('suez') || contentStr.includes('red sea') ||
            contentStr.includes('houthi') || contentStr.includes('vessel') || contentStr.includes('hormuz')) {
            tags.push({ textEn: 'MARITIME', textAr: 'ملاحة بحرية', class: 'tag-urgent' });
        }
        if (contentStr.includes('ddos')) tags.push({ textEn: 'DDoS', textAr: 'حجب الخدمة', class: 'tag-warn' });
        if (contentStr.includes('apt') || contentStr.includes('state-sponsored')) tags.push({ textEn: 'APT', textAr: 'مجموعات متقدمة', class: 'tag-cyan' });
        if (tags.length === 0) tags.push({ textEn: 'INTEL', textAr: 'استخبارات', class: '' });
        return tags.slice(0, 3);
    }

    // Accepts anything the pipeline or a seed file produced and coerces it
    // into the exact shape renderIntelligenceWire() expects.
    normalizeWireItems(raw) {
        if (!Array.isArray(raw)) return [];
        return raw.map(item => {
            if (!item || typeof item !== 'object') return null;

            const titleEn = item.titleEn || item.title || '';
            if (!titleEn) return null;

            let pubDate = item.pubDate;
            if (typeof pubDate !== 'number') {
                const parsed = Date.parse(item.pubDate || item.timestamp || '');
                pubDate = isNaN(parsed) ? Date.now() : parsed;
            }

            const summaryEn = item.summaryEn || item.summary || '';
            let tags = Array.isArray(item.tags) ? item.tags.filter(t => t && t.textEn) : [];
            if (tags.length === 0) {
                tags = this.buildWireTags(`${titleEn} ${summaryEn} ${item.category || ''}`.toLowerCase());
            }

            return {
                titleEn,
                titleAr: item.titleAr || titleEn,
                link: item.link || item.url || '#',
                source: item.source || 'YASLOGIST CTI',
                pubDate,
                summaryEn,
                summaryAr: item.summaryAr || summaryEn,
                tags
            };
        }).filter(Boolean);
    }

    dedupeWireItems(items) {
        // Sort first so the NEWEST duplicate wins, mirroring the pipeline.
        // The key keeps Unicode letters/digits so Arabic-language reports
        // dedupe correctly instead of collapsing to an empty key and vanishing.
        const seen = new Set();
        return [...items]
            .sort((a, b) => b.pubDate - a.pubDate)
            .filter(item => {
                const key = (item.titleEn || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').slice(0, 80) ||
                    (item.link || '').slice(0, 80);
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, 60);
    }

    updateWireCount() {
        const countEl = document.getElementById('wire-report-count');
        if (!countEl) return;
        const isAr = this.currentLang === 'ar';
        const n = (this.allWireItems || []).length;
        const pinned = this.wirePinnedItems().length;
        const pinnedText = pinned
            ? (isAr ? ` · ${pinned} مثبتة` : ` · ${pinned} pinned`)
            : '';
        countEl.textContent = isAr
            ? `${n} تقارير معترضة // تدفق حي متواصل${pinnedText}`
            : `${n} intercepted reports // Active streams${pinnedText}`;
        const pinnedCount = document.getElementById('wire-pinned-count');
        if (pinnedCount) pinnedCount.textContent = String(pinned);
    }

    async fetchSingleFeed(feed, timeoutMs = 9000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            // Read-only public JSON proxy, used only as a browser-side overlay.
            const response = await fetch(
                `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`,
                { signal: controller.signal }
            );
            if (!response.ok) return [];
            const data = await response.json();
            if (!data || !Array.isArray(data.items)) return [];

            const keywords = YaslogistThreatRadarApp.WIRE_KEYWORDS;
            const out = [];
            data.items.forEach(item => {
                const title = item.title || '';
                const description = item.description || item.content || '';
                const contentStr = `${title} ${description}`.toLowerCase();
                const isRelevant = feed.source.includes('BBC') || keywords.some(kw => contentStr.includes(kw));
                if (!isRelevant) return;

                const clean = description.replace(/<[^>]+>/g, '').trim();
                out.push({
                    titleEn: title,
                    titleAr: title,
                    link: item.link || '#',
                    source: feed.source,
                    pubDate: Date.parse(item.pubDate || '') || Date.now(),
                    summaryEn: clean.substring(0, 180) + (clean.length > 180 ? '…' : ''),
                    summaryAr: clean.substring(0, 180) + (clean.length > 180 ? '…' : ''),
                    tags: this.buildWireTags(contentStr)
                });
            });
            return out;
        } catch (err) {
            return [];
        } finally {
            clearTimeout(timer);
        }
    }

    async fetchWire({ background = false } = {}) {
        const container = document.getElementById('news-container');
        const previousIds = (this.allWireItems || []).map(YaslogistThreatRadarApp.wireItemId);
        const seenBefore = new Set(previousIds);
        const isFirstSync = this.lastWireSyncAt === 0;
        if (container && !background) {
            container.classList.add('wire-loading');
            container.innerHTML = `
                <div class="loading-state">
                    <i class="fa-solid fa-satellite-dish fa-spin"></i>
                    <span>${I18N[this.currentLang].loadingWire}</span>
                </div>
                ${'<div class="wire-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>'.repeat(3)}
            `;
        }

        // ---- STAGE 1 : committed wire, regenerated every 2h by the GitHub Action.
        // Always available, never rate-limited. Painted immediately.
        let baseItems = [];
        try {
            const data = await fetchJSONWithTimeout(`./data/intel_wire.json?t=${Date.now()}`, { cache: 'no-store' });
            if (Array.isArray(data)) baseItems = this.normalizeWireItems(data);
        } catch (err) {
            console.warn('[YASLOGIST] Static intel wire unavailable:', err);
        }

        if (baseItems.length > 0) {
            this.allWireItems = this.dedupeWireItems(baseItems);
            this.updateWireCount();
            this.renderIntelligenceWire();
        }

        // ---- STAGE 2 : live browser-side overlay. Parallel + timeboxed.
        let liveItems = [];
        let feedsOk = 0;
        const feedsTotal = YaslogistThreatRadarApp.WIRE_FEEDS.length;
        try {
            const results = await Promise.allSettled(
                YaslogistThreatRadarApp.WIRE_FEEDS.map(feed => this.fetchSingleFeed(feed))
            );
            results.forEach(r => {
                if (r.status === 'fulfilled' && Array.isArray(r.value)) {
                    if (r.value.length > 0) feedsOk++;
                    liveItems = liveItems.concat(r.value);
                }
            });
        } catch (err) {
            console.warn('[YASLOGIST] Live feed overlay degraded:', err);
        }

        const merged = this.dedupeWireItems(liveItems.concat(baseItems));
        this.allWireItems = merged.length > 0 ? merged : FALLBACK_WIRE_ITEMS;
        this.feedHealth = { ok: feedsOk, total: feedsTotal, syncedAt: Date.now() };
        this.lastWireSyncAt = Date.now();

        // New-intercept callout: items whose ids were not on the previous wire.
        if (!isFirstSync) {
            const fresh = this.allWireItems.filter(i => !seenBefore.has(YaslogistThreatRadarApp.wireItemId(i)));
            if (fresh.length) {
                const isAr = this.currentLang === 'ar';
                const label = isAr
                    ? `${fresh.length} اعتراض${fresh.length === 1 ? '' : 'ات'} جديد منذ آخر مزامنة`
                    : `${fresh.length} new intercept${fresh.length === 1 ? '' : 's'} since last sync`;
                this.showToast(`▲ ${label}`);
            }
        }

        if (container) container.classList.remove('wire-loading');
        // Screen-reader courtesy: background syncs announce only the summary
        // toast (a proper live region), not the entire re-rendered wire list.
        if (container && background) container.setAttribute('aria-live', 'off');
        this.updateWireCount();
        this.renderIntelligenceWire();
        this.updateSourceBreakdown();
        this.updateWireSyncChip(true);
        this.renderThreatActors(); // activity chips depend on the fresh wire
        this.updateKPIs();
        this.updateRealTelemetry();
        this.updateChartsFromData();
        this.renderSmartBriefing();
        if (container && background) container.setAttribute('aria-live', 'polite');
    }

    // ---- Derived metrics. Every figure below traces to live wire or CVE data. ----
    countWireTag(tag) {
        return (this.allWireItems || []).filter(
            i => (i.tags || []).some(t => (t.textEn || '').toUpperCase() === tag)
        ).length;
    }

    wireTagDistribution() {
        const counts = {};
        (this.allWireItems || []).forEach(i => {
            (i.tags || []).forEach(t => {
                const k = (t.textEn || '').toUpperCase();
                if (k) counts[k] = (counts[k] || 0) + 1;
            });
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }

    wireSourceDistribution() {
        const counts = {};
        (this.allWireItems || []).forEach(i => {
            const k = i.source || 'Unknown';
            counts[k] = (counts[k] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    }

    /**
     * Sector distribution of the live wire: a deterministic keyword bucket
     * count (one item may signal several sectors). Zero buckets remain zero —
     * the chart honestly shows "no current sector pressure" instead of fiction.
     */
    wireSectorDistribution() {
        const dist = SECTOR_BUCKETS.map(() => 0);
        (this.allWireItems || []).forEach(item => {
            const text = `${item.titleEn || ''} ${item.summaryEn || ''}`.toLowerCase();
            SECTOR_BUCKETS.forEach((bucket, i) => {
                if (bucket.keywords.some(kw => text.includes(kw))) dist[i]++;
            });
        });
        return dist;
    }

    renderIntelligenceWire() {
        const container = document.getElementById('news-container');
        if (!container) return;

        const isAr = this.currentLang === 'ar';
        const dict = I18N[this.currentLang];
        let filtered = this.allWireItems;

        // Apply Tag Filter (PINNED is the operator watchlist pseudo-tag).
        if (this.activeWireTag === 'PINNED') {
            filtered = filtered.filter(item => this.isWirePinned(item));
        } else if (this.activeWireTag !== 'ALL') {
            filtered = filtered.filter(item =>
                item.tags.some(t => t.textEn.toUpperCase() === this.activeWireTag.toUpperCase())
            );
        }

        // Apply Search Filter — Arabic operators search Arabic fields too.
        if (this.wireSearchTerm) {
            const term = this.wireSearchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                (item.titleEn && item.titleEn.toLowerCase().includes(term)) ||
                (item.summaryEn && item.summaryEn.toLowerCase().includes(term)) ||
                (item.titleAr && item.titleAr.includes(term)) ||
                (item.summaryAr && item.summaryAr.includes(term)) ||
                (item.source && item.source.toLowerCase().includes(term))
            );
        }

        if (filtered.length === 0) {
            const pinnedMode = this.activeWireTag === 'PINNED';
            const message = pinnedMode ? dict.pinnedEmptyState
                : (isAr ? 'لا توجد تقارير استخباراتية تطابق التصفية الحالية.' : 'No intelligence reports match the current tactical filter.');
            const icon = pinnedMode ? 'fa-star' : 'fa-filter-circle-xmark';
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted); font-size: 12px;">
                    <i class="fa-solid ${icon}" style="font-size: 24px; margin-bottom: 8px; color: var(--yas-gold);"></i>
                    <p>${escapeHTML(message)}</p>
                </div>
            `;
            return;
        }

        const term = this.wireSearchTerm;
        container.innerHTML = filtered.map((item, idx) => {
            const timeAgo = this.formatTimeAgo(item.pubDate);
            const title = isAr ? (item.titleAr || item.titleEn) : item.titleEn;
            const summary = isAr ? (item.summaryAr || item.summaryEn) : item.summaryEn;
            const pinned = this.isWirePinned(item);
            const isNew = Date.now() - Number(item.pubDate || 0) < 3 * 3600 * 1000;

            return `
                <div class="wire-item reveal ${pinned ? 'wire-item-pinned' : ''}" style="--reveal-index: ${Math.min(idx, 12)}">
                    <div class="wire-item-header">
                        <span class="wire-source">${escapeHTML(item.source)}${isNew ? ` <span class="wire-new-badge">${escapeHTML(dict.newBadge)}</span>` : ''}</span>
                        <span class="wire-item-tools">
                            <span class="wire-timestamp mono">${escapeHTML(timeAgo)}</span>
                            <button type="button" class="wire-pin-btn ${pinned ? 'pinned' : ''}" data-pin-id="${escapeHTML(YaslogistThreatRadarApp.wireItemId(item))}"
                                aria-pressed="${pinned}" aria-label="${escapeHTML(pinned ? dict.unpinItem : dict.pinItem)}" title="${escapeHTML(pinned ? dict.unpinItem : dict.pinItem)}">
                                <i class="fa-${pinned ? 'solid' : 'regular'} fa-star" aria-hidden="true"></i>
                            </button>
                        </span>
                    </div>
                    <h3 class="wire-title">
                        <a href="${safeURL(item.link)}" target="_blank" rel="noopener noreferrer">${YaslogistThreatRadarApp.highlightHTML(title, term)}</a>
                    </h3>
                    <p class="wire-summary">${YaslogistThreatRadarApp.highlightHTML(summary, term)}</p>
                    <div class="wire-tags">
                        ${item.tags.map(tag => `
                            <span class="wire-tag ${escapeHTML(String(tag.class || "").replace(/[^a-z0-9_-]/gi, ""))}">${escapeHTML(isAr ? tag.textAr : tag.textEn)}</span>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        this.applyReveal(container);
    }

    formatTimeAgo(timestamp) {
        const isAr = this.currentLang === 'ar';
        // Clock-skewed feeds can publish "future" timestamps — clamp to now.
        const seconds = Math.max(0, Math.floor((Date.now() - Number(timestamp) || 0) / 1000));

        if (seconds < 60) {
            return isAr ? `منذ ${Math.max(seconds, 1)} ث` : `${Math.max(seconds, 1)}s ago`;
        }
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return isAr ? `منذ ${minutes} د` : `${minutes}m ago`;
        }
        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return isAr ? `منذ ${hours} س` : `${hours}h ago`;
        }
        const days = Math.floor(hours / 24);
        return isAr ? `منذ ${days} ي` : `${days}d ago`;
    }

    /* -------------------------------------------------------------- tabs */

    static get TAB_SLUGS() {
        return {
            'dashboard': 'dashboard',
            'threat-map-view': 'map',
            'intel-wire': 'wire',
            'cve-matrix': 'cves',
            'apt-dossiers': 'actors'
        };
    }

    /** Activate a tab panel by DOM id; optionally moved focus and push hash. */
    activateTab(targetId, { focus = false, pushHash = true } = {}) {
        const tabs = [...document.querySelectorAll('.nav-tab')];
        const panes = [...document.querySelectorAll('.tab-panel')];
        const tab = tabs.find(t => t.getAttribute('data-target') === targetId);
        const pane = document.getElementById(targetId);
        if (!tab || !pane) return false;

        tabs.forEach(t => {
            const active = t === tab;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', active ? 'true' : 'false');
            t.setAttribute('tabindex', active ? '0' : '-1');
        });
        panes.forEach(p => p.classList.toggle('active', p === pane));

        if (targetId === 'threat-map-view' && this.threatMap && this.threatMap.map) {
            setTimeout(() => { this.threatMap.map.invalidateSize(); }, 100);
            setTimeout(() => { this.threatMap.map.invalidateSize(); }, 350);
        }
        if (pushHash) {
            const slug = YaslogistThreatRadarApp.TAB_SLUGS[targetId];
            const query = YaslogistThreatRadarApp.serializeWireState({ tag: this.activeWireTag, q: this.wireSearchTerm });
            try { history.replaceState(null, '', `#${slug}${query ? `?${query}` : ''}`); } catch { /* file:// */ }
            storage.set('yaslogist.tab', targetId);
        }
        if (focus) tab.focus({ preventScroll: true });
        return true;
    }

    bindTabs() {
        const tabs = [...document.querySelectorAll('.nav-tab')];
        if (!tabs.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.activateTab(tab.getAttribute('data-target'));
            });
        });

        // WAI-ARIA tablist keyboard model: ← → (and RTL-aware) + Home/End.
        const nav = document.querySelector('.tactical-navbar');
        nav?.addEventListener('keydown', (event) => {
            const current = document.activeElement;
            if (!current || !current.classList.contains('nav-tab')) return;
            const idx = tabs.indexOf(current);
            if (idx < 0) return;
            const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
            let next = null;
            if (event.key === 'ArrowRight') next = isRtl ? idx - 1 : idx + 1;
            else if (event.key === 'ArrowLeft') next = isRtl ? idx + 1 : idx - 1;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = tabs.length - 1;
            if (next === null) return;
            event.preventDefault();
            const clamped = (next + tabs.length) % tabs.length;
            this.activateTab(tabs[clamped].getAttribute('data-target'), { focus: true });
        });

        // Deep links: #map | #wire?tag=APT&q=hormuz | #cves | #actors | #dashboard
        // (full tab ids are also accepted; query params carry wire filter state).
        const fromHash = () => {
            const raw = (window.location.hash || '').replace(/^#/, '');
            if (!raw) return null;
            const slug = raw.split('?')[0];
            const query = raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : '';
            if (query) {
                const state = YaslogistThreatRadarApp.parseWireState(query);
                this.applyWireState(state);
            }
            const entry = Object.entries(YaslogistThreatRadarApp.TAB_SLUGS)
                .find(([id, slugValue]) => slugValue === slug || id === slug);
            return entry ? entry[0] : null;
        };
        const initial = fromHash() || storage.get('yaslogist.tab', 'dashboard');
        this.activateTab(initial, { pushHash: Boolean(fromHash()) });
        window.addEventListener('hashchange', () => {
            const target = fromHash();
            if (target) this.activateTab(target, { pushHash: true });
        });
    }

    /** Apply wire filter state coming from a shared link (tag + search). */
    applyWireState({ tag, q }) {
        this.activeWireTag = tag || 'ALL';
        this.wireSearchTerm = q || '';
        const tagBar = document.getElementById('wire-tags-filter');
        if (tagBar) {
            tagBar.querySelectorAll('.filter-pill').forEach(b => {
                b.classList.toggle('active', (b.getAttribute('data-tag') || 'ALL') === this.activeWireTag);
            });
        }
        const searchInput = document.getElementById('news-search');
        if (searchInput) searchInput.value = this.wireSearchTerm;
        storage.set('yaslogist.wireTag', this.activeWireTag);
    }

    /**
     * Global single-key hotkeys mirroring the command palette shortcuts.
     * Never fires while the operator is typing (inputs, textareas, selects,
     * contentEditable) or while a modifier is held.
     */
    bindGlobalHotkeys() {
        const HOTKEYS = {
            r: () => this.fetchWire(),
            e: () => this.exportSnapshot(),
            d: () => this.exportMarkdownBriefing(),
            c: () => this.copyDeepLink(),
            l: () => document.getElementById('langToggleBtn')?.click(),
            m: () => this.activateTab('threat-map-view', { focus: true }),
            f: () => this.toggleFullscreen(),
            b: () => { this.renderSmartBriefing(); this.showToast(this.currentLang === 'ar' ? 'تم تحديث الموجز الذكي' : 'Smart briefing recalculated'); }
        };
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            if (event.key === 'Escape' || event.key === 'Tab' || event.key.length !== 1) return;
            const target = event.target;
            const tag = target?.tagName?.toLowerCase?.() || '';
            if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) return;
            if (document.getElementById('command-palette')?.hidden === false) return;
            const action = HOTKEYS[event.key.toLowerCase()];
            if (action) { event.preventDefault(); action(); }
        });
    }

    bindInteractions() {
        // Intelligence Wire Tag Filters
        const tagContainer = document.getElementById('wire-tags-filter');
        if (tagContainer) {
            // Restore persisted filter selection.
            tagContainer.querySelectorAll('.filter-pill').forEach(b => {
                b.classList.toggle('active', (b.getAttribute('data-tag') || 'ALL') === this.activeWireTag);
            });
            tagContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-pill');
                if (!btn) return;

                tagContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.activeWireTag = btn.getAttribute('data-tag') || 'ALL';
                storage.set('yaslogist.wireTag', this.activeWireTag);
                this.renderIntelligenceWire();
                this.syncWireHash();
            });
        }

        // Watchlist star toggles (delegated — survives wire re-renders).
        const wireContainer = document.getElementById('news-container');
        wireContainer?.addEventListener('click', (e) => {
            const btn = e.target.closest?.('.wire-pin-btn');
            if (!btn) return;
            const id = btn.getAttribute('data-pin-id');
            const item = (this.allWireItems || []).find(i => YaslogistThreatRadarApp.wireItemId(i) === id);
            if (!item) return;
            const nowPinned = this.toggleWirePin(item);
            if (nowPinned) this.showToast(this.currentLang === 'ar' ? 'تم التثبيت في قائمة المراقبة' : 'Pinned to operator watchlist');
            this.updateWireCount();
            this.renderIntelligenceWire();
        });

        // Source contribution strip: clicking a chip filters the wire by source.
        const sourceStrip = document.getElementById('wire-source-strip');
        sourceStrip?.addEventListener('click', (e) => {
            const chip = e.target.closest?.('.source-chip');
            if (!chip) return;
            const source = chip.getAttribute('data-source-filter') || '';
            const input = document.getElementById('news-search');
            if (input) input.value = source;
            this.wireSearchTerm = source;
            this.renderIntelligenceWire();
            this.syncWireHash();
        });

        // Search Input on Wire
        const newsSearchInput = document.getElementById('news-search');
        if (newsSearchInput) {
            let searchTimer;
            newsSearchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => {
                    this.wireSearchTerm = e.target.value.trim();
                    this.renderIntelligenceWire();
                    this.syncWireHash();
                }, 120);
            });
        }

        // CVE search filter (id / vendor / advisory, EN + AR).
        const cveSearchInput = document.getElementById('cve-search');
        if (cveSearchInput) {
            let cveSearchTimer;
            cveSearchInput.addEventListener('input', (e) => {
                clearTimeout(cveSearchTimer);
                cveSearchTimer = setTimeout(() => {
                    this.cveSearchTerm = e.target.value.trim();
                    this.renderCVEs();
                }, 120);
            });
        }

        // CVE CSV export (respects the active severity + search filters).
        const cveExportBtn = document.getElementById('cve-export-btn');
        cveExportBtn?.addEventListener('click', () => this.exportCveCSV());

        // Threat Actor Search
        const actorSearchInput = document.getElementById('actor-search');
        if (actorSearchInput) {
            actorSearchInput.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase().trim();
                if (!q) {
                    this.renderThreatActors();
                } else {
                    const filtered = THREAT_ACTORS_DB.filter(a =>
                        a.name.toLowerCase().includes(q) ||
                        (a.originEn && a.originEn.toLowerCase().includes(q)) ||
                        (a.originAr && a.originAr.includes(q)) ||
                        (a.motivationEn && a.motivationEn.toLowerCase().includes(q)) ||
                        (a.motivationAr && a.motivationAr.includes(q)) ||
                        a.targetsEn.some(t => t.toLowerCase().includes(q)) ||
                        a.targetsAr.some(t => t.includes(q))
                    );
                    this.renderThreatActors(filtered);
                }
            });
        }

        // CVE Matrix controls: severity filter pills + sort toggle.
        const cveFilterBar = document.getElementById('cve-severity-filter');
        if (cveFilterBar) {
            cveFilterBar.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-pill');
                if (!btn) return;
                cveFilterBar.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.cveFilter = btn.getAttribute('data-severity') || 'ALL';
                this.renderCVEs();
            });
        }
        const cveSortBtn = document.getElementById('cve-sort-toggle');
        if (cveSortBtn) {
            cveSortBtn.addEventListener('click', () => {
                this.cveSort = this.cveSort === 'cvss' ? 'severity' : 'cvss';
                cveSortBtn.classList.toggle('sort-severity', this.cveSort === 'severity');
                cveSortBtn.setAttribute('aria-pressed', this.cveSort === 'severity' ? 'true' : 'false');
                this.renderCVEs();
            });
        }

        // Wire Refresh Button
        const refreshBtn = document.getElementById('refresh-news-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                if (refreshBtn.disabled) return;
                refreshBtn.disabled = true;
                refreshBtn.setAttribute('aria-busy', 'true');
                try { await this.fetchWire(); } finally {
                    refreshBtn.disabled = false;
                    refreshBtn.removeAttribute('aria-busy');
                }
            });
        }
    }

    /* ----------------------------------------------------- motion system */

    /**
     * Progressive reveal: IntersectionObserver-driven, transform/opacity only,
     * disabled entirely under prefers-reduced-motion (elements simply render).
     */
    initMotionSystem() {
        this.reducedMotion = prefersReducedMotion();
        if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
            const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
            mq.addEventListener?.('change', () => { this.reducedMotion = mq.matches; });
        }
        if (this.reducedMotion || typeof IntersectionObserver !== 'function') {
            this.revealObserver = null;
            document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
            return;
        }
        this.revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    this.revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        this.applyReveal(document);
    }

    applyReveal(scope) {
        const els = (scope || document).querySelectorAll
            ? (scope || document).querySelectorAll('.reveal:not(.revealed)')
            : [];
        els.forEach(el => {
            if (this.reducedMotion || !this.revealObserver) el.classList.add('revealed');
            else this.revealObserver.observe(el);
        });
    }

    /* ------------------------------------------------------------- charts */

    initCharts() {
        if (typeof Chart === 'undefined') return;

        const PLACEHOLDER = this.currentLang === 'ar' ? ['بانتظار القياس'] : ['AWAITING TELEMETRY'];

        // 1. Attack Vectors Doughnut — placeholder until the real wire resolves.
        const ctxVector = document.getElementById('attackVectorChart');
        if (ctxVector) {
            this.charts.vectors = new Chart(ctxVector, {
                type: 'doughnut',
                data: {
                    labels: PLACEHOLDER,
                    datasets: [{
                        data: [1],
                        backgroundColor: ['rgba(100, 116, 139, 0.35)'],
                        borderWidth: 2,
                        borderColor: '#0d1117',
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: '#94A3B8',
                                font: {
                                    family: "'JetBrains Mono', 'Cairo', sans-serif",
                                    size: 10
                                },
                                boxWidth: 10,
                                padding: 8
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(13, 17, 23, 0.95)',
                            borderColor: '#EAB308',
                            borderWidth: 1,
                            titleColor: '#F1F5F9',
                            bodyColor: '#EAB308'
                        }
                    },
                    cutout: '72%'
                }
            });
        }

        // 2. Targeted Infrastructure Sectors — zeroed real distribution until
        // the wire resolves; bars grow strictly from counted wire signals.
        const ctxIndustry = document.getElementById('industryChart');
        if (ctxIndustry) {
            this.charts.industry = new Chart(ctxIndustry, {
                type: 'bar',
                data: {
                    labels: SECTOR_BUCKETS.map(b => b.key),
                    datasets: [{
                        data: SECTOR_BUCKETS.map(() => 0),
                        backgroundColor: SECTOR_COLORS.map(c => `${c}B3`),
                        borderColor: SECTOR_COLORS,
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(13, 17, 23, 0.95)',
                            borderColor: '#06B6D4',
                            borderWidth: 1,
                            titleColor: '#F1F5F9',
                            bodyColor: '#06B6D4',
                            callbacks: {
                                label: (c) => ` ${c.parsed.y} wire signal${c.parsed.y === 1 ? '' : 's'}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0,
                                color: '#64748B',
                                font: { family: "'JetBrains Mono', monospace", size: 9 }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                color: '#94A3B8',
                                font: { family: "'Cairo', 'IBM Plex Sans Arabic', sans-serif", size: 9.5 }
                            }
                        }
                    }
                }
            });
        }
    }

    updateChartsLanguage() {
        if (!this.charts.vectors || !this.charts.industry) return;
        this.updateChartsFromData();
        this.updateRealTelemetry();
    }
}

// Offline shell registration is deliberately non-blocking: telemetry rendering
// never waits for the service worker, and unsupported/private browsers degrade
// to the existing network-only runtime.
const registerOfflineRuntime = async () => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
    try {
        return await navigator.serviceWorker.register('./sw.js', { scope: './' });
    } catch (error) {
        console.warn('YASLOGIST offline runtime unavailable:', error);
        return null;
    }
};

// Bootstrap (skipped under test harness)
if (typeof window !== 'undefined' && typeof document !== 'undefined' && !window.__YASLOGIST_NO_AUTOBOOT__) {
    document.addEventListener('DOMContentLoaded', () => {
        window.yaslogistRadar = new YaslogistThreatRadarApp();
        registerOfflineRuntime();
    });
}

export { YaslogistThreatRadarApp, I18N, escapeHTML, safeURL, registerOfflineRuntime, SECTOR_BUCKETS, TAG_COLORS, FALLBACK_WIRE_ITEMS, THREAT_ACTORS_DB };
