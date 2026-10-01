import re

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. html background transparent
css = re.sub(r'html\s*\{[^}]*background-color:\s*var\(--bg-obsidian\);[^}]*\}', 
             'html {\n    width: 100%;\n    min-height: 100vh;\n    background-color: transparent;\n}', css)

# 2. Remove .hud-overlay-vignette
css = re.sub(r'/\*\s*Ambient Obsidian Vignette Overlay\s*\*/\s*\.hud-overlay-vignette\s*\{[^}]*\}\s*', '', css)

# 3. .glass-panel improvements
css = re.sub(r'\.glass-panel\s*\{[^}]*\}', 
             '''.glass-panel {
    background: rgba(10, 13, 20, 0.15);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
    position: relative;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}''', css)

css = re.sub(r'\.glass-panel:hover\s*\{[^}]*\}',
             '''.glass-panel:hover {
    border-color: rgba(234, 179, 8, 0.3);
    background: rgba(10, 13, 20, 0.25);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 0 15px rgba(234, 179, 8, 0.1);
}''', css)

# 4. .command-header improvements
css = re.sub(r'\.command-header\s*\{[^}]*\}',
             '''.command-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 24px;
    padding: 14px 22px;
    background: rgba(10, 13, 20, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.command-header:hover {
    background: rgba(10, 13, 20, 0.45);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 20px rgba(234, 179, 8, 0.1);
}''', css)


# 5. .nav-tab improvements
css = re.sub(r'\.nav-tab\s*\{[^}]*\}',
             '''.nav-tab {
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
}''', css)

css = re.sub(r'\.nav-tab:hover\s*\{[^}]*\}',
             '''.nav-tab:hover {
    background: rgba(234, 179, 8, 0.1);
    color: var(--yas-gold);
    border-color: rgba(234, 179, 8, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(234, 179, 8, 0.15);
}''', css)

# 6. .kpi-card improvements
css = re.sub(r'\.kpi-card\s*\{[^}]*\}',
             '''.kpi-card {
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
}''', css)

# Fix missing hover states for KPI cards to preserve border color
css = re.sub(r'#kpi-logistics-card\s*\{\s*border-left-color:\s*var\(--yas-crimson\);\s*\}',
             '''#kpi-logistics-card { border-left-color: var(--yas-crimson); }
#kpi-attacks-card:hover { border-color: rgba(255,255,255,0.05); border-left-color: var(--yas-crimson); box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 20px var(--yas-crimson-wash); }
#kpi-campaigns-card:hover { border-color: rgba(255,255,255,0.05); border-left-color: var(--yas-gold); box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 20px var(--yas-gold-wash); }
#kpi-cve-card:hover { border-color: rgba(255,255,255,0.05); border-left-color: var(--yas-cyan); box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 20px var(--yas-cyan-wash); }
#kpi-logistics-card:hover { border-color: rgba(255,255,255,0.05); border-left-color: var(--yas-crimson); box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 20px var(--yas-crimson-wash); }''', css)

# 7. Button hover transitions
css = re.sub(r'\.btn-refresh\s*\{([^}]*transition:[^}]*)\}', lambda m: '.btn-refresh {' + re.sub(r'transition:[^;]+;', 'transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);', m.group(1)) + '}', css)
css = re.sub(r'\.btn-refresh:hover\s*\{[^}]*\}',
             '''.btn-refresh:hover {
    background: rgba(234, 179, 8, 0.15);
    border-color: var(--yas-gold);
    color: var(--yas-gold);
    transform: rotate(180deg) scale(1.1);
    box-shadow: 0 0 15px rgba(234, 179, 8, 0.2);
}''', css)

# 8. .tab-panel fixes
css = re.sub(r'\.tab-panel\s*\{\s*display:\s*none;\s*\}', '.tab-panel { display: none !important; }', css)
css = re.sub(r'\.tab-panel\.active\s*\{\s*display:\s*block;\s*\}', '.tab-panel.active { display: block !important; }', css)

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

