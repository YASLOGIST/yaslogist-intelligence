import re

# 1. READ INDEX.HTML
with open('index.html', 'r') as f:
    html = f.read()

# Remove hud-main-tabs entirely, just promote its children
html = re.sub(r'<main class="hud-main-tabs">\s*(.*?)\s*</main>', r'\1', html, flags=re.DOTALL)

# Write back index.html
with open('index.html', 'w') as f:
    f.write(html)

# 2. READ STYLES.CSS
with open('styles.css', 'r') as f:
    css = f.read()

# Strip out hud-main-tabs entirely
css = re.sub(r'\.hud-main-tabs\s*\{[^}]*\}', '', css, flags=re.DOTALL)

# The user asked to remove all legacy CSS grid rules that force multiple panels to show at once.
# This means ANY class that uses `display: grid;` and forces columns?
# Let's just forcefully remove .mid-left-column, .mid-right-column, etc.
# Actually, wait. Are there grid templates?
css = re.sub(r'\.mid-left-column\s*\{[^}]*\}', '', css, flags=re.DOTALL)
css = re.sub(r'\.mid-right-column\s*\{[^}]*\}', '', css, flags=re.DOTALL)
css = re.sub(r'\.bottom-grid\s*\{[^}]*\}', '', css, flags=re.DOTALL)

# Ensure the .tab-panel rules are exactly what user asked
css = re.sub(r'\.tab-panel\s*\{[^}]*\}', '.tab-panel { display: none; }', css, flags=re.DOTALL)
css = re.sub(r'\.tab-panel\.active\s*\{[^}]*\}', '.tab-panel.active { display: block; }', css, flags=re.DOTALL)

# Write back styles.css
with open('styles.css', 'w') as f:
    f.write(css)

