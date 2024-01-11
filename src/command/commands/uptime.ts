import { Platform } from '../../enums';
import { CONFIG } from '../../config/config.service';

const command: Command = {
  name: 'uptime',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    if (!CONFIG.decapi?.enabled) {
      console.log('DecAPI is not enabled for !uptime command.');
      return false;
    }
    const url = `https://decapi.me/twitch/uptime/${CONFIG.twitch.channel}`;

    const res = await (await fetch(url)).text();
    if (res.includes('offline')) {
      ctx.botSpeak(`${CONFIG.twitch.channel} is offline.`);
    } else {
      ctx.botSpeak(`${CONFIG.twitch.channel} has been live for ${res}.`);
    }
    return true;
  }
};

export default command;
