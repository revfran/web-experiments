const { test, expect } = require('@playwright/test');
const { WeatherPage } = require('../pages/WeatherPage');

test.describe('Weather page', () => {
  let weatherPage;

  test.beforeEach(async ({ page }) => {
    weatherPage = new WeatherPage(page);
    await weatherPage.goto();
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Zaragoza Weather/);
  });

  test('shows page heading', async () => {
    await expect(weatherPage.pageTitle).toHaveText('Zaragoza, Spain');
  });

  test('weather nav link is active', async () => {
    await expect(weatherPage.navWeather).toHaveClass(/active/);
  });

  test('shows loading state before data arrives', async ({ page }) => {
    await page.route(/open-meteo\.com/, async route => {
      await new Promise(r => setTimeout(r, 300));
      await route.continue();
    });
    weatherPage = new WeatherPage(page);
    await weatherPage.goto();
    await expect(weatherPage.loading).toBeVisible();
  });

  test('loads and displays weather data', async () => {
    await weatherPage.waitForWeatherData();
    await expect(weatherPage.weatherIcon).toBeVisible();
    await expect(weatherPage.weatherTemp).toBeVisible();
    await expect(weatherPage.weatherDesc).toBeVisible();
    await expect(weatherPage.weatherFeels).toContainText('Feels like');
  });

  test('displays all weather stats', async () => {
    await weatherPage.waitForWeatherData();
    await expect(weatherPage.humidity).toBeVisible();
    await expect(weatherPage.wind).toBeVisible();
    await expect(weatherPage.windDir).toBeVisible();
  });

  test('shows last updated time', async () => {
    await weatherPage.waitForWeatherData();
    await expect(weatherPage.updated).toContainText('Last updated:');
  });

  test('shows error message when API fails', async ({ page }) => {
    await page.route(/open-meteo\.com/, async route => route.abort());
    weatherPage = new WeatherPage(page);
    await weatherPage.goto();
    await expect(weatherPage.errorMsg).toBeVisible({ timeout: 10000 });
    await expect(weatherPage.weatherDisplay).toBeHidden();
  });

  test('navigation links are present', async () => {
    await expect(weatherPage.navHome).toBeVisible();
    await expect(weatherPage.navMap).toBeVisible();
  });
});
