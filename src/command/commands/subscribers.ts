import { Platform } from '../../enums';
import { ENV } from '../../config/config.service';

const command: Command = {
  name: 'subscribers',
  aliases: ['subs', 'subcount'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    const url = `https://decapi.me/twitch/subcount/${ENV.TWITCH_CHANNEL}`;

    const res = await (await fetch(url)).text();
    ctx.botSpeak(`${ENV.TWITCH_CHANNEL} has ${res} subscribers on Twitch!`);

    return true;
  }
};

export default command;
