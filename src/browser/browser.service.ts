import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { sleep } from '../utils/utils';
import { ENV } from '../config/config.service';

@Injectable()
export class BrowserService {
  private logger: Logger = new Logger(BrowserService.name);

  private browser: Browser;
  private browserLoaded = false;

  private heartRatePage: Page;

  constructor() {
    // Preload some frequently used pages
    (async () => {
      this.logger.log('Preloading browser pages');
      await this.getHeartRatePage();
    })();
  }

  private async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
      });
      this.browserLoaded = true;
    }

    return this.browser;
  }

  isBrowserLoaded() {
    return this.browserLoaded;
  }

  private async getHeartRatePage() {
    if (!this.heartRatePage) {
      const browser = await this.getBrowser();
      this.heartRatePage = await browser.newPage();
      await this.heartRatePage.goto(ENV.HEART_RATE_URL);
      // It takes this long for the heart rate to show up on the page
      await sleep(5000);
    }

    return this.heartRatePage;
  }

  async getHeartRate() {
    const page = await this.getHeartRatePage();

    try {
      const textSelector = await page.waitForSelector(ENV.HEART_RATE_CLASS, {
        timeout: 5_000
      });
      return parseInt(
        (await textSelector?.evaluate((el) => el.textContent))?.trim()
      );
    } catch (e) {
      console.log(e);
    }
  }
}
