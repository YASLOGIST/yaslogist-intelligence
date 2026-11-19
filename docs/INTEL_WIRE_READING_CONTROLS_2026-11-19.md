# Intel Wire — Reading & Operator Clarity Release Gate

**Date:** 19 November 2026. **Project:** YASLOGIST/yaslogist-intelligence only.
**Status:** draft, to be reviewed as part of existing PR #19; not a merge or
promotion to production. The canonical domain continues to serve main.

## What changed

- Native accessible sort select: **newest first / oldest first**, with
  per-browser preference, reversible chronology, invalid dates always last.
- Bilingual live summary: the number visible after filtering versus the
  total number of retained source reports, including zero results.
- Inline optional expansion of source excerpts where the excerpt is
  reasonably long. Expansion does **not** fetch, summarize, rewrite or
  verify the underlying article. An operator can collapse it without
  reloading the feed.
- Small bilingual source-caveat: public-source reports require independent
  verification before action. The total headline now says *public-source
  reports*, not "intercepted reports" or proven live events.
- CSS focused states, keyboard-native controls and RTL-safe wrapping.
- Rotated versioned app/CSS assets and PWA shell from v9 to v10, avoiding
  stale installed styles and source-reader scripts.
- No new external scripts, paid APIs, SQL, tracking, model-generated
  claims or changes to feeds, watchlist, all prior filters, maps or CVEs.

## Executed verification — local isolated browser and code

- Full `npm run ci` passed: **101/101 tests, zero failing**. Source syntax,
  data schema validation, security scan and source-level static integrity
  passed.
- Local surface **415.1 KiB** versus 1024 KiB budget.
- The app bundle meets its existing **152 KiB per-file threshold**
  without raising quality limits.
- Headless Chromium, isolated anonymous profiles: **desktop 1490×960**
  and **mobile 390×844**, both English and Arabic. Offline-safe local
  committed source fixture: 45 reports, with external RSS overlay
  intentionally disabled for a deterministic, source-preserving test.
- **45/45** results counted, sorted oldest/newest and reversed without
  data loss; LOGISTICS filter returned 3 relevant keyword reports and
  ALL restored 45/45 source reports.
- On both viewports, 18 long source excerpts had expandable controls;
  the test opened and closed an excerpt and asserted accessible
  `aria-expanded` and unclamped, visible text.
- Card layout remained sound: first card measured **127px desktop**,
  **170px mobile English**, **180px mobile Arabic**, never reverting
  to the prior 24px clipped flex row.
- No horizontal page overflow, no JavaScript page errors and normal
  scrollable feed in either language.

## Governance and release

This change will be appended to the existing PR #19, retaining its
unmerged scope. No deletion of project content, no production promotion
or domain/DNS changes. Source feed items and evidence are not considered
confirmed disruptions, and sorting is not a risk/confidence ranking.

Before merge, review GitHub Actions for Node 20/22 and repository hygiene,
the Vercel deployment's **exact commit**, access protection on the
preview, the existing static-data refresh workflow, and smartphone
readability. A production deploy to intelligence.yaslogist.com
requires a separately approved merge/release decision.
