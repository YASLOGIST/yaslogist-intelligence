/**
 * YASLOGIST Threat Radar — Interactive Geopolitical & Maritime Threat Heatmap
 * Engine: Leaflet.js with CartoDB Dark Matter tiles (No API Key Required)
 * Dynamic CTI Intensity-Scaled Radar Pulsars bound to data/target_intensity.json
 */

const STRATEGIC_GEO_NODES = {
    'Egypt': {
        countryKey: 'egypt',
        nameEn: 'Egypt (Suez Canal / Cairo Corridor)',
        nameAr: 'مصر (ممر قناة السويس والقاهرة)',
        coords: [29.9668, 32.5498],
        type: 'maritime_corridor',
        supplyChainImpactEn: 'Suez Canal Maritime Artery // Critical Trade Link Europe-Asia',
        supplyChainImpactAr: 'شريان قناة السويس الملاحي // ممر تجارة حيوي يربط آسيا بأوروبا',
        vectorsEn: ['Port SCADA Targeting', 'Edge Appliance Exploits', 'DDoS on Customs'],
        vectorsAr: ['استهداف أنظمة الموانئ SCADA', 'ثغرات أجهزة وبوابات الحافة', 'هجمات حجب الخدمة على الجمارك'],
        status: 'OPERATIONAL_WATCH'
    },
    'Iran': {
        countryKey: 'iran',
        nameEn: 'Iran (Tehran Command & Persian Gulf)',
        nameAr: 'إيران (قيادة طهران والخليج العربي)',
        coords: [35.6892, 51.3890],
        type: 'state_nexus',
        supplyChainImpactEn: 'Strait of Hormuz Petro-Transit & Regional Telemetry',
        supplyChainImpactAr: 'ممر مضيق هرمز لنقل النفط والغاز والاتصالات الإقليمية',
        vectorsEn: ['State-Sponsored APTs', 'Industrial Wiper Payloads', 'ICS/OT Exploits'],
        vectorsAr: ['مجموعات APT برعاية رسمية', 'برمجيات مسح البيانات الصناعية', 'استهداف أنظمة SCADA/OT'],
        status: 'HIGH_ALERT'
    },
    'Israel': {
        countryKey: 'israel',
        nameEn: 'Israel (Tel Aviv & Coastal Terminals)',
        nameAr: 'إسرائيل (تل أبيب ومحطات الساحل)',
        coords: [32.0853, 34.7818],
        type: 'conflict_hub',
        supplyChainImpactEn: 'Haifa & Ashdod Port Terminals // Critical Tech & Energy Infra',
        supplyChainImpactAr: 'موانئ حيفا وأسدود // بنية التكنولوجيا والطاقة الحيوية',
        vectorsEn: ['Hacktivism Defacements', 'Ransomware Operations', 'Cloud Reconnaissance'],
        vectorsAr: ['تشويه المواقع من الناشطين', 'عمليات برمجيات الفدية', 'استطلاع سحابي موسع'],
        status: 'CRITICAL_CONTEST'
    },
    'Lebanon': {
        countryKey: 'lebanon',
        nameEn: 'Lebanon (Beirut Seaport & Eastern Med)',
        nameAr: 'لبنان (مرفأ بيروت وشرق المتوسط)',
        coords: [33.8938, 35.5018],
        type: 'regional_node',
        supplyChainImpactEn: 'Beirut Seaport Logistics & Subsea Communications Landing',
        supplyChainImpactAr: 'لوجستيات مرفأ بيروت ومحطات الإنزال للكابلات البحرية',
        vectorsEn: ['Telecom Surveillance', 'Volumetric DDoS', 'C2 Infrastructure'],
        vectorsAr: ['مراقبة قطاع الاتصالات', 'هجمات حجب الخدمة الحجمية', 'خوادم تحكم C2'],
        status: 'ELEVATED_VOLATILITY'
    },
    'Syria': {
        countryKey: 'syria',
        nameEn: 'Syria (Damascus & Coastal Terminals)',
        nameAr: 'سوريا (دمشق وموانئ الساحل)',
        coords: [33.5138, 36.2765],
        type: 'regional_node',
        supplyChainImpactEn: 'Levant Overland Freight Corridors & Coastal Energy Hubs',
        supplyChainImpactAr: 'مسارات الشحن البري في المشرق ومراكز الطاقة الساحلية',
        vectorsEn: ['Government Portal Probing', 'Counter-Hacktivism', 'Dark Web Intelligence'],
        vectorsAr: ['فحص شبكات حكومية', 'حملات قرصنة مضادة', 'استخبارات الويب المظلم'],
        status: 'MONITORED'
    },
    'Jordan': {
        countryKey: 'jordan',
        nameEn: 'Jordan (Amman & Gulf-Levant Land Bridge)',
        nameAr: 'الأردن (عمان وممر الجسر البري)',
        coords: [31.9454, 35.9284],
        type: 'transit_chokepoint',
        supplyChainImpactEn: 'Port of Aqaba Terminal & Gulf-Levant Land Logistics',
        supplyChainImpactAr: 'محطة ميناء العقبة والخدمات اللوجستية البرية بين الخليج والشام',
        vectorsEn: ['Credential Stuffing', 'Banking Phishing', 'Gov Portal Probing'],
        vectorsAr: ['هجمات حشو الاعتمادات', 'تصيد احتيالي مصرفي', 'فحص بوابات الخدمات الحكومية'],
        status: 'STABLE_GUARD'
    },
    'Red Sea': {
        countryKey: 'redsea',
        nameEn: 'Bab el-Mandeb (Southern Red Sea Chokepoint)',
        nameAr: 'مضيق باب المندب (جنوب البحر الأحمر)',
        coords: [12.5833, 43.3333],
        type: 'maritime_chokepoint',
        supplyChainImpactEn: 'Strategic Maritime Chokepoint // 12% Global Trade Under Direct Interdiction',
        supplyChainImpactAr: 'مضيق ملاحي استراتيجي // 12% من التجارة العالمية تحت خطر الاعتراض',
        vectorsEn: ['AIS Telemetry Spoofing', 'Kinetic-Cyber Hybrid Attacks', 'Vessel GPS Jamming'],
        vectorsAr: ['تزييف إشارات AIS الملاحية', 'عمليات هجينة سيبرانية-عسكرية', 'تشويش إحداثيات GPS للسفن'],
        status: 'CRITICAL_RISK'
    },
    'Strait of Hormuz': {
        countryKey: 'hormuz',
        nameEn: 'Strait of Hormuz (Gulf Arterial Passage)',
        nameAr: 'مضيق هرمز (الشريان النفطي العالمي)',
        coords: [26.5667, 56.2500],
        type: 'maritime_chokepoint',
        supplyChainImpactEn: 'Global Crude & LNG Superhighway // 21 Million Barrels/Day Throughput',
        supplyChainImpactAr: 'شريان النفط والغاز المسال // عبور 21 مليون برميل نفط يومياً',
        vectorsEn: ['GPS Desynchronization', 'Satellite Comms Interception', 'Tanker AIS Tracking'],
        vectorsAr: ['تشويش توقيت GPS', 'اعتراض اتصالات الأقمار الصناعية', 'تتبع ناقلات النفط'],
        status: 'HIGH_ALERT'
    }
};

