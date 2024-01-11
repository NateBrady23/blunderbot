import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'subscribers',
  aliases: ['subs', 'subcount'],
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    if (!CONFIG.decapi?.enabled) {
      console.log('DecAPI is not enabled for !subscribers command.');
      return false;
    }
    const url = `https://decapi.me/twitch/subcount/${CONFIG.twitch.channel}`;

    const res = await (await fetch(url)).text();
    ctx.botSpeak(`${CONFIG.twitch.channel} has ${res} subscribers on Twitch!`);

    return true;
  }
};

export default command;
