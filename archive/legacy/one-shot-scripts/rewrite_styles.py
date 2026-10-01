with open('styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Background transparency
content = content.replace("background-color: var(--bg-obsidian);", "background-color: transparent;")

# 2. Remove .hud-overlay-vignette
import re
content = re.sub(r'/\* Ambient Obsidian Vignette Overlay \*/\s*\.hud-overlay-vignette \{[^}]+\}', '', content)

# 3. .command-header
header_old = """.command-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 24px;
    padding: 14px 22px;
    background: rgba(10, 13, 20, 0.75);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--panel-border-gold);
    border-radius: 8px;
    box-shadow: var(--glass-shadow), 0 0 20px rgba(234, 179, 8, 0.08);
}"""
header_new = """.command-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 24px;
    padding: 14px 22px;
    background: rgba(10, 13, 20, 0.4);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.command-header:hover {
    background: rgba(10, 13, 20, 0.55);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 20px rgba(234, 179, 8, 0.1);
}"""
content = content.replace(header_old, header_new)

# 4. .glass-panel
glass_old = """.glass-panel {
    background: rgba(10, 13, 20, 0.25);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    border: 1px solid rgba(234, 179, 8, 0.15);
    border-radius: 8px;
    box-shadow: var(--glass-shadow);
    box-sizing: border-box;
    position: relative;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.glass-panel:hover {
    border-color: var(--panel-border-gold);
}"""
glass_new = """.glass-panel {
    background: rgba(10, 13, 20, 0.15);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
    position: relative;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-panel:hover {
    border-color: rgba(234, 179, 8, 0.3);
    background: rgba(10, 13, 20, 0.25);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 0 15px rgba(234, 179, 8, 0.1);
}"""
content = content.replace(glass_old, glass_new)

# 5. .nav-tab
navtab_old = """.nav-tab {
    appearance: none;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-secondary);
    padding: 8px 16px;
    border-radius: 4px;
    font-family: 'Orbitron', var(--font-headline);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.nav-tab:hover {
    background: rgba(234, 179, 8, 0.1);
    color: var(--yas-gold);
    border-color: rgba(234, 179, 8, 0.3);
}"""
navtab_new = """.nav-tab {
    appearance: none;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
    padding: 10px 20px;
    border-radius: 8px;
    font-family: 'Orbitron', var(--font-headline);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
    position: relative;
    overflow: hidden;
}

.nav-tab:hover {
    background: rgba(234, 179, 8, 0.1);
    color: var(--yas-gold);
    border-color: rgba(234, 179, 8, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(234, 179, 8, 0.15);
}"""
content = content.replace(navtab_old, navtab_new)

# 6. .kpi-card
kpicard_old = """.kpi-card {
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-left: 3px solid transparent;
}"""
kpicard_new = """.kpi-card {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-radius: 12px;
    background: rgba(10, 13, 20, 0.2);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-left: 4px solid transparent;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.kpi-card:hover {
    transform: translateY(-4px) scale(1.02);
    background: rgba(10, 13, 20, 0.35);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.05);
}"""
content = content.replace(kpicard_old, kpicard_new)

# Need to add hover border color specific to KPI types
content = content.replace("#kpi-attacks-card { border-left-color: var(--yas-crimson); }", "#kpi-attacks-card { border-left-color: var(--yas-crimson); }\n#kpi-attacks-card:hover { border-color: rgba(255,255,255,0.05); border-left-color: var(--yas-crimson); box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 20px var(--yas-crimson-wash); }")
content = content.replace("#kpi-campaigns-card { border-left-color: var(--yas-gold); }", "#kpi-campaigns-card { border-left-color: var(--yas-gold); }\n#kpi-campaigns-card:hover { border-color: rgba(255,255,255,0.05); border-left-color: var(--yas-gold); box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 20px var(--yas-gold-wash); }")
content = content.replace("#kpi-cve-card { border-left-color: var(--yas-cyan); }", "#kpi-cve-card { border-left-color: var(--yas-cyan); }\n#kpi-cve-card:hover { border-color: rgba(255,255,255,0.05); border-left-color: var(--yas-cyan); box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 20px var(--yas-cyan-wash); }")
content = content.replace("#kpi-logistics-card { border-left-color: var(--yas-crimson); }", "#kpi-logistics-card { border-left-color: var(--yas-crimson); }\n#kpi-logistics-card:hover { border-color: rgba(255,255,255,0.05); border-left-color: var(--yas-crimson); box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 20px var(--yas-crimson-wash); }")

# 7. tab-panel display
content = content.replace(".tab-panel { display: none; }", ".tab-panel { display: none !important; }")
content = content.replace(".tab-panel.active { display: block; }", ".tab-panel.active { display: block !important; }")

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(content)

