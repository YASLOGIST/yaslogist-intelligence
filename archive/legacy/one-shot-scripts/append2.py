with open("styles.css", "a") as f:
    f.write('''
/* News Wire Item Cards */
.wire-item {
    background: rgba(18, 24, 34, 0.65);
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    padding: 11px 13px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: transform 0.15s ease, border-color 0.15s ease;
}

.wire-item:hover {
    transform: translateX(4px) scale(1.01);
    border-color: rgba(234, 179, 8, 0.5);
    background: rgba(22, 30, 42, 0.85);
    box-shadow: 0 4px 15px rgba(234, 179, 8, 0.1);
}

.wire-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.wire-source {
    font-family: var(--font-arabic);
    font-size: 10px;
    font-weight: 700;
    color: var(--yas-cyan);
    letter-spacing: 0.02em;
    text-transform: uppercase;
}

.wire-timestamp {
    font-size: 9.5px;
    color: var(--text-muted);
}

.wire-title {
    font-size: 12.5px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--text-primary);
}

.wire-title a {
    color: inherit;
    text-decoration: none;
    transition: color 0.15s ease;
}

.wire-title a:hover {
    color: var(--yas-gold);
}

.wire-summary {
    font-size: 11.5px;
    color: var(--text-secondary);
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.wire-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
}

.wire-tag {
    font-family: 'Cairo', var(--font-arabic);
    font-size: 9px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
    border: 1px solid var(--panel-border);
}

.wire-tag.tag-urgent { background: var(--yas-crimson-wash); color: var(--yas-crimson); border-color: rgba(239, 68, 68, 0.3); }
.wire-tag.tag-warn { background: var(--yas-gold-wash); color: var(--yas-gold); border-color: rgba(234, 179, 8, 0.3); }
.wire-tag.tag-cyan { background: var(--yas-cyan-wash); color: var(--yas-cyan); border-color: rgba(6, 182, 212, 0.3); }
.wire-tag.tag-purple { background: var(--yas-purple-wash); color: var(--yas-purple); border-color: rgba(168, 85, 247, 0.3); }

/* Loading State */
.loading-state {
    padding: 40px 20px;
    text-align: center;
    color: var(--text-muted);
    font-size: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.loading-state i {
    font-size: 20px;
    color: var(--yas-gold);
}

/* ===================================================================
   4. BOTTOM GRID (50% / 50%)
   =================================================================== */


/* CVE Defense Matrix Table */
.table-container-scroller {
    overflow-x: auto;
    max-height: 380px;
    padding: 0 4px 10px;
}

.tactical-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}

.tactical-table th {
    font-family: 'Cairo', var(--font-arabic);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--text-muted);
    text-transform: uppercase;
    text-align: left;
    padding: 10px 14px;
    border-bottom: 1px solid var(--panel-border);
    position: sticky;
    top: 0;
    background: rgba(13, 17, 23, 0.4);
    backdrop-filter: blur(4px);
    z-index: 2;
}

.tactical-table td {
    padding: 10px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
}

.tactical-table tr:hover td {
    background: rgba(255, 255, 255, 0.02);
    color: var(--text-primary);
}

.cve-id-cell {
    font-weight: 700;
    color: var(--yas-cyan);
}

.cve-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 7px;
    border-radius: 4px;
    font-family: 'Cairo', var(--font-arabic);
    font-size: 9.5px;
    font-weight: 700;
}

.badge-critical { background: var(--yas-crimson-wash); color: var(--yas-crimson); border: 1px solid rgba(239, 68, 68, 0.3); }
.badge-high { background: var(--yas-gold-wash); color: var(--yas-gold); border: 1px solid rgba(234, 179, 8, 0.3); }
.badge-medium { background: var(--yas-cyan-wash); color: var(--yas-cyan); border: 1px solid rgba(6, 182, 212, 0.3); }
.badge-low { background: var(--yas-green-wash); color: var(--yas-green); border: 1px solid rgba(16, 185, 129, 0.3); }

/* Threat Actor Dossiers */
.actors-dossier-panel {
    display: flex;
    flex-direction: column;
}

.actor-search-wrap {
    max-width: 260px;
}

.small-search {
    max-width: 280px;
}

.actors-grid-scroller {
    overflow-y: auto;
    max-height: 380px;
    padding: 12px 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 10px;
}

.actor-dossier-card {
    background: rgba(18, 24, 34, 0.7);
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

.actor-dossier-card:hover {
    border-color: rgba(234, 179, 8, 0.5);
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(234, 179, 8, 0.15);
}

.actor-head-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.actor-title {
    font-family: 'Cairo', var(--font-headline);
    font-size: 13px;
    font-weight: 700;
    color: var(--yas-gold);
}

.actor-origin-badge {
    font-size: 9.5px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--yas-cyan);
    border: 1px solid rgba(6, 182, 212, 0.2);
}

.actor-motivation {
    font-size: 11.5px;
    color: var(--text-secondary);
    line-height: 1.4;
}

.actor-target-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
}

.actor-target-pill {
    font-family: 'Cairo', var(--font-arabic);
    font-size: 9px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--panel-border);
    border-radius: 3px;
    padding: 1px 6px;
    color: var(--text-muted);
}

/* ===================================================================
   5. COMMAND HUD FOOTER
   =================================================================== */
.hud-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-top: 1px solid var(--panel-border);
    font-size: 11px;
    color: var(--text-muted);
    flex-wrap: wrap;
    gap: 10px;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.footer-brand {
    font-weight: 700;
    color: var(--yas-gold);
    letter-spacing: 0.05em;
}

.footer-dot {
    color: var(--text-faint);
}

.footer-right {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    color: var(--text-muted);
}

/* ===================================================================
   6. DYNAMIC RADAR MARKER STYLING (LEAFLET PULSARS)
   =================================================================== */
.tactical-radar-marker {
    background: transparent;
    border: none;
}

.radar-node {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--node-color, #EAB308);
}

.radar-center-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    z-index: 3;
    position: relative;
    background: var(--node-color, #EAB308);
    box-shadow: var(--node-glow, 0 0 10px #EAB308);
}

.radar-pulse-ring {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    border: 1.5px solid var(--node-color, #EAB308);
}

.radar-pulse-ring.ring-1 {
    inset: -6px;
    animation: radarExpandRing var(--pulse-duration, 2s) cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
}

.radar-pulse-ring.ring-2 {
    inset: -12px;
    border-style: dashed;
    animation: radarExpandRing var(--pulse-duration, 2s) cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
    animation-delay: 0.4s;
}

.radar-pulse-ring.ring-3 {
    inset: -18px;
    border-style: dotted;
    animation: radarExpandRing var(--pulse-duration, 2s) cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
    animation-delay: 0.8s;
}

@keyframes radarExpandRing {
    0% { transform: scale(0.35); opacity: 1; }
    100% { transform: scale(2.0); opacity: 0; }
}

/* Tactical Leaflet Popups */
.yaslogist-dark-popup .leaflet-popup-content-wrapper {
    background: rgba(13, 17, 23, 0.95) !important;
    backdrop-filter: blur(16px) !important;
    border: 1px solid var(--panel-border-gold) !important;
    border-radius: 8px !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85) !important;
    color: var(--text-primary) !important;
    padding: 0 !important;
}

.yaslogist-dark-popup .leaflet-popup-content {
    margin: 12px 14px !important;
    line-height: 1.4 !important;
}

.yaslogist-dark-popup .leaflet-popup-tip {
    background: rgba(13, 17, 23, 0.95) !important;
    border: 1px solid var(--panel-border-gold) !important;
}

.tac-map-popup {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.tac-popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--panel-border);
    padding-bottom: 6px;
}

.tac-popup-flag {
    font-family: var(--font-mono);
    font-size: 9.5px;
    font-weight: 700;
    color: var(--yas-gold);
    letter-spacing: 0.08em;
}

.tac-intensity-badge {
    font-family: 'Cairo', var(--font-arabic);
    font-size: 9.5px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 3px;
}

.tac-node-name {
    font-family: 'Cairo', var(--font-headline);
    font-size: 13.5px;
    font-weight: 700;
    color: #FFFFFF;
}

.tac-popup-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    background: rgba(0, 0, 0, 0.4);
    padding: 6px 8px;
    border-radius: 4px;
}

.tac-grid-item {
    display: flex;
    flex-direction: column;
}

.tac-k {
    font-family: 'Cairo', var(--font-arabic);
    font-size: 9px;
    color: var(--text-muted);
    text-transform: uppercase;
}

.tac-supply-chain-impact {
    background: rgba(234, 179, 8, 0.06);
    border: 1px solid rgba(234, 179, 8, 0.2);
    border-radius: 4px;
    padding: 6px 8px;
}

.tac-impact-title {
    font-size: 10px;
    font-weight: 700;
    color: var(--yas-gold);
    display: flex;
    align-items: center;
    gap: 5px;
}

.tac-impact-desc {
    font-size: 10.5px;
    color: var(--text-secondary);
    margin-top: 2px;
}

.tac-vector-strip {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.tac-tags-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.tac-tag {
    font-family: 'Cairo', var(--font-arabic);
    font-size: 8.5px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--panel-border);
    border-radius: 3px;
    padding: 1px 5px;
    color: var(--yas-cyan);
}

.yaslogist-tactical-tooltip {
    background: rgba(13, 17, 23, 0.94) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid var(--panel-border-gold) !important;
    border-radius: 4px !important;
    color: var(--text-primary) !important;
    font-size: 10.5px !important;
    padding: 4px 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6) !important;
}

/* ===================================================================
   7. BILINGUAL ARABIC & RTL ADAPTATION
   ================================================================== */
html[dir="rtl"] {
    direction: rtl;
    text-align: right;
}

html[dir="rtl"] .tactical-table th {
    text-align: right;
}

html[dir="rtl"] .kpi-card {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-radius: 12px;
    background: rgba(10, 13, 20, 0.2);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-left: 4px solid transparent;
    transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}
.kpi-card:hover {
    transform: translateY(-5px) scale(1.02);
    background: rgba(10, 13, 20, 0.25);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 24px rgba(255, 255, 255, 0.08);
}

html[dir="rtl"] #kpi-attacks-card { border-right-color: var(--yas-crimson); }
html[dir="rtl"] #kpi-campaigns-card { border-right-color: var(--yas-gold); }
html[dir="rtl"] #kpi-cve-card { border-right-color: var(--yas-cyan); }
html[dir="rtl"] #kpi-logistics-card { border-right-color: var(--yas-crimson); }

html[dir="rtl"] .search-ic {
    left: auto;
    right: 10px;
}

html[dir="rtl"] .search-input-wrap input {
    padding: 6px 30px 6px 12px;
}

html[dir="rtl"] .wire-item:hover {
    transform: translateX(-4px) scale(1.01);
}

html[dir="rtl"] .telemetry-right-block {
    align-items: flex-start;
}

/* ===================================================================
   8. RESPONSIVE BREAKPOINTS (MOBILE & TABLET HUD)
   =================================================================== */
@media (max-width: 1200px) {
    .kpi-strip {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 860px) {
    .command-header {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    .telemetry-right-block {
        align-items: flex-start;
    }
    .vectors-row-grid {
        grid-template-columns: 1fr;
    }
    .chokepoint-status-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
    }
}

@media (max-width: 580px) {
    .hud-container {
        padding: 10px;
    }
    .kpi-strip {
        grid-template-columns: 1fr;
    }
    .main-title {
        font-size: 1.05rem;
    }
}


/* VFX MARKERS */
.node-maritime .sonar-sweep {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(from 0deg, transparent 70%, rgba(6, 182, 212, 0.8) 100%);
    animation: sweep 2s linear infinite;
    pointer-events: none;
}
@keyframes sweep {
    to { transform: rotate(360deg); }
}

.node-cyber .glitch-square {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid var(--node-color);
    animation: glitch 1.5s infinite;
    pointer-events: none;
}
@keyframes glitch {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
}

.node-kinetic .kinetic-beacon {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid var(--node-color);
    border-radius: 50%;
    animation: beacon 0.8s ease-out infinite;
    pointer-events: none;
}
@keyframes beacon {
    0% { transform: scale(0.5); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
}

.tac-vector-icon {
    margin-right: 6px;
    font-size: 12px;
}

.tab-panel { display: none !important; }

.tab-panel.active { display: block !important; }
''')
