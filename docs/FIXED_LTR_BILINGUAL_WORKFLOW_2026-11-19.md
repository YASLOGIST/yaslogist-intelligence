# YASLOGIST Intelligence — bilingual fixed-layout and evidence workflow

Date: 19 November 2026.
Scope: YASLOGIST/yaslogist-intelligence, building on Draft PR #22.
Production: No merge or production deployment authorized for this change.

## Product contract

Switching the interface between English and Arabic changes labels, dates,
text blocks, ARIA descriptions, placeholders and data-derived labels only.
The whole site retains an LTR visual layout: the five tabs, top bar, card
positions, filters, toolbars and actions are never mirrored. Individual
search inputs use dir=auto so that Arabic search phrases read correctly
without moving their containers or icons.

Technical identifiers (CVE, CVSS, MITRE), proper actor names and publisher
names stay source-identifiable. Original English publisher headlines and
abstracts are not falsely shown as translated content. The Arabic interface
explicitly marks original English content as untranslated, pending genuine
licensed, reviewable translation. This is a provenance restriction.

## Added and improved

1. The existing language switcher always retains html dir=ltr and updates
   html lang. Added a small versioned stylesheet with stable slots for
   navigation and workspace tools; header height is stable between
   languages on phone screens.
2. A complete bilingual command palette: keyboard guidance, search
   placeholder, empty state, eight existing command names, dialog and
   launcher ARIA labels. Original callbacks and keyboard shortcuts remain.
3. More Arabic screen-reader labels for search, filters, status and controls.
   Arabic text is bidi-correct inside its original LTR layout.
4. A compact Copy evidence brief tool shared by the five workspaces.
   Its output is from committed reports, observed CVEs, reference actor
   cards and optional source responsiveness, with the actual publication
   date formatted in Cairo time. It explicitly rejects any claim that
   source observations confirm incidents or shipment delays.
5. New versioned PWA shell with all extra module and CSS assets cached,
   including explicit per-file and total performance-budget accounting.

## Safety and release invariants

No lost sources, reports, source attribution, exports, maps, bookmarks,
watchlists, alerts or other YASLOGIST projects. No external paid API,
new source or invented risk inference. Rejected PR #21 stays unmerged,
and production intelligence.yaslogist.com remains on the stable mainline.

Verification requires all five tabs across Chromium desktop and WebKit
phone, both languages, unchanged LTR visual order and x/y positions,
no horizontal overflow, localized operator commands, functional evidence
copy and offline source reports. After successful local CI, verify
GitHub Node20/22, repository hygiene and exact-commit Vercel preview
before any eventual mainline review.

## Executed acceptance — local computer

- Full Node.js 24 CI: 131/131 automated tests, data validation,
  source integrity, per-file performance ceilings and security scan clean.
- Chromium desktop 1490x960 and WebKit mobile 390x844, each using a
  clean browser profile, both languages across all five existing tabs.
- Header, tab positions and common toolbar x/y bounds were identical
  between EN and AR. Nav sequence stays LTR. On desktop the tab x-coordinates
  were 35, 192, 349, 506 and 663. On mobile they were 15, 140, 265, 390
  and 515 (the last tabs can be accessed using the horizontal tab scroller).
- On the phone both language modes used exactly 306px header height;
  previous reflows (301px versus 265px) were eliminated.
- 45 committed public-source reports, 8 CVEs and 12 actor reference
  cards retained and available in all panel views.
- Arabic and English operator command-palette labels, help, search and
  empty states; local Copy evidence brief action, genuine counts, Cairo
  publication timestamp, and no misleading incident truth claims.
- PWA shell v17 includes new locale module and fixed-layout CSS (23
  cached resources). After a simulated offline reload the 45 committed
  reports remain available with Arabic content UI and LTR layout.
- Zero horizontal viewport overflow and zero in-app uncaught JavaScript
  errors. During simulated offline WebKit registered 10 failures to load
  external CDNs (fonts, icons, map/chart assets); these were explicitly
  separated from application exceptions and did not prevent offline
  report reading or the operator interface.
- No change to original external publisher prose; English originals
  remain marked as untranslated when displaying Arabic UI. Licensed
  content translation would require a separately verified data source.

Release remains Draft PR #22 only, without a production merge.
