# YASLOGIST Intelligence — Editorial Wire redesign

Date: 19 November 2026
Scope: YASLOGIST/yaslogist-intelligence only
Base: main 8e87797472f1f4b86b5cb23210706f615395b89a
Release status: review preview / NOT merged to main or Production

## User-visible change, rather than a technical-only update

The previous Intel Wire was a dense single-column engineering log. The
review version turns it into an information-reading view while retaining
YASLOGIST's dark technical identity, source attribution and modest
runtime requirements.

- The Intelligence Wire masthead is substantially larger, with a
  distinct icon and calm cyan/gold accents.
- The search bar is more legible, with larger filter targets and clearer
  selected states. The existing LOGISTICS, APT, MARITIME, RANSOMWARE,
  ZERO-DAY, DDoS, ALL and PINNED filters are preserved.
- Three factual state cards have visible information hierarchy; their
  colors indicate publication freshness, optional fetch responsiveness
  and local viewing mode, NOT verified event severity.
- Source buttons are larger and preserve selection / aria-pressed.
- Desktop: a featured-width first **source report** and two-column
  subsequent report cards. This is layout prominence, NOT a security
  importance, severity or verification rank. Changing chronological
  order changes which report is first.
- Headlines, excerpts, sources, relative dates, tags, action buttons
  and watchlist star are more readable. Hover and keyboard focus styles
  are restrained; there are no new WebGL animations or background loops.
- Mobile / small desktops: one-column report list and touch-friendly
  horizontally scrolling tag options. Arabic switches textual content
  and search icon direction without changing the fundamental site layout.
- Adds a 16.2 KiB local versioned stylesheet, with explicit file and
  total performance budgets. Cached offline in PWA shell v13. No
  additional JavaScript bundle or paid dependency.
- No new external feeds, fabricated translations, threat scores,
  AI-generated incident confirmations or removal of old data.

## Measured visual difference

Same 45 committed report records and same local headless test viewport:

| Metric | main before | review redesign |
| --- | ---: | ---: |
| desktop 1490px first article height | 127px | 206px |
| desktop first headline font size | 13.5px | 27px |
| desktop Intelli-Wire header height | 60px | 118px |
| desktop subsequent report layout | 1 column | 2 columns |
| desktop second / third cards on same row | no | yes |
| mobile 390px first article height | 146px | 241px |
| mobile subsequent report layout | 1 column | 1 column |
| horizontal page overflow | 0px | 0px |

The actual screenshots are kept in the user's Mac audit record,
including before/after and scrolled report-grid English/Arabic captures.

## Automated and browser gates

Full CI will be run on the exact staged commit; expected checks include
source syntax, data schema, static integrity, local surface budget,
security scan, and explicit visual-layout assertions.

Browser acceptance to be recorded in the audit:
- Chromium desktop 1490px: full-width first report + two-column grid.
- WebKit desktop 1490px: same.
- WebKit mobile 390px: one column, no horizontal overflow.
- All above: Arabic and English, sorting, filters and 45/45 restoration,
  watchlist, source attribution, scrolling to final report.
- New CSS cached in active PWA shell and reports accessible offline.
- No new uncaught JS errors when online.
  WebKit may record expected font or CDN load failures while simulated
  offline: these do not imply a site crash or source report loss.

## Release constraint

Preserve all existing files, data, tabs and versions. Publish only a
protected Vercel preview linked to a Draft PR. No production promotion
or domain/DNS modification until visually approved by the user.
