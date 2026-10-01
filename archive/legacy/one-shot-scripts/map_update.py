import re

with open('threat-map.js', 'r') as f:
    js = f.read()

layer_setup = """
        // Basemaps
        const darkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd'
        });
        
        const satelliteIntel = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
        });
        
        darkMatter.addTo(this.map);
        
        L.control.layers({
            'Tactical Dark': darkMatter,
            'Satellite Intel': satelliteIntel
        }).addTo(this.map);
"""

js = re.sub(
    r"        // CartoDB Dark Matter Basemap Tiles.*?}\)\.addTo\(this\.map\);",
    layer_setup.strip('\n'),
    js,
    flags=re.DOTALL
)

vfx_code = """
        let markerType = 'kinetic';
        let iconHtml = '';
        
        // Determine Threat-Specific VFX Marker
        if (nodeMeta.type.includes('maritime')) {
            markerType = 'maritime';
            colorHex = '#06B6D4'; // Cyan
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
        } else if (nodeMeta.type.includes('cyber') || nodeMeta.vectorsEn.join(' ').toLowerCase().includes('cyber') || nodeMeta.vectorsEn.join(' ').toLowerCase().includes('apt') || nodeMeta.vectorsEn.join(' ').toLowerCase().includes('ransomware') || nodeMeta.type === 'state_nexus') {
            markerType = 'cyber';
            colorHex = '#EAB308'; // Gold
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
        } else {
            markerType = 'kinetic';
            colorHex = '#EF4444'; // Crimson
            iconHtml = `
                <div class="radar-node node-kinetic" style="
                    --node-color: ${colorHex};
                    --pulse-duration: ${pulseSpeed};
                    width: ${markerDiameter}px;
                    height: ${markerDiameter}px;
                ">
                    <div class="kinetic-beacon"></div>
                    <div class="radar-center-dot"></div>
                </div>
            `;
        }

        const customIcon = L.divIcon({
            className: 'tactical-radar-marker',
            html: iconHtml,
            iconSize: [markerDiameter, markerDiameter],
            iconAnchor: [markerDiameter / 2, markerDiameter / 2]
        });
"""

js = re.sub(
    r"        // Build HTML for dynamic concentric pulse rings.*?iconAnchor: \[markerDiameter / 2, markerDiameter / 2\]\n        \}\);",
    vfx_code.strip('\n'),
    js,
    flags=re.DOTALL
)

with open('threat-map.js', 'w') as f:
    f.write(js)
