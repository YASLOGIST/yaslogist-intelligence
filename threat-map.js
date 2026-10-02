/**
 * YASLOGIST evidence map.
 *
 * This map deliberately separates two kinds of geometry:
 * - OBSERVED country markers: the rolling country-linked report counts from
 *   data/target_intensity.json.
 * - REFERENCE context: strategic routes, cable paths, and range circles.
 *
 * Reference geometry never receives a synthetic severity, count, vessel, or
 * operational-state claim. That distinction is visible in layer names,
 * legends, popups, and the bottom map status strip.
 */

const COUNTRY_NODES = {
    egypt: {
        country: 'Egypt', coords: [29.9668, 32.5498],
        nameEn: 'Egypt · Suez corridor', nameAr: 'مصر · ممر السويس'
    },
    iran: {
        country: 'Iran', coords: [35.6892, 51.3890],
        nameEn: 'Iran · Persian Gulf context', nameAr: 'إيران · سياق الخليج'
    },
    israel: {
        country: 'Israel', coords: [32.0853, 34.7818],
        nameEn: 'Israel · Eastern Mediterranean', nameAr: 'إسرائيل · شرق المتوسط'
    },
    lebanon: {
        country: 'Lebanon', coords: [33.8938, 35.5018],
        nameEn: 'Lebanon · Beirut context', nameAr: 'لبنان · سياق بيروت'
    },
    syria: {
        country: 'Syria', coords: [33.5138, 36.2765],
        nameEn: 'Syria · Levant context', nameAr: 'سوريا · سياق المشرق'
    },
    jordan: {
        country: 'Jordan', coords: [31.9454, 35.9284],
        nameEn: 'Jordan · Aqaba land bridge', nameAr: 'الأردن · ممر العقبة البري'
    },
    yemen: {
        country: 'Yemen', coords: [15.3694, 44.1910],
        nameEn: 'Yemen · Southern Red Sea context', nameAr: 'اليمن · سياق جنوب البحر الأحمر'
    }
};

const REFERENCE_CHOKEPOINTS = [
    { coords: [29.9668, 32.5498], nameEn: 'Suez Canal', nameAr: 'قناة السويس', radius: 180000, color: '#54b8c2' },
    { coords: [12.5833, 43.3333], nameEn: 'Bab el-Mandeb', nameAr: 'باب المندب', radius: 220000, color: '#c9a85c' },
    { coords: [26.5667, 56.2500], nameEn: 'Strait of Hormuz', nameAr: 'مضيق هرمز', radius: 200000, color: '#c9a85c' }
];

const REFERENCE_ROUTES = [
    {
        nameEn: 'Suez–Red Sea reference route', nameAr: 'مسار السويس والبحر الأحمر المرجعي', color: '#54b8c2',
        points: [[31.3, 32.3], [29.9, 32.5], [27.8, 34.3], [20.0, 38.5], [12.5833, 43.3333]]
    },
    {
        nameEn: 'Gulf reference route', nameAr: 'مسار الخليج المرجعي', color: '#c9a85c',
        points: [[12.5833, 43.3333], [14.5, 49.5], [22.0, 53.0], [26.5667, 56.2500]]
    }
];

const REFERENCE_CABLES = [
    {
        nameEn: 'AAE-1 reference geometry', nameAr: 'هندسة مرجعية لكابل AAE-1', color: '#8b7bc8',
        points: [[12.1, 52.0], [12.6, 44.5], [17.5, 40.5], [22.2, 38.0], [29.9, 32.5], [31.5, 30.1], [35.0, 22.0]]
    },
    {
        nameEn: 'SMW5 reference geometry', nameAr: 'هندسة مرجعية لكابل SMW5', color: '#8b7bc8',
        points: [[25.3, 55.3], [22.5, 60.5], [17.8, 56.3], [12.7, 43.4], [18.1, 39.0], [29.8, 32.5], [36.1, 29.7]]
    }
];

const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '"': '&quot;', "'": '&#39;'
}[char]));

const safeCount = (value) => Math.max(0, Math.round(Number(value) || 0));

