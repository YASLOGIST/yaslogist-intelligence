# Intelligence Wire readability regression — 19 November 2026

**Scope:** YASLOGIST Intelligence PR #19 only. No merge, data deletion, other
project coupling, production promotion or change to custom-domain DNS.

## Reported symptom

At 1490×1024, 50 intelligence reports appeared as narrow 24 px strips,
with titles and summaries clipped even though the news feed was scrollable.
The screenshot from the user showed the exact defect.

## Confirmed root cause

The constrained `.intel-feed-scroller` is a vertical flex layout. Its direct
`.wire-item` children retained the default `flex-shrink: 1`. Chromium
therefore squeezed each item to 24 px while its true content scrollHeight
was 95 px. `overflow:hidden` on the card cut off the actual article.

## Minimal change

- Add `flex: 0 0 auto` and `min-height: max-content` to direct card rules.
- Raise the compact title/summary sizes and spacing slightly without
  changing the layout's style, filtering logic, data, theme, or other tabs.
- Bump the stylesheet URL version from 23 to 24 and the PWA shell cache
  from v8 to v9 to avoid old style retention by service workers.
- Add two structural regression tests to prevent future flex shrinking.

## Actual browser verification (headless Chromium, live local UI, 50 reports)

| Measure | Broken desktop | Fixed desktop | Fixed mobile |
| --- | --- | --- | --- |
| First card rendered height | 24px | 127px | 167–177px |
| First card content scrollHeight | 95px | 125px | 165–175px |
| Flex shrink | 1 | 0 | 0 |
| Can scroll to final report | not checked in baseline | yes | yes |
| Horizontal document overflow | not checked | none | none |
| Arabic RTL and English | baseline English | both pass | both pass |
| Full wire after optional filter | not checked | 50/50 retained | 50/50 retained |

All 50 source items remain available and the LOGISTICS keyword view remains
optional. The wire scrollbar still navigates to its last item, and all
headline/summary content is laid out within the article card boundaries.

A first pass of the *test script* attempted an animated scroll to the
bottom on mobile and asserted before scroll settling. After changing the
test to use explicit instant scrolling and wait for layout, both viewports
passed. No application code change was needed for that test adjustment.

## Automated gates

`npm run ci`: 95/95 tests passed; production static-local surface 409.3KiB
(1024KiB cap); security scan clean across 44 tracked files. No browser
JavaScript errors in English/Arabic; all existing source reports and
security properties preserved.

This is a layout patch atop **Draft PR #19**, not a production deployment.
Use the updated branch preview for review and keep the custom domain on the
previous stable release until merge/promotion is separately authorized.
