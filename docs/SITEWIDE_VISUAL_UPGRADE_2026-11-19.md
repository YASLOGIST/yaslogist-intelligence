# YASLOGIST Intelligence — all-five-panel interface upgrade

**19 November 2026 | Review branch only**
Repository: YASLOGIST/yaslogist-intelligence
Base production main: 8e87797472f1f4b86b5cb23210706f615395b89a

## Brief and scope

Preserve the original dark navy/cyan/gold technical brand and all five
independent panels. The prior wire-only redesign Draft PR #21 remains
unmerged and is NOT the basis for this upgrade. No connection to
Disruption Intelligence or any other project, no deletion of source
reports, capabilities or old files. No new sources, paid APIs, backend,
confident incident labels or shipment tracking claims.

## Visible differences

- Operations: clearly readable 29–39px KPI figures, stronger value/
  subtext hierarchy, source health grid, charts and progress bars.
- Threat Map: grouped map legend, reset/zoom controls, clarified
  reference context, contained canvas and preserved Leaflet layers.
- Intel Wire: deliberately simple single-column reading cards,
  improved 14–16px headlines, existing search/filter/source buttons,
  watchlist and status panels retained; no giant masthead or grid.
- CVE Matrix: better filters/search, sticky high-contrast table header,
  lightly striped rows, clear severity badges and horizontal table
  scroll on narrow screens; all five columns retained.
- APT Dossiers: wider and clearer contextual cards with reference/
  current-match caveats, clear tags, search and responsive columns.

## New genuinely usable tools

- Slim workspace position label 01/05–05/05, tracking active tab.
- Comfortable vs compact reading-density button, stored locally.
- Copy the URL for the currently open tab; English/Arabic feedback.
- Displayed-record counters for CVE and APT search, not verified attacks.
- Accessible focus rings, concise hover and tab transitions; reduced
  motion respected. No new canvas, shader or external dependency.

## Measured comparison at 1490px desktop

| Component | Before main | New preview |
| --- | ---: | ---: |
| KPI card height | 126px | 147px |
| Threat map viewport | 710px | 653px, more usable controls |
| Intel Wire first card | 127px | 154px |
| CVE table height | 401px | 504px |
| APT card width | 338px | 450px |
| APT card height | 193px | 228px |
| Horizontal overflow | 0px | 0px |

Mobile width 390px: KPI cards become two columns, while APT and Wire
remain one column. CVE retains horizontal table scrolling.

## Actual local verification

- Node.js 24 full CI: 122/122 tests passed; data schema checks,
  source syntax, security scan and performance budgets passed.
- Static local surface 451.6 KiB / 1024 KiB; new CSS 17.9 KiB /
  20 KiB; new UI script 5.2 KiB / 8 KiB.
- Chromium desktop (1490x960), WebKit mobile (390x844): five tabs
  remain operational, 0px page overflow and no unexpected app errors.
- 45 committed intelligence items preserved, keyword filter 3,
  and ALL restores 45. CVE initial 8 and APT initial 12; both
  searches filter and restore correctly.
- Density switch updates layout and persisted state. Copy URL
  copied a real #cves link. Arabic translation of the tools passed.
- Existing Leaflet map initialized and reset/legend controls remained.
- New CSS/JS included in 20-entry v14 PWA shell; offline reload
  retained all 12 reference profiles and workspace controls.
- Offline WebKit logged expected third-party CDN loading failures
  (fonts/icons/Leaflet/Chart.js). No claim of complete offline
  availability for external dependencies.

## Evidence, preview and promotion constraints

Owner's Mac audit contains before/after captures of all five
panels, interactive browser test log, QA and CI records.

Do not merge to main or promote to the custom production domain until
the review branch preview is explicitly accepted. Verify Vercel READY
and CI Node20/22 and hygiene on the exact final commit.
