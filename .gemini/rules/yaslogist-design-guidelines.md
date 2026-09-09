# YASLOGIST Design & UI Guidelines

## Identity & Terminology
- Use technical, sovereign terminology. Examples: `YASLOGIST COMMAND INTEL GRID`, `[نظام الاستخبارات والإنذار المبكر للتهديدات]`.
- Enclose Arabic sub-system names in square brackets `[...]` to maintain a sovereign/technical aesthetic.

## Interactive Elements
- **Buttons:** Tactical buttons must include a compact `.btn-tactical` (or `btn-small`) class with reduced padding.
- Include icons (FontAwesome or SVG) to denote action or context (e.g., globe icon for language).
- **Click Effects:** Apply `transform: scale(0.97);` to the `:active` or `:hover` pseudo-classes of buttons to provide a subtle kinetic click effect.

## Layout & Glassmorphism
- **Transparency:** Glass panels and UI cards must use a low-opacity background (e.g., `rgba(10, 13, 20, 0.25)`) and low backdrop-filter blur (e.g., `blur(2px)` or up to `blur(6px)` max).
- This ensures underlying background patterns (like the `AcidSquares` webGL background) remain clearly visible through the elements.

## Tactical Mapping (Leaflet)
- **Base Maps:** Prefer dark CartoDB tile layers paired with optional Satellite imagery for switching via `L.control.layers`.
- **Paths:** Use `L.polyline` for representing sovereign navigation paths or watch paths with tactical colors.
- **Threat Markers:**
  - **Critical:** Red icon (`#EF4444`) with a pulsing animation (`L.icon.pulse`).
  - **High:** Gold/Yellow icon (`#EAB308`).
  - **Medium:** Cyan/Blue icon (`#06B6D4`).
- **Popups & Tooltips:** Must display detailed location info (Geo coordinates), exact report counts, localized tactical advisories in dual languages (English/Arabic), and explicitly use FontAwesome vector icons to denote risk status.

## Structural Layout & Tabbed Navigation
- **Module Separation:** Never stack or overlap major modules (e.g., Dashboard, Map, Intel Wire). Each module must be strictly isolated within its own `<section class="tab-panel">`.
- **CSS Enforcement:** 
  - All tab panels must be hidden by default (`.tab-panel { display: none !important; }`).
  - Only the active tab panel should be visible (`.tab-panel.active { display: block !important; }`).
- **Background Visibility:** By isolating modules to single tabs, you ensure that the `AcidSquares` WebGL background shader remains fully visible behind the active glass panel. Avoid parent wrapper backgrounds that block the `z-index: -1` canvas.
- **Leaflet Sizing:** When switching tabs that contain a Leaflet map, you must fire a dual-stage `map.invalidateSize()` timeout (e.g., at 100ms and 350ms) to ensure the tiles render correctly after the tab's CSS transition `fadeInTab` resolves.
