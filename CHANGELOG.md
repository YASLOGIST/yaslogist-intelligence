# Changelog

All notable changes to YASLOGIST Intelligence are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.3.0] — 2026-10-02

Operator-toolkit release: the console gains a personal watchlist, background
live-sync, actor × wire fusion, shareable filtered views and a PWA install
surface. All features are bilingual (EN/AR) and covered by unit tests.

### Added

- **Operator watchlist (PINNED)** — every wire intercept carries a star toggle;
  pins persist in `localStorage` (bounded, hostile-storage safe) and surface as
  a `PINNED` filter pill with a live count, pinned-card styling, and a dedicated
  watchlist section in the exported Markdown briefing.
- **Background live sync** — the wire re-fetches every 10 minutes while the tab
  is visible; hidden tabs skip the cycle and a stale tab (≥ 10 min) refreshes on
  focus. New intercepts are announced via toast (`▲ N new intercepts since last
  sync`), never a modal. A `wire-sync-chip` in the wire header reports the last
  overlay sync time.
- **Actor × wire fusion** — every APT dossier now cross-references the live wire
  through alias matching (`actorWireActivity`): live actors get a pulsing
  `ACTIVE ON WIRE: N` chip, a 5-segment assessed threat-level meter, and a MITRE
  ATT&CK link (direct group page where the actor has one, search fallback
  otherwise). Default ordering surfaces live actors first. The Markdown briefing
  gains a "threat actors currently active on the wire" section.
- **Shareable filtered views** — wire filter state travels in the hash
  (`#wire?tag=APT&q=hormuz`); deep-link copies include it. Parser sanitizes
  hostile input (tags restricted to `A-Z0-9_-`, query stripped of markup,
  length-bounded).
- **CVE matrix tooling** — live search filter (id / vendor / advisory, EN + AR),
  CVSS mini-meters proportional to the base score, and RFC-4180-safe **CSV
  export** of the filtered matrix (`buildCveCSV`, quoted fields, CRLF rows).
- **Search-term highlighting** — wire title/summary matches are wrapped in
  `<mark class="wire-hl">` via a raw-string-offset algorithm (case-insensitive
  for Latin, exact for Arabic); everything else stays HTML-escaped.
- **NEW intercept badge** — wire items younger than 3 h carry a pulsing badge.
- **Source contribution strip** — per-feed chip row under the wire toolbar
  (reuses the previously computed but unused `wireSourceDistribution`); clicking
  a chip filters the wire by that source.
- **Global hotkeys** — the eight commands advertised in the palette
  (R/E/D/C/L/M/F/B) are now bound as real single-key shortcuts, suppressed while
  typing in inputs and while the palette is open.
- **PWA install surface** — `manifest.webmanifest` + generated app icons
  (192/512, `assets/generate-app-icon.py`, zero-dependency pure-Python PNG
  renderer producing the radar-reticle brand mark), favicon + apple-touch-icon
  links. Icons verified programmatically (structure, CRC, rounded-corner alpha).
- 20 new unit tests (`tests/operator-features.test.mjs`) covering watchlist
  flows, highlight XSS containment, hash-state round-trips and hostile input,
  CSV quoting, CVE search, and actor fusion.

### Changed

- **Honest KPI progress bars** — the four dashboard KPI bars previously held
  static decorative widths (88/92/76/95 %); they are now progressbar-role
  meters driven by real telemetry (active-country share, APT share of wire,
  peak CVSS, maritime share of wire) with bilingual tooltips.
- **Pipeline feed fix** — Reuters retired their public RSS (legacy feed 404s in
  every cycle per `meta.json`); replaced with the stable Google News RSS mirror
  of their Middle East coverage. Per-feed isolation keeps the cycle safe either
  way.
- `data-i18n-title` translation attribute support; language toggle now re-renders
  every new dynamic element (source strip, sync chip, watchlist counts).
- Perf budget deliberately revised for the larger planned surface: `app.js`
  126→145 KB, `styles.css` 130→136 KB, manifest + 192 px icon added to the local
  surface (headroom tightened from ~17 % to ~7 %).

### Verified

- `npm run ci` — all gates green (76/76 tests, 5/5 artifacts, budget, security scan).
- New-intercept toast, PINNED filtering, highlight markup, and actor chips
  exercised headlessly through the DOM stub; XSS attempts through the search
  term, hash query, and pinned-id storage all neutralized by tests.

## [1.2.0] — 2026-10-01

Branding & documentation release: data-honest animated social card, whitepaper README.

### Added

- **Animated OG card** `assets/og-image-animated.gif` (1200×630, 40 frames × 90 ms, ~308 KB)
  — tactical HUD design with radar sweep + blips, scrolling wire, DEFCON band meter,
  CVSS exposure bar, 14-day sparkline, live ECG heartbeat and system clock.
  **Data-honest by construction**: the renderer reads the same committed JSON the app
  serves (45 real wire titles, real peak CVE-2026-67367 at CVSS 9.2, real timeline
  counts), so the card can never advertise fabricated intel. Latin typography only
  (offline PIL build without Arabic shaping — deliberate, documented).
- **OG renderer** `assets/generate-og-image.py` (PIL-only, fully offline) with static
  fallback `assets/og-image.png`; regenerate post-ingest via `npm run card`.
  Rendering note recorded in-source: PIL `ImageDraw` does not alpha-blend —
  translucent elements are composited through RGBA overlays.
- **Full OG/Twitter meta block** in `index.html`: absolute GitHub Pages URLs
  (crawlers fail on relative `og:image`), GIF primary + PNG fallback entries with
  `og:image:type|width|height|alt`, `summary_large_image` Twitter card, `og:url`.

### Changed

