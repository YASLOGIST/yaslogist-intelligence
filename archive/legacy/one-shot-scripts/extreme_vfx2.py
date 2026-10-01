with open('styles.css', 'r') as f:
    css = f.read()

# Make sure we don't duplicate
if '/* EXTREME FUTURISTIC OVERRIDES */' not in css:
    css += '''

/* ===================================================================
   EXTREME FUTURISTIC OVERRIDES
   =================================================================== */

/* Master Background & Holographic Scanlines */
body {
    background: #020408 !important;
}

body::after {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.1),
        rgba(0, 0, 0, 0.1) 1px,
        transparent 1px,
        transparent 2px
    );
    pointer-events: none;
    z-index: 9999;
}

/* Data Lines Overlay */
.hud-container::before {
    content: '';
    position: fixed;
    top: -50%; left: -50%; right: -50%; bottom: -50%;
    background: 
        linear-gradient(45deg, transparent 40%, rgba(6, 182, 212, 0.05) 45%, rgba(6, 182, 212, 0.15) 50%, rgba(6, 182, 212, 0.05) 55%, transparent 60%),
        linear-gradient(-45deg, transparent 40%, rgba(168, 85, 247, 0.05) 45%, rgba(168, 85, 247, 0.15) 50%, rgba(168, 85, 247, 0.05) 55%, transparent 60%),
        linear-gradient(90deg, transparent 45%, rgba(234, 179, 8, 0.03) 50%, transparent 55%);
    background-size: 200vw 200vh;
    animation: neon-sweep 15s linear infinite;
    pointer-events: none;
    z-index: 0;
}

@keyframes neon-sweep {
    0% { background-position: 0 0; }
    100% { background-position: 100vw 100vh; }
}

/* INTEL WIRE OVERHAUL */
.intel-wire-panel {
    background: rgba(10, 15, 25, 0.6) !important;
    border: 2px solid rgba(239, 68, 68, 0.6) !important;
    box-shadow: 0 0 40px rgba(239, 68, 68, 0.2), inset 0 0 20px rgba(239, 68, 68, 0.1) !important;
}

.wire-item {
    background: linear-gradient(90deg, rgba(239,68,68,0.05) 0%, rgba(10,15,25,0.8) 100%) !important;
    border-left: 4px solid var(--yas-crimson) !important;
    border-top: 1px solid rgba(239, 68, 68, 0.3) !important;
    border-bottom: 1px solid rgba(239, 68, 68, 0.3) !important;
    border-right: none !important;
    transform: perspective(500px) rotateY(-2deg);
    transition: all 0.3s ease-out;
}

.wire-item:hover {
    transform: perspective(500px) rotateY(0deg) scale(1.02) translateX(10px);
    background: linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(10,15,25,0.95) 100%) !important;
    box-shadow: 0 0 25px rgba(239, 68, 68, 0.4) !important;
}

.wire-time {
    color: var(--yas-crimson) !important;
    text-shadow: 0 0 8px var(--yas-crimson) !important;
}

/* CVE MATRIX OVERHAUL */
.cve-matrix-panel {
    background: rgba(5, 10, 15, 0.8) !important;
    border: 2px solid rgba(6, 182, 212, 0.6) !important;
    box-shadow: 0 0 40px rgba(6, 182, 212, 0.2), inset 0 0 20px rgba(6, 182, 212, 0.1) !important;
}

.tactical-table {
    border-collapse: separate !important;
    border-spacing: 0 6px !important;
}

.tactical-table thead th {
    background: rgba(6, 182, 212, 0.1) !important;
    color: #0ff !important;
    border-bottom: 2px solid #0ff !important;
    text-shadow: 0 0 10px #0ff !important;
    font-size: 14px !important;
}

.tactical-table tbody tr {
    background: linear-gradient(90deg, rgba(6, 182, 212, 0.05), transparent) !important;
    border: 1px solid rgba(6, 182, 212, 0.2) !important;
    transition: all 0.2s !important;
}

.tactical-table tbody tr:hover {
    background: linear-gradient(90deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05)) !important;
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.4) !important;
    transform: scale(1.01) !important;
}

.cve-id-cell {
    color: #0ff !important;
    text-shadow: 0 0 8px #0ff !important;
}

/* APT DOSSIERS OVERHAUL */
.actors-dossier-panel {
    background: rgba(15, 10, 5, 0.8) !important;
    border: 2px solid rgba(234, 179, 8, 0.6) !important;
    box-shadow: 0 0 40px rgba(234, 179, 8, 0.2), inset 0 0 20px rgba(234, 179, 8, 0.1) !important;
}

.actor-card {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.05) 0%, rgba(10, 10, 10, 0.9) 100%) !important;
    border: 1px solid rgba(234, 179, 8, 0.4) !important;
    box-shadow: 0 0 15px rgba(234, 179, 8, 0.1) !important;
    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}

.actor-card:hover {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(20, 15, 5, 0.9) 100%) !important;
    box-shadow: 0 0 25px rgba(234, 179, 8, 0.4), inset 0 0 15px rgba(234, 179, 8, 0.2) !important;
    border-color: #EAB308 !important;
    transform: translateY(-5px) scale(1.03) !important;
}

.actor-name {
    color: #EAB308 !important;
    text-shadow: 0 0 10px #EAB308 !important;
}

.actor-origin-badge {
    background: rgba(234, 179, 8, 0.2) !important;
    border: 1px solid #EAB308 !important;
    color: #fff !important;
}

/* Tactical Tags Filter Holographic Effect */
.filter-pill {
    background: rgba(0,0,0,0.5) !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    position: relative;
    overflow: hidden;
}
.filter-pill::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: 0.4s;
}
.filter-pill:hover::before {
    left: 100%;
}
.filter-pill.active {
    background: rgba(255,255,255,0.1) !important;
    box-shadow: 0 0 15px rgba(255,255,255,0.5) !important;
    border-color: #fff !important;
}

/* Ensure Tabs Match */
.nav-tab {
    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}
'''

with open('styles.css', 'w') as f:
    f.write(css)

print("Added Extreme Overrides")
