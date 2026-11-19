# Sitewide upgrade: mobile CVE reading cards and compact workspace

19 November 2026. Supplement to Draft PR #22, not a separate product,
not a production deployment and not a cross-project integration.

## Why

The existing review already improved all five sections, but a phone screenshot
showed a large two-row workspace utility bar and a wide CVE table that
hid advisory text behind horizontal scrolling. This follow-up restores
mobile information density without reintroducing the complex Intel Wire
two-column concept from unmerged PR #21.

## Implemented

- On 680px-and-narrower screens, the original five-column CVE table remains
  the actual source of truth, with no data transformation or altered sorting.
  Rows are visually presented as individually readable cards, with the
  CVE, vendor/system, severity, CVSS meter and advisory all visible.
  Each existing column heading retains explicit scope=col for semantics.
- Labels have localized Arabic versions; the same reference links,
  filter pipeline, CSV export and severity values are retained.
- Shared view utilities fit in a compact mobile row; accessible native
  buttons remain and have visible "VIEW" / "LINK" (Arabic: عرض / رابط)
  fallback labels if a third-party icon font fails.
- Full desktop table unchanged. Mobile styles are isolated to mobile-cve.css
  and versioned in the PWA v15 offline shell.
- Both the original sitewide CSS budget and a separate 4 KiB mobile CSS
  budget are measured. No extra paid API, animation or application loop.

## Measured browser acceptance

Tests were run from an isolated local HTTP server using original committed
data, with optional third-party requests blocked only in the QA harness.

- Chromium desktop 1490x960: all five panels accessible, CVE table remains
  native, workspace ribbon 54px, no horizontal page overflow.
- Chromium mobile 390x844: all five panels functional, CVE first card
  measures about 238px with five original data cells, workspace ribbon
  52px, no horizontal page overflow.
- WebKit mobile 390x844: same results, plus RTL Arabic layout, working CVE
  severity filtering, compact-density preference and all five panels.
- All three browser runs had zero uncaught application JavaScript errors.
  Threat-map external dependencies were intentionally excluded from this
  *local isolation* test; previous Draft PR #22 browser evidence includes
  external map initialization.
- The base Draft PR #22 also contains complete five-panel desktop/mobile
  before/after screenshots and CI/functional evidence.

## Release hold

The feature branch remains a Draft PR for inspection, separate from the
production site. Do not delete PR #21 or any old files. Do not merge until
visual acceptance. Verify that the review branch contains the latest
committed data from main, that Node20/22 CI and Vercel preview succeed on
the exact final commit, and that no DNS, API billing, production release
or other project was changed.
