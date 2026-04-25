const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const DIR = path.join(__dirname, '../../test-screenshots');

// ── Mock payloads ────────────────────────────────────────────────────────────

const WEATHER_MOCK = {
  current: {
    weather_code: 1,
    temperature_2m: 22,
    apparent_temperature: 20,
    relative_humidity_2m: 48,
    wind_speed_10m: 14,
    wind_direction_10m: 270,
    time: '2026-04-25T12:00',
  },
};

const NEWS_MOCK = {
  updated: '2026-04-25T06:00:00.000Z',
  zaragoza: [
    { title: 'Zaragoza aprueba el nuevo plan de movilidad urbana sostenible', link: 'https://example.com/1', source: 'elperiodicodearagon.com', date: '2026-04-25T08:00:00.000Z' },
    { title: 'La DGA anuncia nuevas inversiones en infraestructuras', link: 'https://example.com/2', source: 'europapress.es', date: '2026-04-24T10:00:00.000Z' },
    { title: 'El Pilar de Zaragoza inicia obras de restauración', link: 'https://example.com/3', source: 'elperiodicodearagon.com', date: '2026-04-24T09:00:00.000Z' },
    { title: 'Inaugurado el nuevo tramo del tranvía en el barrio de Delicias', link: 'https://example.com/9', source: 'elperiodicodearagon.com', date: '2026-04-23T11:00:00.000Z' },
    { title: 'La temperatura en Zaragoza alcanzará los 28 grados este fin de semana', link: 'https://example.com/10', source: 'europapress.es', date: '2026-04-23T09:00:00.000Z' },
  ],
  tennis: [
    { title: 'Alcaraz wins Barcelona Open in dominant fashion', link: 'https://example.com/4', source: 'bbc.co.uk', date: '2026-04-24T18:00:00.000Z' },
    { title: 'Djokovic reaches Madrid Open semi-finals after thrilling comeback', link: 'https://example.com/5', source: 'bbc.co.uk', date: '2026-04-23T16:00:00.000Z' },
    { title: 'Swiatek cruises into French Open as favourite after clay season', link: 'https://example.com/11', source: 'bbc.co.uk', date: '2026-04-22T14:00:00.000Z' },
  ],
  videogames: [
    { title: 'Nintendo announces new titles for Switch 2 summer lineup', link: 'https://example.com/6', source: 'gamesindustry.biz', date: '2026-04-25T07:00:00.000Z' },
    { title: 'Elden Ring expansion tops sales charts worldwide', link: 'https://example.com/7', source: 'rockpapershotgun.com', date: '2026-04-24T12:00:00.000Z' },
    { title: 'Xbox Game Pass adds ten new titles this month', link: 'https://example.com/8', source: 'pcgamer.com', date: '2026-04-23T14:00:00.000Z' },
    { title: 'GTA VI PC version confirmed for early 2027', link: 'https://example.com/12', source: 'gamesindustry.biz', date: '2026-04-22T10:00:00.000Z' },
  ],
};

const ING_MOCK = {
  status: 'inactive',
  checked: '2026-04-25T06:00:00.000Z',
  url: 'https://www.ing.es/cuenta-nomina-ing/plan-amigo-mgm',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

async function setupMocks(page) {
  await page.route(/open-meteo\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(WEATHER_MOCK) })
  );
  await page.route(/\/news-data\.json/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(NEWS_MOCK) })
  );
  await page.route(/\/ing-plan-data\.json/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ING_MOCK) })
  );
}

async function snap(page, name) {
  const filePath = path.join(DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  await test.info().attach(`${name}.png`, { path: filePath, contentType: 'image/png' });
}

// ── Suite ────────────────────────────────────────────────────────────────────

test.beforeAll(() => fs.mkdirSync(DIR, { recursive: true }));

test.describe('Page screenshots', () => {
  test('01-home', async ({ page }) => {
    await setupMocks(page);
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await snap(page, '01-home');
  });

  test('02-weather', async ({ page }) => {
    await setupMocks(page);
    await page.goto('/weather.html');
    await page.locator('#weather-display').waitFor({ state: 'visible', timeout: 10000 });
    await snap(page, '02-weather');
  });

  test('03-map', async ({ page }) => {
    await setupMocks(page);
    await page.goto('/map.html');
    await page.waitForSelector('.leaflet-popup', { timeout: 15000 });
    // allow tiles a moment to paint before capturing
    await page.waitForTimeout(800);
    await snap(page, '03-map');
  });

  test('04-news', async ({ page }) => {
    await setupMocks(page);
    await page.goto('/news.html');
    await page.locator('.hn-section').first().waitFor({ state: 'visible', timeout: 10000 });
    await snap(page, '04-news');
  });

  // requires the ing-plan-widget branch to be merged first
  test('05-ing-plan', async ({ page }) => {
    await setupMocks(page);
    await page.goto('/ing.html');
    await page.locator('.status-badge').waitFor({ state: 'visible', timeout: 10000 });
    await snap(page, '05-ing-plan');
  });
});
