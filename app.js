/**
 * YASLOGIST CYBER & SUPPLY CHAIN THREAT RADAR
 * Master Application Controller & CTI Telemetry Hub
 * Sovereign Military-Grade Frontend Architecture
 * Zero-Build Vanilla JS with 100% Bilingual Arabic/English Coverage
 */

import { initAcidSquares } from './acid-squares-bg.js';
import { initThreatMap } from './threat-map.js?v=13';

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
        cockpitEngineMeta: 'AI ENGINE: NEURAL-CTI v4.8 // QUANTUM-ENCRYPTED',
        progGridName: 'INGEST FEED INTEGRITY',
        progInterceptName: 'WIRE FRESHNESS (24H)',
        progTransitName: 'MARITIME ALERT LOAD',
        progAiName: 'CVE EXPOSURE INDEX',
        mapTitle: 'GEOPOLITICAL & MARITIME THREAT RADAR',
        mapSubtitle: 'Tactical telemetry: Middle East & Global Maritime Trade Chokepoints',
        legendCritical: 'Critical',
        legendHigh: 'High',
        legendMed: 'Medium',
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
        thAdvisory: 'TACTICAL ADVISORY',
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
        sevLow: 'LOW'
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
        cockpitEngineMeta: 'محرك الذكاء الاصطناعي: NEURAL-CTI v4.8 // مشفر كمومياً',
        progGridName: 'سلامة مصادر التغذية',
        progInterceptName: 'حداثة البث (24 ساعة)',
        progTransitName: 'كثافة الإنذارات البحرية',
        progAiName: 'مؤشر التعرض للثغرات',
        mapTitle: 'رادار التهديدات الجيوسياسية والممرات الملاحية',
        mapSubtitle: 'قياس آني: الشرق الأوسط ومضائق التجارة الدولية الحيوية',
        legendCritical: 'حرج جداً',
        legendHigh: 'مرتفع',
        legendMed: 'متوسط',
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
        thAdvisory: 'التوجيه التكتيكي الفوري',
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
        sevLow: 'منخفضة'
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
        targetsAr: ["أنظمة الموانئ", "إمدادات الوقود", "التكنولوجيا الدفاعية"]
    },
    {
        name: "APT33 (Elfin)",
        originEn: "Iran (IRGC Aligned)",
        originAr: "إيران (تابعة للحرس الثوري IRGC)",
        motivationEn: "Aerospace, petrochemical facilities, and supply chain espionage",
        motivationAr: "تجسس استراتيجي على قطاعات الطيران، البتروكيماويات، وسلاسل الإمداد",
        targetsEn: ["Aerospace", "Energy", "Maritime Logistics"],
        targetsAr: ["صناعة الطيران", "قطاع الطاقة", "اللوجستيات البحرية"]
    },
    {
        name: "APT34 (OilRig)",
        originEn: "Iran",
        originAr: "إيران",
        motivationEn: "Long-term persistent cyber espionage across telecommunications and state ministries",
        motivationAr: "تجسس سيبراني متقدم ومستمر على قطاعات الاتصالات والوزارات الحكومية",
        targetsEn: ["Telecom", "Finance", "Government"],
        targetsAr: ["الاتصالات", "القطاع المالي", "الوزارات السيادية"]
    },
    {
        name: "Cyber Av3ngers",
        originEn: "Axis of Resistance",
        originAr: "محور المقاومة الإقليمي",
        motivationEn: "Targeting programmable logic controllers (PLCs) in municipal and water infrastructure",
        motivationAr: "استهداف وحدات التحكم المنطقي PLC في شبكات المياه والخدمات العامة",
        targetsEn: ["Water Utilities", "ICS/SCADA", "Pipelines"],
        targetsAr: ["محطات المياه", "أنظمة SCADA/ICS", "خطوط الأنابيب"]
    },
    {
        name: "Predatory Sparrow",
        originEn: "Israel Aligned",
        originAr: "مرتبطة بإسرائيل",
        motivationEn: "Precision destructive wiper attacks targeting industrial and financial networks",
        motivationAr: "هجمات مسح تخريبية دقيقة تستهدف مصانع الصلب والبنوك ومحطات الوقود",
        targetsEn: ["Steel Industry", "Fuel Distribution", "Banking"],
        targetsAr: ["صناعة الصلب", "توزيع الوقود", "القطاع المصرفي"]
    },
    {
        name: "MuddyWater",
        originEn: "Iran (MOIS)",
        originAr: "إيران (وزارة الاستخبارات)",
        motivationEn: "Espionage, credential harvesting, and destructive wipers across Middle East and Med",
        motivationAr: "سرقة الاعتمادات، التجسس الحكومي، ونشر برمجيات المسح التخريبي",
        targetsEn: ["Government", "Maritime Logistics", "Telecom"],
        targetsAr: ["المقرات الحكومية", "الشحن البحري", "الاتصالات"]
    },
    {
        name: "Fox Kitten (Parisite)",
        originEn: "Iran",
        originAr: "إيران",
        motivationEn: "Weaponizing edge VPN appliances and selling access to ransomware operators",
        motivationAr: "استغلال ثغرات بوابات VPN وبيع الوصول الأولي لمشغلي الفدية",
        targetsEn: ["Enterprise Gateways", "Defense Contractors"],
        targetsAr: ["بوابات الحافة المؤسسية", "متعاقدو الدفاع"]
    },
    {
        name: "Moses Staff",
        originEn: "Iran",
        originAr: "إيران",
        motivationEn: "Politically motivated hack-and-leak, disk wiper deployments, zero financial ransom",
        motivationAr: "اختراق وتسريب بهوافع سياسية، مسح الأقراص، بدون أي مطالب مالية",
        targetsEn: ["Infrastructure", "Defense Contractors", "Aviation"],
        targetsAr: ["البنية التحتية", "شركات الدفاع", "الملاحة الجوية"]
    },
    {
        name: "DarkStorm Team",
        originEn: "Pro-Palestine Collective",
        originAr: "تجمع نشطاء مؤيد لفلسطين",
        motivationEn: "Volumetric DDoS floods against maritime navigation portals, banks, and media",
        motivationAr: "هجمات حجب الخدمة الحجمية على بوابات الموانئ والمصارف والمؤسسات الإعلامية",
        targetsEn: ["Port Authorities", "Banks", "Gov Portals"],
        targetsAr: ["إدارات الموانئ", "البنوك", "البوابات الرسمية"]
    },
    {
        name: "NoName057(16)",
        originEn: "Russia Aligned",
        originAr: "موالية لروسيا",
        motivationEn: "DDoS swarm targeting Mediterranean shipping corridors, logistics, and allied portals",
        motivationAr: "هجمات حجب خدمة مكثفة على مسارات الشحن في المتوسط واللوجستيات",
        targetsEn: ["Maritime Shipping", "Logistics Hubs", "Telecom"],
        targetsAr: ["الشحن الملاحي", "المراكز اللوجستية", "شبكات الاتصال"]
    },
    {
        name: "Moroccan Black Cyber Army",
        originEn: "Regional Hacktivist",
        originAr: "تجمع نشطاء إقليمي",
        motivationEn: "Subsea cable telemetry, telecom-layer targeting, and state defacements",
        motivationAr: "استهداف قياسات الكابلات البحرية والاتصالات وتشويه المواقع الحكومية",
        targetsEn: ["Telecom Infrastructure", "Airports"],
        targetsAr: ["بنية الاتصالات", "المطارات والمنافذ"]
    },
    {
        name: "AnonGhost",
        originEn: "Hacktivist Cluster",
        originAr: "تكتل ناشطين عالمي",
        motivationEn: "Automated vulnerability scanning, ICS reconnaissance, and SCADA probes",
        motivationAr: "فحص آلي للثغرات، استطلاع لمنظومات التحكم الصناعي ICS والشبكات الذكية",
        targetsEn: ["Industrial Routers", "Utilities"],
        targetsAr: ["الموجهات الصناعية", "شبكات المرافق"]
    }
];

