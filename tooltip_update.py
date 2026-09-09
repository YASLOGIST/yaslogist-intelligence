import re

with open('threat-map.js', 'r') as f:
    js = f.read()

tooltip_code = """
        // Tactical Hover Tooltip
        let tooltipIcon = '<i class="fa-solid fa-crosshairs"></i>';
        if (markerType === 'maritime') tooltipIcon = '<i class="fa-solid fa-ship" style="color:#06B6D4"></i>';
        else if (markerType === 'cyber') tooltipIcon = '<i class="fa-solid fa-microchip" style="color:#EAB308"></i>';
        else if (markerType === 'kinetic') tooltipIcon = '<i class="fa-solid fa-bomb" style="color:#EF4444"></i>';

        const tooltipText = isAr 
            ? `<strong><span class="tac-vector-icon">${tooltipIcon}</span> ${nodeName}</strong><br><span class="mono">${attacks} هجمات مؤكدة [${intensityBadgeText}]</span>`
            : `<strong><span class="tac-vector-icon">${tooltipIcon}</span> ${nodeName}</strong><br><span class="mono">${attacks} confirmed hits [${intensityBadgeText}]</span>`;

        marker.bindTooltip(tooltipText, {
            direction: 'auto',
            offset: [0, -8],
            className: 'yaslogist-tactical-tooltip',
            sticky: true
        });
"""

js = re.sub(
    r"        // Tactical Hover Tooltip.*?className: 'yaslogist-tactical-tooltip'\n        \}\);",
    tooltip_code.strip('\n'),
    js,
    flags=re.DOTALL
)

with open('threat-map.js', 'w') as f:
    f.write(js)
