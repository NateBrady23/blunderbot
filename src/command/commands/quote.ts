/**
 * TODO: Contribute to the Lichess API to add a quote endpoint.
 */
import { Platform } from '../../enums';
import { getRandomElement } from '../../utils/utils';

const url =
  'https://raw.githubusercontent.com/lichess-org/lila/master/modules/gathering/src/main/Quote.scala';

interface Quote {
  quote: string;
  author: string;
}

let quotes: Quote[] = [];

async function fetchAndParseQuotes(url: string): Promise<Quote[]> {
  const response = await fetch(url);
  const text = await response.text();

  const quoteRegex = /Quote\("(.+?)", "(.+?)"\)/g;

  let match;
  while ((match = quoteRegex.exec(text)) !== null) {
    quotes.push({ quote: match[1], author: match[2] });
  }

  return quotes;
}

const command: Command = {
  name: 'quote',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    if (!quotes.length) {
      quotes = await fetchAndParseQuotes(url);
    }
    const quote = getRandomElement(quotes);
    if (!quote) {
      return false;
    }
    void ctx.botSpeak(`${quote.quote} - ${quote.author}`);
    return true;
  }
};

export default command;
