import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { sleep } from '../utils/utils';
import { ConfigV2Service } from '../configV2/configV2.service';

@Injectable()
export class BrowserService {
  private logger: Logger = new Logger(BrowserService.name);

  private browser: Browser;
  private browserLoaded = false;

  private heartRatePage: Page;

  public constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: WrapperType<ConfigV2Service>
  ) {}

  public init(): void {
    // Preload some frequently used pages
    (async () => {
      this.logger.log('Preloading browser pages');
      if (this.configV2Service.get().misc.hypeRateEnabled) {
        await this.getHeartRatePage();
      }
    })();
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
      });
      this.browserLoaded = true;
    }

    return this.browser;
  }

  public isBrowserLoaded(): boolean {
    return this.browserLoaded;
  }

  private async getHeartRatePage(): Promise<Page> {
    try {
      if (!this.heartRatePage) {
        const browser = await this.getBrowser();
        this.heartRatePage = await browser.newPage();
        await this.heartRatePage.goto(
          this.configV2Service.get().misc.hypeRateUrl
        );
        // It takes this long for the heart rate to show up on the page
        await sleep(5000);
      }

      return this.heartRatePage;
    } catch (e) {
      this.logger.error('Error getting heart rate page');
      this.logger.error(e);
    }
  }

  public async getHeartRate(): Promise<number> {
    const page = await this.getHeartRatePage();

    try {
      const textSelector = await page.waitForSelector('.heartrate', {
        timeout: 5_000
      });
      return parseInt(
        (await textSelector.evaluate((el) => el.textContent)).trim()
      );
    } catch (e) {
      console.error(e);
    }
  }
}
