# Release correction: stale Intel Wire after production merge

Date: 19 November 2026. Project: YASLOGIST/yaslogist-intelligence only.
Parent main commit: 24788cc94307fc0bdd20b70f31fb8c192b89a163.

## Incident

A returning browser showed the old 'intercepted reports' layout, no
LOGISTICS filter or source status rail, and clipped ~24px cards despite
the production host serving updated HTML/JS/CSS. The old PWA service
worker was cache-first for page navigations: it could continue serving
cached HTML while online, hiding all subsequently published features.

Separately, offline browser testing found an ES module cache mismatch:
app.js imports acid-squares-bg.js without a query string, while the
PWA shell only cached acid-squares-bg.js?v=20. Offline app startup could
stay in the 'loading committed intelligence' state.

## Remediation

- Bump service-worker shell to yaslogist-v12-shell.
- Fetch the current HTML first on navigation with cache:no-store; update
  the cached offline index only after successful HTML response. Offline
  failures fall back to the last cached page. Online 404s remain 404s.
- When migrating from cache-first worker versions v7-v11, attempt one
  scoped refresh of existing dashboard windows after claiming clients.
  Clean installs are not forcibly reloaded, and no other origins or
  unrelated caches are affected.
- Include BOTH the queryless module import and the existing versioned
  module preload in the shell cache, preserving offline startup.
- Add regression tests; keep all content, data, features and other repos.

## Executed tests

Full local npm run ci: 112/112 pass, 0 failed, security scan clean,
local static surface 427.3 KB versus 1024 KB budget.

Four headless Playwright browser scenarios with deliberately seeded
stale HTML in Cache Storage before online navigation, then offline
reload. All four passed without uncaught JS errors or horizontal overflow:

- Chromium 1490px desktop: online 45 reports and 146px first card;
  offline 45 reports and 127px first card.
- Chromium 390px mobile: online/offline 45 reports, 146px first card.
- WebKit 1490px desktop: online 45 reports, 128px first card;
  offline 45 reports, 127px first card.
- WebKit 390px mobile: online/offline 45 reports, 146px first card.

All online versions displayed the LOGISTICS filter and state rail,
rather than the planted stale HTML. All offline versions retained
committed public-source reports and displayed offline source status.

## Release gates

Verify GitHub-hosted Node20/22 CI and repository hygiene, Vercel
Production READY matching final merge SHA, and served sw.js v12 plus
HTML/CSS/JS/data on intelligence.yaslogist.com. Do not delete site
files, modify MX/DNS or merge with any other YASLOGIST application.
Preserve existing deployment rollback options.
