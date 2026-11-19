# YASLOGIST Intelligence — independent site upgrade and domain release review

**Date:** 19 November 2026. **Scope:** YASLOGIST/yaslogist-intelligence only.
**Safety:** no project merger, no file deletion, no data deletion, no change to
YASLOGIST's primary DNS records or mail configuration. Do not replace or
disable existing GitHub Pages and Vercel addresses.

## Confirmed identity and DNS

- Canonical: https://intelligence.yaslogist.com/
- Existing production repository: https://github.com/YASLOGIST/yaslogist-intelligence
- Vercel project: prj_TKst8e9iqEbQP4mK2nQRUzaZT5mS
- Custom domain attached to that project and returned verified=true.
- HTTPS GET / and /data/meta.json responded HTTP 200, TLS verification OK.
- Previous https://yaslogist-intelligence.vercel.app and
  https://yaslogist.github.io/yaslogist-intelligence/ remain present.

## Upgrade scope (review branch; do not claim production has these features yet)

1. Add an **optional** LOGISTICS KEYWORDS filter to the existing wire.
   It uses explicit keyword matching and never alters or deletes reports,
   fabricates delayed shipments, or auto-verifies incidents. All existing
   filters, source telemetry, exports, watchlists, CVE matrix, map and
   offline PWA behaviour are retained.
2. Mark original English feed headlines in the Arabic interface as
   *not translated*, rather than presenting duplicate text as real Arabic.
   Explicit left-to-right direction for English title text within RTL
   layout prevents punctuation and link-order confusion.
3. Extend the regional pipeline and map configuration for Saudi Arabia,
   with conservative source-text mention matching. This does **not**
   imply verified incidents or live shipments, and the published
   target_intensity.json remains the original seven-country snapshot
   until the next legitimate data ingestion/release cycle.
4. Publish canonical metadata, Open Graph and Twitter image URLs using
   the verified custom subdomain. Add robots.txt and sitemap.xml.
   Set primary README console links and kinetic README health monitoring
   to the canonical URL while keeping GitHub Pages as a documented fallback.
5. Bump the service-worker cache generation to v8 and version the
   changed application/map/style assets so prior cached shells can
   transition without retaining the old UI.
6. Expand automated tests for domain SEO, preserved PWA assets, KSA
   display metadata, optional filters and honest bilingual source copy.

## Verified test evidence

- Node.js 24: complete npm run ci (syntax, unit tests, data schema,
  size budget, security lint): **93/93 pass**.
- Total budgeted static local surface: **409.1 KiB** (limit: 1024 KiB).
- Static source scan: clean across **42** tracked files at test time.
- Headless Chromium, isolated browser contexts:
  - desktop 1440px: 45 committed articles available initially;
    keyword filter returned a subset; all articles remained available;
    Arabic original-source labels present; no horizontal overflow.
  - mobile 390px: full wire and keyword subset available, Arabic
    source labels present, no horizontal overflow.
  - Both browser runs had no JavaScript page errors.
  - A first browser run encountered a **test state isolation flaw**:
    shared localStorage carried the previous device's selected filter.
    Each viewport was subsequently given a fresh browser context;
    the corrected QA passed.
- These tests do not prove source accuracy, stable third-party RSS
  availability, real translation, or Google indexing.

## Deployment/approval gates

The custom domain already serves the old stable mainline and was not
repointed. The upgrade should be staged as a private/non-production
branch preview for review. Before merging and rolling production:
- Check the exact preview Git commit, Chromium screenshots and build.
- Review analytics/CSP, theme contrast, source feed restrictions and
  device responsiveness; rerun CI on the final merge candidate.
- Do not claim that the extra KSA country is live until a valid
  pipeline artefact includes Saudi Arabia and metadata counts reconcile.
- Any real Arabic translation service must be licensed, source-
  attributed, reviewable and optional; no translation was fabricated.
- Keep GitHub Pages, custom domain and Vercel deployments in a safe,
  reversible configuration; no force-push and no deletion.

## Suggested future improvements (not falsely marked completed)

- Add verified, licensed port, transport and cyber data sources for
  Egypt and Saudi Arabia with feed health and incident-level provenance.
- Separate country *mention volume* from independently verified events
  and from operational shipment exposure.
- Provide reviewed Arabic translations with a visible original-language
  toggle; do not machine-translate into fabricated confidence.
- Benchmark FPS, rendering, TTFB, LCP and accessibility on low-end
  mobile devices; adjust shader and map quality with measured evidence.
- Measure source-latency, search retention and error rates under
  explicit privacy and data-retention rules.
