import re

with open('styles.css', 'r') as f:
    css = f.read()

# Refine Glassmorphism on panels
css = css.replace(
    '    background: var(--panel-bg);\n    backdrop-filter: var(--glass-blur);\n    -webkit-backdrop-filter: var(--glass-blur);\n    border: 1px solid var(--panel-border);',
    '    background: rgba(10, 13, 20, 0.65);\n    backdrop-filter: blur(12px);\n    -webkit-backdrop-filter: blur(12px);\n    border: 1px solid rgba(234, 179, 8, 0.15);'
)

# Add Navigation and Tabs Styles
nav_styles = """
/* ===================================================================
   NEW TACTICAL NAVIGATION BAR & TAB PANES
   =================================================================== */
.tactical-navbar {
    display: flex;
    gap: 12px;
    padding: 10px 16px;
    margin-bottom: 8px;
    overflow-x: auto;
}

.nav-tab {
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
}

.nav-tab.active {
    background: rgba(234, 179, 8, 0.15);
    color: var(--yas-gold);
    border-color: var(--yas-gold);
    box-shadow: var(--yas-gold-glow);
}

.hud-main-tabs {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.tab-pane {
    display: none;
}

.tab-pane.active {
    display: block;
    animation: fadeInTab 0.3s ease-out;
}

@keyframes fadeInTab {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}

"""

css = css.replace('/* Main HUD Layout Container */', nav_styles + '/* Main HUD Layout Container */')

with open('styles.css', 'w') as f:
    f.write(css)