// Fallback CVE Data with Complete Arabic Support
const DEFAULT_CVES = [
    {
        id: "CVE-2024-3400",
        system: "Palo Alto PAN-OS",
        systemAr: "بالو ألتو PAN-OS (بوابات الحافة)",
        severity: "Critical",
        badge: "badge-critical",
        advisoryEn: "Patch PAN-OS GlobalProtect Gateway immediately.",
        advisoryAr: "تحديث عاجل وفوري لبوابات GlobalProtect وسد ثغرة الحقن."
    },
    {
        id: "CVE-2023-34362",
        system: "MOVEit Transfer",
        systemAr: "نظام نقل الملفات MOVEit Transfer",
        severity: "Critical",
        badge: "badge-critical",
        advisoryEn: "Apply vendor SQLi mitigations and isolate storage endpoints.",
        advisoryAr: "تطبيق معالجة ثغرة SQLi وعزل نقاط التخزين عن الإنترنت العام."
    },
    {
        id: "CVE-2024-21412",
        system: "Windows Defender SmartScreen",
        systemAr: "نظام الحماية Windows Defender",
        severity: "Critical",
        badge: "badge-critical",
        advisoryEn: "Enforce MSFT security patch to halt zero-day shortcut execution.",
        advisoryAr: "تطبيق حزمة تحديث مايكروسوفت لوقف تنفيذ ملفات الاختصار الخبيثة."
    },
    {
        id: "CVE-2023-46805",
        system: "Ivanti Connect Secure (ICS)",
        systemAr: "بوابات إيفانتي Ivanti Connect Secure",
        severity: "High",
        badge: "badge-high",
        advisoryEn: "Run external integrity verification tool; revoke all API tokens.",
        advisoryAr: "تشغيل أداة التحقق من النزاهة الخارجية وإلغاء كافة مفاتيح API."
    },
    {
        id: "CVE-2023-4966",
        system: "Citrix NetScaler ADC",
        systemAr: "موزع الأحمال Citrix NetScaler ADC",
        severity: "High",
        badge: "badge-high",
        advisoryEn: "Clear persistent session tokens and deploy firmware update.",
        advisoryAr: "تطهير كافة رموز الجلسات النشطة وتحديث البرنامج الثابت فوراً."
    }
];

