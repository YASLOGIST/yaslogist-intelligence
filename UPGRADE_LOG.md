# YASLOGIST Upgrade Log

**Execution:** 2026-10-02 · autonomous INVENT + UPGRADE
**Audience:** intelligence, security, and maritime operations analysts
**Direction:** replace decorative dashboard density with a measured command surface that keeps evidence provenance visible.

## Shipped

- Added an explainable **Evidence Vector** to the decision brief: cyber pressure, maritime exposure, and signal recency are rendered as a data-backed triangular vector with exact supporting counts.
- Reworked the decision brief's signal list into three compact evidence channels with localized labels, progress tracks, and supporting detail.
- Re-authored the native WebGL2 substrate as a quiet cartographic field: orthographic grid, analytical orbits, vector rays, vignette, and pointer-local parallax. It remains a single fullscreen triangle with no textures or fragment loops.
- Applied a restrained command-surface visual pass: stronger grouping, reduced glow and blur, squared operational geometry, clearer tab hierarchy, and responsive header behavior.
- Preserved bilingual rendering, source provenance, map/wire/CVE/actor workflows, watchlist state, offline behavior, CSP/SRI contracts, and deterministic teardown.

## Verification

- `npm test` — **81 passed**
- `npm run check` — **passed**
- `npm run validate:data` — **5 artefacts valid**
- `npm run budget` — **all budgets green; 407.9 KB local surface / 1 MB budget**
- `npm run scan` — **clean across tracked files**
- `git diff --check` — **clean**

## Performance notes

- WebGL remains demand-driven: it submits no recurring frames while idle.
- No new runtime dependency, network request, texture, render target, or animation timer was introduced.
- Evidence Vector uses one small inline SVG and updates only when evidence state or language changes.
