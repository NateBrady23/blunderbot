import { Platform } from '../../enums';
import { ENV } from '../../config/config.service';

const command: Command = {
  name: 'uptime',
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    const url = `https://decapi.me/twitch/uptime/${ENV.TWITCH_CHANNEL}`;

    const res = await (await fetch(url)).text();
    if (res.includes('offline')) {
      ctx.botSpeak(`${ENV.TWITCH_CHANNEL} is offline.`);
    } else {
      ctx.botSpeak(`${ENV.TWITCH_CHANNEL} has been live for ${res}.`);
    }
    return true;
  }
};

export default command;
