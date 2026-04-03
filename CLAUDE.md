# CLAUDE.md

## Project

Static site served on GitHub Pages (`revfran/web-experiments`). No build step — the HTML/CSS files at the root are served directly. Do not introduce a build tool or move files out of the root.

## Commands

```bash
npm run serve        # start local server at http://localhost:3000
npm test             # run Playwright tests (starts server automatically)
npm run test:ui      # Playwright UI mode
```

Node version: 20 (see `.nvmrc`). Run `nvm use` before anything else.

## Structure

```
/                    # static site root (served as-is by GitHub Pages)
  index.html
  weather.html
  map.html
  style.css
server.js            # plain Node http server, no framework, serves the root
playwright.config.js # testDir: tests/specs, baseURL: http://localhost:3000
tests/
  pages/             # page objects — one per HTML page, all extend BasePage
  specs/             # one spec file per HTML page
.github/workflows/
  deploy.yml         # test → deploy pipeline
```

## Testing conventions

- One page object per HTML page, extending `BasePage` (shared nav/header/footer locators).
- Route interception uses **regex**, not glob — e.g. `/open-meteo\.com/` not `**/open-meteo.com/**`.
- The `webServer` in `playwright.config.js` starts `server.js` automatically; no need to start it manually before running tests.

## Deployment

Merges to `main` run tests and deploy to GitHub Pages via `actions/deploy-pages`. The Pages source in repo settings must be set to **GitHub Actions**, not branch.

## What to avoid

- Do not add a framework or bundler.
- Do not move HTML files into a subdirectory — GitHub Pages serves from the root.
- Do not add `node_modules` to git (it is gitignored via the standard Node `.gitignore`).
