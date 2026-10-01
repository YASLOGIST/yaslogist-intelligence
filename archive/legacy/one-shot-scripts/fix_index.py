import re

with open("index.html.bak", "r") as f:
    html = f.read()

threat_map_replacement = """            <section id="threat-map-view" class="tab-pane">
                    <!-- Map Card -->
                    <div class="card glass-panel map-panel">
                        <div class="card-header">
                            <div class="header-title-group">
                                <span class="header-icon"><i class="fa-solid fa-earth-americas text-gold"></i></span>
                                <div>
                                    <h2 class="card-title" data-i18n="mapTitle">GEOPOLITICAL & MARITIME THREAT RADAR</h2>
                                    <div class="card-subtitle" data-i18n="mapSubtitle">Tactical telemetry: Middle East & Global Maritime Trade Chokepoints</div>
                                </div>
                            </div>
                            <div class="map-controls">
                                <div class="map-legend">
                                    <span class="map-legend-item"><span class="legend-dot dot-critical"></span> <span data-i18n="legendCritical">Critical</span></span>
                                    <span class="map-legend-item"><span class="legend-dot dot-high"></span> <span data-i18n="legendHigh">High</span></span>
                                    <span class="map-legend-item"><span class="legend-dot dot-med"></span> <span data-i18n="legendMed">Medium</span></span>
                                </div>
                                <button class="btn-reset-map" id="btnResetMap">
                                    <i class="fa-solid fa-crosshairs"></i> <span data-i18n="resetView">RESET</span>
                                </button>
                            </div>
                        </div>
                        <div class="map-container-relative">
                            <div id="threat-map" class="tactical-map-viewport"></div>
                            <div class="chokepoint-status-bar">
                                <div class="cp-item">
                                    <span class="cp-dot cp-warning"></span>
                                    <span class="cp-name" data-i18n="cpSuez">SUEZ CANAL (EGY)</span>
                                    <span class="cp-state text-gold mono" data-i18n="cpSuezState">[WATCH]</span>
                                </div>
                                <div class="cp-item">
                                    <span class="cp-dot cp-critical"></span>
                                    <span class="cp-name" data-i18n="cpMandeb">BAB EL-MANDEB (RED SEA)</span>
                                    <span class="cp-state text-crimson mono" data-i18n="cpMandebState">[INTERDICTED]</span>
                                </div>
                                <div class="cp-item">
                                    <span class="cp-dot cp-warning"></span>
                                    <span class="cp-name" data-i18n="cpHormuz">STRAIT OF HORMUZ</span>
                                    <span class="cp-state text-gold mono" data-i18n="cpHormuzState">[ESCORT_REC]</span>
                                </div>
                            </div>
                        </div>
                    </div>
            </section>"""

cve_matrix_replacement = """            <section id="cve-matrix" class="tab-pane">
                <!-- LEFT: Actively Exploited CVE Defense Matrix -->
                <div class="card glass-panel cve-matrix-panel">
                    <div class="card-header">
                        <div class="header-title-group">
                            <span class="header-icon"><i class="fa-solid fa-shield-halved text-crimson"></i></span>
                            <div>
                                <h2 class="card-title" data-i18n="cveMatrixTitle">ACTIVELY EXPLOITED CVE DEFENSE MATRIX</h2>
                                <div class="card-subtitle" data-i18n="cveMatrixSubtitle">Weaponized zero-days & known exploited vulnerabilities (KEV)</div>
                            </div>
                        </div>
                        <span class="badge-intel mono text-crimson" data-i18n="mitreCveSync">CISA KEV / MITRE</span>
                    </div>
                    <div class="table-container-scroller">
                        <table class="tactical-table" id="cve-table">
                            <thead>
                                <tr>
                                    <th data-i18n="thCveId">CVE IDENTIFIER</th>
                                    <th data-i18n="thSystem">AFFECTED SYSTEM / VENDOR</th>
                                    <th data-i18n="thSeverity">SEVERITY</th>
                                    <th data-i18n="thAdvisory">TACTICAL ADVISORY</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>"""

apt_dossiers_replacement = """            <section id="apt-dossiers" class="tab-pane">
                <!-- RIGHT: Threat Actor Dossiers -->
                <div class="card glass-panel actors-dossier-panel">
                    <div class="card-header">
                        <div class="header-title-group">
                            <span class="header-icon"><i class="fa-solid fa-user-secret text-gold"></i></span>
                            <div>
                                <h2 class="card-title" data-i18n="actorsTitle">THREAT ACTOR DOSSIERS (APTs & PROXIES)</h2>
                                <div class="card-subtitle" data-i18n="actorsSubtitle">State-backed clusters, wiper collectives & hacktivists</div>
                            </div>
                        </div>
                        <div class="search-input-wrap small-search">
                            <i class="fa-solid fa-magnifying-glass search-ic"></i>
                            <input type="text" id="actor-search" placeholder="Search actor by alias, origin, target..." data-i18n-placeholder="searchActorsPlaceholder" />
                        </div>
                    </div>
                    <div class="actors-grid-scroller" id="actors-grid">
                        <!-- Populated by JS -->
                    </div>
                </div>
            </section>"""

html = re.sub(r'            <section id="threat-map-view" class="tab-pane">[\s\S]*?            </section>', threat_map_replacement, html, count=1)
html = re.sub(r'            <section id="cve-matrix" class="tab-pane">[\s\S]*?            </section>', cve_matrix_replacement, html, count=1)
html = re.sub(r'            <section id="apt-dossiers" class="tab-pane">[\s\S]*?            </section>', apt_dossiers_replacement, html, count=1)

with open("index.html", "w") as f:
    f.write(html)
