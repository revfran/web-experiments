# Claude Code Experiments

A personal playground for small interactive experiments, all built through conversations with [Claude Code](https://claude.ai/code). Deployed as a static site on GitHub Pages.

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Home — lists all experiments |
| `weather.html` | Live weather for Zaragoza via [Open-Meteo API](https://open-meteo.com/) |
| `map.html` | Interactive map of Mesones de Isuela via [Leaflet.js](https://leafletjs.com/) + OpenStreetMap |

## Development

**Requirements:** Node 20 (use `nvm use` in the project directory)

```bash
# Install dependencies and Playwright browser (first time only)
npm install
npx playwright install chromium
```

### `npm run serve`

Starts a local static file server. Use this to manually browse the site before committing.

```mermaid
flowchart LR
    A([npm run serve]) --> B[server.js\nNode http server]
    B --> C[(Static files\nat project root)]
    C --> D[http://localhost:3000]
```

### `npm test`

Runs all Playwright tests in headless mode. **No manual server needed** — Playwright reads `playwright.config.js` and launches `server.js` automatically before the tests start, then shuts it down when they finish.

```mermaid
flowchart TD
    A([npm test]) --> B[Playwright reads\nplaywright.config.js]
    B --> C{Is server\nalready running?}
    C -- No --> D[Starts server.js\non localhost:3000]
    C -- Yes --> E[Reuses existing\nserver]
    D --> F[Runs test specs\nin parallel]
    E --> F
    F --> G[home.spec.js\nweather.spec.js\nmap.spec.js]
    G --> H[Stops server\nif it started it]
    H --> I([Exit 0 / 1])
```

> This is purely local. Nothing is deployed — the tests run against your machine.

### `npm run test:ui`

Same as `npm test` but opens the Playwright interactive UI, where you can run individual tests, inspect steps, and see screenshots.

```mermaid
flowchart LR
    A([npm run test:ui]) --> B[Starts server.js\nautomatically]
    B --> C[Opens Playwright UI]
    C --> D{You pick\nwhich tests to run}
    D --> E[Runs selected tests]
    E --> F[Shows steps,\nscreenshots, trace]
```

### `npm run test:report`

Opens the HTML report from the **last** `npm test` run in your browser. Does not run any tests or start any server.

```mermaid
flowchart LR
    A([npm run test:report]) --> B[Reads playwright-report/]
    B --> C[Opens report\nin browser]
```

## Test structure

```
tests/
├── pages/           # page objects (BasePage, HomePage, WeatherPage, MapPage)
└── specs/           # one spec per HTML page
```

## Deployment

Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`), which runs tests and deploys to GitHub Pages only if they pass.

```mermaid
flowchart TD
    A([git push to main]) --> B[GitHub Actions\ndeploy.yml]
    B --> C[Install deps\n& Playwright]
    C --> D[npm test\nheadless on CI]
    D --> E{Tests pass?}
    E -- Yes --> F[Upload static files\nto GitHub Pages]
    F --> G[Site live at\ngithub.io URL]
    E -- No --> H([Deployment blocked\nreport uploaded as artifact])
```

> GitHub Pages source must be set to **GitHub Actions** in `Settings → Pages`.
