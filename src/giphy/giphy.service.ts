import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CONFIG } from '../config/config.service';
import { ConfigV2Service } from '../configV2/configV2.service';

@Injectable()
export class GiphyService {
  private logger: Logger = new Logger(GiphyService.name);

  constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: ConfigV2Service
  ) {
    //
  }

  async fetchGif(phrase: string) {
    const phraseToMatch = phrase.trim().toLowerCase();
    if (this.configV2Service.get().gifs?.includes(phraseToMatch)) {
      return `https://localhost/gifs/${phraseToMatch}.gif`;
    }
    const encodedPhrase = encodeURIComponent(phrase);
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${
        CONFIG.get().giphy.apiKey
      }&q=${encodedPhrase}&limit=1`
    );
    const data = await response.json();
    // Sometimes giphy doesn't return a gif for a phrase, so we return a default gif
    if (!data?.data[0] && this.configV2Service.get().gifs?.includes('404')) {
      this.logger.error(data);
      return `https://localhost/gifs/404.gif`;
    } else {
      return `https://i.giphy.com/media/${data.data[0].id}/giphy.webp`;
    }
  }
}
