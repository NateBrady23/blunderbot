import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigV2Service } from '../configV2/configV2.service';

@Injectable()
export class GiphyService {
  private readonly logger: Logger = new Logger(GiphyService.name);

  public constructor(
    @Inject(forwardRef(() => ConfigV2Service))
    private readonly configV2Service: WrapperType<ConfigV2Service>
  ) {
    //
  }

  public async fetchGif(phrase: string): Promise<string> {
    const phraseToMatch = phrase.trim().toLowerCase() + '.gif';
    if (this.configV2Service.get().gifs.includes(phraseToMatch)) {
      return `https://localhost/gifs/${phraseToMatch}`;
    }

    if (!this.configV2Service.get().misc.giphyApiKey) {
      this.logger.error('No giphy api key found and no local gif found');
    }

    const encodedPhrase = encodeURIComponent(phrase);
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${
        this.configV2Service.get().misc.giphyApiKey
      }&q=${encodedPhrase}&limit=1`
    );
    const data = await response.json();
    // Sometimes giphy doesn't return a gif for a phrase, so we return a default gif
    if (!data?.data[0] && this.configV2Service.get().gifs.includes('404')) {
      this.logger.error(data);
      return `https://localhost/gifs/404.gif`;
    } else {
      return `https://i.giphy.com/media/${data.data[0].id}/giphy.webp`;
    }
  }
}