const severity = (raw, count) => {
    const value = String(raw || '').toLowerCase().trim();
    if (value === 'critical') return { key: 'critical', color: '#ef6b6b', size: 28 };
    if (value === 'high') return { key: 'high', color: '#c9a85c', size: 23 };
    if (value === 'medium') return { key: 'medium', color: '#54b8c2', size: 19 };
    // The pipeline's Low category can include an observed zero count. It is
    // still a source observation, not an inferred threat condition.
    return { key: 'low', color: '#55b58b', size: count > 0 ? 16 : 12 };
};

const language = (isAr, en, ar) => isAr ? ar : en;

export class ThreatMap {
    constructor(containerId = 'threat-map', options = {}) {
        this.containerId = containerId;
        this.options = Object.assign({
            center: [28.5, 40.0],
            zoom: 4,
            minZoom: 2,
            maxZoom: 18,
            onCountrySelect: null
        }, options);
        this.map = null;
        this.observedLayer = null;
        this.referenceRoutesLayer = null;
        this.referenceRangesLayer = null;
        this.referenceCablesLayer = null;
        this.layersControl = null;
        this.currentData = [];
        this.currentLang = 'en';
        this.resizeTimer = null;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container || typeof L === 'undefined') {
            console.warn('[YASLOGIST] Evidence map unavailable: container or Leaflet missing.');
            return;
        }

        this.map = L.map(this.containerId, {
            center: this.options.center,
            zoom: this.options.zoom,
            minZoom: this.options.minZoom,
            maxZoom: this.options.maxZoom,
            preferCanvas: true,
            zoomControl: true,
            attributionControl: true,
            dragging: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true
        });

