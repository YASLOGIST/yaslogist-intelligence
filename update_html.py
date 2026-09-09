import re

with open('index.html', 'r') as f:
    content = f.read()

# Insert Nav Bar
nav_html = """
        <!-- Tactical Navigation Bar -->
        <nav class="tactical-navbar glass-panel">
            <button class="nav-tab active" data-target="dashboard" data-i18n="navDashboard">Dashboard</button>
            <button class="nav-tab" data-target="threat-map-view" data-i18n="navThreatMap">Threat Map</button>
            <button class="nav-tab" data-target="intel-wire" data-i18n="navIntelWire">Intel Wire</button>
            <button class="nav-tab" data-target="cve-matrix" data-i18n="navCveMatrix">CVE Matrix</button>
            <button class="nav-tab" data-target="apt-dossiers" data-i18n="navAptDossiers">APT Dossiers</button>
        </nav>

        <!-- 2. Main Tabbed Layout -->
        <main class="hud-main-tabs">
"""

content = content.replace('<!-- 2. Main High-Density Layout -->\n        <main class="hud-main-grid">', nav_html)

# Now wrap sections
# Dashboard: KPI strip and vectors
content = content.replace('<!-- TOP KPI STRIP (4 CARDS) -->', '<section id="dashboard" class="tab-pane active">\n            <!-- TOP KPI STRIP (4 CARDS) -->')

# End Dashboard before Map Card
content = content.replace('<!-- MID SECTION (65% / 35% GRID) -->', '')
content = content.replace('<section class="mid-section-grid">', '')
content = content.replace('<div class="mid-left-column">', '')

# Threat Map View
content = content.replace('<!-- Map Card -->', 
'''            <div class="vectors-row-grid">
                <!-- moved vectors here if needed, or leave vectors in dashboard -->
            </div>
        </section>

        <section id="threat-map-view" class="tab-pane">
            <!-- Map Card -->''')

# Now wait, the vector chart is AFTER Map Card currently.
pass
