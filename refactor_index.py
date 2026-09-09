import re

with open('index.html', 'r') as f:
    content = f.read()

# Extract the header and footer
header_match = re.search(r'(.*?<!-- 2\. Main High-Density Layout -->\n)', content, re.DOTALL)
footer_match = re.search(r'(        <!-- Command HUD Footer -->.*)', content, re.DOTALL)

# Extract blocks
kpi_match = re.search(r'(            <!-- TOP KPI STRIP \(4 CARDS\) -->.*?            </section>)', content, re.DOTALL)
map_match = re.search(r'(                    <!-- Map Card -->.*?                    </div>\n)', content, re.DOTALL)
vectors_match = re.search(r'(                    <!-- Attack Vector Doughnut & Sector Telemetry -->.*?                    </div>\n                </div>)', content, re.DOTALL)
wire_match = re.search(r'(                <!-- RIGHT COLUMN \(35%\): Live Intelligence Wire -->.*?                    </div>\n                </div>)', content, re.DOTALL)
cve_match = re.search(r'(                <!-- LEFT: Actively Exploited CVE Defense Matrix -->.*?                </div>\n)', content, re.DOTALL)
actors_match = re.search(r'(                <!-- RIGHT: Threat Actor Dossiers -->.*?                </div>\n)', content, re.DOTALL)

# Build new HTML
nav_html = """
        <!-- Tactical Navigation Bar -->
        <nav class="tactical-navbar glass-panel">
            <button class="nav-tab active" data-target="dashboard" data-i18n="navDashboard">DASHBOARD</button>
            <button class="nav-tab" data-target="threat-map-view" data-i18n="navThreatMap">THREAT MAP</button>
            <button class="nav-tab" data-target="intel-wire" data-i18n="navIntelWire">INTEL WIRE</button>
            <button class="nav-tab" data-target="cve-matrix" data-i18n="navCveMatrix">CVE MATRIX</button>
            <button class="nav-tab" data-target="apt-dossiers" data-i18n="navAptDossiers">APT DOSSIERS</button>
        </nav>

        <main class="hud-main-tabs">
"""

# Reconstruct vectors (remove closing div from mid-left-column)
vectors_html = vectors_match.group(1).replace('                    </div>\n                </div>', '                    </div>')
wire_html = wire_match.group(1).replace('                <!-- RIGHT COLUMN (35%): Live Intelligence Wire -->\n                <div class="mid-right-column">\n', '').replace('                </div>', '')

new_content = header_match.group(1) + nav_html + \
    '            <section id="dashboard" class="tab-pane active">\n' + \
    kpi_match.group(1) + '\n' + \
    vectors_html + '\n' + \
    '            </section>\n\n' + \
    '            <section id="threat-map-view" class="tab-pane">\n' + \
    map_match.group(1) + \
    '            </section>\n\n' + \
    '            <section id="intel-wire" class="tab-pane">\n' + \
    wire_match.group(1) + '\n' + \
    '            </section>\n\n' + \
    '            <section id="cve-matrix" class="tab-pane">\n' + \
    cve_match.group(1) + \
    '            </section>\n\n' + \
    '            <section id="apt-dossiers" class="tab-pane">\n' + \
    actors_match.group(1) + \
    '            </section>\n' + \
    '        </main>\n\n' + \
    footer_match.group(1)

with open('index.html', 'w') as f:
    f.write(new_content)
