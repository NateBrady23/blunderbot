import { Injectable, Logger } from '@nestjs/common';
import { CONFIG } from '../config/config.service';

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

@Injectable()
export class GiphyService {
  private logger: Logger = new Logger(GiphyService.name);

  constructor() {
    //
  }

  async fetchGif(phrase: string, replaceURL = true) {
    const phraseToMatch = phrase.trim().toLowerCase();
    if (CONFIG.gif?.matches[phraseToMatch]) {
      return CONFIG.gif.matches[phraseToMatch];
    }
    const encodedPhrase = encodeURIComponent(phrase);
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodedPhrase}&limit=1`
    );
    const data = await response.json();
    // Sometimes giphy doesn't return a gif for a phrase, so we return a default gif
    if (!data.data[0] && CONFIG.gif?.notFound) {
      return CONFIG.gif.notFound;
    }
    // The URL is changed here to match what the proxy expects
    if (replaceURL) {
      return `https://lichess.org/giphy/media/${data.data[0].id}/giphy.webp`;
    } else {
      return `https://i.giphy.com/media/${data.data[0].id}/giphy.webp`;
    }
  }
}
