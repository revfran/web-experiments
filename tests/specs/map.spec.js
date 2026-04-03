const { test, expect } = require('@playwright/test');
const { MapPage } = require('../pages/MapPage');

test.describe('Map page', () => {
  let mapPage;

  test.beforeEach(async ({ page }) => {
    mapPage = new MapPage(page);
    await mapPage.goto();
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Mesones de Isuela Map/);
  });

  test('shows page heading', async () => {
    await expect(mapPage.pageTitle).toHaveText('Mesones de Isuela');
  });

  test('map nav link is active', async () => {
    await expect(mapPage.navMap).toHaveClass(/active/);
  });

  test('renders map container', async () => {
    await expect(mapPage.mapContainer).toBeVisible();
  });

  test('initializes leaflet map', async () => {
    await mapPage.waitForMapLoad();
    await expect(mapPage.page.locator('.leaflet-container')).toBeVisible();
  });

  test('shows Mesones de Isuela popup open by default', async () => {
    await mapPage.waitForMapLoad();
    await expect(mapPage.page.locator('.leaflet-popup')).toBeVisible({ timeout: 10000 });
    await expect(mapPage.mapPopup).toContainText('Mesones de Isuela');
  });

  test('shows map info text with attribution', async () => {
    await expect(mapPage.mapInfo).toBeVisible();
    await expect(mapPage.mapInfo).toContainText('OpenStreetMap');
  });

  test('navigation links are present', async () => {
    await expect(mapPage.navHome).toBeVisible();
    await expect(mapPage.navWeather).toBeVisible();
  });

  test('shows footer with Leaflet attribution', async () => {
    await expect(mapPage.footer).toBeVisible();
    await expect(mapPage.footer).toContainText('Leaflet.js');
  });
});
