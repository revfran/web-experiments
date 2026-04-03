class BasePage {
  constructor(page) {
    this.page = page;
    this.header = page.locator('header');
    this.logo = page.locator('.logo');
    this.footer = page.locator('footer');
    this.navHome = page.locator('nav a[href="index.html"]');
    this.navWeather = page.locator('nav a[href="weather.html"]');
    this.navMap = page.locator('nav a[href="map.html"]');
  }

  async navigateTo(path) {
    await this.page.goto(path);
  }

  async clickLogo() {
    await this.logo.click();
  }
}

module.exports = { BasePage };
