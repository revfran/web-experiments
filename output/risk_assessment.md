# Orchestrator Review — `web-experiments`
_Generated: 2026-04-05_

---

## Stage 1 — Data Acquisition

**Project:** Static site (3 HTML pages) deployed to GitHub Pages via CI/CD. No build step — files served directly from repo root. Dev tooling: plain Node HTTP server (`server.js`) + Playwright E2E tests with page object pattern.

**Stack:** HTML/CSS/vanilla JS, Open-Meteo API (weather), Leaflet.js + OpenStreetMap (map), Playwright, GitHub Actions.

---

## Stage 2 — Architecture Review

**Strengths:**
- Clean separation of concerns: static files at root, dev infra (`server.js`, `tests/`) alongside but not mixed in.
- Page object pattern with `BasePage` inheritance is well-structured.
- CI gate: tests must pass before deploy.
- Path traversal protection in `server.js:23` (`filePath.startsWith(ROOT)`).

**Concerns:**
1. `deploy.yml:62` uploads `path: '.'` — the comment says "static site files only" but the upload includes `server.js`, `tests/`, `playwright.config.js`, `CLAUDE.md`, `package.json`, `package-lock.json`, `.nvmrc` on GitHub Pages.
2. `map.html:8,77` loads Leaflet CSS and JS from unpkg CDN with no Subresource Integrity (SRI) hash.
3. No CSP headers served from `server.js` for local development.
4. Only Chromium tested in CI — no Firefox/Safari coverage.

---

## Stage 3 — QA Architecture Risk Assessment

| Severity | Finding |
|----------|---------|
| **HIGH** | `deploy.yml:62` — `path: '.'` publishes non-web files to GitHub Pages |
| **MEDIUM** | `map.html:8,77` — Leaflet CDN loaded without SRI hashes |
| **LOW** | Single-browser CI (Chromium only) |
| **LOW** | No CSP headers in `server.js` |

> HIGH risk found → revising architecture recommendation.

**Revised Architecture Finding (deploy):** The `actions/upload-pages-artifact` step should use a curated path. Since GitHub Pages needs only the HTML/CSS files at the root, the fix is to stage only those files before upload.

---

## Stage 4 — Code Review

### `deploy.yml:62` — `path: '.'` exposes internal tooling

Publishes `CLAUDE.md`, `server.js`, `package.json`, `package-lock.json`, `playwright.config.js`, and the entire `tests/` directory to the live GitHub Pages site.

```yaml
# current
path: '.'
```

### `map.html:8,77` — CDN assets without SRI

If unpkg is compromised or the package is tampered with, arbitrary JS executes in users' browsers.

```html
<!-- current — no integrity attribute -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

### `weather.html:235` — `innerHTML` with unvalidated API field

Temperature and wind speed use `Math.round()`, but humidity does not — inconsistent and slightly risky if the API returns a non-numeric value.

```js
// current — relative_humidity_2m not coerced to number before innerHTML
document.getElementById('w-humidity').innerHTML =
  `${c.relative_humidity_2m}<span class="stat-unit">%</span>`;
```

### `playwright.config.js:13` — Chromium only

No Firefox or WebKit coverage in CI.

---

## Stage 5 — QA Code Risk Assessment

| Severity | File | Line | Issue |
|----------|------|------|-------|
| **HIGH** | `deploy.yml` | 62 | Publishes non-web files to GitHub Pages |
| **MEDIUM** | `map.html` | 8, 77 | No SRI on Leaflet CDN assets |
| **LOW** | `weather.html` | 235 | `innerHTML` without `Math.round()` on humidity |
| **LOW** | `playwright.config.js` | 13 | Chromium only — no cross-browser coverage |

---

## Stage 6 — Final Report

### Priority 1 — Fix GitHub Pages upload scope `deploy.yml:62` (HIGH)

Stage only the static files before upload:

```yaml
- name: Stage static files
  run: |
    mkdir -p _site
    cp index.html weather.html map.html style.css _site/

- uses: actions/upload-pages-artifact@v3
  with:
    path: '_site'
```

### Priority 2 — Add SRI to Leaflet CDN assets `map.html:8,77` (MEDIUM)

```html
<link rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin="" />

<script
  src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
  crossorigin=""></script>
```

### Priority 3 — Consistent `Math.round()` on humidity `weather.html:235` (LOW)

```js
document.getElementById('w-humidity').innerHTML =
  `${Math.round(c.relative_humidity_2m)}<span class="stat-unit">%</span>`;
```

### Priority 4 — Expand CI browser coverage `playwright.config.js:13` (LOW)

```js
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
],
```

---

**Summary:** The most impactful fix is scoping the GitHub Pages upload to only the 4 static files — a two-line change with no functional risk. The SRI issue is worth addressing before the site gets wider use. The other two are low-effort quality improvements.
