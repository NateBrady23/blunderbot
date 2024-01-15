/**
 * TODO: Type the expected response from the Lichess API. Use the LichessService for this.
 */
import fetch from 'node-fetch';
import { isNHoursLater } from '../../utils/utils';
import { Platform } from '../../enums';
const ndjsonParser = require('ndjson-parse');

let cached = [];
let cachedAt;

const cacheBBB = async () => {
  try {
    const res = await fetch(
      `https://lichess.org/api/user/natebrady23/tournament/created`
    );
    const ndjson = await res.text();
    const json = ndjsonParser(ndjson);
    const current = json[0];
    const last = json[1];
    cached = [];
    cachedAt = Date.now();
    if (!current.winner && current.fullName.startsWith('BBB Title Arena')) {
      cached.push(
        `${current.fullName}: https://lichess.org/tournament/${current.id}`
      );
      if (last.winner && last.fullName.startsWith('BBB Title Arena')) {
        cached.push(`${last.fullName} winner: ${last.winner.name}`);
      }
    }
    if (current.winner && current.fullName.startsWith('BBB Title Arena')) {
      cached.push(`${current.fullName} winner: ${current.winner.name}`);
    }
  } catch (e) {
    console.error('Error caching BBB');
    console.error(e);
  }
};

const speak = (ctx: Context): void => {
  if (ctx.platform === 'twitch') {
    ctx.botSpeak(
      'natebr4Bbb The BBB is a weekly viewer arena where the winner gets the BBB title! natebr4Bbb To play, join the team: https://lichess.org/team/bradys-blunder-buddies ' +
        '--' +
        cached.join(' -- ')
    );
  } else {
    ctx.botSpeak(
      'The BBB is a weekly viewer arena where the winner gets the BBB title! To play, join the team: https://lichess.org/team/bradys-blunder-buddies ' +
        '--' +
        cached.join(' -- ')
    );
  }
};

// Cache the BBB when we start the server
void cacheBBB();

const command: Command = {
  name: 'bbb',
  aliases: [
    'aaa',
    'ccc',
    'ddd',
    'eee',
    'fff',
    'ggg',
    'hhh',
    'iii',
    'jjj',
    'lll',
    'mmm',
    'nnn',
    'ooo',
    'ppp',
    'qqq',
    'rrr',
    'sss',
    'ttt',
    'uuu',
    'vvv',
    'www',
    'yyy',
    'xxx',
    'zzz'
  ],
  help: ' Displays the team link, the current natebr4Bbb tournament, and the previous winner.',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    // Allow any extra args to be a cache buster
    if (ctx.args[0]) {
      cached = [];
    }
    if (cached.length && cachedAt && !isNHoursLater(8, cachedAt)) {
      speak(ctx);
      return true;
    }
    try {
      await cacheBBB();
      speak(ctx);
    } catch (e) {
      console.error(e);
    }
    return true;
  }
};

export default command;
