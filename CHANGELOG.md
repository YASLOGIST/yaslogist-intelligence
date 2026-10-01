# Changelog

All notable changes to YASLOGIST Intelligence are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
