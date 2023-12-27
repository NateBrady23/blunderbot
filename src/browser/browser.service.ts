import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { sleep } from '../utils/utils';
import { CONFIG } from '../config/config.service';

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
      if (CONFIG.heartRate.enabled) {
        await this.getHeartRatePage();
      }
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
      await this.heartRatePage.goto(CONFIG.heartRate.url);
      // It takes this long for the heart rate to show up on the page
      await sleep(5000);
    }

    return this.heartRatePage;
  }

  async getHeartRate() {
    const page = await this.getHeartRatePage();

    try {
      const textSelector = await page.waitForSelector(CONFIG.heartRate.class, {
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
