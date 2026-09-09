import re

with open('styles.css', 'r') as f:
    css = f.read()

# Make background of map and table transparent to not block AcidSquares
css = css.replace('background: #090c12;', 'background: transparent;')
css = css.replace('background: #090c12 !important;', 'background: transparent !important;')
css = css.replace('background: #0d1117;', 'background: rgba(13, 17, 23, 0.4); backdrop-filter: blur(4px);')

# Upgrade glass panels
css = css.replace('background: rgba(10, 13, 20, 0.15);', 'background: rgba(10, 13, 20, 0.1);')
css = css.replace('backdrop-filter: blur(8px);', 'backdrop-filter: blur(12px);')

# command-header redesign in css
css = re.sub(r'\.command-header\s*\{[^}]+\}', '''\.command-header {
    display: grid;
    grid-template-columns: auto auto auto;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    padding: 16px 28px;
    background: rgba(10, 13, 20, 0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
    transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}''', css)

css = re.sub(r'\.command-header:hover\s*\{[^}]+\}', '''\.command-header:hover {
    background: rgba(10, 13, 20, 0.2);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4), 0 0 30px rgba(234, 179, 8, 0.12);
}''', css)

# upgrade transitions everywhere
# replace `transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);` with `transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);`
css = css.replace('transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);', 'transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);')

# Upgrade hovers for nav-tab
css = re.sub(r'\.nav-tab:hover\s*\{[^}]+\}', '''\.nav-tab:hover {
    background: rgba(234, 179, 8, 0.15);
    color: var(--yas-gold);
    border-color: rgba(234, 179, 8, 0.4);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 24px rgba(234, 179, 8, 0.2);
}''', css)

# Upgrade hovers for kpi-card
css = re.sub(r'\.kpi-card:hover\s*\{[^}]+\}', '''\.kpi-card:hover {
    transform: translateY(-5px) scale(1.02);
    background: rgba(10, 13, 20, 0.25);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 24px rgba(255, 255, 255, 0.08);
}''', css)

# Fix KPI card specific hovers
css = re.sub(r'#kpi-attacks-card:hover\s*\{[^}]+\}', '''#kpi-attacks-card:hover { border-color: rgba(239, 68, 68, 0.4); border-left-color: var(--yas-crimson); box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 30px var(--yas-crimson-wash); }''', css)
css = re.sub(r'#kpi-campaigns-card:hover\s*\{[^}]+\}', '''#kpi-campaigns-card:hover { border-color: rgba(234, 179, 8, 0.4); border-left-color: var(--yas-gold); box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 30px var(--yas-gold-wash); }''', css)
css = re.sub(r'#kpi-cve-card:hover\s*\{[^}]+\}', '''#kpi-cve-card:hover { border-color: rgba(6, 182, 212, 0.4); border-left-color: var(--yas-cyan); box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 30px var(--yas-cyan-wash); }''', css)
css = re.sub(r'#kpi-logistics-card:hover\s*\{[^}]+\}', '''#kpi-logistics-card:hover { border-color: rgba(239, 68, 68, 0.4); border-left-color: var(--yas-crimson); box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 30px var(--yas-crimson-wash); }''', css)

# Make actor cards smoother
css = re.sub(r'\.actor-dossier-card:hover\s*\{[^}]+\}', '''\.actor-dossier-card:hover {
    border-color: rgba(234, 179, 8, 0.5);
    transform: translateY(-3px) scale(1.01);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(234, 179, 8, 0.15);
}''', css)

# Make wire item smoother
css = re.sub(r'\.wire-item:hover\s*\{[^}]+\}', '''\.wire-item:hover {
    transform: translateX(4px) scale(1.01);
    border-color: rgba(234, 179, 8, 0.5);
    background: rgba(22, 30, 42, 0.85);
    box-shadow: 0 4px 15px rgba(234, 179, 8, 0.1);
}''', css)

with open('styles.css', 'w') as f:
    f.write(css)

