# CLAUDE.md

## Project

Static site on GitHub Pages (`revfran/web-experiments`). **No build step** — HTML/CSS files at the root are served directly. Do not add a framework, bundler, or move files out of the root.

## Quick start

```bash
nvm use          # Node 20 (required)
npm run serve    # http://localhost:3000
npm test         # Playwright tests (server starts automatically)
```

## Pages & data files

| Page | Data file | Updated by |
|---|---|---|
| `index.html` | — | static |
| `weather.html` | open-meteo API (live) | — |
| `map.html` | — | static |
| `news.html` | `news-data.json` *(gitignored)* | `update-news.yml` daily |
| `ing.html` | `ing-plan-data.json` *(committed)* | `check-ing-plan.yml` weekly |

## Structure

```
/                        static root
  *.html / style.css
  ing-plan-data.json     committed; updated by ING workflow
scripts/
  fetch-news.mjs         RSS → news-data.json  (needs ANTHROPIC_API_KEY for summaries)
  check-ing-plan.mjs     Playwright → ing-plan-data.json
server.js                plain Node static server
playwright.config.js     testDir: tests/specs, reporter: html
tests/
  pages/                 page objects extending BasePage
  specs/                 one spec per page + screenshots.spec.js
.github/workflows/
  deploy.yml             push/PR → test → deploy
  update-news.yml        daily 06:00 UTC → fetch RSS → deploy
  check-ing-plan.yml     Monday 07:00 UTC → check ING page → deploy
```

## Testing conventions

- One page object per HTML page, all extend `BasePage`.
- Route interception uses **regex**: `/open-meteo\.com/`, `/\/news-data\.json/`, `/\/ing-plan-data\.json/`.
- `screenshots.spec.js` takes full-page desktop screenshots of every page with mocked data and attaches them to the Playwright HTML report.

## Workflows & deployment

- `deploy.yml` runs on every push/PR to `main`: tests → deploy.
- The two data workflows each fetch the other's data file from the live Pages URL before staging, so neither wipes the other's content.
- `deploy.yml` posts screenshots as an embedded PR comment via GitHub's issue assets CDN (requires `pull-requests: write`).
- Pages source in repo settings must be **GitHub Actions**, not branch.
- `ANTHROPIC_API_KEY` secret needed for AI news summaries in `update-news.yml`.

## Hard rules

- No framework or bundler.
- HTML files stay at the root.
- `news-data.json` is gitignored — never commit it.
- `node_modules` is gitignored — never commit it.
