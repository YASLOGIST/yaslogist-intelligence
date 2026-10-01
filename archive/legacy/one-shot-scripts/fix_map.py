import re

with open('threat-map.js', 'r') as f:
    js = f.read()

# Replace the Basemaps block
new_basemaps = '''        // Basemaps (Sovereign Cyberpunk Radar View)
        const darkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: 'CartoDB DarkMatter'
        });
        
        darkMatter.addTo(this.map);

        this.corridorsLayer = L.layerGroup().addTo(this.map);
        this.markersLayer = L.layerGroup().addTo(this.map);

        // Remove layer control as we only want one highly stylistic map
'''

js = re.sub(
    r'// Basemaps.*?// Layer control.*?addTo\(this\.map\);',
    new_basemaps,
    js,
    flags=re.DOTALL
)

with open('threat-map.js', 'w') as f:
    f.write(js)
