const { BasePage } = require('./BasePage');

class WeatherPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle = page.locator('.weather-hero h1');
    this.loading = page.locator('#loading');
    this.errorMsg = page.locator('#error-msg');
    this.weatherDisplay = page.locator('#weather-display');
    this.weatherIcon = page.locator('#w-icon');
    this.weatherTemp = page.locator('#w-temp');
    this.weatherDesc = page.locator('#w-desc');
    this.weatherFeels = page.locator('#w-feels');
    this.humidity = page.locator('#w-humidity');
    this.wind = page.locator('#w-wind');
    this.windDir = page.locator('#w-dir');
    this.updated = page.locator('#w-updated');
  }

  async goto() {
    await this.navigateTo('/weather.html');
  }

  async waitForWeatherData() {
    await this.weatherDisplay.waitFor({ state: 'visible', timeout: 10000 });
  }
}

module.exports = { WeatherPage };
