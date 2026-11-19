# YASLOGIST Intelligence — final five-panel visual refinement

Date: 19 November 2026
Repo: YASLOGIST/yaslogist-intelligence
Base production main before release: ca84e7098a76bd7202379b2a5e2437bbc74b35da
Change stream: existing Draft PR #22
Rejected design: PR #21 remains separate and is not merged.

## Scope, without changing the established product identity

Keep the original dark YASLOGIST palette, public-source provenance labels,
five navigation tabs, single-column Intel Wire, fixed left-to-right screen
geometry for Arabic and English, existing CVE/APT/Map/Operations workflows,
local evidence brief, and compact-versus-comfortable reading controls.

This final polish consists of a single versioned ~5.3 KiB stylesheet:
- Header: very subdued technical hairline / corner treatment. No motion.
- Navigation: a restrained amber active tab treatment and stable focus.
- Workspace: gentle cool gradient and legible current-view name.
- Operations: quiet cyan edge glow on KPI/chart surfaces and progress
  containers without modifying their numeric inputs or rendering code.
- Map: pointer-transparent, light corner-registration lines and clearer
  hover feedback for its existing reset control. No change to map data,
  map position, layer placement or geographic claim.
- Intel Wire: data-state-driven cards use existing publication/fetch/view
  status color only; bookmarked reports get an amber paper edge; keyboard
  focus is visible. No manufactured severity or fake live state.
- CVE Matrix: focus indication for the table; original severity badges,
  sort, search and CSV remain untouched.
- APT Dossiers: gently lit amber reading surface and keyboard focus.
  No altered actor attribution or added fictional sightings.
- Motion / cost: no new app JavaScript, timer, background rendering,
  infinite animation, WebGL, external fonts, paid service or network call.
  Prefers-reduced-motion is explicitly honored.

## Acceptance evidence

The final accepted source fixture still includes 45 committed public
reports, 8 CVEs and 12 actor reference profiles. No source record is
deleted or substituted.

Local browser comparison of the same source commit with the final CSS
disabled vs enabled demonstrates actual computed-gradient changes and
screenshots. Chromium desktop at 1490x960 and WebKit mobile at 390x844
both visited all five tabs in both languages (20 panel checks); all
showed no horizontal page overflow. The root direction and navigation
remained LTR, including logical tab coordinates when the narrow-screen
tab row was scrolled to its fifth tab. The header stayed the same height
and the interactive evidence brief still generated the committed data
counts. The decorative Map layer is pointer-transparent. Service worker
v18 caches all local CSS and language assets (24 shell entries).

Full Node.js 24 local CI (syntax, tests, provenance schema, budget,
security) and GitHub Actions Node.js 20/22 plus hygiene must pass on the
exact final PR commit before merger. A production deployment must be
verified separately after the merge; successful Preview build alone
does not constitute successful live domain publication.

## Release and rollback rules

- Save original production main SHA (above) and its Vercel deployment ID.
- Merge PR #22 only after remote checks and ready deployment.
- Confirm the production Vercel deployment is tied to new main SHA.
- Confirm HTTPS 200 at https://intelligence.yaslogist.com/, new
  visual-finishing.css?v=1 is loaded, no login redirect on production,
  all key JSON artifacts available, and mobile/Arabic layout.
- Preserve this report and screenshot/QA evidence under the user's
  Documents/YASLOGIST-Audits/Intelligence directory.
- On release failure, report explicit rollback decision; no unrelated
  repository deletion, no DNS or billing changes.

## Final local evidence

- Node.js 24 complete CI: **134/134 passed**, zero failures.
- Provenance/data validation: passed; security scan clean (67 tracked files).
- Visual stylesheet size 5.3 KiB of 8 KiB per-file budget.
- Total static surface 477.3 KiB of 1024 KiB budget.
- Local Chromium desktop and WebKit mobile: all 20 tab-language cases
  passed, including retained counts 45/8/12, zero viewport overflow,
  stable LTR layout, data-grounded evidence brief, and PWA v18 shell
  with 24 cached entries including the visual stylesheet.
- APT before/after comparisons show the expected new gradient without
  changing header geometry, and the map's decorative overlay is
  pointer-transparent.
- All evidence snapshots are archived outside the Git checkout.
