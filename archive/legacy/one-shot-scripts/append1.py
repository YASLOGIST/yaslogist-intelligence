with open("styles.css", "a") as f:
    f.write('''
.kpi-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.kpi-label {
    font-family: 'Cairo', var(--font-arabic);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--text-secondary);
    text-transform: uppercase;
}

.kpi-icon {
    font-size: 14px;
}

.kpi-value-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
}

.kpi-value {
    font-size: 2.1rem;
    font-weight: 800;
    line-height: 1;
}

.kpi-trend {
    font-size: 11px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.trend-up { color: var(--yas-crimson); }
.trend-gold { color: var(--yas-gold); }
.trend-cyan { color: var(--yas-cyan); }
.trend-warn { color: #F97316; }

.dot-pulse-gold {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--yas-gold);
    display: inline-block;
    box-shadow: 0 0 6px var(--yas-gold);
}

.kpi-subtext {
    font-size: 11.5px;
    color: var(--text-muted);
}

/* ===================================================================
   3. MID SECTION GRID (65% / 35%)
   =================================================================== */




.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid var(--panel-border);
    gap: 12px;
}

.mini-header {
    padding: 10px 14px;
}

.header-title-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.header-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    display: grid;
    place-items: center;
    font-size: 13px;
    flex-shrink: 0;
}

.card-title {
    font-family: 'Cairo', var(--font-headline);
    font-size: 13.5px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--text-primary);
}

.card-title-sm {
    font-family: 'Cairo', var(--font-headline);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--text-primary);
}

.card-subtitle {
    font-size: 11px;
    color: var(--text-muted);
}

.map-controls {
    display: flex;
    align-items: center;
    gap: 12px;
}

.map-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-arabic);
    font-size: 10.5px;
    color: var(--text-secondary);
}

.legend-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
}

.dot-critical { background: var(--yas-crimson); box-shadow: 0 0 6px var(--yas-crimson); }
.dot-high { background: var(--yas-gold); box-shadow: 0 0 6px var(--yas-gold); }
.dot-med { background: var(--yas-cyan); box-shadow: 0 0 6px var(--yas-cyan); }

.btn-reset-map {
    appearance: none;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--panel-border);
    color: var(--text-secondary);
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 10.5px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: var(--font-arabic);
}

.btn-reset-map:hover {
    background: rgba(234, 179, 8, 0.15);
    border-color: var(--yas-gold);
    color: var(--yas-gold);
    box-shadow: 0 0 10px rgba(234, 179, 8, 0.2);
    transform: translateY(-1px);
}

/* Map Container */
.map-container-relative {
    position: relative;
    width: 100%;
    min-height: 65vh;
    height: calc(100vh - 280px);
    border-radius: 0 0 8px 8px;
    overflow: hidden;
}

.tactical-map-viewport {
    width: 100%;
    height: 100%;
    background: transparent;
}

.leaflet-container {
    background: transparent !important;
    font-family: var(--font-arabic) !important;
}

/* Tactical Chokepoint Status Bar */
.chokepoint-status-bar {
    position: absolute;
    bottom: 12px;
    left: 12px;
    right: 12px;
    z-index: 500;
    background: rgba(10, 13, 20, 0.9);
    backdrop-filter: blur(12px);
    border: 1px solid var(--panel-border-gold);
    border-radius: 6px;
    padding: 7px 14px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 10px;
}

.cp-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
}

.cp-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.cp-warning { background: var(--yas-gold); box-shadow: 0 0 6px var(--yas-gold); }
.cp-critical { background: var(--yas-crimson); box-shadow: 0 0 8px var(--yas-crimson); animation: statusBlink 1.4s infinite; }

.cp-name {
    font-weight: 600;
    color: var(--text-secondary);
}

.cp-state {
    font-size: 10.5px;
    font-weight: 700;
}

/* Vectors Row Grid (Charts side by side) */
.vectors-row-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}

.canvas-wrapper-fixed {
    position: relative;
    height: 190px;
    padding: 10px 14px 14px;
}

.badge-intel {
    font-family: var(--font-arabic);
    font-size: 10px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--panel-border);
    color: var(--text-muted);
}

/* Live Intelligence Wire */
.intel-wire-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.btn-refresh {
    appearance: none;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--panel-border);
    color: var(--text-secondary);
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: grid;
    place-items: center;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-refresh:hover {
    background: rgba(234, 179, 8, 0.15);
    border-color: var(--yas-gold);
    color: var(--yas-gold);
    transform: rotate(180deg) scale(1.1);
    box-shadow: 0 0 15px rgba(234, 179, 8, 0.2);
}

.wire-toolbar {
    padding: 10px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-bottom: 1px solid var(--panel-border);
}

.search-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.search-ic {
    position: absolute;
    left: 10px;
    color: var(--text-muted);
    font-size: 12px;
    pointer-events: none;
}

.search-input-wrap input {
    width: 100%;
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    padding: 6px 12px 6px 30px;
    color: var(--text-primary);
    font-family: var(--font-arabic);
    font-size: 11.5px;
    outline: none;
    transition: border-color 0.2s ease;
}

.search-input-wrap input:focus {
    border-color: var(--yas-gold);
}

.tactical-tags-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.filter-pill {
    appearance: none;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    padding: 3px 8px;
    color: var(--text-muted);
    font-family: 'Cairo', var(--font-arabic);
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
}

.filter-pill:hover, .filter-pill.active {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
}

.filter-pill.tag-pill-crimson.active { background: var(--yas-crimson-wash); border-color: var(--yas-crimson); color: var(--yas-crimson); }
.filter-pill.tag-pill-purple.active { background: var(--yas-purple-wash); border-color: var(--yas-purple); color: var(--yas-purple); }
.filter-pill.tag-pill-cyan.active { background: var(--yas-cyan-wash); border-color: var(--yas-cyan); color: var(--yas-cyan); }
.filter-pill.tag-pill-gold.active { background: var(--yas-gold-wash); border-color: var(--yas-gold); color: var(--yas-gold); }
.filter-pill.tag-pill-warn.active { background: rgba(249, 115, 22, 0.15); border-color: #F97316; color: #F97316; }

.intel-feed-scroller {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 575px;
}

/* Custom Scrollbars */
.intel-feed-scroller::-webkit-scrollbar,
.actors-grid-scroller::-webkit-scrollbar,
.table-container-scroller::-webkit-scrollbar {
    width: 5px;
    height: 5px;
}

.intel-feed-scroller::-webkit-scrollbar-thumb,
.actors-grid-scroller::-webkit-scrollbar-thumb,
.table-container-scroller::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
}

.intel-feed-scroller::-webkit-scrollbar-track,
.actors-grid-scroller::-webkit-scrollbar-track,
.table-container-scroller::-webkit-scrollbar-track {
    background: transparent;
}
''')
