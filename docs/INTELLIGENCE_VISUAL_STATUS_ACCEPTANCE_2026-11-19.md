# Intelligence Visual Status — independent review gate

**19 November 2026 · YASLOGIST Intelligence only · Draft PR #19**

This is a user-visible *explanatory* visual enhancement, not a new feed
provider, incident truth classifier, GPS/AIS tracking connection, or real-time
shipment alert. It does not merge with any other YASLOGIST application.
It does not delete any reports or existing site features.

## Why this matters

The original wire showed a single green overlay check indicator and small
source chips, but three materially different concepts were easy to confuse:
publication time for the committed data, responsiveness of optional
browser-side RSS proxy fetches, and an operator's local report filters.
A green indicator on an attempted check (even when every optional fetch
failed) also risked overstating data health.

## Exactly what changed

- **Published snapshot:** source `data/meta.json.generatedAt`, not the date
  of an individual reported incident. Green/teal means younger than 5 hours;
  amber means 5–24 hours; coral means at least 24 hours; gray means invalid,
  missing or significantly future-skewed publication timestamp. The 5-hour
  threshold is a cautious display condition for a nominal 2-hour pipeline,
  not a source-quality or safety assessment.
- **Optional source check:** based only on the latest completed browser
  overlay check. Shows *x/5 responding* where 5 is the actual number of
  configured browser-side feeds (separate from the 7 background ingestion
  sources). Colors separate all responding, partial, none, never checked,
  and offline. "Responding" **never** means independently verified news.
  The top overlay chip no longer marks 0/5 or partial runs as fully synced.
- **Wire view:** shows all/filtered/watchlist mode and the count of currently
  visible results, derived from the existing client filtering. Clicking a
  source chip produces a visible selected border and proper `aria-pressed`
  state. Pinned news retains its existing star and gains a restrained
  static accent.
- **Bilingual and accessible:** actual status text in Arabic and English,
  semantic group label and readable small-screen layout; red/amber/green
  are never the sole form of meaning. No continuous status animation,
  canvas, WebGL, polling or paid API is added.
- **Small extracted helper:** deterministic classifications are isolated
  in `lib/wire-visual-state.js` with direct unit coverage. The new module is
  included in the offline PWA shell and total performance-budget accounting
  rather than omitted from the size calculation. Existing bundle file
  thresholds have not been raised.
- CSS/JS asset revisions are cache-busted; offline shell version moves to
  `yaslogist-v11-shell` without removing any source artifact or user data.

## Results actually observed

Local Node.js 24, macOS, temporary clone. Full `npm run ci`:
**107 passed / 0 failed**. Data validation and security scan passed.
`app.js` **151.7 KiB / 152 KiB** limit, new source-state helper
**6.1 KiB / 10 KiB** limit, total static surface **426.2 KiB / 1024 KiB**.

Headless Chromium on isolated desktop **1490×960** and phone **390×844**,
using original 45 committed reports plus synthetic-only metadata and
proxy responses:

- Desktop: "Published 2h ago", optional browser overlay 3/5 responding,
  all 45 reports, 127px first card.
- Phone: "Published 35h ago" (stale), optional browser overlay 0/5,
  45 reports retained, 146px first card.
- Both: optional LOGISTICS filter 3 results, single-source selection
  `aria-pressed=true`, pinned watchlist of 1, Arabic RTL text/state,
  offline/online state changes, no page errors and 0px horizontal overflow.
- Separate offline PWA cold/warm rehearsal: new source-state helper
  cached in 17-file service-worker shell; offline reload displayed the
  45 committed reports with an honest "offline" browser-feed status.
- Initial synthetic cross-origin proxy fixture returned 0/5 even when
  expected 3/5 due to omitted CORS response headers. Corrected **test
  fixture only**, reran both viewports successfully. No production
  dependency or app behaviour changed in that correction.

The tests do not measure genuine external feed availability, publication
accuracy, incident veracity, or page rendering on every old device. The
colors express **data state, not threat level or verified shipment impact**.

## Release gate

No file or repository deletion. No merge into `main`. No production release
or DNS update. Use the refreshed Vercel preview attached to Draft PR #19
for acceptance, then require an explicit mainline promotion decision.
Check GitHub Actions Node 20/22 and repository hygiene before any release.
Keep `https://intelligence.yaslogist.com/` on its stable main deployment
until separately authorized.
