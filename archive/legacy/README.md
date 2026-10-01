# Legacy archive

Files in this directory are **not part of the running application**. They were
archived (never deleted) during the 2026-10-01 hardening pass so the repository
root only contains the live, production surface.

| Path | Why it was archived |
| :--- | :--- |
| `one-shot-scripts/*.py` | 18 single-use Python patch scripts left over from an earlier AI editing session. They mutate `styles.css` / `index.html` via string replacement, are not idempotent, and are superseded by direct source edits. Kept for historical reference only — **do not run**. |
| `dashboard.html`, `v2.html` | Byte-identical duplicates of an older `index.html` build. |
| `index.html.bak`, `original_index.html` | Manual pre-edit backups. History lives in Git. |
| `diff.txt` | A stale `git diff` capture of an old `styles.css` rewrite. |
| `test.js`, `test.py` | Abandoned one-off browser smoke scripts. `test.js` requires a `puppeteer` dependency that was never declared; `test.py` contains a hard-coded local path from the author's machine (`/Users/ah/...`). Replaced by the maintained suite under `tests/`. |
| `data/intel-seed-2026-09-09.json` | Static sample intelligence from 2026‑09‑09. Three byte-identical copies existed (`data/intel.json`, `data/intelligence.json`, `data/wire.json`); none were referenced by any code path. One copy is kept here as a data-shape example. |

Nothing in this folder is loaded by `index.html`, the pipeline, or CI.
