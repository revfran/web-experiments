const { BasePage } = require('./BasePage');

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.badge = page.locator('.badge');
    this.heroTitle = page.locator('.hero h1');
    this.heroDesc = page.locator('.hero p');
    this.experimentsGrid = page.locator('.experiments-grid');
    this.weatherCard = page.locator('.experiment-card[href="weather.html"]');
    this.mapCard = page.locator('.experiment-card[href="map.html"]');
    this.aboutCard = page.locator('.about-card');
  }

  async goto() {
    await this.navigateTo('/index.html');
  }
}

module.exports = { HomePage };