        this.baseLayers = {
            dark: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 16, attribution: 'Esri Dark Gray'
            }),
            satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19, attribution: 'Esri World Imagery'
            }),
            ocean: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 16, attribution: 'Esri Ocean'
            }),
            topo: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 18, attribution: 'Esri Topographic'
            })
        };
        this.baseLayers.dark.addTo(this.map);
        this.map.attributionControl?.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a> · YASLOGIST');

        this.observedLayer = L.layerGroup().addTo(this.map);
        this.referenceRoutesLayer = L.layerGroup().addTo(this.map);
        this.referenceRangesLayer = L.layerGroup().addTo(this.map);
        this.referenceCablesLayer = L.layerGroup().addTo(this.map);

        this.renderReferenceContext();
        this.renderLayerControl();
        this.bindMapEvents();
        this.updateMapSummary(0);
        this.resizeTimer = setTimeout(() => {
            this.map?.invalidateSize();
            this.resizeTimer = null;
        }, 150);
    }

    bindMapEvents() {
        this.handleContainerClick = (event) => {
            const button = event.target.closest?.('[data-map-country]');
            const country = button?.getAttribute('data-map-country');
            if (!country || typeof this.options.onCountrySelect !== 'function') return;
            this.options.onCountrySelect(country);
        };
        this.map?.getContainer()?.addEventListener('click', this.handleContainerClick);
    }

    renderLayerControl() {
        if (!this.map) return;
        this.layersControl?.remove();
        const isAr = this.currentLang === 'ar';
        const baseMaps = {
            [language(isAr, 'Tactical dark', 'الخريطة الداكنة')]: this.baseLayers.dark,
            [language(isAr, 'Satellite', 'الأقمار الصناعية')]: this.baseLayers.satellite,
            [language(isAr, 'Ocean', 'المحيط')]: this.baseLayers.ocean,
            [language(isAr, 'Topographic', 'طبوغرافية')]: this.baseLayers.topo
        };
        const overlays = {
            [language(isAr, 'Observed country signals', 'إشارات الدول المرصودة')]: this.observedLayer,
            [language(isAr, 'Reference maritime routes', 'مسارات بحرية مرجعية')]: this.referenceRoutesLayer,
            [language(isAr, 'Reference range circles', 'دوائر نطاق مرجعية')]: this.referenceRangesLayer,
            [language(isAr, 'Reference cable paths', 'مسارات كابلات مرجعية')]: this.referenceCablesLayer
        };
        this.layersControl = L.control.layers(baseMaps, overlays, { position: 'topright', collapsed: true }).addTo(this.map);
    }

    referencePopup(title) {
        const isAr = this.currentLang === 'ar';
        return `
            <div class="tac-map-popup ${isAr ? 'rtl' : 'ltr'} map-reference-popup">
                <span class="map-evidence-badge reference">${language(isAr, 'REFERENCE CONTEXT', 'سياق مرجعي')}</span>
                <h4 class="tac-node-name">${escapeHTML(title)}</h4>
                <p class="map-popup-note">${language(
                    isAr,
                    'Reference geometry only. It does not represent live vessel, cable, incident, or threat-condition telemetry.',
                    'هندسة مرجعية فقط. لا تمثل حركة سفن أو كابلات أو حوادث أو حالة تهديد حية.'
                )}</p>
            </div>`;
    }

    renderReferenceContext() {
        if (!this.map) return;
        this.referenceRoutesLayer?.clearLayers();
        this.referenceRangesLayer?.clearLayers();
        this.referenceCablesLayer?.clearLayers();
        const isAr = this.currentLang === 'ar';

        REFERENCE_ROUTES.forEach((route) => {
            const title = language(isAr, route.nameEn, route.nameAr);
            const glow = L.polyline(route.points, { color: route.color, weight: 5, opacity: 0.10, interactive: false });
            const line = L.polyline(route.points, { color: route.color, weight: 1.4, opacity: 0.65, dashArray: '7 7' });
            line.bindTooltip(title, { sticky: true, className: 'yaslogist-tactical-tooltip' });
            line.bindPopup(this.referencePopup(title), { className: 'yaslogist-dark-popup', maxWidth: 300 });
            glow.addTo(this.referenceRoutesLayer);
            line.addTo(this.referenceRoutesLayer);
        });

        REFERENCE_CHOKEPOINTS.forEach((zone) => {
            const title = language(isAr, zone.nameEn, zone.nameAr);
            const circle = L.circle(zone.coords, {
                radius: zone.radius, color: zone.color, weight: 1, dashArray: '5 8', fillColor: zone.color, fillOpacity: 0.025
            });
            circle.bindTooltip(`${title} · ${language(isAr, 'reference radius', 'نطاق مرجعي')}`, { className: 'yaslogist-tactical-tooltip' });
            circle.bindPopup(this.referencePopup(title), { className: 'yaslogist-dark-popup', maxWidth: 300 });
            circle.addTo(this.referenceRangesLayer);
        });

        REFERENCE_CABLES.forEach((cable) => {
            const title = language(isAr, cable.nameEn, cable.nameAr);
            const line = L.polyline(cable.points, { color: cable.color, weight: 1.2, opacity: 0.56, dashArray: '2 7' });
            line.bindTooltip(title, { sticky: true, className: 'yaslogist-tactical-tooltip' });
            line.bindPopup(this.referencePopup(title), { className: 'yaslogist-dark-popup', maxWidth: 300 });
            line.addTo(this.referenceCablesLayer);
        });
    }

    updateData(intensityList = [], lang = 'en') {
        this.currentData = Array.isArray(intensityList) ? intensityList : [];
        this.currentLang = lang === 'ar' ? 'ar' : 'en';
        if (!this.observedLayer) return;

        this.observedLayer.clearLayers();
        const isAr = this.currentLang === 'ar';
        const records = new Map();
        this.currentData.forEach((item) => {
            const key = String(item?.country || '').trim().toLowerCase();
            if (key && COUNTRY_NODES[key]) records.set(key, item);
        });

        records.forEach((record, key) => this.createObservedMarker(COUNTRY_NODES[key], record, isAr));
        this.renderReferenceContext();
        this.renderLayerControl();
        this.updateMapSummary(records.size);
    }

    createObservedMarker(node, record, isAr) {
        const count = safeCount(record?.attacks);
        const previous = Number.isFinite(Number(record?.previous)) ? safeCount(record.previous) : null;
        const level = severity(record?.intensity, count);
        const title = language(isAr, node.nameEn, node.nameAr);
        const markerIcon = L.divIcon({
            className: 'tactical-radar-marker observed-radar-marker',
            html: `<span class="observed-marker marker-${level.key}" style="--marker-color:${level.color};--marker-size:${level.size}px"><span></span></span>`,
            iconSize: [level.size, level.size],
            iconAnchor: [level.size / 2, level.size / 2]
        });
        const marker = L.marker(node.coords, { icon: markerIcon, keyboard: true, title }).addTo(this.observedLayer);
        const delta = this.deltaLabel(record, count, previous, isAr);
        const levelLabel = language(isAr,
            { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }[level.key],
            { critical: 'حرج', high: 'مرتفع', medium: 'متوسط', low: 'منخفض' }[level.key]
        );
        const country = escapeHTML(node.country);
        const popup = `
            <div class="tac-map-popup ${isAr ? 'rtl' : 'ltr'}">
                <div class="tac-popup-header">
                    <span class="map-evidence-badge observed">${language(isAr, 'OBSERVED · ROLLING 7D', 'مرصود · ٧ أيام متحركة')}</span>
                    <span class="tac-intensity-badge badge-${level.key}">${levelLabel}</span>
                </div>
                <h4 class="tac-node-name">${escapeHTML(title)}</h4>
                <div class="tac-popup-grid">
                    <div class="tac-grid-item"><span class="tac-k">${language(isAr, 'Country-linked reports', 'تقارير مرتبطة بالدولة')}</span><span class="tac-v mono">${count}</span></div>
                    <div class="tac-grid-item"><span class="tac-k">${language(isAr, 'Prior 7d', 'السبعة أيام السابقة')}</span><span class="tac-v mono">${previous === null ? '—' : previous}</span></div>
                </div>
                <div class="map-change-row"><span>${language(isAr, 'Window change', 'التغير بين الفترتين')}</span><strong class="mono" data-direction="${escapeHTML(delta.direction)}">${escapeHTML(delta.label)}</strong></div>
                <p class="map-popup-note">${language(
                    isAr,
                    'Counts reflect country-linked public-source reports. They are not incident totals or a physical threat condition.',
                    'تعكس الأعداد تقارير مصادر مفتوحة مرتبطة بالدولة. لا تمثل إجمالي الحوادث أو حالة تهديد مادية.'
                )}</p>
                <button class="map-wire-link" type="button" data-map-country="${country}">${language(isAr, 'عرض التقارير المطابقة', 'View matching wire')}</button>
            </div>`;
        marker.bindPopup(popup, { className: 'yaslogist-dark-popup', offset: [0, -8], maxWidth: 340 });
        marker.bindTooltip(`<strong>${escapeHTML(title)}</strong><br><span class="mono">${count} ${language(isAr, 'reports / 7d', 'تقارير / ٧ أيام')}</span>`, {
            direction: 'top', offset: [0, -8], className: 'yaslogist-tactical-tooltip', sticky: true
        });
    }

    deltaLabel(record, count, previous, isAr) {
        if (previous === null) return { direction: 'unknown', label: language(isAr, 'No baseline', 'لا خط أساس') };
        if (previous === 0 && count === 0) return { direction: 'flat', label: language(isAr, 'No change', 'لا تغير') };
        if (previous === 0) return { direction: 'up', label: language(isAr, `New activity (${count})`, `نشاط جديد (${count})`) };
        const explicit = Number(record?.deltaPct);
        const pct = Number.isFinite(explicit) ? Math.round(explicit) : Math.round(((count - previous) / previous) * 100);
        if (pct === 0) return { direction: 'flat', label: language(isAr, 'No change', 'لا تغير') };
        return {
            direction: pct > 0 ? 'up' : 'down',
            label: `${pct > 0 ? '▲' : '▼'} ${Math.abs(pct)}%`
        };
    }

    updateMapSummary(observedCount) {
        const target = document.getElementById('map-observed-summary');
        if (!target) return;
        const isAr = this.currentLang === 'ar';
        target.textContent = language(isAr,
            `${observedCount} COUNTRY SERIES LOADED`,
            `${observedCount} سلاسل دول محملة`
        );
    }

    setLanguage(lang) {
        this.updateData(this.currentData, lang);
    }

    invalidateSize() {
        this.map?.invalidateSize();
    }

    destroy() {
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        this.resizeTimer = null;
        this.map?.getContainer()?.removeEventListener('click', this.handleContainerClick);
        if (this.map) {
            this.map.off();
            this.map.remove();
        }
        this.map = null;
        this.layersControl = null;
        this.observedLayer = null;
        this.referenceRoutesLayer = null;
        this.referenceRangesLayer = null;
        this.referenceCablesLayer = null;
        this.currentData = [];
    }
}

export function initThreatMap(containerId = 'threat-map', options = {}) {
    return new ThreatMap(containerId, options);
}
