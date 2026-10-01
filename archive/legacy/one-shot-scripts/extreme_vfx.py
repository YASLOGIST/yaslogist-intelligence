import re

with open('styles.css', 'r') as f:
    css = f.read()

# 1. Extreme 3D map
css = re.sub(
    r'\.map-container-relative \{.*?\n\}',
    '''.map-container-relative {
    position: relative;
    width: 100%;
    min-height: 70vh;
    height: calc(100vh - 280px);
    border-radius: 16px;
    overflow: hidden;
    perspective: 1500px;
    transform-style: preserve-3d;
    box-shadow: 0 0 30px rgba(6, 182, 212, 0.4), inset 0 0 50px rgba(168, 85, 247, 0.2);
    border: 2px solid rgba(6, 182, 212, 0.5);
}''',
    css, flags=re.DOTALL
)

css = re.sub(
    r'\.tactical-map-viewport \{.*?\n\}',
    '''.tactical-map-viewport {
    width: 100%;
    height: 100%;
    background: #000;
    transform: rotateX(25deg) scale(1.15) translateY(-2%);
    transform-origin: center top;
    box-shadow: inset 0 0 100px rgba(6, 182, 212, 0.6), inset 0 0 40px rgba(168, 85, 247, 0.4);
    border-radius: 20px;
    filter: contrast(1.2) saturate(1.5) hue-rotate(5deg);
    position: relative;
}
.tactical-map-viewport::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
    background-size: 100% 4px, 3px 100%;
    pointer-events: none;
    z-index: 1000;
}
''',
    css, flags=re.DOTALL
)

# 2. Futuristic Tables & Cards
css = re.sub(
    r'\.glass-panel \{.*?\n\}',
    '''.glass-panel {
    background: linear-gradient(135deg, rgba(5, 8, 15, 0.8) 0%, rgba(10, 15, 25, 0.6) 100%);
    backdrop-filter: blur(20px) saturate(200%);
    -webkit-backdrop-filter: blur(20px) saturate(200%);
    border: 1px solid rgba(6, 182, 212, 0.4);
    border-radius: 12px;
    box-shadow: 
        inset 0 0 20px rgba(6, 182, 212, 0.15),
        inset 0 0 10px rgba(168, 85, 247, 0.1),
        0 0 25px rgba(6, 182, 212, 0.2),
        0 8px 32px 0 rgba(0, 0, 0, 0.8);
    position: relative;
    transition: all 0.4s ease;
    overflow: hidden;
}
.glass-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(6, 182, 212, 0.03) 2px,
        rgba(6, 182, 212, 0.03) 4px
    );
    pointer-events: none;
    z-index: 0;
}
''',
    css, flags=re.DOTALL
)

# 3. Ambient Neon Data Lines
css += '''
/* Cyberpunk Neon Scanlines & Holographic Overlays */
body::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: 
        radial-gradient(circle at 15% 50%, rgba(6, 182, 212, 0.08), transparent 40%),
        radial-gradient(circle at 85% 30%, rgba(234, 179, 8, 0.08), transparent 40%),
        radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.08), transparent 40%);
    pointer-events: none;
    z-index: -1;
}

body::after {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(180deg, rgba(6, 182, 212, 0) 0%, rgba(6, 182, 212, 0.05) 50%, rgba(6, 182, 212, 0) 100%);
    background-size: 100% 8px;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.3;
    animation: scanline 8s linear infinite;
}

@keyframes scanline {
    0% { transform: translateY(-100vh); }
    100% { transform: translateY(100vh); }
}

/* Futuristic Table Overhauls */
.tactical-table {
    border-collapse: separate;
    border-spacing: 0 8px;
    width: 100%;
}
.tactical-table thead th {
    background: rgba(6, 182, 212, 0.15);
    color: #06B6D4;
    text-shadow: 0 0 8px rgba(6, 182, 212, 0.8);
    border-bottom: 2px solid #06B6D4;
    font-family: 'Orbitron', sans-serif;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 12px;
}
.tactical-table tbody tr {
    background: rgba(10, 15, 25, 0.8);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5), inset 0 0 5px rgba(239, 68, 68, 0.2);
    transition: all 0.3s;
}
.tactical-table tbody tr:hover {
    transform: scale(1.01) translateX(5px);
    background: rgba(239, 68, 68, 0.1);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.3);
    border-left: 4px solid #EF4444;
}

/* Extreme Glowing UI for Actors / Wire */
.actor-card, .wire-item {
    background: linear-gradient(180deg, rgba(16, 20, 30, 0.9), rgba(5, 8, 12, 0.95));
    border: 1px solid rgba(234, 179, 8, 0.3);
    box-shadow: inset 0 0 15px rgba(234, 179, 8, 0.05), 0 4px 10px rgba(0,0,0,0.8);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
}
.actor-card::before, .wire-item::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: skewX(-20deg);
    transition: 0.5s;
}
.actor-card:hover::before, .wire-item:hover::before {
    left: 150%;
}
.actor-card:hover {
    border-color: var(--yas-gold);
    box-shadow: 0 0 20px rgba(234, 179, 8, 0.4), inset 0 0 20px rgba(234, 179, 8, 0.2);
}
.wire-item:hover {
    border-color: var(--yas-cyan);
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(6, 182, 212, 0.2);
}
'''

with open('styles.css', 'w') as f:
    f.write(css)

print("Styles updated with extreme VFX.")
