const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');

test.describe('Home page', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Claude Code Experiments');
  });

  test('shows hero badge and heading', async () => {
    await expect(homePage.badge).toBeVisible();
    await expect(homePage.badge).toHaveText('Built with Claude Code');
    await expect(homePage.heroTitle).toBeVisible();
  });

  test('shows navigation links', async () => {
    await expect(homePage.navHome).toBeVisible();
    await expect(homePage.navWeather).toBeVisible();
    await expect(homePage.navMap).toBeVisible();
  });

  test('home nav link is active', async () => {
    await expect(homePage.navHome).toHaveClass(/active/);
  });

  test('shows experiment cards', async () => {
    await expect(homePage.weatherCard).toBeVisible();
    await expect(homePage.mapCard).toBeVisible();
  });

  test('weather card navigates to weather page', async ({ page }) => {
    await homePage.weatherCard.click();
    await expect(page).toHaveURL(/weather\.html/);
  });

  test('map card navigates to map page', async ({ page }) => {
    await homePage.mapCard.click();
    await expect(page).toHaveURL(/map\.html/);
  });

  test('shows about card', async () => {
    await expect(homePage.aboutCard).toBeVisible();
  });

  test('logo navigates back to home', async ({ page }) => {
    await homePage.navWeather.click();
    await homePage.clickLogo();
    await expect(page).toHaveURL(/index\.html/);
  });

  test('shows footer', async () => {
    await expect(homePage.footer).toBeVisible();
    await expect(homePage.footer).toContainText('Claude Code');
  });
});
