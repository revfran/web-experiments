# AGENTS.md

## Repo at a glance

Static site (`revfran/web-experiments`) on GitHub Pages. Pure HTML/CSS — no framework, no build step. Two background workflows keep data files fresh; the main `deploy.yml` runs tests and deploys on every merge to `main`.

## Before you write any code

1. `nvm use` — must be Node 20.
2. `npm run serve` to preview at `http://localhost:3000`.
3. `npm test` to run the full Playwright suite (server starts automatically).

## Key constraints

- All HTML files live at the **repo root**. GitHub Pages serves from there.
- `news-data.json` is **gitignored** — generate it locally with `node scripts/fetch-news.mjs`.
- `ing-plan-data.json` is **committed** — initial value is in the repo.
- No bundler, no transpilation, no `node_modules` in git.

## Adding a new page

1. Create `mypage.html` at the root.
2. Add a nav link in every existing `*.html` file.
3. Add a page object `tests/pages/MyPage.js` extending `BasePage`.
4. Add a spec `tests/specs/mypage.spec.js`.
5. Add a screenshot test case in `tests/specs/screenshots.spec.js`.
6. Add `mypage.html` to the `cp` command in **all three** workflow staging steps (`deploy.yml`, `update-news.yml`, `check-ing-plan.yml`).

## Workflow invariant

`update-daily.yml` is the single data workflow. It must stage **all** HTML pages and **both** data files. Both data steps run with `continue-on-error: true` so one failure does not block the deploy. If `news-data.json` is missing after the fetch step (step failed), the staging script downloads it from the live Pages URL as a fallback.

## PR workflow

- Develop on a feature branch, open PR against `main`.
- `deploy.yml` runs tests and posts full-page screenshots as an embedded comment automatically.
- Merge only when tests are green.
