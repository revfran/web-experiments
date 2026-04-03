const { BasePage } = require('./BasePage');

class MapPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle = page.locator('.map-hero h1');
    this.mapContainer = page.locator('#map');
    this.mapInfo = page.locator('.map-info');
    this.mapPopup = page.locator('.leaflet-popup-content');
  }

  async goto() {
    await this.navigateTo('/map.html');
  }

  async waitForMapLoad() {
    await this.mapContainer.waitFor({ state: 'visible' });
    await this.page.waitForSelector('.leaflet-container', { timeout: 10000 });
  }
}

module.exports = { MapPage };