- **README rewritten as a technical whitepaper**: hero with the animated card,
  Abstract, numbered chapters — System Architecture (design doctrine, data-plane
  Mermaid, runtime sequence diagram, trust-boundary table), Feature Matrix (capability
  × module × data path × verification × status), Core Workflows (ingestion cycle,
  browser boot, operator loop, CI gate, card regeneration), Tech Stack (per-layer
  rationale), Intelligence Dataset, Security & Integrity, Bilingual, Quick Start,
  Repository Map, **Verification Ledger** (measured gate results, no estimates).
- `package.json` version → 1.2.0; new `card` script.

### Verified

- Renderer output inspected frame-by-frame (frame 0/10/25): no text collisions,
  shared 128-colour palette (no playback flicker), clock/sweep/cursor/meter animate.
- `npm run ci` — all gates green (56/56 tests, 5/5 artifacts, budget, 33-file scan).

## [1.1.0] — 2026-10-01

Full audit, hardening and capability upgrade. See `docs/AUDIT-2026-10.md` for the
ranked findings and `docs/ARCHITECTURE.md` for the reconstructed specification.

### Added

- **Honest telemetry everywhere**: KPI trends now compute from real 7d-vs-prior-7d windows
  (per-country `previous` + `deltaPct` in `target_intensity.json`), APT share-of-wire,
  peak CVSS, and maritime posture thresholds. Placeholder chart states are labelled
  `AWAITING TELEMETRY`. No invented figures remain in the UI.
- **Provenance manifest** `data/meta.json` — generation time, per-feed health, artefact
  counts; footer shows real pipeline age with fresh/warn/critical stale states.
- **Signal timeline** `data/signal_timeline.json` (14-day UTC buckets, merged across
  cycles) + brand-styled sparkline in the Smart Briefing with honest week-over-week delta.
- **CVE matrix controls**: severity filter pills, CVSS column, CVSS/severity sort toggle,
  empty-state row; default sort by CVSS desc.
- **Deep links & persistence**: tabs map to `#dashboard|map|wire|cves|actors` hashes with
  browser-history awareness; language, active tab and wire filter persist in localStorage;
  command palette gained *Copy deep link* and *Export Markdown briefing* commands.
- **Markdown briefing export** for operator hand-off (risk index, DEFCON, top CVEs, wire
  snapshot, country intensity — fully data-derived).
- **Motion system**: reveal-on-scroll (IntersectionObserver), staggered wire cards,
  skeleton loading shimmer, KPI count-up — all transform/opacity and all suppressed by
  `prefers-reduced-motion`.
- **WebGL resilience + budget**: rolling 90-frame FPS watchdog steps the shader down
  (DPR 2→1.5→1, steps 32→24→16→8) and finally freezes to a static frame; reduced-motion
  users get a static frame by default.
- **Security hardening**: restrictive CSP meta; Chart.js pinned to 4.4.7 with SRI
  (verified against the npm tarball); FontAwesome SRI; `object-src 'none'`, `form-action 'none'`.
- **Accessibility**: WAI-ARIA tablist with roving tabindex and RTL-aware arrow/Home/End
  navigation, skip link, localized nav `aria-label`, labelled canvases and inputs,
  focus-visible styling on the operator console.
- **Pipeline resilience**: bounded retries with exponential backoff + jitter (transient
  errors only), order-preserving concurrency pool for CVE enrichment (3 lanes), wire
  items schema-sanitized before write, empty cycles keep the previous wire.
- **Test suite (56 assertions, zero dependencies)**: pipeline unit tests, headless app
  integration flows (XSS containment, Arabic search, DEFCON derivation, CVE sorting),
  i18n parity/coverage, artefact schema, static-integrity checks.
- **CI**: `.github/workflows/ci.yml` (Node 20/22 matrix: syntax, tests, data schema,
  perf budget, security scan + repo hygiene); ingest workflow now validates artefacts
  before committing.
- **Performance budget** `perf-budget.json` enforced by `scripts/perf-budget.cjs`
  (local surface measured at 589 KB of a 1 MiB cap).
- `CHANGELOG.md`, `docs/ARCHITECTURE.md`, `docs/AUDIT-2026-10.md`.

### Changed

- **DEFCON readout** now resolves correct localized strings for all five levels
  (previously levels 4/5 displayed the DEFCON 3 text).
- **Sector chart** ("Targeted Infrastructure Sectors") now counts real wire signals via a
  deterministic keyword classifier instead of a static demo dataset.
- **Dedupe** keeps the newest duplicate and uses Unicode-aware keys — Arabic-language
  reports are no longer dropped by the pipeline or the UI.
- **Wire search** matches Arabic titles/summaries too (previously EN-only).
- **Offline badge** is localized and restores correctly across language switches.
- **Tile attribution** is enabled (Esri/Leaflet ToS compliance) with a compact branded chip.
- **Logo payload** −94%: 1723×1723 @ 266 KB → optimized 128×128 @ 15.7 KB rendered asset
  (original preserved in `assets/`).
- `app.js` split into a testable module (class/dict exports, opt-out bootstrap).
- README updated; stale references removed.

### Fixed

- `setDefconLevel` wrong-string bug for DEFCON 4/5.
- `safeURL('')` resolving to the page itself.
- Unicode dedupe-key data loss for non-Latin titles.
- `cockpitEngineMeta` i18n key defined but never wired to the DOM.
- Command palette index resolution simplified; selected-item edge cases removed.
- Live `test.js`/`test.py` referenced undeclared deps & a hard-coded local path — archived.

### Security

- CSP meta, SRI + exact-version pinning for all external scripts, CI secret/sink scanner,
  keep `escapeHTML`/`safeURL` contract under test.

## [1.0.0] — 2026-09

Initial public dashboard (pre-audit baseline, commit `aa96544`).