// Fallback Intensity Data
const DEFAULT_INTENSITY = [
    { country: "Iran", attacks: "14", intensity: "Critical", trend: "up", class: "intensity-high" },
    { country: "Israel", attacks: "11", intensity: "High", trend: "up", class: "intensity-high" },
    { country: "Lebanon", attacks: "5", intensity: "High", trend: "up", class: "intensity-high" },
    { country: "Egypt", attacks: "3", intensity: "Medium", trend: "up", class: "intensity-med" },
    { country: "Syria", attacks: "1", intensity: "Low", trend: "down", class: "intensity-low" },
    { country: "Jordan", attacks: "1", intensity: "Low", trend: "down", class: "intensity-low" }
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
// 3. MASTER CONTROLLER CLASS
// ===================================================================
class YaslogistThreatRadarApp {
    constructor() {
        this.currentLang = 'en';
        this.threatMap = null;
        this.acidSquares = null;
        this.intensityData = [];
        this.cveData = [];
        this.allWireItems = [];
        this.activeWireTag = 'ALL';
        this.wireSearchTerm = '';
        this.charts = {
            vectors: null,
            industry: null
        };

        this.init();
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

        await safe('shader',       () => this.initShader());
        await safe('tactical-map', () => this.initMap());
        await safe('clocks',       () => this.startDualClocks());
        await safe('i18n',         () => this.initLanguageSwitcher());
        await safe('charts',       () => this.initCharts());
        await safe('tabs',         () => this.bindTabs());
        await safe('interactions', () => this.bindInteractions());
        await safe('cti-data',     () => this.loadData());
        await safe('intel-wire',   () => this.fetchWire());
        await safe('dossiers',     () => this.renderThreatActors());
        await safe('telemetry',    () => this.startLiveProgressTelemetry());

        console.log('[YASLOGIST] Sovereign Threat Radar online.');
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
            this.charts.vectors.update();
        }

        if (this.charts.industry) {
            const dist = this.wireSourceDistribution();
            this.charts.industry.data.labels = dist.map(([k]) => k);
            this.charts.industry.data.datasets[0].data = dist.map(([, v]) => v);
            this.charts.industry.update();
        }
    }

    initLanguageSwitcher() {
        const toggleBtn = document.getElementById('langToggleBtn');
        const langText = document.getElementById('langBtnText');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
                const isAr = this.currentLang === 'ar';

                document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
                document.documentElement.setAttribute('lang', this.currentLang);

                if (langText) {
                    langText.textContent = isAr ? 'ENGLISH' : 'العربية';
                }

                this.applyTranslations();

                if (this.threatMap) {
                    this.threatMap.setLanguage(this.currentLang);
                }

                this.renderCVEs();
                this.renderThreatActors();
                this.renderIntelligenceWire();
                this.updateChartsLanguage();
                this.updateKPIs();
            });
        }
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
                
                // Need to convert to array before iterating since we might modify childNodes
                Array.from(node.childNodes).forEach(walkDOM);
            }
        };
        walkDOM(document.body);

        // Update browser document title
        if (isAr) {
            document.title = "أنظمة دفاع ياسلوجست // رادار الاستخبارات السيادية وسلاسل الإمداد";
        } else {
            document.title = "YASLOGIST DEFENSE SYSTEMS // SOVEREIGN CTI & LOGISTICS RADAR";
        }

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
        const refreshBtn = document.getElementById('refresh-news-btn');
        if (refreshBtn) {
            refreshBtn.setAttribute('title', dict.refreshFeedsTitle || (isAr ? 'تحديث البث الحي' : 'Refresh Live Feeds'));
        }

        // Update dynamic report count in wire subtitle if items exist
        const countEl = document.getElementById('wire-report-count');
        if (countEl && this.allWireItems && this.allWireItems.length > 0) {
            countEl.textContent = isAr 
                ? `${this.allWireItems.length} تقارير معترضة // تدفق حي متواصل`
                : `${this.allWireItems.length} intercepted reports // Active streams`;
        }
    }
    async loadData() {
        // Load target intensity data
        try {
            const res = await fetch('./data/target_intensity.json');
            if (res.ok) {
                this.intensityData = await res.json();
            } else {
                this.intensityData = DEFAULT_INTENSITY;
            }
        } catch (e) {
            this.intensityData = DEFAULT_INTENSITY;
        }

        // Load CVE data
        try {
            const res = await fetch('./data/middle_east_cves.json');
            if (res.ok) {
                this.cveData = await res.json();
            } else {
                this.cveData = DEFAULT_CVES;
            }
        } catch (e) {
            this.cveData = DEFAULT_CVES;
        }

        // Update Map with Intensity
        if (this.threatMap) {
            this.threatMap.updateData(this.intensityData, this.currentLang);
        }

        // Render CVE Table
        this.renderCVEs();

        // Update KPIs & DEFCON
        this.updateKPIs();
    }

    updateKPIs() {
        const set = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        // Regional signal volume: sum of country-linked reports over the 7d window.
        const signalVolume = (this.intensityData || [])
            .reduce((sum, item) => sum + (parseInt(item.attacks || '0', 10) || 0), 0);
        set('kpi-attacks-count', signalVolume);

        // APT / state-linked reports currently on the wire.
        set('kpi-campaigns-count', this.countWireTag('APT'));

        // Weaponized CVEs actually tracked.
        set('kpi-cves-count', (this.cveData || []).length);

        // Maritime chokepoint alerts currently on the wire.
        set('kpi-logistics-count', this.countWireTag('MARITIME'));

        // DEFCON from the real severity mix of tracked CVEs.
        const sev = (this.cveData || []).map(c => (c.severity || '').toLowerCase());
        const criticalCount = sev.filter(x => x === 'critical').length;
        const highCount = sev.filter(x => x === 'high').length;
        let defcon = 4;
        if (criticalCount >= 3) defcon = 2;
        else if (criticalCount >= 1 || highCount >= 5) defcon = 3;
        this.setDefconLevel(defcon);
    }

    setDefconLevel(level = 2) {
        document.querySelectorAll('.defcon-tier').forEach(tier => {
            const tierLevel = parseInt(tier.getAttribute('data-level'), 10);
            if (tierLevel === level) {
                tier.classList.add('active');
            } else {
                tier.classList.remove('active');
            }
        });

        const readoutEl = document.getElementById('defcon-readout-text');
        if (readoutEl) {
            const isAr = this.currentLang === 'ar';
            if (level === 1) {
                readoutEl.innerHTML = isAr 
                    ? '<span class="mono">DEFCON 1</span> // تصعيد عسكري وسيبراني وشيك'
                    : '<span class="mono">DEFCON 1</span> // IMMINENT KINETIC / CYBER ESCALATION';
                readoutEl.style.color = 'var(--yas-crimson)';
            } else if (level === 2) {
                readoutEl.innerHTML = isAr
                    ? '<span class="mono">DEFCON 2</span> // استهداف إقليمي حرج لمنشآت الطاقة والنقل'
                    : '<span class="mono">DEFCON 2</span> // SEVERE REGIONAL TARGETING';
                readoutEl.style.color = '#F97316';
            } else {
                readoutEl.innerHTML = isAr
                    ? '<span class="mono">DEFCON 3</span> // جاهزية أمنية واستخباراتية مرتفعة'
                    : '<span class="mono">DEFCON 3</span> // ELEVATED MILITARY READINESS';
                readoutEl.style.color = 'var(--yas-gold)';
            }
        }
    }

    renderCVEs() {
        const tbody = document.querySelector('#cve-table tbody');
        if (!tbody) return;

        const isAr = this.currentLang === 'ar';
        const dict = I18N[this.currentLang];

        tbody.innerHTML = this.cveData.map(cve => {
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

            return `
                <tr>
                    <td class="cve-id-cell mono">
                        <a href="https://nvd.nist.gov/vuln/detail/${cve.id}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">
                            <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px; opacity: 0.6; margin-inline-end: 4px;"></i>${cve.id}
                        </a>
                    </td>
                    <td><strong style="color: #FFFFFF;">${sysName}</strong></td>
                    <td><span class="cve-badge ${badgeClass}">${sevText}</span></td>
                    <td style="font-size: 11.5px; color: var(--text-secondary);">${advisory}</td>
                </tr>
            `;
        }).join('');
    }

    renderThreatActors(filteredList = null) {
        const container = document.getElementById('actors-grid');
        if (!container) return;

        const isAr = this.currentLang === 'ar';
        const actors = filteredList || THREAT_ACTORS_DB;

        container.innerHTML = actors.map(actor => {
            const origin = isAr ? actor.originAr : actor.originEn;
            const motivation = isAr ? actor.motivationAr : actor.motivationEn;
            const targets = isAr ? actor.targetsAr : actor.targetsEn;

            return `
                <div class="actor-dossier-card">
                    <div class="actor-head-row">
                        <span class="actor-title">${actor.name}</span>
                        <span class="actor-origin-badge">${origin}</span>
                    </div>
                    <p class="actor-motivation">${motivation}</p>
                    <div class="actor-target-tags">
                        ${targets.map(t => `<span class="actor-target-pill">${t}</span>`).join('')}
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
        const seen = new Set();
        const out = [];
        items.forEach(item => {
            const key = (item.titleEn || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80);
            if (!key || seen.has(key)) return;
            seen.add(key);
            out.push(item);
        });
        out.sort((a, b) => b.pubDate - a.pubDate);
        return out.slice(0, 60);
    }

    updateWireCount() {
        const countEl = document.getElementById('wire-report-count');
        if (!countEl) return;
        const isAr = this.currentLang === 'ar';
        const n = (this.allWireItems || []).length;
        countEl.textContent = isAr
            ? `${n} تقارير معترضة // تدفق حي متواصل`
            : `${n} intercepted reports // Active streams`;
    }

    async fetchSingleFeed(feed, timeoutMs = 9000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
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

    async fetchWire() {
        const container = document.getElementById('news-container');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <i class="fa-solid fa-satellite-dish fa-spin"></i>
                    <span>${I18N[this.currentLang].loadingWire}</span>
                </div>
            `;
        }

        // ---- STAGE 1 : committed wire, regenerated every 2h by the GitHub Action.
        // Always available, never rate-limited. Painted immediately.
        let baseItems = [];
        try {
            const res = await fetch(`./data/intel_wire.json?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) baseItems = this.normalizeWireItems(await res.json());
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

        this.updateWireCount();
        this.renderIntelligenceWire();
        this.updateKPIs();
        this.updateRealTelemetry();
        this.updateChartsFromData();
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

    renderIntelligenceWire() {
        const container = document.getElementById('news-container');
        if (!container) return;

        const isAr = this.currentLang === 'ar';
        let filtered = this.allWireItems;

        // Apply Tag Filter
        if (this.activeWireTag !== 'ALL') {
            filtered = filtered.filter(item => 
                item.tags.some(t => t.textEn.toUpperCase() === this.activeWireTag.toUpperCase())
            );
        }

        // Apply Search Filter
        if (this.wireSearchTerm) {
            const term = this.wireSearchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                (item.titleEn && item.titleEn.toLowerCase().includes(term)) ||
                (item.summaryEn && item.summaryEn.toLowerCase().includes(term)) ||
                (item.source && item.source.toLowerCase().includes(term))
            );
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted); font-size: 12px;">
                    <i class="fa-solid fa-filter-circle-xmark" style="font-size: 24px; margin-bottom: 8px; color: var(--yas-gold);"></i>
                    <p>${isAr ? 'لا توجد تقارير استخباراتية تطابق التصفية الحالية.' : 'No intelligence reports match the current tactical filter.'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(item => {
            const timeAgo = this.formatTimeAgo(item.pubDate);
            const title = isAr ? (item.titleAr || item.titleEn) : item.titleEn;
            const summary = isAr ? (item.summaryAr || item.summaryEn) : item.summaryEn;

            return `
                <div class="wire-item">
                    <div class="wire-item-header">
                        <span class="wire-source">${item.source}</span>
                        <span class="wire-timestamp mono">${timeAgo}</span>
                    </div>
                    <h3 class="wire-title">
                        <a href="${item.link}" target="_blank" rel="noopener noreferrer">${title}</a>
                    </h3>
                    <p class="wire-summary">${summary}</p>
                    <div class="wire-tags">
                        ${item.tags.map(tag => `
                            <span class="wire-tag ${tag.class}">${isAr ? tag.textAr : tag.textEn}</span>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    formatTimeAgo(timestamp) {
        const isAr = this.currentLang === 'ar';
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

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

    
    bindTabs() {
        const tabs = document.querySelectorAll('.nav-tab');
        const panes = document.querySelectorAll('.tab-panel');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                const targetId = tab.getAttribute('data-target');
                const targetPane = document.getElementById(targetId);
                if (targetPane) {
                    targetPane.classList.add('active');
                    if (targetId === 'threat-map-view' && this.threatMap && this.threatMap.map) {
                        setTimeout(() => {
                            this.threatMap.map.invalidateSize();
                        }, 100);
                        setTimeout(() => {
                            this.threatMap.map.invalidateSize();
                        }, 350);
                    }
                }
            });
        });
    }

    bindInteractions() {
        // Intelligence Wire Tag Filters
        const tagContainer = document.getElementById('wire-tags-filter');
        if (tagContainer) {
            tagContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-pill');
                if (!btn) return;

                tagContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.activeWireTag = btn.getAttribute('data-tag') || 'ALL';
                this.renderIntelligenceWire();
            });
        }

        // Search Input on Wire
        const newsSearchInput = document.getElementById('news-search');
        if (newsSearchInput) {
            newsSearchInput.addEventListener('input', (e) => {
                this.wireSearchTerm = e.target.value.trim();
                this.renderIntelligenceWire();
            });
        }

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

        // Wire Refresh Button
        const refreshBtn = document.getElementById('refresh-news-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.fetchWire();
            });
        }
    }

    initCharts() {
        if (typeof Chart === 'undefined') return;

        // 1. Attack Vectors Doughnut
        const ctxVector = document.getElementById('attackVectorChart');
        if (ctxVector) {
            this.charts.vectors = new Chart(ctxVector, {
                type: 'doughnut',
                data: {
                    labels: ['DDoS Floods', 'Phishing & Creds', 'Ransomware', 'Zero-Day Exploit', 'OT/SCADA Wipers'],
                    datasets: [{
                        data: [38, 24, 18, 12, 8],
                        backgroundColor: [
                            '#EF4444',
                            '#06B6D4',
                            '#EAB308',
                            '#A855F7',
                            '#D97706'
                        ],
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

        // 2. Targeted Infrastructure Sectors
        const ctxIndustry = document.getElementById('industryChart');
        if (ctxIndustry) {
            this.charts.industry = new Chart(ctxIndustry, {
                type: 'bar',
                data: {
                    labels: ['Ports & Maritime', 'Energy & Petro', 'Defense Tech', 'Gov / Diplomatic', 'Subsea Telecom', 'Banking'],
                    datasets: [{
                        data: [88, 74, 69, 52, 45, 34],
                        backgroundColor: 'rgba(234, 179, 8, 0.7)',
                        borderColor: '#EAB308',
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
                            bodyColor: '#06B6D4'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: {
                                color: '#64748B',
                                font: { family: "'JetBrains Mono', monospace", size: 9 }
                            }
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
        const isAr = this.currentLang === 'ar';

        this.updateChartsFromData();
        this.updateRealTelemetry();
    }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    window.yaslogistRadar = new YaslogistThreatRadarApp();
});