export class ThreatMap {
    constructor(containerId = 'threat-map', options = {}) {
        this.containerId = containerId;
        this.options = Object.assign({
            center: [28.5, 40.0],
            zoom: 4,
            minZoom: 2,
            maxZoom: 18
        }, options);

        this.map = null;
        this.markersLayer = null;
        this.corridorsLayer = null;
        this.radarRangesLayer = null;
        this.subseaCablesLayer = null;
        this.aisVesselsLayer = null;
        this.currentData = [];
        this.currentLang = 'en';

        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.warn(`[YASLOGIST] ThreatMap container #${this.containerId} not found.`);
            return;
        }

        if (typeof L === 'undefined') {
            console.error('[YASLOGIST] Leaflet library is not loaded on window.');
            return;
        }

        // Initialize Leaflet Map with full tactile interactive control & extended zoom
        this.map = L.map(this.containerId, {
            center: this.options.center,
            zoom: this.options.zoom,
            minZoom: this.options.minZoom,
            maxZoom: this.options.maxZoom,
            zoomControl: true,
            attributionControl: false,
            dragging: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true
        });

        // 1. Sovereign Dark Gray Canvas (No API Key Required, Clean & Sharp)
        const darkCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 16,
            attribution: 'Esri Dark Gray'
        });
        
        // 2. High-Resolution Satellite Recon (No API Key Required)
        const satelliteIntel = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Esri Satellite'
        });

        // 3. Maritime Ocean & Bathymetry (Strategic Naval & Chokepoint Depths)
        const oceanMaritime = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 16,
            attribution: 'Esri Ocean Maritime'
        });

        // 4. Topographic Terrain Recon (Strategic Elevation & Border Corridors)
        const topoRecon = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 18,
            attribution: 'Esri Topo Recon'
        });

        // Default to Dark Canvas
        darkCanvas.addTo(this.map);

        this.corridorsLayer = L.layerGroup().addTo(this.map);
        this.markersLayer = L.layerGroup().addTo(this.map);
        this.radarRangesLayer = L.layerGroup().addTo(this.map);
        this.subseaCablesLayer = L.layerGroup().addTo(this.map);
        this.aisVesselsLayer = L.layerGroup().addTo(this.map);

        const baseMaps = {
            "Tactical Dark": darkCanvas,
            "Satellite Intel": satelliteIntel,
            "Maritime Ocean": oceanMaritime,
            "Topographic Recon": topoRecon
        };

        const overlayMaps = {
            "Sovereign Nav Paths": this.corridorsLayer,
            "Threat Markers": this.markersLayer,
            "Radar Range Rings": this.radarRangesLayer,
            "Subsea Cyber Cables": this.subseaCablesLayer,
            "Live AIS Vessels & Escorts": this.aisVesselsLayer
        };

        // Always show the expanded tactical layer control in the top-right
        L.control.layers(baseMaps, overlayMaps, { 
            position: 'topright',
            collapsed: false 
        }).addTo(this.map);

        // Render strategic maritime supply chain routes
        this.renderMaritimeCorridors();

        // Render tactical operational coverage circles
        this.renderRadarRangeRings();

        // Render smart super intelligence: subsea telecommunications & fiber hubs
        this.renderSubseaCables();

        // Render smart super intelligence: live simulated AIS vessel tracking & escort combatants
        this.renderAisVessels();

        // Invalidate size to guarantee perfect tile rendering
        setTimeout(() => {
            if (this.map) this.map.invalidateSize();
        }, 150);

        console.log('[YASLOGIST] Leaflet Tactical Threat Map initialized with Super Intelligence layers.');
    }

    renderRadarRangeRings() {
        if (!this.radarRangesLayer) return;
        this.radarRangesLayer.clearLayers();
        const isAr = this.currentLang === 'ar';

        const zones = [
            { nameEn: 'SUEZ CANAL OP-ZONE', nameAr: 'نطاق عمليات قناة السويس', coords: [29.9668, 32.5498], radius: 180000, color: '#06B6D4' },
            { nameEn: 'BAB EL-MANDEB INTERDICTION ZONE', nameAr: 'نطاق اعتراض باب المندب', coords: [12.5855, 43.3328], radius: 240000, color: '#EF4444' },
            { nameEn: 'STRAIT OF HORMUZ ESCORT ZONE', nameAr: 'منطقة المرافقة الأمنية بمضيق هرمز', coords: [26.5667, 56.2500], radius: 220000, color: '#EAB308' },
            { nameEn: 'EAST MED MARITIME ZONE', nameAr: 'نطاق عمليات شرق المتوسط', coords: [32.8191, 34.9983], radius: 160000, color: '#A855F7' }
        ];

        zones.forEach(z => {
            const zName = isAr ? z.nameAr : z.nameEn;
            const rangeText = isAr ? `مدى التغطية الرادارية: ${z.radius / 1000} كم` : `RADAR RANGE: ${z.radius / 1000} KM`;
            // Outer range ring
            L.circle(z.coords, {
                radius: z.radius,
                color: z.color,
                weight: 1.5,
                dashArray: '6, 8',
                fillColor: z.color,
                fillOpacity: 0.04
            }).bindTooltip(`<strong>${zName}</strong><br><span style="font-size:10px">${rangeText}</span>`, { className: 'yaslogist-tactical-tooltip' }).addTo(this.radarRangesLayer);

            // Inner core ring
            L.circle(z.coords, {
                radius: z.radius * 0.45,
                color: z.color,
                weight: 1,
                dashArray: '3, 4',
                fillColor: z.color,
                fillOpacity: 0.08
            }).addTo(this.radarRangesLayer);
        });
    }

    renderSubseaCables() {
        if (!this.subseaCablesLayer) return;
        this.subseaCablesLayer.clearLayers();
        const isAr = this.currentLang === 'ar';

        // 1. AAE-1 Cable Route (Asia-Africa-Europe 1)
        const aae1Coords = [
            [12.1, 52.0], [12.4, 48.0], [12.6, 44.5], [13.2, 43.1],
            [17.5, 40.5], [22.2, 38.0], [27.9, 34.5], [29.9, 32.5],
            [31.2, 32.3], [31.5, 30.1], [33.5, 27.5], [35.0, 22.0]
        ];
        const aae1Popup = isAr ? `
            <div class="tac-map-popup rtl">
                <div class="popup-header-row"><span class="badge-intel text-cyan">العمود الفقري للألياف الضوئية البحرية</span></div>
                <div class="popup-title">كابل آسيا-أفريقيا-أوروبا 1 (AAE-1)</div>
                <div class="popup-data-grid">
                    <div><span>الطول الإجمالي:</span> <strong>25,000 كم</strong></div>
                    <div><span>سعة التصميم:</span> <strong class="text-cyan">40 تيرابت/ثانية</strong></div>
                    <div><span>الحالة التشغيلية:</span> <strong style="color:#10B981">يعمل بكامل الكفاءة (100%)</strong></div>
                    <div><span>مستوى التهديد:</span> <strong class="text-gold">متوسط (مراقبة منطقة الانتظار)</strong></div>
                </div>
            </div>
        ` : `
            <div class="tac-map-popup ltr">
                <div class="popup-header-row"><span class="badge-intel text-cyan">SUBSEA FIBER BACKBONE</span></div>
                <div class="popup-title">AAE-1 (Asia-Africa-Europe 1)</div>
                <div class="popup-data-grid">
                    <div><span>LENGTH:</span> <strong>25,000 KM</strong></div>
                    <div><span>DESIGN CAPACITY:</span> <strong class="text-cyan">40 Tbps</strong></div>
                    <div><span>STATUS:</span> <strong style="color:#10B981">OPERATIONAL (100%)</strong></div>
                    <div><span>THREAT LEVEL:</span> <strong class="text-gold">MEDIUM (Anchorage Watch)</strong></div>
                </div>
            </div>
        `;
        L.polyline(aae1Coords, {
            color: '#06B6D4',
            weight: 3.5,
            opacity: 0.85,
            dashArray: '8, 4'
        }).bindPopup(aae1Popup, { className: 'yaslogist-dark-popup' }).addTo(this.subseaCablesLayer);

        // 2. SEA-ME-WE 5 Cable Route
        const smw5Coords = [
            [11.5, 51.0], [12.0, 46.5], [12.8, 43.3], [19.5, 39.5],
            [24.5, 36.8], [28.5, 33.8], [29.8, 32.4], [31.3, 30.0],
            [33.8, 25.5], [35.5, 18.0]
        ];
        const smw5Popup = isAr ? `
            <div class="tac-map-popup rtl">
                <div class="popup-header-row"><span class="badge-intel text-gold">شريان الربط العابر للقارات</span></div>
                <div class="popup-title">منظومة كابلات الربط القاري الخامسة (SEA-ME-WE 5)</div>
                <div class="popup-data-grid">
                    <div><span>الطول الإجمالي:</span> <strong>20,000 كم</strong></div>
                    <div><span>سعة التصميم:</span> <strong class="text-cyan">24 تيرابت/ثانية</strong></div>
                    <div><span>زمن الاستجابة:</span> <strong>أقل من 85 مللي ثانية (أوروبا-آسيا)</strong></div>
                    <div><span>مستوى المخاطر:</span> <strong class="text-crimson">مرتفع (حساسية الممرات الضيقة)</strong></div>
                </div>
            </div>
        ` : `
            <div class="tac-map-popup ltr">
                <div class="popup-header-row"><span class="badge-intel text-gold">INTERCONTINENTAL LINK</span></div>
                <div class="popup-title">SEA-ME-WE 5 (Southeast Asia - Med - Europe)</div>
                <div class="popup-data-grid">
                    <div><span>LENGTH:</span> <strong>20,000 KM</strong></div>
                    <div><span>CAPACITY:</span> <strong class="text-cyan">24 Tbps</strong></div>
                    <div><span>LATENCY:</span> <strong>Sub-85ms Europe-Asia</strong></div>
                    <div><span>RISK:</span> <strong class="text-crimson">ELEVATED (Chokepoint Vulnerability)</strong></div>
                </div>
            </div>
        `;
        L.polyline(smw5Coords, {
            color: '#A855F7',
            weight: 3.5,
            opacity: 0.85,
            dashArray: '10, 5'
        }).bindPopup(smw5Popup, { className: 'yaslogist-dark-popup' }).addTo(this.subseaCablesLayer);

        // 3. FALCON Gulf Loop
        const falconCoords = [
            [29.9, 32.5], [26.0, 36.0], [21.5, 39.0], [15.5, 41.5],
            [12.6, 43.5], [13.0, 48.0], [16.5, 54.0], [23.6, 58.5],
            [25.3, 56.4], [26.5, 56.3], [27.0, 52.0], [29.4, 48.0]
        ];
        const falconPopup = isAr ? `
            <div class="tac-map-popup rtl">
                <div class="popup-header-row"><span class="badge-intel text-gold">حلقة الربط الخليجي الإقليمية</span></div>
                <div class="popup-title">شبكة فالكون لربط الخليج العربي والبحر الأحمر (FALCON)</div>
                <div class="popup-data-grid">
                    <div><span>الهيكل البنائي:</span> <strong>حلقة مزدوجة ذاتية التعافي</strong></div>
                    <div><span>نقاط الإنزال:</span> <strong>14 محطة إنزال سيادية</strong></div>
                    <div><span>طبيعة البيانات:</span> <strong>حركة المعاملات المصرفية وبيانات سكادا</strong></div>
                </div>
            </div>
        ` : `
            <div class="tac-map-popup ltr">
                <div class="popup-header-row"><span class="badge-intel text-gold">REGIONAL GULF LOOP</span></div>
                <div class="popup-title">GCX FALCON (Gulf Interconnect System)</div>
                <div class="popup-data-grid">
                    <div><span>TOPOLOGY:</span> <strong>Self-Healing Dual Ring</strong></div>
                    <div><span>LANDINGS:</span> <strong>14 Sovereign Stations</strong></div>
                    <div><span>TRAFFIC:</span> <strong>Regional Banking & SCADA Telemetry</strong></div>
                </div>
            </div>
        `;
        L.polyline(falconCoords, {
            color: '#EAB308',
            weight: 2.5,
            opacity: 0.8,
            dashArray: '4, 4'
        }).bindPopup(falconPopup, { className: 'yaslogist-dark-popup' }).addTo(this.subseaCablesLayer);

        // Strategic Cable Landing Hubs
        const landingHubs = [
            { nameEn: 'Alexandria Sovereign Landing Hub', nameAr: 'محطة الإنزال السيادية - الإسكندرية', coords: [31.2, 29.9], cablesEn: 'AAE-1, SMW-5, 2Africa', cablesAr: 'AAE-1, SMW-5, 2Africa' },
            { nameEn: 'Zafarana / Suez Landing Corridor', nameAr: 'شريان العبور المزدوج - الزعفرانة / السويس', coords: [29.1, 32.6], cablesEn: 'Suez Land Transit Route', cablesAr: 'مسار العبور البري لقناة السويس' },
            { nameEn: 'Jeddah International Teleport', nameAr: 'محطة جدة الدولية للكابلات البحرية', coords: [21.5, 39.1], cablesEn: 'FALCON, AAE-1, SAS', cablesAr: 'FALCON, AAE-1, SAS' },
            { nameEn: 'Fujairah Smart Gateway Hub', nameAr: 'بوابة الفجيرة الذكية (تجاوز مضيق هرمز)', coords: [25.1, 56.3], cablesEn: 'FALCON, TW1, MENA', cablesAr: 'FALCON, TW1, MENA' },
            { nameEn: 'Djibouti Horn Data Interchange', nameAr: 'محطة اتصال جيبوتي والقرن الأفريقي', coords: [11.6, 43.1], cablesEn: 'DARE-1, EASSy, SEACOM', cablesAr: 'DARE-1, EASSy, SEACOM' }
        ];

        landingHubs.forEach(hub => {
            const hubIcon = L.divIcon({
                className: 'subsea-hub-icon',
                html: `<div class="hub-pulse-ring"></div><div class="hub-center-dot"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const hName = isAr ? hub.nameAr : hub.nameEn;
            const hCables = isAr ? hub.cablesAr : hub.cablesEn;

            const hubPopup = isAr ? `
                <div class="tac-map-popup rtl">
                    <div class="popup-header-row"><span class="badge-intel text-cyan"><i class="fa-solid fa-network-wired"></i> محطة إنزال الكابلات البحرية</span></div>
                    <div class="popup-title">${hName}</div>
                    <div class="popup-data-grid">
                        <div><span>نقاط الربط:</span> <strong>${hCables}</strong></div>
                        <div><span>الدفاع السيبراني:</span> <strong style="color:#10B981">معزول ماديًا (Zero-Trust)</strong></div>
                        <div><span>الحماية الميدانية:</span> <strong>تأمين وحراسة عسكرية سيادية</strong></div>
                    </div>
                </div>
            ` : `
                <div class="tac-map-popup ltr">
                    <div class="popup-header-row"><span class="badge-intel text-cyan"><i class="fa-solid fa-network-wired"></i> CABLE LANDING STATION</span></div>
                    <div class="popup-title">${hName}</div>
                    <div class="popup-data-grid">
                        <div><span>INTERCONNECTS:</span> <strong>${hCables}</strong></div>
                        <div><span>CYBER DEFENSE:</span> <strong style="color:#10B981">Zero-Trust Air-Gapped</strong></div>
                        <div><span>PHYSICAL SECURITY:</span> <strong>Sovereign Military Escort</strong></div>
                    </div>
                </div>
            `;

            L.marker(hub.coords, { icon: hubIcon }).bindPopup(hubPopup, { className: 'yaslogist-dark-popup' }).addTo(this.subseaCablesLayer);
        });
    }

    renderAisVessels() {
        if (!this.aisVesselsLayer) return;
        this.aisVesselsLayer.clearLayers();
        const isAr = this.currentLang === 'ar';

        const vessels = [
            {
                name: 'M/V YASLOGIST SOVEREIGN',
                typeEn: 'Ultra Large Container Vessel (24,000 TEU)',
                typeAr: 'سفينة حاويات عملاقة (24,000 حاوية نمطية)',
                coords: [28.2, 33.6],
                heading: 155,
                speedEn: '17.2 kts',
                speedAr: '17.2 عقدة',
                flagEn: 'Sovereign Fleet',
                flagAr: 'الأسطول السيادي',
                threatLevelEn: 'SECURE ESCORT',
                threatLevelAr: 'مرافقة آمنة',
                threatColor: '#06B6D4',
                cargoEn: 'High-Value Semiconductor & Strategic Defense Hardware',
                cargoAr: 'أشباه موصلات فائقة الأهمية وعتاد دفاع استراتيجي',
                escortEn: 'Egyptian Naval Escort Unit (Frigate Escort Active)',
                escortAr: 'وحدة مرافقة البحرية المصرية (حراسة فرقاطة نشطة)'
            },
            {
                name: 'M/T ARABIAN TITAN',
                typeEn: 'VLCC Supertanker (320,000 DWT)',
                typeAr: 'ناقلة نفط خام عملاقة (320,000 طن ساكن)',
                coords: [25.7, 57.0],
                heading: 135,
                speedEn: '13.4 kts',
                speedAr: '13.4 عقدة',
                flagEn: 'Liberia',
                flagAr: 'ليبيريا',
                threatLevelEn: 'HIGH CONTINGENCY',
                threatLevelAr: 'طوارئ عالية',
                threatColor: '#EAB308',
                cargoEn: '2.18M Bbls Light Crude Oil (Ras Tanura -> Singapore)',
                cargoAr: '2.18 مليون برميل نفط خام خفيف (رأس تنورة -> سنغافورة)',
                escortEn: 'Coalition Combined Maritime Forces (CMF Task Force 152)',
                escortAr: 'القوات البحرية المشتركة للتحالف (قوة المهام 152)'
            },
            {
                name: 'ENS AL-GALALA (FFG-1002)',
                typeEn: 'Egyptian Navy FREMM Bergamini Multi-Role Frigate',
                typeAr: 'فرقاطة فريم برجاميني متعددة المهام - البحرية المصرية',
                coords: [27.7, 34.2],
                heading: 190,
                speedEn: '23.5 kts',
                speedAr: '23.5 عقدة',
                flagEn: 'Egyptian Navy',
                flagAr: 'القوات البحرية المصرية',
                threatLevelEn: 'ACTIVE PATROL COMBATANT',
                threatLevelAr: 'دورية قتالية نشطة',
                threatColor: '#10B981',
                cargoEn: 'Sovereign Anti-Air, Aster 30 & Anti-Drone Electronic Warfare Systems',
                cargoAr: 'منظومات أستر 30 للدفاع الجوي وحرب إلكترونية مضادة للمسيرات',
                escortEn: 'Leading Maritime Task Force 153',
                escortAr: 'قيادة قوة المهام البحرية المشتركة 153'
            },
            {
                name: 'C/V RED SEA SENTINEL',
                typeEn: 'Bulk Grain & Sovereign Logistics Carrier',
                typeAr: 'ناقلة صب للحبوب واللوجستيات الاستراتيجية',
                coords: [13.4, 42.8],
                heading: 325,
                speedEn: '14.8 kts',
                speedAr: '14.8 عقدة',
                flagEn: 'Panama',
                flagAr: 'بنما',
                threatLevelEn: 'HOSTILE AIR/DRONE RISK',
                threatLevelAr: 'خطر مسيرات وهجوم جوي معادٍ',
                threatColor: '#EF4444',
                cargoEn: '65,000 MT Sovereign Wheat Cargo (Direct Suez Corridor)',
                cargoAr: '65,000 طن متري من القمح الاستراتيجي (ممر السويس المباشر)',
                escortEn: 'Autonomous Anti-Drone Electronic Jamming Suite Armed',
                escortAr: 'تفعيل منظومة التشويش الإلكتروني الذاتي المضاد للمسيرات'
            },
            {
                name: 'USS LABOON (DDG-58)',
                typeEn: 'US Navy Arleigh Burke Guided Missile Destroyer',
                typeAr: 'مدمرة صواريخ موجهة فئة أرلي بيرك - البحرية الأمريكية',
                coords: [12.6, 44.1],
                heading: 80,
                speedEn: '20.0 kts',
                speedAr: '20.0 عقدة',
                flagEn: 'US Navy',
                flagAr: 'البحرية الأمريكية',
                threatLevelEn: 'COMBAT AIR INTERCEPTION',
                threatLevelAr: 'اعتراض جوي وقتالي',
                threatColor: '#06B6D4',
                cargoEn: 'Aegis Combat System / SM-2 / SM-6 Anti-Ballistic Interceptors',
                cargoAr: 'نظام إيجيس القتالي / صواريخ اعتراض باليستية SM-2 و SM-6',
                escortEn: 'Operation Prosperity Guardian Area Defense',
                escortAr: 'دفاع قطاع عمليات حارس الازدهار'
            }
        ];

        vessels.forEach(v => {
            const shipIcon = L.divIcon({
                className: 'ais-vessel-icon',
                html: `
                    <div class="vessel-marker-box" style="--v-color: ${v.threatColor}">
                        <div class="vessel-heading-pointer" style="transform: rotate(${v.heading}deg)">
                            <i class="fa-solid fa-location-arrow"></i>
                        </div>
                        <div class="vessel-ping"></div>
                    </div>
                `,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            const vType = isAr ? v.typeAr : v.typeEn;
            const vThreat = isAr ? v.threatLevelAr : v.threatLevelEn;
            const vFlag = isAr ? v.flagAr : v.flagEn;
            const vCargo = isAr ? v.cargoAr : v.cargoEn;
            const vEscort = isAr ? v.escortAr : v.escortEn;
            const vSpeed = isAr ? `${v.speedAr} // الاتجاه ${v.heading}°` : `${v.speedEn} // ${v.heading}°`;

            const vesselPopup = isAr ? `
                <div class="tac-map-popup rtl">
                    <div class="popup-header-row">
                        <span class="badge-intel" style="color: ${v.threatColor}; border-color: ${v.threatColor}">نظام التتبع الملاحي الحي // قياس الأقمار الصناعية</span>
                        <span class="mono" style="font-size:10px; color:${v.threatColor}">[${vThreat}]</span>
                    </div>
                    <div class="popup-title"><i class="fa-solid fa-ship"></i> ${v.name}</div>
                    <div class="popup-subtitle mono" style="font-size:11px; color:#94A3B8">${vType}</div>
                    <div class="popup-data-grid" style="margin-top:8px">
                        <div><span>السرعة / الاتجاه:</span> <strong>${vSpeed}</strong></div>
                        <div><span>العلم وسجل السفينة:</span> <strong>${vFlag}</strong></div>
                        <div><span>الشحنة التكتيكية:</span> <strong style="color:#F1F5F9">${vCargo}</strong></div>
                        <div><span>بروتوكول المرافقة:</span> <strong style="color:${v.threatColor}">${vEscort}</strong></div>
                    </div>
                </div>
            ` : `
                <div class="tac-map-popup ltr">
                    <div class="popup-header-row">
                        <span class="badge-intel" style="color: ${v.threatColor}; border-color: ${v.threatColor}">LIVE AIS // SATELLITE TELEMETRY</span>
                        <span class="mono" style="font-size:10px; color:${v.threatColor}">[${vThreat}]</span>
                    </div>
                    <div class="popup-title"><i class="fa-solid fa-ship"></i> ${v.name}</div>
                    <div class="popup-subtitle mono" style="font-size:11px; color:#94A3B8">${vType}</div>
                    <div class="popup-data-grid" style="margin-top:8px">
                        <div><span>SPEED / HEADING:</span> <strong>${vSpeed}</strong></div>
                        <div><span>FLAG & REGISTRY:</span> <strong>${vFlag}</strong></div>
                        <div><span>TACTICAL CARGO:</span> <strong style="color:#F1F5F9">${vCargo}</strong></div>
                        <div><span>ESCORT PROTOCOL:</span> <strong style="color:${v.threatColor}">${vEscort}</strong></div>
                    </div>
                </div>
            `;

            L.marker(v.coords, { icon: shipIcon }).bindPopup(vesselPopup, { className: 'yaslogist-dark-popup' }).addTo(this.aisVesselsLayer);
        });
    }

    renderMaritimeCorridors() {
        if (!this.corridorsLayer) return;
        this.corridorsLayer.clearLayers();
        const isAr = this.currentLang === 'ar';

        // European-Asian Maritime Artery (Mediterranean -> Suez Canal -> Red Sea -> Bab el-Mandeb -> Gulf of Aden)
        const suezRedSeaRoute = [
            [32.2, 31.0],       // Med Approach
            [31.2, 32.3],       // Port Said
            [29.9668, 32.5498], // Suez Canal
            [27.8, 34.3],       // Strait of Tiran
            [20.0, 38.5],       // Central Red Sea
            [12.5833, 43.3333], // Bab el-Mandeb
            [11.8, 48.0]        // Gulf of Aden / Indian Ocean
        ];

        // Persian Gulf Energy Route (Kuwait/Basra -> Central Gulf -> Strait of Hormuz -> Gulf of Oman)
        const hormuzRoute = [
            [29.6, 49.0],       // Northern Gulf
            [26.8, 51.5],       // Central Gulf
            [26.5667, 56.2500], // Strait of Hormuz
            [24.5, 58.5]        // Gulf of Oman
        ];

        const glowStyle = {
            color: '#06B6D4',
            weight: 5,
            opacity: 0.18,
            interactive: false
        };

        const coreLineStyle = {
            color: '#EAB308',
            weight: 2,
            opacity: 0.55,
            dashArray: '5, 8',
            interactive: false
        };

        L.polyline(suezRedSeaRoute, glowStyle).addTo(this.corridorsLayer);
        L.polyline(suezRedSeaRoute, coreLineStyle).addTo(this.corridorsLayer);

        L.polyline(hormuzRoute, glowStyle).addTo(this.corridorsLayer);
        L.polyline(hormuzRoute, coreLineStyle).addTo(this.corridorsLayer);

        // Marine Watch Patrol Path — active naval surveillance route
        const marineWatchPath = [
            [29.9668, 32.5498], // Suez Canal
            [27.8, 34.3],      // Strait of Tiran
            [20.0, 38.5],      // Central Red Sea
            [12.5833, 43.3333],// Bab el-Mandeb
            [14.5, 49.5],      // Gulf of Aden midpoint
            [22.0, 53.0],      // Arabian Sea approach
            [26.5667, 56.2500] // Strait of Hormuz
        ];

        const watchPathGlow = {
            color: '#EF4444',
            weight: 4,
            opacity: 0.15,
            interactive: false
        };

        const watchPathCore = {
            color: '#EF4444',
            weight: 1.5,
            opacity: 0.6,
            dashArray: '8, 4, 2, 4',
            interactive: true
        };

        L.polyline(marineWatchPath, watchPathGlow).addTo(this.corridorsLayer);
        const watchLine = L.polyline(marineWatchPath, watchPathCore).addTo(this.corridorsLayer);

        const watchTooltip = isAr
            ? '<i class="fa-solid fa-route" style="color:#EF4444"></i> <strong>مسار المراقبة والدورية البحرية السيادية</strong>'
            : '<i class="fa-solid fa-route" style="color:#EF4444"></i> <strong>SOVEREIGN MARINE WATCH PATROL PATH</strong>';

        watchLine.bindTooltip(watchTooltip, { sticky: true, className: 'yaslogist-tactical-tooltip' });
    }

    updateData(intensityList = [], lang = 'en') {
        this.currentData = intensityList;
        this.currentLang = lang;
        if (!this.markersLayer) return;

        this.markersLayer.clearLayers();

        // Build case-insensitive lookup table for intensity
        const dataMap = new Map();
        intensityList.forEach(item => {
            if (item && item.country) {
                dataMap.set(item.country.toLowerCase().trim(), item);
            }
        });

        // Calculate regional average to dynamically drive maritime chokepoint intensity
        let maxAttacks = 0;
        let totalAttacks = 0;
        let countryCount = 0;
        intensityList.forEach(item => {
            const a = parseInt(item.attacks || '0', 10);
            if (a > maxAttacks) maxAttacks = a;
            totalAttacks += a;
            countryCount++;
        });
        const avgAttacks = countryCount > 0 ? Math.round(totalAttacks / countryCount) : 4;

        Object.keys(STRATEGIC_GEO_NODES).forEach(nodeKey => {
            const nodeMeta = STRATEGIC_GEO_NODES[nodeKey];
            let dynamicData = dataMap.get(nodeMeta.countryKey) || dataMap.get(nodeKey.toLowerCase());

            if (!dynamicData) {
                // For maritime chokepoints, dynamically scale from active conflict telemetry
                if (nodeKey === 'Red Sea') {
                    // Bab el-Mandeb is critical if high conflict activity in region
                    const attacks = Math.max(maxAttacks + 4, 18);
                    dynamicData = {
                        country: 'Red Sea / Bab el-Mandeb',
                        attacks: attacks.toString(),
                        intensity: 'Critical',
                        trend: 'up'
                    };
                } else if (nodeKey === 'Strait of Hormuz') {
                    // Strait of Hormuz scales with Iranian / regional telemetry
                    const iranData = dataMap.get('iran');
                    const attacks = iranData ? Math.max(parseInt(iranData.attacks || '0', 10), 8) : 8;
                    dynamicData = {
                        country: 'Strait of Hormuz',
                        attacks: attacks.toString(),
                        intensity: attacks >= 10 ? 'Critical' : 'High',
                        trend: 'up'
                    };
                } else {
                    dynamicData = {
                        country: nodeKey,
                        attacks: '0',
                        intensity: 'Low',
                        trend: 'down'
                    };
                }
            }

            this.createDynamicPulsarMarker(nodeMeta, dynamicData);
        });
    }

    createDynamicPulsarMarker(nodeMeta, data) {
        const attacks = parseInt(data.attacks || '0', 10);
        const rawIntensity = (data.intensity || '').toLowerCase().trim();

        // Strict Dynamic Scaling Rules based on CTI Data
        let category = 'low';
        let colorHex = '#10B981'; // Tactical Emerald Green for Normal/Low
        let pulseSpeed = '3.5s';
        let markerDiameter = 18;
        let ringCount = 1;
        let glowShadow = '0 0 8px rgba(16, 185, 129, 0.6)';

        if (rawIntensity === 'critical' || attacks >= 14) {
            category = 'critical';
            colorHex = '#EF4444'; // Tactical Crimson Peak
            pulseSpeed = '1.0s';
            markerDiameter = 34;
            ringCount = 3;
            glowShadow = '0 0 18px rgba(239, 68, 68, 0.9)';
        } else if (rawIntensity === 'high' || attacks >= 5) {
            category = 'high';
            colorHex = '#EAB308'; // YASLOGIST Gold Core
            pulseSpeed = '1.6s';
            markerDiameter = 28;
            ringCount = 2;
            glowShadow = '0 0 14px rgba(234, 179, 8, 0.8)';
        } else if (rawIntensity === 'medium' || attacks >= 2) {
            category = 'medium';
            colorHex = '#06B6D4'; // Sovereign Cyan
            pulseSpeed = '2.3s';
            markerDiameter = 22;
            ringCount = 2;
            glowShadow = '0 0 10px rgba(6, 182, 212, 0.7)';
        }

        // Threat-Level-First Marker VFX — icon determined by severity, not node type
        let markerType = 'kinetic';
        let iconHtml = '';
        let customIcon = null;

        if (category === 'critical') {
            // CRITICAL: Red pulsing beacon (kinetic alert effect)
            markerType = 'kinetic';
            customIcon = L.icon.pulse({
                iconSize: [markerDiameter, markerDiameter],
                color: colorHex,
                fillColor: colorHex
            });
        } else if (category === 'high') {
            // HIGH: Yellow/gold glitch square (cyber alert effect)
            markerType = 'cyber';
            iconHtml = `
                <div class="radar-node node-cyber" style="
                    --node-color: ${colorHex};
                    --pulse-duration: ${pulseSpeed};
                    width: ${markerDiameter}px;
                    height: ${markerDiameter}px;
                ">
                    <div class="glitch-square"></div>
                    <div class="radar-center-dot" style="border-radius: 0;"></div>
                </div>
            `;
        } else if (category === 'medium') {
            // MEDIUM: Blue sonar sweep (maritime surveillance effect)
            markerType = 'maritime';
            iconHtml = `
                <div class="radar-node node-maritime" style="
                    --node-color: ${colorHex};
                    --pulse-duration: ${pulseSpeed};
                    width: ${markerDiameter}px;
                    height: ${markerDiameter}px;
                ">
                    <div class="sonar-sweep"></div>
                    <div class="radar-center-dot"></div>
                </div>
            `;
        } else {
            // LOW: Simple dot
            markerType = 'kinetic';
            iconHtml = `
                <div class="radar-node" style="
                    --node-color: ${colorHex};
                    width: ${markerDiameter}px;
                    height: ${markerDiameter}px;
                ">
                    <div class="radar-center-dot"></div>
                </div>
            `;
        }

        if (!customIcon) {
            customIcon = L.divIcon({
                className: 'tactical-radar-marker',
                html: iconHtml,
                iconSize: [markerDiameter, markerDiameter],
                iconAnchor: [markerDiameter / 2, markerDiameter / 2]
            });
        }

        const marker = L.marker(nodeMeta.coords, { icon: customIcon }).addTo(this.markersLayer);

        const isAr = this.currentLang === 'ar';
        const nodeName = isAr ? nodeMeta.nameAr : nodeMeta.nameEn;
        const supplyChainStatus = isAr ? nodeMeta.supplyChainImpactAr : nodeMeta.supplyChainImpactEn;
        const vectors = (isAr ? nodeMeta.vectorsAr : nodeMeta.vectorsEn) || [];
        const vectorTags = vectors.map(v => `<span class="tac-tag">${v}</span>`).join('');

        // Localized Intensity Title
        let intensityLabelEn = category.toUpperCase();
        let intensityLabelAr = 'منخفض';
        if (category === 'critical') intensityLabelAr = 'حرج جداً';
        else if (category === 'high') intensityLabelAr = 'مرتفع';
        else if (category === 'medium') intensityLabelAr = 'متوسط';

        const intensityBadgeText = isAr ? intensityLabelAr : intensityLabelEn;

        // Tactical Advisory — localized ops intelligence text
        const advisoryMap = {
            'maritime_corridor': { en: 'Port Ops & Canal Transit Advisory', ar: 'عمليات موانئ الشواطئ ومرور القنوات' },
            'maritime_chokepoint': { en: 'Maritime Chokepoint Interdiction Risk', ar: 'مخاطر اعتراض نقاط التضييق البحرية' },
            'state_nexus': { en: 'State APT & Industrial Sabotage Watch', ar: 'مراقبة مجموعات APT الحكومية والتخريب الصناعي' },
            'conflict_hub': { en: 'Active Conflict Zone — Cloud Recon Expanded', ar: 'منطقة صراع نشطة — استطلاع سحابي موسع' },
            'regional_node': { en: 'Regional Volatility — C2 Infrastructure Detected', ar: 'تقلبات إقليمية — رصد خوادم تحكم C2' },
            'transit_chokepoint': { en: 'Land Corridor & Freight Logistics Monitoring', ar: 'مراقبة الممرات البرية والشحن اللوجستي' }
        };
        const advisory = advisoryMap[nodeMeta.type] || { en: 'Standard Monitoring', ar: 'مراقبة قياسية' };
        const advisoryText = isAr ? advisory.ar : advisory.en;

        // Risk status icon per category
        let riskIcon = '<i class="fa-solid fa-circle-check" style="color:#10B981"></i>';
        if (category === 'critical') riskIcon = '<i class="fa-solid fa-skull-crossbones" style="color:#EF4444"></i>';
        else if (category === 'high') riskIcon = '<i class="fa-solid fa-triangle-exclamation" style="color:#EAB308"></i>';
        else if (category === 'medium') riskIcon = '<i class="fa-solid fa-circle-exclamation" style="color:#06B6D4"></i>';

        // Localized node status
        const statusMap = {
            'OPERATIONAL_WATCH': { en: 'OPERATIONAL WATCH', ar: 'مراقبة تشغيلية' },
            'HIGH_ALERT': { en: 'HIGH ALERT', ar: 'تأهب أمني مرتفع' },
            'CRITICAL_CONTEST': { en: 'CRITICAL CONTEST', ar: 'نزاع حرج نشط' },
            'ELEVATED_VOLATILITY': { en: 'ELEVATED VOLATILITY', ar: 'تقلبات أمنية متصاعدة' },
            'MONITORED': { en: 'MONITORED', ar: 'تحت الرصد المستمر' },
            'STABLE_GUARD': { en: 'STABLE GUARD', ar: 'حراسة أمنية مستقرة' },
            'CRITICAL_RISK': { en: 'CRITICAL RISK', ar: 'خطر حرج ومباشر' }
        };
        const statusObj = statusMap[nodeMeta.status] || { en: nodeMeta.status.replace(/_/g, ' '), ar: nodeMeta.status.replace(/_/g, ' ') };
        const statusText = isAr ? statusObj.ar : statusObj.en;
        const brandFlag = isAr ? '◤ ياسلوجست // استخبارات' : '◤ YASLOGIST // INTEL';

        // Rich Tactical Popup with enhanced detail
        const popupContent = `
            <div class="tac-map-popup ${isAr ? 'rtl' : 'ltr'}">
                <div class="tac-popup-header">
                    <span class="tac-popup-flag">${brandFlag}</span>
                    <span class="tac-intensity-badge badge-${category}">${intensityBadgeText}</span>
                </div>
                <h4 class="tac-node-name">${nodeName}</h4>
                <div class="tac-popup-grid">
                    <div class="tac-grid-item">
                        <span class="tac-k"><i class="fa-solid fa-chart-line" style="margin-${isAr ? 'left' : 'right'}:4px"></i>${isAr ? 'تقارير الهجمات (7 أيام)' : '7D Intel Volume'}</span>
                        <span class="tac-v mono">${attacks} ${isAr ? 'هجمات مرصودة' : 'Confirmed Hits'}</span>
                    </div>
                    <div class="tac-grid-item">
                        <span class="tac-k"><i class="fa-solid fa-location-dot" style="margin-${isAr ? 'left' : 'right'}:4px"></i>${isAr ? 'الإحداثيات الجغرافية' : 'Geo Coordinates'}</span>
                        <span class="tac-v mono">${nodeMeta.coords[0].toFixed(4)}°N, ${nodeMeta.coords[1].toFixed(4)}°E</span>
                    </div>
                </div>
                <div class="tac-popup-grid" style="margin-top:4px">
                    <div class="tac-grid-item">
                        <span class="tac-k"><i class="fa-solid fa-shield-halved" style="margin-${isAr ? 'left' : 'right'}:4px"></i>${isAr ? 'حالة المخاطر' : 'Risk Status'}</span>
                        <span class="tac-v">${riskIcon} ${statusText}</span>
                    </div>
                    <div class="tac-grid-item">
                        <span class="tac-k"><i class="fa-solid fa-file-lines" style="margin-${isAr ? 'left' : 'right'}:4px"></i>${isAr ? 'عدد التقارير' : 'Report Count'}</span>
                        <span class="tac-v mono">${Math.max(attacks, 1)} ${isAr ? 'تقرير' : 'reports'}</span>
                    </div>
                </div>
                <div class="tac-supply-chain-impact">
                    <div class="tac-impact-title">
                        <i class="fa-solid fa-anchor"></i> ${isAr ? 'تأثير سلاسل الإمداد واللوجستيات' : 'Supply Chain & Chokepoint Status'}
                    </div>
                    <p class="tac-impact-desc">${supplyChainStatus}</p>
                </div>
                <div class="tac-supply-chain-impact" style="background:rgba(239,68,68,0.06);border-color:rgba(239,68,68,0.2);margin-top:4px">
                    <div class="tac-impact-title" style="color:#EF4444">
                        <i class="fa-solid fa-bullseye"></i> ${isAr ? 'إرشاد تكتيكي' : 'Tactical Advisory'}
                    </div>
                    <p class="tac-impact-desc">${advisoryText}</p>
                </div>
                <div class="tac-vector-strip">
                    <span class="tac-k"><i class="fa-solid fa-bolt" style="margin-${isAr ? 'left' : 'right'}:4px"></i>${isAr ? 'نواقل التهديد النشطة:' : 'Threat Vectors:'}</span>
                    <div class="tac-tags-wrap">${vectorTags}</div>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, {
            className: 'yaslogist-dark-popup',
            offset: [0, -10],
            maxWidth: 340
        });

        // Tactical Hover Tooltip with vector-specific icons
        let tooltipIcon = '<i class="fa-solid fa-crosshairs"></i>';
        if (category === 'critical') tooltipIcon = '<i class="fa-solid fa-skull-crossbones" style="color:#EF4444"></i>';
        else if (category === 'high') tooltipIcon = '<i class="fa-solid fa-triangle-exclamation" style="color:#EAB308"></i>';
        else if (category === 'medium') tooltipIcon = '<i class="fa-solid fa-circle-exclamation" style="color:#06B6D4"></i>';

        const tooltipText = isAr 
            ? `<strong><span class="tac-vector-icon">${tooltipIcon}</span> ${nodeName}</strong><br><span class="mono">${attacks} هجمات مؤكدة [${intensityBadgeText}]</span><br><span style="font-size:9px;color:#94A3B8">${advisory.ar}</span>`
            : `<strong><span class="tac-vector-icon">${tooltipIcon}</span> ${nodeName}</strong><br><span class="mono">${attacks} confirmed hits [${intensityBadgeText}]</span><br><span style="font-size:9px;color:#94A3B8">${advisory.en}</span>`;

        marker.bindTooltip(tooltipText, {
            direction: 'auto',
            offset: [0, -8],
            className: 'yaslogist-tactical-tooltip',
            sticky: true
        });
    }

    setLanguage(lang) {
        this.currentLang = lang;
        if (this.currentData && this.currentData.length > 0) {
            this.updateData(this.currentData, lang);
        }
        this.renderMaritimeCorridors();
        this.renderRadarRangeRings();
        this.renderSubseaCables();
        this.renderAisVessels();
        this.updateLayersControlLanguage(lang);
    }

    updateLayersControlLanguage(lang) {
        const isAr = lang === 'ar';
        const labelsMap = {
            "Tactical Dark": "الخريطة التكتيكية الداكنة",
            "Satellite Intel": "استطلاع الأقمار الصناعية",
            "Maritime Ocean": "أعماق الملاحة البحرية",
            "Topographic Recon": "تضاريس الاستطلاع الطبوغرافي",
            "Sovereign Nav Paths": "مسارات الملاحة السيادية",
            "Threat Markers": "مؤشرات التهديدات والإنذار",
            "Radar Range Rings": "دوائر التغطية الرادارية",
            "Subsea Cyber Cables": "كابلات الاتصالات البحرية",
            "Live AIS Vessels & Escorts": "تتبع السفن وقوافل الحماية"
        };

        const allLabels = document.querySelectorAll('.leaflet-control-layers label');
        allLabels.forEach(lbl => {
            for (let [enKey, arVal] of Object.entries(labelsMap)) {
                if (lbl.textContent.includes(enKey) || lbl.textContent.includes(arVal)) {
                    Array.from(lbl.childNodes).forEach(cn => {
                        if (cn.nodeType === 3 && cn.nodeValue.trim().length > 0) {
                            cn.nodeValue = ` ${isAr ? arVal : enKey}`;
                        }
                    });
                    const innerSpan = lbl.querySelector('span');
                    if (innerSpan) {
                        innerSpan.textContent = ` ${isAr ? arVal : enKey}`;
                    }
                }
            }
        });
    }

    invalidateSize() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }
}

export function initThreatMap(containerId = 'threat-map', options = {}) {
    return new ThreatMap(containerId, options);
}
